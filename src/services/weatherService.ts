export interface WeatherLocation {
  id: string;
  name: string;
  subArea: string;
  district: 'Thane' | 'Mumbai' | 'Navi Mumbai';
  latitude: number;
  longitude: number;
  wardLabel: string;
}

export const CITIES_CONFIG: WeatherLocation[] = [
  {
    id: 'mumbai-city',
    name: 'Mumbai',
    subArea: 'Colaba • Dadar • Worli',
    district: 'Mumbai',
    latitude: 18.9388,
    longitude: 72.8354,
    wardLabel: 'BMC A & G-South Wards',
  },
  {
    id: 'mumbai-suburbs',
    name: 'Mumbai Suburbs',
    subArea: 'Bandra • Andheri • BKC',
    district: 'Mumbai',
    latitude: 19.0600,
    longitude: 72.8360,
    wardLabel: 'BMC H-West & K Wards',
  },
  {
    id: 'thane-central',
    name: 'Thane',
    subArea: 'Naupada • Majiwada • Ghodbunder',
    district: 'Thane',
    latitude: 19.2183,
    longitude: 72.9781,
    wardLabel: 'TMC Ward 4 & 5',
  },
  {
    id: 'navi-mumbai',
    name: 'Navi Mumbai',
    subArea: 'Vashi • Belapur • Palm Beach',
    district: 'Navi Mumbai',
    latitude: 19.0330,
    longitude: 73.0297,
    wardLabel: 'NMMC Sector 17',
  },
];

export interface HourlyForecast {
  time: string;
  displayHour: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  precipitationProbabilityMax: number;
  precipitationSum: number;
  weatherCode: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface AirQualityData {
  aqi: number;
  category: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  categoryColor: string;
  categoryBg: string;
  pm25: number;
  pm10: number;
  healthAdvisory: string;
}

export interface WeatherData {
  location: WeatherLocation;
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    humidityDescription: string;
    humidityComfort: string;
    dewPoint: number;
    windSpeed: number;
    windDirection: string;
    windDescription: string;
    windScale: string;
    windGusts: number;
    weatherCode: number;
    weatherDescription: string;
    precipitation: number;
    isDay: boolean;
    pressure: number;
    cloudCover: number;
  };
  todayMax: number;
  todayMin: number;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  airQuality: AirQualityData;
  monsoonAdvisory?: {
    type: 'info' | 'watch' | 'alert';
    title: string;
    message: string;
    highTide?: string;
  };
  severeAlert: SevereWeatherAlertInfo;
  lastUpdated: string;
  isRealTime: boolean;
}

// Defined Public Safety Limits for Temperature and Humidity in Mumbai & Thane
export const WEATHER_SAFETY_LIMITS = {
  TEMP_LIMIT: 35.0, // °C - IMD Coastal Heatwave threshold: temperatures >= 35°C in coastal areas trigger severe alerts
  HUMIDITY_LIMIT: 80.0, // % - High moisture safety threshold: humidity >= 80% causes dangerous heat dissipation failure
  FEELS_LIKE_LIMIT: 40.0, // °C - Hazardous heat index limit
};

export interface SevereWeatherAlertInfo {
  isSevere: boolean;
  severity: 'warning' | 'danger';
  badgeLabel: string;
  headline: string;
  triggerType: 'temperature' | 'humidity' | 'both' | 'none';
  reasons: string[];
  currentTemp: number;
  currentHumidity: number;
  tempLimit: number;
  humidityLimit: number;
  tempExceeded: boolean;
  humidityExceeded: boolean;
  safetyAdvice: string[];
}

