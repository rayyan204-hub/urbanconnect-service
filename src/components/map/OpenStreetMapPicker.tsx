import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Loader2, Search, Check, AlertCircle } from 'lucide-react';

interface OpenStreetMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onLocationSelected: (location: { lat: number; lng: number; address: string }) => void;
  onClose?: () => void;
}

// Popular Thane & Mumbai landmark shortcuts for quick picking
const LANDMARKS = [
  { name: 'Majiwada Junction, Ghodbunder Rd', lat: 19.2085, lng: 72.9815 },
  { name: 'Talao Pali Promenade, Thane West', lat: 19.1912, lng: 72.9734 },
  { name: 'Thane Railway Station West', lat: 19.1868, lng: 72.9763 },
  { name: 'Upvan Lake, Yeoor Foothills', lat: 19.2198, lng: 72.9642 },
  { name: 'Dadar TT Circle, Mumbai', lat: 19.0178, lng: 72.8478 },
  { name: 'Bandra Kurla Complex (BKC)', lat: 19.0657, lng: 72.8687 },
];

export function OpenStreetMapPicker({
  initialLat = 19.2085,
  initialLng = 72.9815,
  initialAddress = 'Majiwada, Thane West',
  onLocationSelected,
  onClose,
}: OpenStreetMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const safeInitialLat = typeof initialLat === 'number' && !isNaN(initialLat) ? initialLat : 19.2085;
  const safeInitialLng = typeof initialLng === 'number' && !isNaN(initialLng) ? initialLng : 72.9815;

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: safeInitialLat,
    lng: safeInitialLng,
  });
  const [address, setAddress] = useState(initialAddress);
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Reverse geocoding using free OpenStreetMap Nominatim API with fallback
  const fetchAddress = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          const shortName = data.address?.road
            ? `${data.address.road}, ${data.address.suburb || data.address.neighbourhood || data.address.city || 'Thane'}`
            : data.display_name.split(',').slice(0, 3).join(',');
          setAddress(shortName);
          return;
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsGeocoding(false);
    }
    setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Thane Ward)`);
  };

  // Create custom SVG marker icon
  const createPinIcon = () => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: #0f766e; color: white; padding: 6px; border-radius: 50%; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.4); border: 2px solid white; display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div style="width: 2px; height: 8px; background-color: #0f766e;"></div>
          <div style="width: 8px; height: 3px; background-color: rgba(0,0,0,0.3); border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [32, 38],
      iconAnchor: [16, 38],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy prior map instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Initial marker
    const marker = L.marker([coords.lat, coords.lng], {
      icon: createPinIcon(),
      draggable: true,
    }).addTo(map);

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setCoords({ lat: position.lat, lng: position.lng });
      fetchAddress(position.lat, position.lng);
    });

    // Map click handler to relocate pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      fetchAddress(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Trigger map resize check
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Center on coordinates change
  const moveToLocation = (lat: number, lng: number, label?: string) => {
    const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 19.2085;
    const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : 72.9815;
    setCoords({ lat: safeLat, lng: safeLng });
    if (label) setAddress(label);
    else fetchAddress(safeLat, safeLng);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([safeLat, safeLng], 16, { animate: true });
      markerRef.current.setLatLng([safeLat, safeLng]);
    }
  };

  // Real GPS Geolocation button
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('GPS Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const latitude = pos.coords?.latitude;
        const longitude = pos.coords?.longitude;
        if (
          typeof latitude === 'number' &&
          typeof longitude === 'number' &&
          !isNaN(latitude) &&
          !isNaN(longitude)
        ) {
          moveToLocation(latitude, longitude);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Please click on the map or choose a landmark.');
        } else {
          setGeoError('Unable to retrieve GPS coordinates. Please select on the map.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    onLocationSelected({
      lat: coords.lat,
      lng: coords.lng,
      address,
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Header */}
      <div className="p-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 rounded-lg">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Pin Issue Location</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Tap anywhere on map or drag pin</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetGPS}
          disabled={isLocating}
          className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-teal-600 text-teal-700 dark:text-teal-300 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-2xs hover:bg-teal-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
        >
          {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5 text-teal-600" />}
          <span>{isLocating ? 'Locating...' : 'Use GPS'}</span>
        </button>
      </div>

      {/* GPS Error alert if any */}
      {geoError && (
        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Interactive Map Container */}
      <div className="relative flex-1 min-h-[220px] max-h-[280px] w-full bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        
        {/* Attribution Badge */}
        <div className="absolute bottom-1 right-2 z-10 bg-white/90 dark:bg-slate-900/90 text-[9px] px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-2xs pointer-events-none">
          © OpenStreetMap (₹0 Cost)
        </div>
      </div>

      {/* Quick Landmark Chips */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Search className="w-3 h-3" />
          <span>Quick Mumbai & Thane Landmarks</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {LANDMARKS.map((lm) => (
            <button
              key={lm.name}
              type="button"
              onClick={() => moveToLocation(lm.lat, lm.lng, lm.name)}
              className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-teal-500 hover:text-teal-700 transition-all flex-shrink-0"
            >
              {lm.name.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Address Display & Confirmation */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
            Confirmed Location
          </label>
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between gap-2">
            <span className="truncate">{isGeocoding ? 'Detecting street name...' : address}</span>
            <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded flex-shrink-0">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
