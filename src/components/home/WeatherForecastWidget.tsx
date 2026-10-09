import { useState, useEffect, useTransition, useMemo } from 'react';
import {
  WeatherLocation,
  WeatherData,
  CITIES_CONFIG,
  fetchLiveWeatherData,
  getWeatherCodeDetails,
  WEATHER_SAFETY_LIMITS,
  checkSevereWeatherAlert,
  SevereWeatherAlertInfo,
} from '../../services/weatherService';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Gauge,
  RefreshCw,
  MapPin,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  X,
  Sliders,
  CheckCircle2,
  PhoneCall,
  Thermometer,
  Activity,
  Umbrella,
} from 'lucide-react';

interface WeatherForecastWidgetProps {
  onSelectScreen?: (screenId: string) => void;
  onWeatherUpdate?: (data: WeatherData) => void;
  defaultLocationId?: string;
}

export function WeatherForecastWidget({
  onWeatherUpdate,
  defaultLocationId = 'mumbai-city',
}: WeatherForecastWidgetProps) {
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation>(
    () => CITIES_CONFIG.find((c) => c.id === defaultLocationId) || CITIES_CONFIG[0]
  );
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Severe weather alert & optional threshold verification test
  const [simulationMode, setSimulationMode] = useState<'live' | 'temp_breach' | 'humidity_breach' | 'both_breach'>('live');
  const [showSevereAlertModal, setShowSevereAlertModal] = useState<boolean>(false);
  const [showLimitsModal, setShowLimitsModal] = useState<boolean>(false);
  const [tempSafetyLimit] = useState<number>(WEATHER_SAFETY_LIMITS.TEMP_LIMIT);
  const [humiditySafetyLimit] = useState<number>(WEATHER_SAFETY_LIMITS.HUMIDITY_LIMIT);

  const loadWeather = async (loc: WeatherLocation, showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchLiveWeatherData(loc);
      startTransition(() => {
        setWeatherData(data);
        onWeatherUpdate?.(data);
      });
    } catch (err: any) {
      setError(err?.message || 'Unable to load weather data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedLocation);
  }, [selectedLocation]);

  // Evaluated values (supports simulation if testing thresholds)
  const currentTemp = useMemo(() => {
    if (simulationMode === 'temp_breach' || simulationMode === 'both_breach') return 37.2;
    return weatherData?.current.temperature ?? 27;
  }, [simulationMode, weatherData]);

  const currentHumidity = useMemo(() => {
    if (simulationMode === 'humidity_breach' || simulationMode === 'both_breach') return 86;
    if (simulationMode === 'temp_breach') return 68;
    return weatherData?.current.humidity ?? 82;
  }, [simulationMode, weatherData]);

  const currentApparentTemp = useMemo(() => {
    if (simulationMode === 'temp_breach' || simulationMode === 'both_breach') return 42;
    return weatherData?.current.apparentTemperature ?? 31;
  }, [simulationMode, weatherData]);

  const severeAlert: SevereWeatherAlertInfo = useMemo(() => {
    return checkSevereWeatherAlert(
      currentTemp,
      currentHumidity,
      currentApparentTemp,
      {
        tempLimit: tempSafetyLimit,
        humidityLimit: humiditySafetyLimit,
      }
    );
  }, [currentTemp, currentHumidity, currentApparentTemp, tempSafetyLimit, humiditySafetyLimit]);

  // Weather icon renderer
  const renderWeatherIcon = (code: number, isDay = true, className = 'w-5 h-5') => {
    const { iconName } = getWeatherCodeDetails(code, isDay);
    switch (iconName) {
      case 'sun':
        return <Sun className={`${className} text-amber-500`} />;
      case 'moon':
        return <Moon className={`${className} text-sky-300`} />;
      case 'cloud-sun':
        return <CloudSun className={`${className} text-amber-500`} />;
      case 'cloud-moon':
        return <CloudMoon className={`${className} text-sky-300`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-sky-500`} />;
      case 'cloud-drizzle':
        return <CloudDrizzle className={`${className} text-teal-500`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-amber-500`} />;
      case 'cloud-fog':
        return <CloudFog className={`${className} text-slate-400`} />;
      case 'cloud':
      default:
        return <Cloud className={`${className} text-slate-400`} />;
    }
  };

  return (
    <div
      id="weather-forecast-widget"
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 transition-colors"
    >
      {/* Top Location Bar: Clean pill selector & live status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* City / Ward selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CITIES_CONFIG.map((loc) => {
            const isSelected = selectedLocation.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {loc.name}
              </button>
            );
          })}
        </div>

        {/* Live indicator & refresh */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[11px]">
              Live • {selectedLocation.wardLabel}
            </span>
          </div>

          <button
            onClick={() => loadWeather(selectedLocation, true)}
            disabled={isRefreshing || isLoading}
            title="Refresh Live Meteorological Readings"
            aria-label="Refresh Live Meteorological Readings"
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Severe Weather Alert Notice (Appears ONLY when thresholds are exceeded) */}
      {severeAlert.isSevere && (
        <div
          id="severe-weather-alert-banner"
          className="p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-amber-950 dark:text-amber-100 truncate">
                Severe Weather Alert: {severeAlert.headline}
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 truncate">
                {severeAlert.reasons.join(' • ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSevereAlertModal(true)}
            className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 transition-colors cursor-pointer"
          >
            Safety Advisory
          </button>
        </div>
      )}

      {/* Content Area */}
      {isLoading && !weatherData ? (
        <div className="space-y-4 py-4 animate-pulse">
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : weatherData ? (
        <div className="space-y-4">
          {/* Main Conditions Hero */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentTemp}°
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Feels like {currentApparentTemp}°
                </span>
              </div>

              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {weatherData.current.weatherDescription}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                <span>H: {weatherData.todayMax}°</span>
                <span>•</span>
                <span>L: {weatherData.todayMin}°</span>
                <span>•</span>
                <span className="truncate">{selectedLocation.subArea}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-2xs shrink-0 flex items-center justify-center">
              {renderWeatherIcon(weatherData.current.weatherCode, weatherData.current.isDay, 'w-10 h-10 sm:w-12 sm:h-12')}
            </div>
          </div>

          {/* Smooth Hourly Forecast Strip */}
          {weatherData.hourly.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-0.5">
                Hourly Forecast
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                {weatherData.hourly.map((hour, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-2xl flex flex-col items-center justify-between min-w-[62px] text-center border transition-all ${
                      idx === 0
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-2xs'
                        : 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <span className={`text-[11px] font-semibold ${idx === 0 ? 'opacity-80' : 'text-slate-500 dark:text-slate-400'}`}>
                      {hour.displayHour}
                    </span>
                    <div className="py-1.5">
                      {renderWeatherIcon(hour.weatherCode, hour.isDay, 'w-5 h-5')}
                    </div>
                    <span className="text-xs font-bold">
                      {hour.temperature}°
                    </span>
                    {hour.precipitationProbability > 15 && (
                      <span className={`text-[9px] font-bold mt-0.5 ${idx === 0 ? 'text-sky-200' : 'text-sky-600 dark:text-sky-400'}`}>
                        {hour.precipitationProbability}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real Live Mumbai Weather Statistics Grid (Simple & Smooth 4-Card) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {/* Humidity */}
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-medium">Humidity</span>
                <Droplets className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {currentHumidity}%
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Dew point {weatherData.current.dewPoint}°C
              </div>
            </div>

            {/* Wind Speed */}
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-medium">Wind</span>
                <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white truncate">
                {weatherData.current.windSpeed} <span className="text-xs font-normal text-slate-500">km/h</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {weatherData.current.windDirection} • Gusts {weatherData.current.windGusts} km/h
              </div>
            </div>

            {/* Air Quality (AQI) */}
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-medium">Air Quality</span>
                <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {weatherData.airQuality.aqi} <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{weatherData.airQuality.category}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                PM2.5: {weatherData.airQuality.pm25} µg/m³
              </div>
            </div>

            {/* Rain / UV */}
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-medium">Precipitation</span>
                <Umbrella className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {weatherData.current.precipitation > 0 ? `${weatherData.current.precipitation} mm` : '0 mm'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                UV Index: {weatherData.daily[0]?.uvIndexMax ?? 0}
              </div>
            </div>
          </div>

          {/* 5-Day Forecast: Simple and smooth row strip */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-0.5">
              5-Day Outlook
            </div>
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-2.5 border border-slate-100 dark:border-slate-800 space-y-2">
              {weatherData.daily.slice(0, 5).map((day, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 text-xs py-1 px-1.5 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <span className="w-14 font-semibold text-slate-800 dark:text-slate-200">
                    {day.dayName}
                  </span>

                  <div className="flex items-center gap-1.5 w-16">
                    {renderWeatherIcon(day.weatherCode, true, 'w-4 h-4')}
                    {day.precipitationProbabilityMax > 20 && (
                      <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                        {day.precipitationProbabilityMax}%
                      </span>
                    )}
                  </div>

                  {/* Visual Temperature Bar */}
                  <div className="flex-1 flex items-center gap-2 max-w-[180px]">
                    <span className="text-[11px] font-medium text-slate-400 w-6 text-right">
                      {day.tempMin}°
                    </span>
                    <div className="h-1.5 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-amber-500 rounded-full"
                        style={{
                          marginLeft: `${Math.max(0, (day.tempMin - 20) * 4)}%`,
                          width: `${Math.min(100, (day.tempMax - day.tempMin) * 8)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 w-6 text-left">
                      {day.tempMax}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discreet Footer Info & Verification Controls */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 px-1">
            <span>
              Updated {weatherData.lastUpdated} IST via Open-Meteo & IMD
            </span>

            <button
              onClick={() => setShowLimitsModal(true)}
              className="hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Safety Limits ({tempSafetyLimit}°C / {humiditySafetyLimit}%)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-500 space-y-2">
          <p>{error || 'No weather data available'}</p>
          <button
            onClick={() => loadWeather(selectedLocation)}
            className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Severe Weather Advisory Modal */}
      {showSevereAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-labelledby="severe-alert-title"
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="severe-alert-title" className="text-sm font-bold text-slate-900 dark:text-white">
                    Severe Weather Advisory
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    BMC & TMC Municipal Disaster Management
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSevereAlertModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Breached thresholds */}
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl space-y-1.5 text-xs">
              <div className="font-bold text-amber-950 dark:text-amber-200">
                {severeAlert.headline}
              </div>
              <ul className="space-y-1 text-amber-800 dark:text-amber-300 text-[11px]">
                {severeAlert.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Health & Transit Protocols */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Recommended Actions:
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                {severeAlert.safetyAdvice.map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Municipal Emergency Hotlines */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-red-500" />
                <span>Emergency Numbers</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">BMC Disaster Cell: </span>
                  <strong className="text-red-600 dark:text-red-400">1916</strong>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">TMC Disaster Cell: </span>
                  <strong className="text-red-600 dark:text-red-400">022-25371010</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSevereAlertModal(false)}
              className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              Acknowledge Advisory
            </button>
          </div>
        </div>
      )}

      {/* Safety Limits & Threshold Verification Modal */}
      {showLimitsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-labelledby="limits-modal-title"
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 id="limits-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                  Defined Weather Safety Limits
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Controls when the Severe Weather Alert badge appears
                </p>
              </div>
              <button
                onClick={() => setShowLimitsModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Temperature Safety Limit:</span>
                  <strong className="text-slate-900 dark:text-white">{tempSafetyLimit}°C</strong>
                </div>
                <p className="text-[11px] text-slate-500">
                  IMD heatwave threshold for coastal Konkan / Mumbai / Thane.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Humidity Safety Limit:</span>
                  <strong className="text-slate-900 dark:text-white">{humiditySafetyLimit}%</strong>
                </div>
                <p className="text-[11px] text-slate-500">
                  Excessive moisture threshold hindering bodily sweat evaporation.
                </p>
              </div>
            </div>

            {/* Threshold test controls */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                Simulation Modes (Test Verification)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSimulationMode('live')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    simulationMode === 'live'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px]">Live Mumbai Data</div>
                  <div className="text-[10px] opacity-75">Real station readings</div>
                </button>

                <button
                  onClick={() => setSimulationMode('temp_breach')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    simulationMode === 'temp_breach'
                      ? 'bg-amber-600 text-white border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px]">Temp Breach</div>
                  <div className="text-[10px] opacity-75">37.2°C (&gt; {tempSafetyLimit}°C)</div>
                </button>

                <button
                  onClick={() => setSimulationMode('humidity_breach')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    simulationMode === 'humidity_breach'
                      ? 'bg-amber-600 text-white border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px]">Humidity Breach</div>
                  <div className="text-[10px] opacity-75">86% (&gt; {humiditySafetyLimit}%)</div>
                </button>

                <button
                  onClick={() => setSimulationMode('both_breach')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    simulationMode === 'both_breach'
                      ? 'bg-amber-600 text-white border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px]">Dual Breach</div>
                  <div className="text-[10px] opacity-75">37.2°C & 86%</div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowLimitsModal(false)}
              className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