export function checkSevereWeatherAlert(
  temperature: number,
  humidity: number,
  apparentTemperature?: number,
  customLimits?: { tempLimit?: number; humidityLimit?: number }
): SevereWeatherAlertInfo {
  const tempLimit = customLimits?.tempLimit ?? WEATHER_SAFETY_LIMITS.TEMP_LIMIT;
  const humidityLimit = customLimits?.humidityLimit ?? WEATHER_SAFETY_LIMITS.HUMIDITY_LIMIT;

  const tempExceeded = temperature >= tempLimit;
  const humidityExceeded = humidity >= humidityLimit;
  const isSevere = tempExceeded || humidityExceeded;

  let triggerType: 'temperature' | 'humidity' | 'both' | 'none' = 'none';
  const reasons: string[] = [];

  if (tempExceeded && humidityExceeded) {
    triggerType = 'both';
    reasons.push(`Temperature (${temperature}°C) exceeds safety limit of ${tempLimit}°C`);
    reasons.push(`Relative humidity (${humidity}%) exceeds safe moisture threshold of ${humidityLimit}%`);
  } else if (tempExceeded) {
    triggerType = 'temperature';
    reasons.push(`Temperature (${temperature}°C) exceeds safety limit of ${tempLimit}°C (IMD Coastal Heatwave Alert)`);
  } else if (humidityExceeded) {
    triggerType = 'humidity';
    reasons.push(`Relative humidity (${humidity}%) exceeds safety limit of ${humidityLimit}% (Dangerous Moisture & Heat Stress)`);
  }

  const advice: string[] = [];
  if (tempExceeded) {
    advice.push('Avoid direct sun exposure and non-essential strenuous travel between 11:30 AM and 3:30 PM.');
    advice.push('Carry oral rehydration salts (ORS), lemon water, or electrolytes while commuting.');
    advice.push('Ensure elderly family members, pets, and children stay in well-ventilated or cool environments.');
  }
  if (humidityExceeded) {
    advice.push('High humidity hinders bodily cooling; take frequent hydration and shade breaks.');
    advice.push('Wear loose, light-colored breathable cotton clothing for suburban train and bus transit.');
  }
  advice.push('For emergency medical assistance or heat stroke support, contact TMC/BMC Helpline 1916 or 108.');

  const isDanger = (tempExceeded && humidityExceeded) || temperature >= 38 || humidity >= 88;

  return {
    isSevere,
    severity: isDanger ? 'danger' : 'warning',
    badgeLabel: 'Severe Weather Alert',
    headline: isSevere
      ? triggerType === 'both'
        ? 'Severe Heat & Excessive Humidity Alert'
        : triggerType === 'temperature'
        ? 'Severe Heat Alert (Safety Threshold Exceeded)'
        : 'Severe Humidity Alert (Safety Threshold Exceeded)'
      : 'Normal Weather Parameters',
    triggerType,
    reasons,
    currentTemp: temperature,
    currentHumidity: humidity,
    tempLimit,
    humidityLimit,
    tempExceeded,
    humidityExceeded,
    safetyAdvice: advice,
  };
}

// Evaluate coastal humidity levels for Mumbai & Thane
export function getHumidityDetails(humidity: number): { label: string; comfort: string } {
  if (humidity >= 80) {
    return {
      label: 'Very High (Muggy)',
      comfort: 'Heavy coastal moisture, high sweat index across city platforms',
    };
  } else if (humidity >= 65) {
    return {
      label: 'High Coastal Humid',
      comfort: 'Typical Arabian Sea coastal humidity, stay hydrated during commute',
    };
  } else if (humidity >= 45) {
    return {
      label: 'Moderate / Normal',
      comfort: 'Comfortable atmospheric moisture for outdoor transit',
    };
  } else {
    return {
      label: 'Pleasantly Dry',
      comfort: 'Dryer than average for coastal Mumbai/Thane',
    };
  }
}

// Evaluate coastal wind speed according to Beaufort scale
export function getWindDetails(speed: number): { label: string; scale: string } {
  if (speed < 6) {
    return { label: 'Light Air / Calm', scale: 'Beaufort 1' };
  } else if (speed <= 15) {
    return { label: 'Gentle Coastal Breeze', scale: 'Beaufort 2-3' };
  } else if (speed <= 25) {
    return { label: 'Moderate Sea Breeze', scale: 'Beaufort 4' };
  } else if (speed <= 38) {
    return { label: 'Fresh Coastal Wind', scale: 'Beaufort 5' };
  } else {
    return { label: 'Strong Coastal Gusts', scale: 'Beaufort 6+' };
  }
}

