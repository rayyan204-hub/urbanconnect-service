import { useState, useCallback, useEffect, useRef, FormEvent } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
  useApiLoadingStatus,
  APILoadingStatus,
  ColorScheme,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Loader2,
  Check,
  X,
  Search,
  Crosshair,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { checkAndNotifyGmpQuotaError } from '../../utils/gmpQuota';

interface GoogleMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onLocationSelected: (location: { lat: number; lng: number; address: string }) => void;
  onClose?: () => void;
}

const POPULAR_AREAS = [
  { name: 'Majiwada Junction', lat: 19.2085, lng: 72.9815 },
  { name: 'Thane Railway Station', lat: 19.186, lng: 72.9759 },
  { name: 'Upvan Lake Park', lat: 19.2198, lng: 72.9642 },
  { name: 'Ghodbunder Road', lat: 19.2625, lng: 72.956 },
  { name: 'Wagle Estate Industrial', lat: 19.198, lng: 72.951 },
];

const PICKER_MAP_ID = 'civic-location-picker-map';

function GoogleMapPickerInner({
  initialLat = 19.2085,
  initialLng = 72.9815,
  initialAddress = 'Majiwada Junction, Thane West',
  onLocationSelected,
  onClose,
}: GoogleMapPickerProps) {
  const map = useMap(PICKER_MAP_ID);
  const placesLib = useMapsLibrary('places');
  const apiStatus = useApiLoadingStatus();

  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [address, setAddress] = useState<string>(initialAddress);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return;
    const obs = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Resolve nearest place/address using Places API (New) Place.searchNearby
  const resolveNearestPlaceLabel = useCallback(
    async (lat: number, lng: number) => {
      if (!placesLib) {
        setAddress(`Civic Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        return;
      }

      setIsLookingUp(true);
      try {
        const { places } = await placesLib.Place.searchNearby({
          locationRestriction: {
            center: { lat, lng },
            radius: 150,
          },
          maxResultCount: 1,
          fields: ['displayName', 'formattedAddress'],
          language: 'en',
          region: 'IN',
          internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
        });

        const nearest = places?.[0];
        if (nearest) {
          const label =
            nearest.displayName && nearest.formattedAddress
              ? `${nearest.displayName}, ${nearest.formattedAddress.split(',').slice(0, 2).join(',').trim()}`
              : nearest.formattedAddress || nearest.displayName;
          if (label) {
            setAddress(label);
            setIsLookingUp(false);
            return;
          }
        }
      } catch (err) {
        checkAndNotifyGmpQuotaError(err);
      }
      setAddress(`Civic Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      setIsLookingUp(false);
    },
    [placesLib]
  );

  // Places API (New) Autocomplete suggestions
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!placesLib || trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
        }
        const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          locationBias: { lat: 19.2085, lng: 72.9815 },
          includedRegionCodes: ['in'],
        });
        if (!cancelled) {
          setSuggestions(res.suggestions || []);
        }
      } catch (err) {
        checkAndNotifyGmpQuotaError(err);
        if (!cancelled) setSuggestions([]);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [placesLib, searchQuery]);

  const handlePanTo = useCallback(
    (lat: number, lng: number, zoom = 16, customAddress?: string) => {
      setPosition({ lat, lng });
      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(zoom);
      }
      if (customAddress) {
        setAddress(customAddress);
      } else {
        void resolveNearestPlaceLabel(lat, lng);
      }
    },
    [map, resolveNearestPlaceLabel]
  );

  const handleSelectSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!suggestion.placePrediction) return;
      setIsLookingUp(true);
      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location'],
        });
        sessionTokenRef.current = null;
        setSuggestions([]);

        if (place.location) {
          const lat = place.location.lat();
          const lng = place.location.lng();
          const label =
            place.displayName && place.formattedAddress
              ? `${place.displayName}, ${place.formattedAddress.split(',').slice(0, 2).join(',').trim()}`
              : place.formattedAddress || place.displayName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setSearchQuery(place.displayName || '');
          handlePanTo(lat, lng, 16, label);
        }
      } catch (err) {
        checkAndNotifyGmpQuotaError(err);
      } finally {
        setIsLookingUp(false);
      }
    },
    [handlePanTo]
  );

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLookingUp(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePanTo(pos.coords.latitude, pos.coords.longitude, 16);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setIsLookingUp(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const matched = POPULAR_AREAS.find((a) =>
      a.name.toLowerCase().includes(trimmed.toLowerCase())
    );
    if (matched) {
      setSuggestions([]);
      handlePanTo(matched.lat, matched.lng, 16, matched.name);
      return;
    }

    if (!placesLib) return;
    setIsLookingUp(true);
    try {
      const { places } = await placesLib.Place.searchByText({
        textQuery: `${trimmed} Thane Mumbai Maharashtra`,
        fields: ['displayName', 'formattedAddress', 'location'],
        locationBias: { lat: 19.2085, lng: 72.9815 },
        maxResultCount: 1,
        language: 'en',
        region: 'IN',
        internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
      });
      setSuggestions([]);
      const first = places?.[0];
      if (first?.location) {
        const lat = first.location.lat();
        const lng = first.location.lng();
        const label =
          first.displayName && first.formattedAddress
            ? `${first.displayName}, ${first.formattedAddress.split(',').slice(0, 2).join(',').trim()}`
            : first.formattedAddress || first.displayName || trimmed;
        handlePanTo(lat, lng, 16, label);
      }
    } catch (err) {
      checkAndNotifyGmpQuotaError(err);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleConfirm = () => {
    onLocationSelected({
      lat: position.lat,
      lng: position.lng,
      address,
    });
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 flex flex-col max-h-[85vh] w-full animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-[#F5F5F7] dark:bg-[#2C2C2E]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-white">
              Pin Location on Google Maps
            </h3>
            <p className="text-[11px] text-[#86868B]">
              Tap anywhere or drag the red pin to set exact grievance spot
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search & Location Bar */}
      <div className="p-3 border-b border-black/5 dark:border-white/10 space-y-2 bg-white dark:bg-[#1C1C1E] relative z-30">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-[#86868B] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search landmark (e.g. Majiwada, Station, Ghodbunder)..."
            className="w-full pl-9 pr-20 py-2 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] border border-transparent focus:border-[#0071E3] outline-hidden"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-[#0071E3] text-white text-[11px] font-semibold hover:bg-[#0077ED] transition-colors"
          >
            Find
          </button>
        </form>

        {/* Autocomplete Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <ul className="max-h-40 overflow-y-auto rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#2C2C2E] shadow-lg divide-y divide-black/5 dark:divide-white/5">
            {suggestions.slice(0, 4).map((suggestion, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => void handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-3 py-2 text-xs text-[#1D1D1F] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
                  <span className="truncate">{suggestion.placePrediction?.text.text}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Quick Area Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {POPULAR_AREAS.slice(0, 4).map((area) => (
            <button
              key={area.name}
              type="button"
              onClick={() => handlePanTo(area.lat, area.lng, 16, area.name)}
              className="px-2.5 py-1 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[10px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10 shrink-0 transition-colors"
            >
              {area.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Google Map Area */}
      <div className="relative w-full h-[340px] min-h-[300px] bg-[#E5E3DF] dark:bg-[#1C1C1E]">
        <GoogleMap
          id={PICKER_MAP_ID}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={{ lat: initialLat, lng: initialLng }}
          defaultZoom={15}
          colorScheme={isDarkMode ? ColorScheme.DARK : ColorScheme.LIGHT}
          gestureHandling="greedy"
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
          onClick={(ev) => {
            if (ev.detail.latLng) {
              const { lat, lng } = ev.detail.latLng;
              setPosition({ lat, lng });
              void resolveNearestPlaceLabel(lat, lng);
            }
          }}
        >
          <AdvancedMarker
            position={position}
            gmpDraggable={true}
            title="Drag to adjust exact civic issue location"
            onDragEnd={(ev) => {
              if (ev.latLng) {
                const lat = ev.latLng.lat();
                const lng = ev.latLng.lng();
                setPosition({ lat, lng });
                void resolveNearestPlaceLabel(lat, lng);
              }
            }}
          >
            <div className="relative flex flex-col items-center cursor-grab active:cursor-grabbing">
              <div className="w-9 h-9 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-xl border-[3px] border-white">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="w-2.5 h-2.5 bg-[#FF3B30] rotate-45 -mt-1.5 shadow-md" />
            </div>
          </AdvancedMarker>
        </GoogleMap>

        {(apiStatus === APILoadingStatus.FAILED || apiStatus === APILoadingStatus.AUTH_FAILURE) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-[#F5F5F7]/95 dark:bg-[#1C1C1E]/95">
            <div className="max-w-xs w-full bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-lg text-center space-y-2">
              <AlertTriangle className="w-7 h-7 text-[#FF9500] mx-auto" />
              <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">
                Google Maps unavailable
              </p>
              <p className="text-[11px] text-[#86868B]">
                You can still confirm using your current coordinates below.
              </p>
            </div>
          </div>
        )}

        {/* Floating Quick Action Buttons */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            title="Use My GPS Location"
            className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md shadow-lg border border-black/10 dark:border-white/10 text-[#0071E3] flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all"
          >
            <Crosshair className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => handlePanTo(initialLat, initialLng, 15, initialAddress)}
            title="Overview Center"
            className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md shadow-lg border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all"
          >
            <Compass className="w-5 h-5 text-[#0071E3]" />
          </button>
        </div>
      </div>

      {/* Selected Address Card & Actions */}
      <div className="p-4 border-t border-black/5 dark:border-white/10 bg-[#F5F5F7] dark:bg-[#2C2C2E] space-y-3">
        <div className="flex items-start gap-2.5 bg-white dark:bg-[#1C1C1E] p-3 rounded-2xl border border-black/5 dark:border-white/10 shadow-xs">
          <div className="w-7 h-7 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                Confirmed Coordinates
              </span>
              <span className="text-[10px] font-mono text-[#0071E3] bg-[#0071E3]/10 px-1.5 py-0.5 rounded">
                {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </span>
            </div>
            {isLookingUp ? (
              <div className="flex items-center gap-1.5 text-xs text-[#86868B]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0071E3]" />
                <span>Resolving location address...</span>
              </div>
            ) : (
              <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white line-clamp-2">
                {address}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold text-[#1D1D1F] dark:text-white hover:bg-black/10 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-2 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#0071E3]/20 active:scale-98 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Pin Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function GoogleMapPicker(props: GoogleMapPickerProps) {
  const hasApiKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  if (!hasApiKey) {
    return (
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 text-center space-y-3 border border-black/10 dark:border-white/10 shadow-2xl">
        <AlertTriangle className="w-8 h-8 text-[#FF9500] mx-auto" />
        <p className="text-sm font-bold text-[#1D1D1F] dark:text-white">
          Google Maps API key not active yet
        </p>
        <p className="text-xs text-[#86868B]">
          Restart the dev server to activate the provisioned Google Maps key.
        </p>
        {props.onClose && (
          <button
            type="button"
            onClick={props.onClose}
            className="px-4 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-semibold"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return <GoogleMapPickerInner {...props} />;
}
