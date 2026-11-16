import { useState, useCallback, FormEvent, useEffect, useMemo } from 'react';
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
  ScreenId,
  Complaint,
  ParkingLot,
  UserProfile,
  BloodDonor,
  VolunteerEvent,
} from '../types';
import {
  getComplaints,
  getParkingLots,
  reserveParkingSlot,
  getBloodDonors,
  getVolunteerEvents,
  joinVolunteerEvent,
  subscribeToCollection,
  COLLECTIONS,
} from '../services/dbService';
import {
  BLOOD_DONATION_SPOTS,
  GARBAGE_PICKUP_SPOTS,
  POTHOLE_AVOID_SPOTS,
  EXTRA_VOLUNTEER_HUBS,
  resolveVolunteerCoords,
  BloodDonationSpot,
  GarbagePickupSpot,
  PotholeHazardSpot,
} from '../data/mapSpotsData';
import { TopAppBar } from '../components/common/TopAppBar';
import { checkAndNotifyGmpQuotaError } from '../utils/gmpQuota';
import {
  MapPin,
  Car,
  Navigation,
  AlertCircle,
  X,
  Compass,
  Train,
  ChevronRight,
  Search,
  CheckCircle2,
  Layers,
  Crosshair,
  List,
  Eye,
  EyeOff,
  AlertTriangle,
  Activity,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Droplet,
  Trash2,
  Users,
  ShieldAlert,
  Clock,
  Phone,
  Calendar,
  Route,
} from 'lucide-react';

interface UnifiedMapScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  category: string;
}

interface SearchedPlaceResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface VolunteerMapPoint {
  id: string;
  title: string;
  organization: string;
  category: string;
  date: string;
  time: string;
  location: string;
  description: string;
  lat: number;
  lng: number;
  isLiveEvent: boolean;
  joinedCount?: number;
  maxVolunteers?: number;
  isJoined?: boolean;
}

type SelectedEntity =
  | { type: 'complaint'; data: Complaint }
  | { type: 'parking'; data: ParkingLot }
  | { type: 'transit'; data: (typeof TRANSIT_HUBS)[number] }
  | { type: 'landmark'; data: Landmark }
  | { type: 'place'; data: SearchedPlaceResult }
  | { type: 'blood'; data: BloodDonationSpot }
  | { type: 'garbage'; data: GarbagePickupSpot }
  | { type: 'pothole'; data: PotholeHazardSpot }
  | { type: 'volunteer'; data: VolunteerMapPoint };

const UNIFIED_MAP_ID = 'urbanconnect-live-city-map';

const TRANSIT_HUBS = [
  {
    id: 'tr-1',
    name: 'Thane Railway Junction (CR & Trans-Harbour)',
    lat: 19.186,
    lng: 72.9759,
    type: 'train',
    line: 'Central Railway · 10 Platforms',
    desc: 'Major suburban hub connecting Central and Harbour lines.',
  },
  {
    id: 'tr-2',
    name: 'Dadar Central & Western Interchange',
    lat: 19.0178,
    lng: 72.8478,
    type: 'train',
    line: 'CR & WR Junction',
    desc: 'Mumbai mega-interchange connecting Western and Central railways.',
  },
  {
    id: 'tr-3',
    name: 'Ghatkopar Metro & Local Station',
    lat: 19.0866,
    lng: 72.9082,
    type: 'metro',
    line: 'Metro Line 1 + CR Local',
    desc: 'Seamless interchange between Mumbai Metro Line 1 and suburban local trains.',
  },
  {
    id: 'tr-4',
    name: 'Majiwada TMT Bus Terminal',
    lat: 19.212,
    lng: 72.978,
    type: 'bus',
    line: 'TMT Routes 12, 45, 110',
    desc: 'Key bus terminus for Thane Municipal Transport covering eastern and western corridors.',
  },
  {
    id: 'tr-5',
    name: 'BKC Metro Station (Aqua Line 3)',
    lat: 19.066,
    lng: 72.868,
    type: 'metro',
    line: 'Metro Line 3 Underground',
    desc: 'Underground high-capacity rapid transit station serving the business district.',
  },
];

const QUICK_LANDMARKS: Landmark[] = [
  {
    id: 'lm-1',
    name: 'Majiwada Junction',
    lat: 19.2085,
    lng: 72.9815,
    description: 'Eastern Express Highway & Ghodbunder Road central civic intersection',
    category: 'Major Junction',
  },
  {
    id: 'lm-2',
    name: 'Thane Station',
    lat: 19.186,
    lng: 72.9759,
    description: 'Historic terminal with 10 platforms and bustling civic services',
    category: 'Transit Hub',
  },
  {
    id: 'lm-3',
    name: 'Upvan Lake',
    lat: 19.2198,
    lng: 72.9642,
    description: 'Scenic recreational park, Sanskruti Arts Festival venue',
    category: 'Park & Lake',
  },
  {
    id: 'lm-4',
    name: 'Dadar Chowk',
    lat: 19.0178,
    lng: 72.8478,
    description: 'Heart of Mumbai civic transport & flower market precinct',
    category: 'City Centre',
  },
  {
    id: 'lm-5',
    name: 'BKC Hub',
    lat: 19.066,
    lng: 72.868,
    description: 'Bandra Kurla Complex International Finance & Tech Hub',
    category: 'Commercial',
  },
];

type MapStyleMode = 'google-streets' | 'google-dark' | 'google-hybrid' | 'google-terrain';

const STYLE_CONFIG: Record<
  MapStyleMode,
  { mapTypeId: string; colorScheme: ColorScheme; name: string }
> = {
  'google-streets': {
    mapTypeId: 'roadmap',
    colorScheme: ColorScheme.LIGHT,
    name: 'Google Streets',
  },
  'google-dark': {
    mapTypeId: 'roadmap',
    colorScheme: ColorScheme.DARK,
    name: 'Night / Dark Mode',
  },
  'google-hybrid': {
    mapTypeId: 'hybrid',
    colorScheme: ColorScheme.LIGHT,
    name: 'Satellite + Labels',
  },
  'google-terrain': {
    mapTypeId: 'terrain',
    colorScheme: ColorScheme.LIGHT,
    name: 'Terrain Relief',
  },
};

const isValidLatLng = (lat: unknown, lng: unknown): lat is number =>
  typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng);

function getCategoryColor(cat?: string): string {
  const lower = (cat || '').toLowerCase();
  if (lower.includes('road') || lower.includes('pothole')) return '#FF9500';
  if (lower.includes('sanitation') || lower.includes('waste') || lower.includes('garbage')) return '#AF52DE';
  if (lower.includes('water') || lower.includes('drain')) return '#0071E3';
  if (lower.includes('electric') || lower.includes('power') || lower.includes('light')) return '#FFCC00';
  return '#FF3B30';
}

/**
 * Manages real Google Maps TrafficLayer and optional GPS accuracy circle.
 * Uses only official TrafficLayer (no custom man-made road polylines).
 */
