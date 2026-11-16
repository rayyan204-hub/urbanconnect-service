import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useApiLoadingStatus,
  APILoadingStatus,
  ColorScheme,
} from '@vis.gl/react-google-maps';
import { Complaint, ParkingLot } from '../../types';
import {
  Car,
  Compass,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Crosshair,
  RefreshCw,
} from 'lucide-react';

interface GoogleMapViewProps {
  complaints?: Complaint[];
  parkingLots?: ParkingLot[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  onSelectComplaint?: (c: Complaint) => void;
  onSelectParking?: (p: ParkingLot) => void;
  interactive?: boolean;
  height?: string;
  className?: string;
}

type GoogleMapStyle = 'roadmap' | 'hybrid' | 'terrain';

const MAP_ID = 'civic-overview-map';

const isValidLatLng = (lat: unknown, lng: unknown): lat is number =>
  typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng);

function getComplaintColor(category?: string): string {
  const c = (category || '').toLowerCase();
  if (c.includes('road') || c.includes('pothole')) return '#FF9500';
  if (c.includes('water') || c.includes('drain')) return '#0071E3';
  if (c.includes('sanitation') || c.includes('waste')) return '#AF52DE';
  if (c.includes('light') || c.includes('electric')) return '#FFCC00';
  return '#FF3B30';
}

function MapStatusOverlay() {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-[#F5F5F7]/95 dark:bg-[#1C1C1E]/95">
        <div className="max-w-xs w-full bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-lg border border-black/10 dark:border-white/10 text-center space-y-2">
          <AlertTriangle className="w-7 h-7 text-[#FF9500] mx-auto" />
          <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">Unable to load Google Maps</p>
          <p className="text-[11px] text-[#86868B]">
            Please check your network connection or Maps API quota.
          </p>
        </div>
      </div>
    );
  }

  if (status !== APILoadingStatus.LOADED) {
    return (
      <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md shadow-md border border-black/10 dark:border-white/10 flex items-center gap-2 text-[11px] font-medium text-[#1D1D1F] dark:text-white pointer-events-none">
        <RefreshCw className="w-3.5 h-3.5 text-[#007AFF] animate-spin" />
        <span>Loading Google Maps...</span>
      </div>
    );
  }

  return null;
}

function MapActionControls({
  centerLat,
  centerLng,
  zoom,
}: {
  centerLat: number;
  centerLng: number;
  zoom: number;
}) {
  const map = useMap(MAP_ID);

  const handleRecenter = useCallback(() => {
    if (map) {
      map.panTo({ lat: centerLat, lng: centerLng });
      map.setZoom(zoom);
    }
  }, [map, centerLat, centerLng, zoom]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation || !map) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        map.setZoom(16);
      },
      (err) => console.warn('Geolocation error:', err.message),
      { timeout: 7000 }
    );
  }, [map]);

  return (
    <div className="absolute right-3 bottom-3 z-20 flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleLocateMe}
        title="Locate Me"
        className="w-9 h-9 rounded-xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md shadow-md border border-black/5 dark:border-white/10 text-[#0071E3] flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all"
      >
        <Crosshair className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={handleRecenter}
        title="Overview Center"
        className="w-9 h-9 rounded-xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md shadow-md border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all"
      >
        <Compass className="w-4 h-4 text-[#0071E3]" />
      </button>
    </div>
  );
}