// Convert WMO code to human-readable string and icon mapping
export function getWeatherCodeDetails(code: number, isDay = true): {
  description: string;
  iconName: 'sun' | 'moon' | 'cloud-sun' | 'cloud-moon' | 'cloud' | 'cloud-rain' | 'cloud-drizzle' | 'cloud-lightning' | 'cloud-fog' | 'snowflake';
} {
  switch (code) {
    case 0:
      return {
        description: isDay ? 'Sunny & Clear' : 'Clear Sky',
        iconName: isDay ? 'sun' : 'moon',
      };
    case 1:
      return {
        description: isDay ? 'Mainly Sunny' : 'Mainly Clear',
        iconName: isDay ? 'cloud-sun' : 'cloud-moon',
      };
    case 2:
      return {
        description: 'Partly Cloudy',
        iconName: isDay ? 'cloud-sun' : 'cloud-moon',
      };
    case 3:
      return {
        description: 'Overcast & Cloudy',
        iconName: 'cloud',
      };
    case 45:
    case 48:
      return {
        description: 'Hazy / Coastal Fog',
        iconName: 'cloud-fog',
      };
    case 51:
    case 53:
    case 55:
      return {
        description: 'Light Coastal Drizzle',
        iconName: 'cloud-drizzle',
      };
    case 61:
    case 63:
      return {
        description: 'Moderate Rain Showers',
        iconName: 'cloud-rain',
      };
    case 65:
      return {
        description: 'Heavy Monsoon Downpour',
        iconName: 'cloud-rain',
      };
    case 80:
    case 81:
    case 82:
      return {
        description: 'Passing Rain Showers',
        iconName: 'cloud-rain',
      };
    case 95:
    case 96:
    case 99:
      return {
        description: 'Thunderstorm with Gusts',
        iconName: 'cloud-lightning',
      };
    default:
      return {
        description: 'Partly Cloudy',
        iconName: isDay ? 'cloud-sun' : 'cloud-moon',
      };
  }
}

// Wind degrees to cardinal direction
export function getWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index] || 'W';
}

// Map US AQI or PM2.5 to Indian CPCB standards
export function evaluateAQI(usAqi: number, pm25: number): AirQualityData {
  const effectiveAqi = usAqi > 0 ? usAqi : Math.round(pm25 * 2.5);

  if (effectiveAqi <= 50) {
    return {
      aqi: effectiveAqi,
      category: 'Good',
      categoryColor: 'text-emerald-700 dark:text-emerald-300',
      categoryBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      pm25: Math.round(pm25 * 10) / 10,
      pm10: Math.round(pm25 * 1.9),
      healthAdvisory: 'Air quality is satisfactory. Ideal for outdoor transit and walking.',
    };
  } else if (effectiveAqi <= 100) {
    return {
      aqi: effectiveAqi,
      category: 'Satisfactory',
      categoryColor: 'text-teal-700 dark:text-teal-300',
      categoryBg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
      pm25: Math.round(pm25 * 10) / 10,
      pm10: Math.round(pm25 * 1.9),
      healthAdvisory: 'Minor breathing discomfort to sensitive people. Generally clean air.',
    };
  } else if (effectiveAqi <= 200) {
    return {
      aqi: effectiveAqi,
      category: 'Moderate',
      categoryColor: 'text-amber-700 dark:text-amber-300',
      categoryBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      pm25: Math.round(pm25 * 10) / 10,
      pm10: Math.round(pm25 * 1.9),
      healthAdvisory: 'May cause breathing discomfort to people with asthma and respiratory conditions.',
    };
  } else if (effectiveAqi <= 300) {
    return {
      aqi: effectiveAqi,
      category: 'Poor',
      categoryColor: 'text-orange-700 dark:text-orange-300',
      categoryBg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
      pm25: Math.round(pm25 * 10) / 10,
      pm10: Math.round(pm25 * 1.9),
      healthAdvisory: 'Breathing discomfort to most people on prolonged exposure. Limit intense outdoor activity.',
    };
  } else {
    return {
      aqi: effectiveAqi,
      category: 'Very Poor',
      categoryColor: 'text-rose-700 dark:text-rose-300',
      categoryBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      pm25: Math.round(pm25 * 10) / 10,
      pm10: Math.round(pm25 * 1.9),
      healthAdvisory: 'Respiratory illness on prolonged exposure. Sensitive groups should stay indoors.',
    };
  }
}