function GoogleMapImperativeLayers({
  showTraffic,
  userLocation,
}: {
  showTraffic: boolean;
  userLocation: { lat: number; lng: number; accuracy: number } | null;
}) {
  const map = useMap(UNIFIED_MAP_ID);
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib || !showTraffic) return;
    const trafficLayer = new mapsLib.TrafficLayer();
    trafficLayer.setMap(map);
    return () => {
      trafficLayer.setMap(null);
    };
  }, [map, mapsLib, showTraffic]);

  useEffect(() => {
    if (!map || !mapsLib || !userLocation || !userLocation.accuracy || userLocation.accuracy >= 2000) {
      return;
    }

    const circle = new mapsLib.Circle({
      center: { lat: userLocation.lat, lng: userLocation.lng },
      radius: userLocation.accuracy,
      strokeColor: '#007AFF',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#007AFF',
      fillOpacity: 0.12,
      clickable: false,
      map,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, mapsLib, userLocation]);

  return null;
}

function UnifiedMapScreenInner({ onNavigate, currentUser }: UnifiedMapScreenProps) {
  const map = useMap(UNIFIED_MAP_ID);
  const placesLib = useMapsLibrary('places');
  const apiStatus = useApiLoadingStatus();

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const data = getComplaints();
    return Array.isArray(data) ? data : [];
  });
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(() => {
    const data = getParkingLots();
    return Array.isArray(data) ? data : [];
  });
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>(() => {
    const data = getBloodDonors();
    return Array.isArray(data) ? data : [];
  });
  const [volunteerEvents, setVolunteerEvents] = useState<VolunteerEvent[]>(() => {
    const data = getVolunteerEvents();
    return Array.isArray(data) ? data : [];
  });

  // Keep map datasets synced with live Firestore / cross-tab updates
  useEffect(() => {
    const unsubC = subscribeToCollection(COLLECTIONS.COMPLAINTS, () => setComplaints(getComplaints()));
    const unsubP = subscribeToCollection(COLLECTIONS.PARKING, () => setParkingLots(getParkingLots()));
    const unsubB = subscribeToCollection(COLLECTIONS.BLOOD_DONORS, () => setBloodDonors(getBloodDonors()));
    const unsubV = subscribeToCollection(COLLECTIONS.VOLUNTEER_EVENTS, () =>
      setVolunteerEvents(getVolunteerEvents())
    );
    return () => {
      unsubC();
      unsubP();
      unsubB();
      unsubV();
    };
  }, []);

  const [mapStyle, setMapStyle] = useState<MapStyleMode>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'google-dark'
      : 'google-streets'
  );
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [searchedPlace, setSearchedPlace] = useState<SearchedPlaceResult | null>(null);
  const [showItemsListModal, setShowItemsListModal] = useState(false);
  const [showAvoidAdvisoryPanel, setShowAvoidAdvisoryPanel] = useState(false);

  // Full immersion toggle for phones (hides search and chips)
  const [showOverlays, setShowOverlays] = useState(true);

  // Layer toggles
  const [showTraffic, setShowTraffic] = useState(true);
  const [showPotholes, setShowPotholes] = useState(true);
  const [showBlood, setShowBlood] = useState(true);
  const [showGarbage, setShowGarbage] = useState(true);
  const [showParking, setShowParking] = useState(true);
  const [showVolunteer, setShowVolunteer] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);
  const [showTransit, setShowTransit] = useState(true);

  // Collapsed pill on mobile so map viewport remains unobstructed
  const [isTrafficLegendExpanded, setIsTrafficLegendExpanded] = useState(false);

  // User GPS Location State
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);

  // Selected item popup state
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Combine curated pothole hazards with active citizen pothole/road complaints
  const allPotholeAdvisories = useMemo<PotholeHazardSpot[]>(() => {
    const activeComplaintPotholes: PotholeHazardSpot[] = complaints
      .filter((c) => {
        const text = `${c.category || ''} ${c.title || ''} ${c.description || ''}`.toLowerCase();
        const isRoadOrPothole = text.includes('pothole') || text.includes('road');
        const isActive = c.status !== 'Resolved';
        return isRoadOrPothole && isActive && isValidLatLng(c.latitude, c.longitude);
      })
      .map((c) => ({
        id: `cmp-ph-${c.id}`,
        name: c.title,
        roadStretch: c.location,
        severity: c.priority === 'High' || c.priority === 'Critical' ? 'Severe' : 'Moderate',
        advisory: `Avoid this stretch — active citizen pothole report (${c.status}). Slow moving bottleneck reported.`,
        alternateRoute: `Use parallel arterial road or check Journey Planner to bypass ${c.location}.`,
        delayMinutes: c.priority === 'Critical' ? 25 : 15,
        reportedDate: c.dateFiled || 'Active Citizen Report',
        ward: c.ward || 'Municipal Ward',
        lat: c.latitude!,
        lng: c.longitude!,
      }));

    return [...POTHOLE_AVOID_SPOTS, ...activeComplaintPotholes];
  }, [complaints]);

  // Combine live VolunteerEvents with Extra Volunteer Hubs
  const allVolunteerPoints = useMemo<VolunteerMapPoint[]>(() => {
    const currentUid = currentUser?.uid || currentUser?.citizenId || 'usr-1';
    const livePoints: VolunteerMapPoint[] = volunteerEvents.map((evt) => {
      const coords =
        isValidLatLng(evt.latitude, evt.longitude)
          ? { lat: evt.latitude, lng: evt.longitude }
          : resolveVolunteerCoords(evt.id, evt.location);
      const isJoined =
        evt.isJoined || Boolean(evt.registeredUserIds?.includes(currentUid));
      return {
        id: evt.id,
        title: evt.title,
        organization: evt.organization,
        category: evt.category,
        date: evt.date,
        time: evt.time,
        location: evt.location,
        description: evt.description,
        lat: coords.lat,
        lng: coords.lng,
        isLiveEvent: true,
        joinedCount: evt.joinedCount,
        maxVolunteers: evt.maxVolunteers,
        isJoined,
      };
    });

    const extraPoints: VolunteerMapPoint[] = EXTRA_VOLUNTEER_HUBS.map((hub) => ({
      ...hub,
      isLiveEvent: false,
    }));

    return [...livePoints, ...extraPoints];
  }, [volunteerEvents, currentUser]);

  const availableDonors = useMemo(
    () => bloodDonors.filter((d) => d.isAvailable),
    [bloodDonors]
  );

  const handlePanTo = useCallback(
    (lat: number, lng: number, zoom = 15) => {
      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(zoom);
      }
    },
    [map]
  );

  const handleSelectEntity = useCallback(
    (entity: SelectedEntity, lat?: number, lng?: number) => {
      setSelectedEntity(entity);
      setActionFeedback(null);
      if (lat && lng && map) {
        map.panTo({ lat: lat - 0.003, lng });
        const currentZoom = map.getZoom() ?? 13;
        if (currentZoom < 14) {
          map.setZoom(15);
        }
      }
    },
    [map]
  );

  const handleZoomIn = () => {
    if (map) {
      map.setZoom(Math.min(20, (map.getZoom() ?? 13) + 1));
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom(Math.max(5, (map.getZoom() ?? 13) - 1));
    }
  };

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatusMessage('Geolocation not supported on this browser');
      setTimeout(() => setGpsStatusMessage(null), 3500);
      return;
    }

    setIsLocating(true);
    setGpsStatusMessage('Acquiring high-accuracy GPS...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        setGpsStatusMessage(`GPS Located (±${Math.round(accuracy)}m)`);
        setTimeout(() => setGpsStatusMessage(null), 3000);
        handlePanTo(latitude, longitude, 16);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation notice:', err.message);
        setGpsStatusMessage('Location permission unavailable. Centered on Mumbai–Thane.');
        setTimeout(() => setGpsStatusMessage(null), 3500);
        handlePanTo(19.2085, 72.9815, 14);
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 10000,
      }
    );
  }, [handlePanTo]);

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    const q = trimmed.toLowerCase();

    // 1. Check Pothole / Avoid Route Advisories
    const foundPothole = allPotholeAdvisories.find(
      (ph) =>
        ph.name.toLowerCase().includes(q) ||
        ph.roadStretch.toLowerCase().includes(q) ||
        q.includes('pothole') ||
        q.includes('avoid')
    );
    if (foundPothole) {
      setShowPotholes(true);
      handleSelectEntity({ type: 'pothole', data: foundPothole }, foundPothole.lat, foundPothole.lng);
      return;
    }

    // 2. Check Blood Donation Centres
    const foundBlood = BLOOD_DONATION_SPOTS.find(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.spotType.toLowerCase().includes(q) ||
        q.includes('blood') ||
        q.includes('donor')
    );
    if (foundBlood) {
      setShowBlood(true);
      handleSelectEntity({ type: 'blood', data: foundBlood }, foundBlood.lat, foundBlood.lng);
      return;
    }

    // 3. Check Garbage Pickup Spots
    const foundGarbage = GARBAGE_PICKUP_SPOTS.find(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.address.toLowerCase().includes(q) ||
        g.pickupType.toLowerCase().includes(q) ||
        q.includes('garbage') ||
        q.includes('waste') ||
        q.includes('trash') ||
        q.includes('pickup')
    );
    if (foundGarbage) {
      setShowGarbage(true);
      handleSelectEntity({ type: 'garbage', data: foundGarbage }, foundGarbage.lat, foundGarbage.lng);
      return;
    }

    // 4. Check Volunteering Spots
    const foundVolunteer = allVolunteerPoints.find(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.organization.toLowerCase().includes(q) ||
        q.includes('volunteer')
    );
    if (foundVolunteer) {
      setShowVolunteer(true);
      handleSelectEntity({ type: 'volunteer', data: foundVolunteer }, foundVolunteer.lat, foundVolunteer.lng);
      return;
    }

    // 5. Check Parking, Civic Complaints, Transit & Landmarks
    const foundParking = parkingLots.find(
      (p) => p.name.toLowerCase().includes(q) || p.ward.toLowerCase().includes(q) || q.includes('parking')
    );
    if (foundParking) {
      setShowParking(true);
      handleSelectEntity({ type: 'parking', data: foundParking }, foundParking.latitude, foundParking.longitude);
      return;
    }

    const foundLandmark = QUICK_LANDMARKS.find((lm) => lm.name.toLowerCase().includes(q));
    if (foundLandmark) {
      handleSelectEntity({ type: 'landmark', data: foundLandmark }, foundLandmark.lat, foundLandmark.lng);
      return;
    }

    const foundComplaint = complaints.find(
      (c) =>
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
    );
    if (foundComplaint && foundComplaint.latitude && foundComplaint.longitude) {
      setShowComplaints(true);
      handleSelectEntity({ type: 'complaint', data: foundComplaint }, foundComplaint.latitude, foundComplaint.longitude);
      return;
    }

    const foundTransit = TRANSIT_HUBS.find((t) => t.name.toLowerCase().includes(q));
    if (foundTransit) {
      setShowTransit(true);
      handleSelectEntity({ type: 'transit', data: foundTransit }, foundTransit.lat, foundTransit.lng);
      return;
    }

    // 6. Fallback to Google Places API (New) Place.searchByText
    if (!placesLib) return;
    setIsSearchingPlace(true);
    try {
      const { places } = await placesLib.Place.searchByText({
        textQuery: `${trimmed} Mumbai Thane`,
        fields: ['id', 'displayName', 'formattedAddress', 'location'],
        locationBias: { lat: 19.2085, lng: 72.9815 },
        maxResultCount: 1,
        language: 'en',
        region: 'IN',
        internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
      });
      const first = places?.[0];
      if (first?.location) {
        const result: SearchedPlaceResult = {
          id: first.id || `place-${Date.now()}`,
          name: first.displayName || trimmed,
          address: first.formattedAddress || 'Mumbai Metropolitan Region',
          lat: first.location.lat(),
          lng: first.location.lng(),
        };
        setSearchedPlace(result);
        handleSelectEntity({ type: 'place', data: result }, result.lat, result.lng);
      }
    } catch (err) {
      checkAndNotifyGmpQuotaError(err);
    } finally {
      setIsSearchingPlace(false);
    }
  };

  const handleReserveSlot = (lot: ParkingLot) => {
    if (lot.availableSpaces <= 0) return;
    const res = reserveParkingSlot(lot.id);
    if (res.success) {
      setParkingLots(getParkingLots());
      setSelectedEntity({
        type: 'parking',
        data: { ...lot, availableSpaces: lot.availableSpaces - 1 },
      });
      setActionFeedback(res.message || 'Slot successfully reserved!');
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleJoinVolunteerDrive = (point: VolunteerMapPoint) => {
    if (!point.isLiveEvent || point.isJoined) return;
    const userUid = currentUser?.uid || currentUser?.citizenId || 'usr-1';
    const ok = joinVolunteerEvent(point.id, userUid);
    if (ok) {
      setVolunteerEvents(getVolunteerEvents());
      setSelectedEntity({
        type: 'volunteer',
        data: {
          ...point,
          joinedCount: (point.joinedCount ?? 0) + 1,
          isJoined: true,
        },
      });
      setActionFeedback('Registered for volunteer drive! +100 Civic Points added.');
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const styleConf = STYLE_CONFIG[mapStyle];
  const isApiFailed =
    apiStatus === APILoadingStatus.FAILED || apiStatus === APILoadingStatus.AUTH_FAILURE;
  const isApiLoading = apiStatus !== APILoadingStatus.LOADED && !isApiFailed;

  const severeAvoidCount = allPotholeAdvisories.filter((p) => p.severity === 'Severe').length;

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full bg-[#E5E3DF] dark:bg-[#1C1C1E] relative overflow-hidden select-none">
      {/* Top App Bar with Layer & Style Menu */}
      <div className="relative z-30 shrink-0">
        <TopAppBar
          currentScreen="map"
          title="Live City Map"
          showBack={true}
          onBack={() => onNavigate('home')}
          onNavigate={onNavigate}
          currentUser={currentUser}
          rightAction={
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowOverlays(!showOverlays)}
                className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full transition-colors ${
                  !showOverlays
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'hover:bg-black/5 dark:hover:bg-white/10 text-[#1D1D1F] dark:text-[#F5F5F7]'
                }`}
                title={showOverlays ? 'Hide UI for Full-Screen Map' : 'Show Map Search & Overlays'}
              >
                {showOverlays ? <Eye className="w-5 h-5 text-[#86868B]" /> : <EyeOff className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStyleMenu(!showStyleMenu)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors"
                  title="Change Map Type & Overlays"
                >
                  <Layers className="w-5 h-5 text-[#007AFF]" />
                </button>

                {showStyleMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 p-2 z-50 flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-[#86868B] px-2.5 py-1">
                      Google Maps Style
                    </span>
                    {(Object.keys(STYLE_CONFIG) as MapStyleMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setMapStyle(mode);
                          setShowStyleMenu(false);
                        }}
                        className={`px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                          mapStyle === mode
                            ? 'bg-[#007AFF] text-white shadow-xs'
                            : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <span>{STYLE_CONFIG[mode].name}</span>
                        {mapStyle === mode && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}

                    <div className="border-t border-black/10 dark:border-white/10 my-1 pt-1.5 space-y-1">
                      <span className="text-[11px] font-semibold text-[#86868B] px-2.5 py-1 block">
                        Quick Layers
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowTraffic(!showTraffic);
                          setShowStyleMenu(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                          showTraffic
                            ? 'bg-[#FF9500]/15 text-[#FF9500] dark:text-[#FFA000]'
                            : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#FF9500]" />
                          <span>Live Traffic Flow</span>
                        </div>
                        <span className="text-[11px] font-bold">{showTraffic ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const allActive =
                            showPotholes &&
                            showBlood &&
                            showGarbage &&
                            showParking &&
                            showVolunteer &&
                            showComplaints &&
                            showTransit;
                          const next = !allActive;
                          setShowPotholes(next);
                          setShowBlood(next);
                          setShowGarbage(next);
                          setShowParking(next);
                          setShowVolunteer(next);
                          setShowComplaints(next);
                          setShowTransit(next);
                          setShowStyleMenu(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <span>Toggle All Map Pins</span>
                        <span className="text-[11px] text-[#007AFF] font-semibold">Switch</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          }
        />
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 w-full relative z-10 bg-[#E5E3DF] dark:bg-[#1C1C1E] min-h-[360px] overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <GoogleMap
            id={UNIFIED_MAP_ID}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            defaultCenter={{ lat: 19.2085, lng: 72.9815 }}
            defaultZoom={12}
            mapTypeId={styleConf.mapTypeId}
            colorScheme={styleConf.colorScheme}
            gestureHandling="greedy"
            disableDefaultUI={true}
            style={{ width: '100%', height: '100%' }}
            onClick={() => {
              setShowStyleMenu(false);
              setShowAvoidAdvisoryPanel(false);
            }}
          >
            <GoogleMapImperativeLayers showTraffic={showTraffic} userLocation={userLocation} />

            {/* User GPS Pulsing Marker */}
            {userLocation && (
              <AdvancedMarker
                position={{ lat: userLocation.lat, lng: userLocation.lng }}
                title={`Your Location (±${Math.round(userLocation.accuracy)}m)`}
              >
                <div className="user-location-pulsing-marker relative flex items-center justify-center w-10 h-10">
                  <div className="user-location-pulse" />
                  <div className="user-location-dot" />
                </div>
              </AdvancedMarker>
            )}

            {/* Pothole Hazard & Route Avoidance Pins */}
            {showPotholes &&
              allPotholeAdvisories.map((ph) => {
                const isSevere = ph.severity === 'Severe';
                const pinBg = isSevere ? '#DC2626' : '#EA580C';
                return (
                  <AdvancedMarker
                    key={`ph-${ph.id}`}
                    position={{ lat: ph.lat, lng: ph.lng }}
                    title={`Avoid Route: ${ph.name} (${ph.severity} Potholes)`}
                    zIndex={45}
                    onClick={() => handleSelectEntity({ type: 'pothole', data: ph }, ph.lat, ph.lng)}
                  >
                    <div className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
                      <div
                        className="px-2 py-1 rounded-xl text-white text-[10px] font-bold flex items-center gap-1 shadow-lg border-2 border-white whitespace-nowrap"
                        style={{ backgroundColor: pinBg }}
                      >
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>Avoid</span>
                      </div>
                      <div className="w-2 h-2 rotate-45 -mt-1" style={{ backgroundColor: pinBg }} />
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Blood Donation Centres & Camps */}
            {showBlood &&
              BLOOD_DONATION_SPOTS.map((spot) => (
                <AdvancedMarker
                  key={`bld-${spot.id}`}
                  position={{ lat: spot.lat, lng: spot.lng }}
                  title={`${spot.name} (${spot.spotType})`}
                  zIndex={35}
                  onClick={() => handleSelectEntity({ type: 'blood', data: spot }, spot.lat, spot.lng)}
                >
                  <div className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
                    <div className="w-8 h-8 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-lg border-2 border-white">
                      <Droplet className="w-4 h-4 fill-current" />
                    </div>
                    <div className="w-2 h-2 bg-[#E11D48] rotate-45 -mt-1" />
                  </div>
                </AdvancedMarker>
              ))}

            {/* Municipal Garbage Pickup & Segregation Spots */}
            {showGarbage &&
              GARBAGE_PICKUP_SPOTS.map((spot) => (
                <AdvancedMarker
                  key={`garb-${spot.id}`}
                  position={{ lat: spot.lat, lng: spot.lng }}
                  title={`${spot.name} (${spot.pickupType})`}
                  zIndex={30}
                  onClick={() => handleSelectEntity({ type: 'garbage', data: spot }, spot.lat, spot.lng)}
                >
                  <div className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
                    <div className="w-8 h-8 rounded-full bg-[#0D9488] text-white flex items-center justify-center shadow-lg border-2 border-white">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div className="w-2 h-2 bg-[#0D9488] rotate-45 -mt-1" />
                  </div>
                </AdvancedMarker>
              ))}

            {/* Volunteering Places & Drives */}
            {showVolunteer &&
              allVolunteerPoints.map((vol) => (
                <AdvancedMarker
                  key={`vol-${vol.id}`}
                  position={{ lat: vol.lat, lng: vol.lng }}
                  title={vol.title}
                  zIndex={32}
                  onClick={() => handleSelectEntity({ type: 'volunteer', data: vol }, vol.lat, vol.lng)}
                >
                  <div className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
                    <div className="w-8 h-8 rounded-full bg-[#6366F1] text-white flex items-center justify-center shadow-lg border-2 border-white">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="w-2 h-2 bg-[#6366F1] rotate-45 -mt-1" />
                  </div>
                </AdvancedMarker>
              ))}

            {/* Smart Parking Pins */}
            {showParking &&
              parkingLots.map((p) => {
                if (!p || !isValidLatLng(p.latitude, p.longitude)) return null;
                const isFull = p.availableSpaces === 0;
                const isFast = p.status === 'Fast Filling' || p.availableSpaces < 15;
                const bg = isFull ? '#FF3B30' : isFast ? '#FF9500' : '#34C759';
                return (
                  <AdvancedMarker
                    key={`pk-${p.id}`}
                    position={{ lat: p.latitude, lng: p.longitude }}
                    title={`${p.name} (${p.availableSpaces} spots)`}
                    zIndex={28}
                    onClick={() => handleSelectEntity({ type: 'parking', data: p }, p.latitude, p.longitude)}
                  >
                    <div className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
                      <div
                        className="px-2 py-0.5 rounded-full text-white text-[11px] font-extrabold flex items-center gap-1 shadow-lg border-2 border-white tabular-nums"
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

            {/* Civic Complaint Pins */}
            {showComplaints &&
              complaints.map((c) => {
                if (!c || !isValidLatLng(c.latitude, c.longitude)) return null;
                const color = getCategoryColor(c.category);
                return (
                  <AdvancedMarker
                    key={`cmp-${c.id}`}
                    position={{ lat: c.latitude, lng: c.longitude }}
                    title={c.title}
                    zIndex={20}
                    onClick={() => handleSelectEntity({ type: 'complaint', data: c }, c.latitude, c.longitude)}
                  >
                    <div className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
                      <div
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-white"
                        style={{ backgroundColor: color }}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="w-2 h-2 rotate-45 -mt-1" style={{ backgroundColor: color }} />
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Transit Hub Pins */}
            {showTransit &&
              TRANSIT_HUBS.map((tr) => (
                <AdvancedMarker
                  key={tr.id}
                  position={{ lat: tr.lat, lng: tr.lng }}
                  title={tr.name}
                  zIndex={22}
                  onClick={() => handleSelectEntity({ type: 'transit', data: tr }, tr.lat, tr.lng)}
                >
                  <div className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
                    <div className="w-8 h-8 rounded-full bg-[#0071E3] text-white flex items-center justify-center shadow-lg border-2 border-white">
                      <Train className="w-4 h-4" />
                    </div>
                    <div className="w-2 h-2 bg-[#0071E3] rotate-45 -mt-1" />
                  </div>
                </AdvancedMarker>
              ))}

            {/* Quick Landmark Pins */}
            {QUICK_LANDMARKS.map((lm) => (
              <AdvancedMarker
                key={lm.id}
                position={{ lat: lm.lat, lng: lm.lng }}
                title={lm.name}
                zIndex={15}
                onClick={() => handleSelectEntity({ type: 'landmark', data: lm }, lm.lat, lm.lng)}
              >
                <div className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
                  <div className="w-7 h-7 rounded-full bg-[#FF9500] text-white flex items-center justify-center shadow-md border-2 border-white">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#FF9500] rotate-45 -mt-0.5" />
                </div>
              </AdvancedMarker>
            ))}

            {/* Searched Google Place Pin */}
            {searchedPlace && (
              <AdvancedMarker
                key={searchedPlace.id}
                position={{ lat: searchedPlace.lat, lng: searchedPlace.lng }}
                title={searchedPlace.name}
                zIndex={50}
                onClick={() =>
                  handleSelectEntity({ type: 'place', data: searchedPlace }, searchedPlace.lat, searchedPlace.lng)
                }
              >
                <div className="relative flex flex-col items-center cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-[#5856D6] text-white flex items-center justify-center shadow-xl border-2 border-white">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="w-2 h-2 bg-[#5856D6] rotate-45 -mt-1" />
                </div>
              </AdvancedMarker>
            )}
          </GoogleMap>
        </div>

        {/* Loading Indicator */}
        {(isApiLoading || isSearchingPlace) && !isApiFailed && (
          <div className="absolute bottom-4 left-3 z-20 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md shadow-md border border-black/10 dark:border-white/10 flex items-center gap-2 text-[11px] font-medium text-[#1D1D1F] dark:text-white pointer-events-none">
            <RefreshCw className="w-3.5 h-3.5 text-[#007AFF] animate-spin" />
            <span>{isSearchingPlace ? 'Searching Google Places...' : 'Loading Google Maps...'}</span>
          </div>
        )}

        {/* Map Error Recovery Overlay */}
        {isApiFailed && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-[#F5F5F7]/95 dark:bg-[#1C1C1E]/95">
            <div className="max-w-xs w-full bg-white dark:bg-[#2C2C2E] rounded-3xl p-5 shadow-xl border border-black/10 dark:border-white/10 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-[#FF9500] mx-auto" />
              <p className="text-sm font-bold text-[#1D1D1F] dark:text-white">
                Google Maps could not load
              </p>
              <p className="text-xs text-[#86868B]">
                Please verify your internet connection or Google Maps API quota and try again.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#007AFF] text-white text-xs font-semibold"
              >
                Reload Map
              </button>
            </div>
          </div>
        )}

        {/* Floating GPS Status Toast on Phone */}
        {gpsStatusMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-2 rounded-full bg-[#1D1D1F]/90 dark:bg-black/90 text-white text-[11px] font-semibold border border-white/15 shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-none">
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#007AFF] animate-spin shrink-0" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
            )}
            <span>{gpsStatusMessage}</span>
          </div>
        )}

        {/* Floating Search & Filter Carousel Header */}
        {showOverlays && (
          <div className="absolute top-3 inset-x-0 z-20 px-3 space-y-2 pointer-events-none transition-all">
            <form
              onSubmit={handleSearchSubmit}
              className="pointer-events-auto bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl rounded-2xl p-1.5 pl-3 shadow-lg border border-black/10 dark:border-white/10 flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#86868B] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blood, garbage pickup, potholes, parking, volunteer..."
                className="flex-1 bg-transparent text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-hidden min-w-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowItemsListModal(true)}
                title="Browse all city spots & route advisories"
                className="px-3 py-1.5 rounded-xl bg-[#007AFF]/10 text-[#007AFF] text-[11px] font-semibold flex items-center gap-1 hover:bg-[#007AFF]/20 transition-colors shrink-0 whitespace-nowrap"
              >
                <List className="w-3.5 h-3.5" />
                <span>Directory</span>
              </button>
            </form>

            {/* Quick Layer Filter Buttons */}
            <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <button
                type="button"
                onClick={() => setShowTraffic(!showTraffic)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md transition-all shrink-0 whitespace-nowrap shadow-xs ${
                  showTraffic
                    ? 'bg-[#FF9500] text-white shadow-md shadow-[#FF9500]/25'
                    : 'bg-white/90 dark:bg-[#2C2C2E]/90 text-[#86868B] border border-black/5 dark:border-white/10'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Traffic</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPotholes(!showPotholes)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-xs transition-all shrink-0 whitespace-nowrap tabular-nums ${
                  showPotholes
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-white/90 dark:bg-[#2C2C2E]/90 text-[#86868B] border border-black/5 dark:border-white/10'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Potholes · Avoid ({allPotholeAdvisories.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBlood(!showBlood)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-xs transition-all shrink-0 whitespace-nowrap tabular-nums ${
                  showBlood
                    ? 'bg-[#E11D48] text-white'
                    : 'bg-white/90 dark:bg-[#2C2C2E]/90 text-[#86868B] border border-black/5 dark:border-white/10'
                }`}
              >
                <Droplet className="w-3.5 h-3.5" />
                <span>Blood ({BLOOD_DONATION_SPOTS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGarbage(!showGarbage)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-xs transition-all shrink-0 whitespace-nowrap tabular-nums ${
                  showGarbage
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-white/90 dark:bg-[#2C2C2E]/90 text-[#86868B] border border-black/5 dark:border-white/10'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Garbage Pickup ({GARBAGE_PICKUP_SPOTS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowParking(!showParking)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-xs transition-all shrink-0 whitespace-nowrap tabular-nums ${
                  showParking
                    ? 'bg-[#34C759] text-white'
                    : 'bg-white/90 dark:bg-[#2C2C2E]/90 text-[#86868B] border border-black/5 dark:border-white/10'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Parking ({parkingLots.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVolunteer(!showVolunteer)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-xs transition-all shrink-0 whitespace-nowrap tabular-nums ${
                  showVolunteer
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-white/90 dark:bg-[#2C2C2E]/90 text-[#86868B] border border-black/5 dark:border-white/10'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Volunteering ({allVolunteerPoints.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowComplaints(!showComplaints)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-xs transition-all shrink-0 whitespace-nowrap tabular-nums ${
                  showComplaints
                    ? 'bg-[#FF3B30] text-white'
                    : 'bg-white/90 dark:bg-[#2C2C2E]/90 text-[#86868B] border border-black/5 dark:border-white/10'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Civic ({complaints.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTransit(!showTransit)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-xs transition-all shrink-0 whitespace-nowrap tabular-nums ${
                  showTransit
                    ? 'bg-[#007AFF] text-white'
                    : 'bg-white/90 dark:bg-[#2C2C2E]/90 text-[#86868B] border border-black/5 dark:border-white/10'
                }`}
              >
                <Train className="w-3.5 h-3.5" />
                <span>Transit ({TRANSIT_HUBS.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Compact Status Row: Live Traffic Legend + Route Avoidance Advisory Drawer */}
        {showOverlays && (showTraffic || showPotholes) && (
          <div className="absolute top-24 left-3 right-3 z-20 flex flex-wrap items-start gap-2 pointer-events-none">
            {showTraffic && (
              <div className="pointer-events-auto bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-black/10 dark:border-white/10 text-xs max-w-[230px]">
                <button
                  type="button"
                  onClick={() => setIsTrafficLegendExpanded(!isTrafficLegendExpanded)}
                  className="flex items-center justify-between gap-2 w-full text-left"
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-[11px] text-[#1D1D1F] dark:text-white">
                      Live Traffic
                    </span>
                    <span className="text-[10px] text-[#86868B] font-medium">Real roads</span>
                  </div>
                  {isTrafficLegendExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#86868B]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B]" />
                  )}
                </button>

                {isTrafficLegendExpanded && (
                  <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2.5 text-[10px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
                      Fast
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500]" />
                      Med
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" />
                      Slow
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8B0000]" />
                      Heavy
                    </span>
                  </div>
                )}
              </div>
            )}

            {showPotholes && allPotholeAdvisories.length > 0 && (
              <div className="pointer-events-auto max-w-xs">
                <button
                  type="button"
                  onClick={() => setShowAvoidAdvisoryPanel(!showAvoidAdvisoryPanel)}
                  className="bg-[#DC2626] text-white rounded-2xl px-3 py-2 shadow-xl border border-white/20 flex items-center gap-2 text-[11px] font-bold hover:bg-[#B91C1C] transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span className="tabular-nums">
                    Avoid {allPotholeAdvisories.length} Pothole Routes ({severeAvoidCount} Severe)
                  </span>
                  {showAvoidAdvisoryPanel ? (
                    <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  )}
                </button>

                {showAvoidAdvisoryPanel && (
                  <div className="mt-1.5 bg-white/98 dark:bg-[#1C1C1E]/98 backdrop-blur-2xl rounded-2xl p-2.5 shadow-2xl border border-[#DC2626]/25 space-y-2 max-h-60 overflow-y-auto">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold text-[#DC2626] dark:text-[#F87171]">
                        Map Advisory · Do Not Take These Routes
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAvoidAdvisoryPanel(false)}
                        className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {allPotholeAdvisories.map((ph) => (
                      <button
                        key={ph.id}
                        type="button"
                        onClick={() => {
                          handleSelectEntity({ type: 'pothole', data: ph }, ph.lat, ph.lng);
                          setShowAvoidAdvisoryPanel(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-[#FEF2F2] dark:bg-[#2C1A1A] hover:bg-[#FEE2E2] dark:hover:bg-[#3B1F1F] border border-[#DC2626]/15 transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#1D1D1F] dark:text-white truncate">
                            {ph.name}
                          </span>
                          <span className="text-[10px] font-bold text-[#DC2626] dark:text-[#FCA5A5] shrink-0 tabular-nums">
                            {ph.severity} · +{ph.delayMinutes}m
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6E6E73] dark:text-[#D1D1D6] line-clamp-1">
                          Take instead: {ph.alternateRoute}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile-Friendly Floating Controls */}
        <div className="absolute right-3 bottom-4 z-20 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-11 h-11 rounded-2xl bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-md shadow-lg border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center active:scale-90 transition-all font-bold"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-11 h-11 rounded-2xl bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-md shadow-lg border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center active:scale-90 transition-all font-bold"
          >
            <Minus className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            title="My GPS Location"
            className={`w-11 h-11 rounded-2xl backdrop-blur-md shadow-lg border border-black/10 dark:border-white/10 flex items-center justify-center active:scale-90 transition-all ${
              userLocation
                ? 'bg-[#007AFF] text-white shadow-[#007AFF]/35'
                : 'bg-white/95 dark:bg-[#2C2C2E]/95 text-[#007AFF]'
            }`}
          >
            {isLocating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => handlePanTo(19.2085, 72.9815, 12)}
            title="Reset Map to Mumbai-Thane Center"
            className="w-11 h-11 rounded-2xl bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-md shadow-lg border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center active:scale-90 transition-all"
          >
            <Compass className="w-5 h-5 text-[#007AFF]" />
          </button>
        </div>

        {/* Interactive Bottom Sheet Card */}
        {selectedEntity && (
          <div className="absolute inset-x-2.5 bottom-3 z-30 max-w-lg mx-auto">
            <div className="bg-white/98 dark:bg-[#2C2C2E]/98 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-black/10 dark:border-white/15 space-y-3">
              <div className="w-10 h-1 bg-black/20 dark:bg-white/20 rounded-full mx-auto -mt-1" />

              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{
                      backgroundColor:
                        selectedEntity.type === 'pothole'
                          ? selectedEntity.data.severity === 'Severe'
                            ? '#DC2626'
                            : '#EA580C'
                          : selectedEntity.type === 'blood'
                          ? '#E11D48'
                          : selectedEntity.type === 'garbage'
                          ? '#0D9488'
                          : selectedEntity.type === 'volunteer'
                          ? '#6366F1'
                          : selectedEntity.type === 'complaint'
                          ? '#FF3B30'
                          : selectedEntity.type === 'parking'
                          ? '#34C759'
                          : selectedEntity.type === 'place'
                          ? '#5856D6'
                          : '#007AFF',
                    }}
                  >
                    {selectedEntity.type === 'pothole' && <ShieldAlert className="w-5 h-5" />}
                    {selectedEntity.type === 'blood' && <Droplet className="w-5 h-5 fill-current" />}
                    {selectedEntity.type === 'garbage' && <Trash2 className="w-5 h-5" />}
                    {selectedEntity.type === 'volunteer' && <Users className="w-5 h-5" />}
                    {selectedEntity.type === 'complaint' && <AlertCircle className="w-5 h-5" />}
                    {selectedEntity.type === 'parking' && <Car className="w-5 h-5" />}
                    {selectedEntity.type === 'transit' && <Train className="w-5 h-5" />}
                    {(selectedEntity.type === 'landmark' || selectedEntity.type === 'place') && (
                      <MapPin className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#86868B] flex-wrap">
                      <span>
                        {selectedEntity.type === 'pothole'
                          ? 'Road Hazard Advisory'
                          : selectedEntity.type === 'blood'
                          ? selectedEntity.data.spotType
                          : selectedEntity.type === 'garbage'
                          ? selectedEntity.data.pickupType
                          : selectedEntity.type === 'volunteer'
                          ? `Volunteering · ${selectedEntity.data.category}`
                          : selectedEntity.type === 'complaint'
                          ? `${selectedEntity.data.category} · ${selectedEntity.data.status}`
                          : selectedEntity.type === 'parking'
                          ? 'Smart Parking'
                          : selectedEntity.type === 'transit'
                          ? 'Transit Hub'
                          : selectedEntity.type === 'place'
                          ? 'Google Place'
                          : selectedEntity.data.category}
                      </span>
                      {selectedEntity.type === 'pothole' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-bold text-[#DC2626] dark:text-[#FCA5A5]">
                            {selectedEntity.data.severity} · +{selectedEntity.data.delayMinutes}m delay
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-white leading-tight truncate">
                      {selectedEntity.type === 'volunteer' || selectedEntity.type === 'complaint'
                        ? selectedEntity.data.title
                        : selectedEntity.data.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEntity(null)}
                  className="min-w-[36px] min-h-[36px] rounded-full bg-black/5 dark:bg-white/10 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content Details by Type */}
              <div className="text-xs text-[#6E6E73] dark:text-[#A1A1AA] space-y-2">
                {selectedEntity.type === 'pothole' && (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-2xl bg-[#FEF2F2] dark:bg-[#3B1919] border border-[#DC2626]/20 space-y-1">
                      <p className="text-xs font-bold text-[#B91C1C] dark:text-[#FCA5A5]">
                        Do Not Take This Route
                      </p>
                      <p className="text-[11px] text-[#7F1D1D] dark:text-[#FECACA] leading-relaxed">
                        {selectedEntity.data.advisory}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#132A1C] border border-[#16A34A]/20 space-y-0.5">
                      <p className="text-[11px] font-bold text-[#15803D] dark:text-[#86EFAC]">
                        Suggested Alternate Route
                      </p>
                      <p className="text-[11px] text-[#166534] dark:text-[#BBF7D0]">
                        {selectedEntity.data.alternateRoute}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#86868B]">
                      Stretch: {selectedEntity.data.roadStretch} · {selectedEntity.data.reportedDate}
                    </p>
                  </div>
                )}

                {selectedEntity.type === 'blood' && (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-2xl bg-[#FFF1F2] dark:bg-[#331820] border border-[#E11D48]/15 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#BE123C] dark:text-[#FDA4AF]">
                          Urgent Groups Needed: {selectedEntity.data.urgentGroups.join(', ')}
                        </span>
                        <span className="font-semibold text-[#1D1D1F] dark:text-white tabular-nums">
                          {availableDonors.length} Verified Donors Online
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#6E6E73] dark:text-[#D1D1D6] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#E11D48]" />
                          {selectedEntity.data.timings}
                        </span>
                        <span className="flex items-center gap-1 tabular-nums">
                          <Phone className="w-3.5 h-3.5 text-[#E11D48]" />
                          {selectedEntity.data.contact}
                        </span>
                      </div>
                    </div>
                    <p className="line-clamp-2">{selectedEntity.data.description}</p>
                    <p className="text-[11px] text-[#86868B]">{selectedEntity.data.address}</p>
                  </div>
                )}

                {selectedEntity.type === 'garbage' && (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-2xl bg-[#F0FDFA] dark:bg-[#132A28] border border-[#0D9488]/20 space-y-1">
                      <p className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4]">
                        Pickup Schedule: {selectedEntity.data.schedule}
                      </p>
                      <p className="text-[11px] text-[#115E59] dark:text-[#99F6E4]">
                        Accepted: {selectedEntity.data.wasteTypes}
                      </p>
                    </div>
                    <p className="line-clamp-2">{selectedEntity.data.description}</p>
                    <p className="text-[11px] text-[#86868B]">{selectedEntity.data.address}</p>
                  </div>
                )}

                {selectedEntity.type === 'volunteer' && (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-2xl bg-[#EEF2FF] dark:bg-[#1E1E38] border border-[#6366F1]/20 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#4338CA] dark:text-[#A5B4FC]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {selectedEntity.data.date} · {selectedEntity.data.time}
                        </span>
                        {selectedEntity.data.isLiveEvent && (
                          <span className="tabular-nums">
                            {selectedEntity.data.joinedCount}/{selectedEntity.data.maxVolunteers} Joined
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#4F46E5] dark:text-[#C7D2FE]">
                        Organizer: {selectedEntity.data.organization}
                      </p>
                    </div>
                    <p className="line-clamp-2">{selectedEntity.data.description}</p>
                    <p className="text-[11px] text-[#86868B]">{selectedEntity.data.location}</p>
                  </div>
                )}

                {selectedEntity.type === 'parking' && (
                  <>
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#1D1D1F] dark:text-white tabular-nums">
                          Available: {selectedEntity.data.availableSpaces} / {selectedEntity.data.totalCapacity}
                        </span>
                        <span className="text-[10px] text-[#86868B]">({selectedEntity.data.status})</span>
                      </div>
                      <span className="text-xs font-bold text-[#007AFF] tabular-nums">
                        {selectedEntity.data.hourlyRate || '₹30/hr'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#86868B]">
                      {selectedEntity.data.ward} · {selectedEntity.data.type}
                    </p>
                  </>
                )}

                {selectedEntity.type === 'transit' && (
                  <>
                    <div className="p-2 rounded-xl bg-[#007AFF]/5 text-[#007AFF] text-[11px] font-medium flex items-center gap-1.5">
                      <Train className="w-3.5 h-3.5" />
                      <span>{selectedEntity.data.line}</span>
                    </div>
                    <p className="line-clamp-2">{selectedEntity.data.desc}</p>
                  </>
                )}

                {selectedEntity.type === 'complaint' && (
                  <p className="line-clamp-2">
                    {selectedEntity.data.description || selectedEntity.data.location}
                  </p>
                )}

                {(selectedEntity.type === 'landmark' || selectedEntity.type === 'place') && (
                  <p className="line-clamp-2">
                    {selectedEntity.type === 'landmark'
                      ? selectedEntity.data.description
                      : selectedEntity.data.address}
                  </p>
                )}

                {actionFeedback && (
                  <div className="p-2 rounded-xl bg-[#34C759]/10 text-[#34C759] text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{actionFeedback}</span>
                  </div>
                )}
              </div>

              {/* Actions Bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                {selectedEntity.type === 'pothole' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onNavigate('journey-planner')}
                      className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#007AFF]/20 transition-all"
                    >
                      <Route className="w-4 h-4" />
                      <span>Plan Alternate Route</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('complaints')}
                      className="min-h-[44px] py-2 px-3 rounded-xl bg-[#F5F5F7] dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white text-xs font-semibold"
                    >
                      Road Reports
                    </button>
                  </>
                )}

                {selectedEntity.type === 'blood' && (
                  <button
                    type="button"
                    onClick={() => onNavigate('blood-donation')}
                    className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#E11D48]/20 transition-all"
                  >
                    <Droplet className="w-4 h-4 fill-current" />
                    <span>Find Blood Donors & Donate</span>
                  </button>
                )}

                {selectedEntity.type === 'garbage' && (
                  <button
                    type="button"
                    onClick={() => onNavigate('complaints')}
                    className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#0D9488]/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Report Bin Overflow / Request Pickup</span>
                  </button>
                )}

                {selectedEntity.type === 'volunteer' && (
                  <>
                    {selectedEntity.data.isLiveEvent && (
                      <button
                        type="button"
                        onClick={() => handleJoinVolunteerDrive(selectedEntity.data)}
                        disabled={selectedEntity.data.isJoined}
                        className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          selectedEntity.data.isJoined
                            ? 'bg-[#34C759]/15 text-[#15803D] dark:text-[#86EFAC] cursor-default'
                            : 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-md shadow-[#6366F1]/20'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {selectedEntity.data.isJoined ? 'Joined Drive' : 'Join Drive (+100 pts)'}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onNavigate('volunteer-events')}
                      className={`${
                        selectedEntity.data.isLiveEvent ? '' : 'flex-1'
                      } min-h-[44px] py-2 px-3 rounded-xl bg-[#F5F5F7] dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5`}
                    >
                      <Users className="w-4 h-4" />
                      <span>All Volunteer Drives</span>
                    </button>
                  </>
                )}

                {selectedEntity.type === 'parking' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReserveSlot(selectedEntity.data)}
                      disabled={selectedEntity.data.availableSpaces <= 0}
                      className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        selectedEntity.data.availableSpaces > 0
                          ? 'bg-[#34C759] hover:bg-[#2CA84A] text-white shadow-md shadow-[#34C759]/20'
                          : 'bg-[#E5E5EA] dark:bg-[#3A3A3C] text-[#86868B] cursor-not-allowed'
                      }`}
                    >
                      <Car className="w-4 h-4" />
                      <span>Reserve Slot Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('parking')}
                      className="min-h-[44px] py-2 px-3 rounded-xl bg-[#F5F5F7] dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white text-xs font-semibold"
                    >
                      Parking Hub
                    </button>
                  </>
                )}

                {selectedEntity.type === 'complaint' && (
                  <button
                    type="button"
                    onClick={() => onNavigate('complaints')}
                    className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#007AFF]/20 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Track Grievance</span>
                  </button>
                )}

                {selectedEntity.type === 'transit' && (
                  <button
                    type="button"
                    onClick={() => onNavigate('train-info')}
                    className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#007AFF]/20 transition-all"
                  >
                    <Train className="w-4 h-4" />
                    <span>View Timetable & Passes</span>
                  </button>
                )}

                {(selectedEntity.type === 'landmark' || selectedEntity.type === 'place') && (
                  <button
                    type="button"
                    onClick={() => onNavigate('journey-planner')}
                    className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#007AFF]/20 transition-all"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Directions Here</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Points of Interest & Advisories Directory Modal */}
      {showItemsListModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-3.5 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl max-w-md w-full max-h-[84vh] flex flex-col shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-white">
                  City Map Directory
                </h3>
                <p className="text-[11px] text-[#86868B]">
                  Tap any route advisory, donation bank, pickup hub, parking, or drive
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowItemsListModal(false)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                aria-label="Close directory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Pothole Hazards & Avoid Advisories */}
              <div>
                <h4 className="text-[11px] font-bold text-[#DC2626] dark:text-[#FCA5A5] mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Potholes & Routes to Avoid ({allPotholeAdvisories.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {allPotholeAdvisories.map((ph) => (
                    <button
                      key={ph.id}
                      type="button"
                      onClick={() => {
                        setShowPotholes(true);
                        handleSelectEntity({ type: 'pothole', data: ph }, ph.lat, ph.lng);
                        setShowItemsListModal(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-[#FEF2F2] dark:bg-[#2C1A1A] hover:bg-[#FEE2E2] dark:hover:bg-[#3B1F1F] transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">
                          {ph.name}
                        </p>
                        <p className="text-[11px] text-[#B91C1C] dark:text-[#FCA5A5] truncate">
                          {ph.severity} · Avoid & take: {ph.alternateRoute}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#DC2626] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Blood Donation Spots */}
              <div>
                <h4 className="text-[11px] font-bold text-[#E11D48] dark:text-[#FDA4AF] mb-2 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5" />
                  <span>Blood Donation Centres ({BLOOD_DONATION_SPOTS.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {BLOOD_DONATION_SPOTS.map((spot) => (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => {
                        setShowBlood(true);
                        handleSelectEntity({ type: 'blood', data: spot }, spot.lat, spot.lng);
                        setShowItemsListModal(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">
                          {spot.name}
                        </p>
                        <p className="text-[11px] text-[#86868B] truncate">
                          {spot.spotType} · Urgent: {spot.urgentGroups.join(', ')}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#86868B] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Garbage Pickup Spots */}
              <div>
                <h4 className="text-[11px] font-bold text-[#0D9488] dark:text-[#5EEAD4] mb-2 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Garbage Pickup & Recycling ({GARBAGE_PICKUP_SPOTS.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {GARBAGE_PICKUP_SPOTS.map((spot) => (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => {
                        setShowGarbage(true);
                        handleSelectEntity({ type: 'garbage', data: spot }, spot.lat, spot.lng);
                        setShowItemsListModal(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">
                          {spot.name}
                        </p>
                        <p className="text-[11px] text-[#86868B] truncate">
                          {spot.pickupType} · {spot.schedule}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#86868B] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Volunteering Places */}
              <div>
                <h4 className="text-[11px] font-bold text-[#6366F1] dark:text-[#A5B4FC] mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Volunteering Places ({allVolunteerPoints.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {allVolunteerPoints.map((vol) => (
                    <button
                      key={vol.id}
                      type="button"
                      onClick={() => {
                        setShowVolunteer(true);
                        handleSelectEntity({ type: 'volunteer', data: vol }, vol.lat, vol.lng);
                        setShowItemsListModal(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">
                          {vol.title}
                        </p>
                        <p className="text-[11px] text-[#86868B] truncate">
                          {vol.date} · {vol.location}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#86868B] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Parking */}
              <div>
                <h4 className="text-[11px] font-bold text-[#34C759] mb-2 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" />
                  <span>Parking Facilities ({parkingLots.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {parkingLots.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setShowParking(true);
                        handleSelectEntity({ type: 'parking', data: p }, p.latitude, p.longitude);
                        setShowItemsListModal(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-[#86868B] truncate tabular-nums">
                          {p.availableSpaces} spots available · {p.ward}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#86868B] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Civic Complaints */}
              <div>
                <h4 className="text-[11px] font-bold text-[#FF3B30] mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Civic Issues ({complaints.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {complaints.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setShowComplaints(true);
                        handleSelectEntity({ type: 'complaint', data: c }, c.latitude, c.longitude);
                        setShowItemsListModal(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">
                          {c.title}
                        </p>
                        <p className="text-[11px] text-[#86868B] truncate">{c.location}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#86868B] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Transit */}
              <div>
                <h4 className="text-[11px] font-bold text-[#007AFF] mb-2 flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5" />
                  <span>Transit Hubs ({TRANSIT_HUBS.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {TRANSIT_HUBS.map((tr) => (
                    <button
                      key={tr.id}
                      type="button"
                      onClick={() => {
                        setShowTransit(true);
                        handleSelectEntity({ type: 'transit', data: tr }, tr.lat, tr.lng);
                        setShowItemsListModal(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">
                          {tr.name}
                        </p>
                        <p className="text-[11px] text-[#86868B] truncate">{tr.line}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#86868B] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function UnifiedMapScreen(props: UnifiedMapScreenProps) {
  const hasApiKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  if (!hasApiKey) {
    return (
      <div className="flex-1 min-h-0 flex flex-col w-full bg-[#F5F5F7] dark:bg-[#1C1C1E]">
        <TopAppBar
          currentScreen="map"
          title="Live City Map"
          showBack={true}
          onBack={() => props.onNavigate('home')}
          onNavigate={props.onNavigate}
          currentUser={props.currentUser}
        />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-xs w-full bg-white dark:bg-[#2C2C2E] rounded-3xl p-6 shadow-xl border border-black/10 dark:border-white/10 space-y-3">
            <AlertTriangle className="w-8 h-8 text-[#FF9500] mx-auto" />
            <p className="text-sm font-bold text-[#1D1D1F] dark:text-white">
              Google Maps API key pending activation
            </p>
            <p className="text-xs text-[#86868B]">
              Restart the server or reload after provisioning finishes to display Google Maps.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <UnifiedMapScreenInner {...props} />;
}