function GoogleMapViewInner({
  complaints = [],
  parkingLots = [],
  centerLat = 19.2085,
  centerLng = 72.9815,
  zoom = 13,
  onSelectComplaint,
  onSelectParking,
  interactive = true,
  height = '100%',
  className = '',
}: GoogleMapViewProps) {
  const [mapType, setMapType] = useState<GoogleMapStyle>('roadmap');
  const [filterType, setFilterType] = useState<'all' | 'complaints' | 'parking'>('all');
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  const [activeInfo, setActiveInfo] = useState<
    | { kind: 'complaint'; item: Complaint; key: string }
    | { kind: 'parking'; item: ParkingLot; key: string }
    | null
  >(null);

  const markerRefs = useRef<Record<string, google.maps.marker.AdvancedMarkerElement | null>>({});

  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return;
    const obs = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const setMarkerRef = useCallback(
    (key: string) => (el: google.maps.marker.AdvancedMarkerElement | null) => {
      markerRefs.current[key] = el;
    },
    []
  );

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 shadow-sm bg-[#E5E3DF] dark:bg-[#1C1C1E] flex flex-col ${className}`}
      style={{ height, minHeight: '340px' }}
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center gap-1.5 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md p-1 rounded-full border border-black/5 dark:border-white/10 shadow-sm pointer-events-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-[#0071E3] text-white shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            All ({complaints.length + parkingLots.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('complaints')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 ${
              filterType === 'complaints'
                ? 'bg-[#FF3B30] text-white shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Civic ({complaints.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('parking')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 ${
              filterType === 'parking'
                ? 'bg-[#34C759] text-white shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            <Car className="w-3 h-3" />
            Parking ({parkingLots.length})
          </button>
        </div>

        {/* Layer Switcher */}
        <div className="relative pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="px-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-sm hover:bg-black/5 active:scale-95 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-[#0071E3]" />
            <span className="capitalize hidden sm:inline">{mapType}</span>
          </button>

          {showStyleMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-xl rounded-xl shadow-xl border border-black/5 dark:border-white/10 p-1 z-30 flex flex-col gap-0.5">
              {(
                [
                  { id: 'roadmap', label: 'Google Streets' },
                  { id: 'hybrid', label: 'Satellite + Labels' },
                  { id: 'terrain', label: 'Terrain' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setMapType(t.id);
                    setShowStyleMenu(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    mapType === t.id
                      ? 'bg-[#0071E3] text-white'
                      : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{t.label}</span>
                  {mapType === t.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Google Map Canvas Container */}
      <div className="flex-1 w-full min-h-[340px] relative bg-[#E5E3DF] dark:bg-[#1C1C1E]">
        <GoogleMap
          id={MAP_ID}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={{ lat: centerLat, lng: centerLng }}
          defaultZoom={zoom}
          mapTypeId={mapType}
          colorScheme={isDarkMode ? ColorScheme.DARK : ColorScheme.LIGHT}
          gestureHandling={interactive ? 'greedy' : 'none'}
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
          onClick={() => {
            setShowStyleMenu(false);
            setActiveInfo(null);
          }}
        >
          {/* Complaint Markers */}
          {filterType !== 'parking' &&
            complaints.map((c) => {
              if (!isValidLatLng(c.latitude, c.longitude)) return null;
              const color = getComplaintColor(c.category);
              const key = `c-${c.id}`;
              return (
                <AdvancedMarker
                  key={key}
                  ref={setMarkerRef(key)}
                  position={{ lat: c.latitude, lng: c.longitude }}
                  title={c.title}
                  onClick={() => {
                    setActiveInfo({ kind: 'complaint', item: c, key });
                    onSelectComplaint?.(c);
                  }}
                >
                  <div className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
                    <div
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-white"
                      style={{ backgroundColor: color }}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div
                      className="w-2 h-2 rotate-45 -mt-1"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </AdvancedMarker>
              );
            })}

          {/* Parking Markers */}
          {filterType !== 'complaints' &&
            parkingLots.map((p) => {
              if (!isValidLatLng(p.latitude, p.longitude)) return null;
              const isFull = p.availableSpaces === 0;
              const isFast = p.status === 'Fast Filling' || p.availableSpaces < 15;
              const bg = isFull ? '#FF3B30' : isFast ? '#FF9500' : '#34C759';
              const key = `p-${p.id}`;
              return (
                <AdvancedMarker
                  key={key}
                  ref={setMarkerRef(key)}
                  position={{ lat: p.latitude, lng: p.longitude }}
                  title={p.name}
                  onClick={() => {
                    setActiveInfo({ kind: 'parking', item: p, key });
                    onSelectParking?.(p);
                  }}
                >
                  <div className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
                    <div
                      className="px-2 py-0.5 rounded-full text-white text-[11px] font-extrabold flex items-center gap-1 shadow-lg border-2 border-white"
                      style={{ backgroundColor: bg }}
                    >
                      <Car className="w-3 h-3" />
                      <span>{p.availableSpaces}</span>
                    </div>
                    <div className="w-2 h-2 rotate-45 -mt-1" style={{ backgroundColor: bg }} />
                  </div>
                </AdvancedMarker>
              );
            })}

          {/* InfoWindow */}
          {activeInfo && markerRefs.current[activeInfo.key] && (
            <InfoWindow
              anchor={markerRefs.current[activeInfo.key]}
              maxWidth={240}
              onCloseClick={() => setActiveInfo(null)}
            >
              {activeInfo.kind === 'complaint' ? (
                <div className="p-1 min-w-[180px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase text-[#86868B]">
                      {activeInfo.item.category}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF]">
                      {activeInfo.item.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#1D1D1F] leading-snug mb-1">
                    {activeInfo.item.title}
                  </div>
                  <div className="text-[11px] text-[#6E6E73]">
                    {activeInfo.item.location || 'Thane, Maharashtra'}
                  </div>
                </div>
              ) : (
                <div className="p-1 min-w-[180px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase text-[#86868B]">
                      Smart Parking
                    </span>
                    <span className="text-[11px] font-extrabold text-[#34C759]">
                      {activeInfo.item.availableSpaces} open
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#1D1D1F] leading-snug mb-1">
                    {activeInfo.item.name}
                  </div>
                  <div className="text-[11px] text-[#6E6E73] mb-1">
                    {activeInfo.item.address || activeInfo.item.ward}
                  </div>
                  <div className="text-[11px] font-bold text-[#007AFF]">
                    Rate: {activeInfo.item.hourlyRate || '₹30/hr'}
                  </div>
                </div>
              )}
            </InfoWindow>
          )}
        </GoogleMap>

        <MapStatusOverlay />
        <MapActionControls centerLat={centerLat} centerLng={centerLng} zoom={zoom} />
      </div>
    </div>
  );
}

export function GoogleMapView(props: GoogleMapViewProps) {
  const hasApiKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  if (!hasApiKey) {
    return (
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-[#F5F5F7] dark:bg-[#1C1C1E] flex items-center justify-center p-6 text-center ${props.className || ''}`}
        style={{ height: props.height || '100%', minHeight: '340px' }}
      >
        <div className="max-w-xs space-y-2">
          <AlertTriangle className="w-8 h-8 text-[#FF9500] mx-auto" />
          <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">
            Google Maps API key not active yet
          </p>
          <p className="text-[11px] text-[#86868B]">
            Restart the dev server to activate the provisioned Google Maps key.
          </p>
        </div>
      </div>
    );
  }

  return <GoogleMapViewInner {...props} />;
}