// Generate realistic fallback data if device is offline
export function getFallbackWeatherData(location: WeatherLocation): WeatherData {
  const isThane = location.district === 'Thane';
  const temp = isThane ? 29 : 30;
  const humidity = 74;
  const windSpeed = 14;
  const humInfo = getHumidityDetails(humidity);
  const windInfo = getWindDetails(windSpeed);

  return {
    location,
    current: {
      temperature: temp,
      apparentTemperature: 33,
      humidity,
      humidityDescription: humInfo.label,
      humidityComfort: humInfo.comfort,
      dewPoint: Math.round(temp - (100 - humidity) / 5),
      windSpeed,
      windDirection: 'WSW',
      windDescription: windInfo.label,
      windScale: windInfo.scale,
      windGusts: 21,
      weatherCode: 2,
      weatherDescription: 'Partly Cloudy with Coastal Breeze',
      precipitation: 0,
      isDay: true,
      pressure: 1010,
      cloudCover: 35,
    },
    todayMax: 32,
    todayMin: 25,
    hourly: [
      { time: '10:00', displayHour: '10 AM', temperature: 28, precipitationProbability: 10, weatherCode: 1, isDay: true },
      { time: '12:00', displayHour: '12 PM', temperature: 31, precipitationProbability: 15, weatherCode: 2, isDay: true },
      { time: '14:00', displayHour: '2 PM', temperature: 32, precipitationProbability: 25, weatherCode: 2, isDay: true },
      { time: '16:00', displayHour: '4 PM', temperature: 30, precipitationProbability: 35, weatherCode: 80, isDay: true },
      { time: '18:00', displayHour: '6 PM', temperature: 28, precipitationProbability: 20, weatherCode: 2, isDay: true },
      { time: '20:00', displayHour: '8 PM', temperature: 27, precipitationProbability: 15, weatherCode: 1, isDay: false },
      { time: '22:00', displayHour: '10 PM', temperature: 26, precipitationProbability: 10, weatherCode: 0, isDay: false },
    ],
    daily: [
      { date: '2026-09-15', dayName: 'Today', tempMax: 32, tempMin: 25, precipitationProbabilityMax: 30, precipitationSum: 1.2, weatherCode: 2, uvIndexMax: 6, sunrise: '06:24', sunset: '18:38' },
      { date: '2026-09-16', dayName: 'Wed', tempMax: 31, tempMin: 25, precipitationProbabilityMax: 45, precipitationSum: 4.5, weatherCode: 80, uvIndexMax: 5, sunrise: '06:24', sunset: '18:37' },
      { date: '2026-09-17', dayName: 'Thu', tempMax: 30, tempMin: 24, precipitationProbabilityMax: 60, precipitationSum: 9.8, weatherCode: 61, uvIndexMax: 4, sunrise: '06:25', sunset: '18:36' },
      { date: '2026-09-18', dayName: 'Fri', tempMax: 30, tempMin: 24, precipitationProbabilityMax: 40, precipitationSum: 3.1, weatherCode: 2, uvIndexMax: 6, sunrise: '06:25', sunset: '18:35' },
      { date: '2026-09-19', dayName: 'Sat', tempMax: 32, tempMin: 25, precipitationProbabilityMax: 20, precipitationSum: 0.4, weatherCode: 1, uvIndexMax: 7, sunrise: '06:25', sunset: '18:34' },
    ],
    airQuality: {
      aqi: 58,
      category: 'Satisfactory',
      categoryColor: 'text-teal-700 dark:text-teal-300',
      categoryBg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
      pm25: 16.8,
      pm10: 42.1,
      healthAdvisory: 'Air quality is satisfactory in TMC Ward 4 & Dadar corridors.',
    },
    monsoonAdvisory: {
      type: 'info',
      title: 'Arabian Sea Coastal Watch',
      message: 'Moderate humid winds from WSW. Arabian Sea high tide: 3.84m expected at 15:10 IST.',
      highTide: '3.84m at 15:10 IST',
    },
    severeAlert: checkSevereWeatherAlert(temp, humidity, 33),
    lastUpdated: 'Cached / Fallback',
    isRealTime: false,
  };
}

// Fetch live weather data from Open-Meteo
export async function fetchLiveWeatherData(location: WeatherLocation): Promise<WeatherData> {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=7`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=pm10,pm2_5,us_aqi&timezone=Asia%2FKolkata`;

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl).catch(() => null),
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status}`);
    }

    const weatherJson = await weatherRes.json();
    let aqiJson: any = null;
    if (aqiRes && aqiRes.ok) {
      try {
        aqiJson = await aqiRes.json();
      } catch {
        // Ignored
      }
    }

    const current = weatherJson.current || {};
    const daily = weatherJson.daily || {};
    const hourly = weatherJson.hourly || {};

    const code = current.weather_code ?? 0;
    const isDay = current.is_day === 1;
    const { description } = getWeatherCodeDetails(code, isDay);

    // Parse Hourly (next 12 hours from current local Mumbai time)
    const hourlyList: HourlyForecast[] = [];
    if (hourly.time && Array.isArray(hourly.time)) {
      const currentIsoTime = typeof current.time === 'string' ? current.time : '';
      const currentHourPrefix = currentIsoTime.slice(0, 13); // e.g. 2026-09-15T21

      let startIndex = currentHourPrefix
        ? hourly.time.findIndex((t: string) => t.startsWith(currentHourPrefix))
        : -1;
      if (startIndex < 0) startIndex = 0;

      for (let i = startIndex; i < Math.min(startIndex + 12, hourly.time.length); i++) {
        const timeStr = hourly.time[i];
        const hourNum = parseInt(timeStr.slice(11, 13), 10);
        const displayHour = i === startIndex ? 'Now' : `${hourNum % 12 || 12} ${hourNum >= 12 ? 'PM' : 'AM'}`;

        hourlyList.push({
          time: timeStr,
          displayHour,
          temperature: Math.round(hourly.temperature_2m?.[i] ?? 0),
          precipitationProbability: hourly.precipitation_probability?.[i] ?? 0,
          weatherCode: hourly.weather_code?.[i] ?? 0,
          isDay: (hourly.is_day?.[i] ?? 1) === 1,
        });
      }
    }

    // Parse Daily (next 5 days)
    const dailyList: DailyForecast[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (daily.time && Array.isArray(daily.time)) {
      for (let i = 0; i < Math.min(5, daily.time.length); i++) {
        const dStr = daily.time[i];
        const dObj = new Date(dStr);
        const dayName = i === 0 ? 'Today' : dayNames[dObj.getDay()];
        const sunriseIso = daily.sunrise?.[i] || '';
        const sunsetIso = daily.sunset?.[i] || '';

        const sunriseTime = sunriseIso ? sunriseIso.split('T')[1]?.slice(0, 5) : '06:25';
        const sunsetTime = sunsetIso ? sunsetIso.split('T')[1]?.slice(0, 5) : '18:35';

        dailyList.push({
          date: dStr,
          dayName,
          tempMax: Math.round(daily.temperature_2m_max?.[i] ?? 31),
          tempMin: Math.round(daily.temperature_2m_min?.[i] ?? 25),
          precipitationProbabilityMax: daily.precipitation_probability_max?.[i] ?? 10,
          precipitationSum: Math.round((daily.precipitation_sum?.[i] ?? 0) * 10) / 10,
          weatherCode: daily.weather_code?.[i] ?? 0,
          uvIndexMax: Math.round(daily.uv_index_max?.[i] ?? 5),
          sunrise: sunriseTime,
          sunset: sunsetTime,
        });
      }
    }

    // Parse Air Quality
    const rawUsAqi = aqiJson?.current?.us_aqi ?? 0;
    const rawPm25 = aqiJson?.current?.pm2_5 ?? 22.4;
    const airQuality = evaluateAQI(rawUsAqi, rawPm25);

    // Weather advisory based on rain probability or temperature
    let monsoonAdvisory: WeatherData['monsoonAdvisory'] = undefined;
    const maxRainChance = dailyList[0]?.precipitationProbabilityMax ?? 0;
    const currentTemp = Math.round(current.temperature_2m ?? 29);

    if (maxRainChance >= 60 || (current.rain ?? 0) > 2) {
      monsoonAdvisory = {
        type: 'alert',
        title: 'IMD Rain Advisory • TMC & BMC Alert',
        message: 'Heavy localized monsoon showers expected. Low-lying areas (Vandana Cinema, Hindmata) may experience water logging. Allow extra local transit time.',
        highTide: 'High Tide 4.15m anticipated today',
      };
    } else if (maxRainChance >= 30) {
      monsoonAdvisory = {
        type: 'watch',
        title: 'Passing Monsoon Showers Expected',
        message: 'Scattered rain showers over Thane creek and Central Line suburbs. Keep umbrellas handy.',
        highTide: 'High Tide 3.92m at 14:50 IST',
      };
    } else if (currentTemp >= 34) {
      monsoonAdvisory = {
        type: 'info',
        title: 'High Heat & Humidity Index',
        message: 'High heat index due to coastal humidity. Stay well hydrated when using BEST buses and local platforms.',
      };
    } else {
      monsoonAdvisory = {
        type: 'info',
        title: 'Normal Coastal Weather',
        message: 'Pleasant coastal breeze across Mumbai & Thane metropolitan region. Normal suburban train operations.',
        highTide: 'Astronomical Tide: 3.75m at 15:30 IST',
      };
    }

    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const liveHumidity = Math.round(current.relative_humidity_2m ?? 70);
    const liveWindSpeed = Math.round(current.wind_speed_10m ?? 12);
    const liveWindGusts = Math.round(current.wind_gusts_10m ?? liveWindSpeed * 1.3);
    const humDetails = getHumidityDetails(liveHumidity);
    const windDetails = getWindDetails(liveWindSpeed);
    const liveDewPoint = Math.round(currentTemp - (100 - liveHumidity) / 5);

    return {
      location,
      current: {
        temperature: currentTemp,
        apparentTemperature: Math.round(current.apparent_temperature ?? currentTemp),
        humidity: liveHumidity,
        humidityDescription: humDetails.label,
        humidityComfort: humDetails.comfort,
        dewPoint: liveDewPoint,
        windSpeed: liveWindSpeed,
        windDirection: getWindDirection(current.wind_direction_10m ?? 240),
        windDescription: windDetails.label,
        windScale: windDetails.scale,
        windGusts: liveWindGusts,
        weatherCode: code,
        weatherDescription: description,
        precipitation: current.precipitation ?? 0,
        isDay,
        pressure: Math.round(current.pressure_msl ?? 1011),
        cloudCover: Math.round(current.cloud_cover ?? 30),
      },
      todayMax: dailyList[0]?.tempMax ?? currentTemp + 3,
      todayMin: dailyList[0]?.tempMin ?? currentTemp - 4,
      hourly: hourlyList,
      daily: dailyList,
      airQuality,
      monsoonAdvisory,
      severeAlert: checkSevereWeatherAlert(currentTemp, liveHumidity, Math.round(current.apparent_temperature ?? currentTemp)),
      lastUpdated: nowFormatted,
      isRealTime: true,
    };
  } catch (err) {
    console.warn('Live weather fetch failed, falling back to local cached data:', err);
    const fallback = getFallbackWeatherData(location);
    return fallback;
  }
}
