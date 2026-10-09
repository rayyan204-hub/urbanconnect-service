import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { ScreenId, Complaint, ParkingLot, UserProfile } from '../types';
import { getComplaints, getParkingLots, reserveParkingSlot } from '../services/dbService';
import { TopAppBar } from '../components/common/TopAppBar';
import {
  Layers,
  MapPin,
  Car,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Filter,
  X,
  Compass,
  Train,
  Bus,
  Shield,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';

interface UnifiedMapScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

const TRANSIT_HUBS = [
  { id: 'tr-1', name: 'Thane Railway Junction (CR & Trans-Harbour)', lat: 19.186, lng: 72.9759, type: 'train', line: 'Central Railway • 10 Platforms' },
  { id: 'tr-2', name: 'Dadar Central & Western Interchange', lat: 19.0178, lng: 72.8478, type: 'train', line: 'CR & WR Junction' },
  { id: 'tr-3', name: 'Ghatkopar Metro & Local Station', lat: 19.0866, lng: 72.9082, type: 'metro', line: 'Metro Line 1 + CR Local' },
  { id: 'tr-4', name: 'Majiwada TMT Bus Terminal', lat: 19.212, lng: 72.978, type: 'bus', line: 'TMT Routes 12, 45, 110' },
  { id: 'tr-5', name: 'BKC Metro Station (Aqua Line 3)', lat: 19.066, lng: 72.868, type: 'metro', line: 'Metro Line 3 Underground' },
];

export function UnifiedMapScreen({ onNavigate, currentUser }: UnifiedMapScreenProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints());
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(getParkingLots());

  // Layer toggles
  const [showComplaints, setShowComplaints] = useState(true);
  const [showParking, setShowParking] = useState(true);
  const [showTransit, setShowTransit] = useState(true);
  const [showWardBoundary, setShowWardBoundary] = useState(true);

  // Selected item modal/drawer
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'complaint' | 'parking' | 'transit';
    data: any;
  } | null>(null);

  const [parkingBookingMessage, setParkingBookingMessage] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [19.2085, 72.9815],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

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

  // Update map layers & markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers and shapes except base tiles
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // 1. Ward Boundary Layer (TMC Ward 4 & Majiwada)
    if (showWardBoundary) {
      const wardPolygon = L.polygon(
        [
          [19.225, 72.965],
          [19.228, 72.995],
          [19.195, 73.002],
          [19.185, 72.97],
          [19.205, 72.96],
        ],
        {
          color: '#0d9488',
          fillColor: '#14b8a6',
          fillOpacity: 0.12,
          weight: 2,
          dashArray: '5, 5',
        }
      ).addTo(map);
      wardPolygon.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong style="color: #0f766e;">TMC Ward 4 - Majiwada & Naupada</strong><br/>
          <span>Civic Health Index: <strong>84/100 (Grade A)</strong></span><br/>
          <span>Area: 14.8 sq.km • Population: 210,000</span>
        </div>
      `);
    }

    // 2. Complaints Layer
    if (showComplaints) {
      complaints.forEach((comp) => {
        const rawLat = comp.latitude ?? (comp as any).lat;
        const rawLng = comp.longitude ?? (comp as any).lng;
        const lat = typeof rawLat === 'number' && !isNaN(rawLat) ? rawLat : 19.2085;
        const lng = typeof rawLng === 'number' && !isNaN(rawLng) ? rawLng : 72.9815;
        const color =
          comp.status === 'Resolved'
            ? '#10b981'
            : comp.status === 'Work Started' || comp.status === 'In Progress'
            ? '#0d9488'
            : comp.status === 'Awaiting Citizen Confirmation'
            ? '#059669'
            : '#f59e0b';

        const icon = L.divIcon({
          className: 'complaint-pin',
          html: `
            <div style="transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="background-color: ${color}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.on('click', () => {
          setSelectedEntity({ type: 'complaint', data: comp });
        });
      });
    }

    // 3. Smart Parking Layer
    if (showParking) {
      parkingLots.forEach((lot) => {
        const rawLat = lot.latitude ?? (lot as any).lat;
        const rawLng = lot.longitude ?? (lot as any).lng;
        const lat = typeof rawLat === 'number' && !isNaN(rawLat) ? rawLat : 19.2085;
        const lng = typeof rawLng === 'number' && !isNaN(rawLng) ? rawLng : 72.9815;

        const statusColor =
          lot.status === 'Available' ? '#10b981' : lot.status === 'Fast Filling' ? '#f59e0b' : '#ef4444';

        const icon = L.divIcon({
          className: 'parking-pin',
          html: `
            <div style="transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="background-color: ${statusColor}; color: white; width: 30px; height: 30px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2px solid white;">
                P
              </div>
              <span style="background: rgba(15,23,42,0.85); color: white; padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: bold; margin-top: 2px; white-space: nowrap;">
                ${lot.availableSpaces} left
              </span>
            </div>
          `,
          iconSize: [30, 42],
          iconAnchor: [15, 21],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.on('click', () => {
          setSelectedEntity({ type: 'parking', data: lot });
        });
      });
    }

    // 4. Transit Layer
    if (showTransit) {
      TRANSIT_HUBS.forEach((th) => {
        const rawLat = th.lat ?? (th as any).latitude;
        const rawLng = th.lng ?? (th as any).longitude;
        const lat = typeof rawLat === 'number' && !isNaN(rawLat) ? rawLat : 19.186;
        const lng = typeof rawLng === 'number' && !isNaN(rawLng) ? rawLng : 72.9759;

        const icon = L.divIcon({
          className: 'transit-pin',
          html: `
            <div style="transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="background-color: #6366f1; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(99,102,241,0.4); border: 2px solid white;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.on('click', () => {
          setSelectedEntity({ type: 'transit', data: th });
        });
      });
    }
  }, [complaints, parkingLots, showComplaints, showParking, showTransit, showWardBoundary]);

  const handleBookParking = (lotId: string) => {
    const res = reserveParkingSlot(lotId);
    if (res.success && res.lot) {
      setParkingLots(getParkingLots());
      setSelectedEntity({ type: 'parking', data: res.lot });
      setParkingBookingMessage(res.message);
      setTimeout(() => setParkingBookingMessage(null), 4000);
    }
  };

  const centerOnMyWard = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([19.2085, 72.9815], 14, { duration: 1.2 });
    }
  };

  return (
    <div id="screen-unified-map" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] relative pb-16">
      <TopAppBar
        currentScreen="map"
        title="Unified Civic Map"
        subtitle="Multi-Layer Smart City Telemetry"
        showBack
        onNavigate={onNavigate}
      />

      {/* Layer Controls Bar */}
      <div className="relative z-20 px-3 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setShowComplaints(!showComplaints)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              showComplaints
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Grievances ({complaints.length})</span>
          </button>

          <button
            onClick={() => setShowParking(!showParking)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              showParking
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Smart Parking ({parkingLots.length})</span>
          </button>

          <button
            onClick={() => setShowTransit(!showTransit)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              showTransit
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Transit Hubs</span>
          </button>

          <button
            onClick={() => setShowWardBoundary(!showWardBoundary)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              showWardBoundary
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Ward Zone</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full min-h-[550px] relative z-0">
        {/* Recenter & Ward Button */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          <button
            onClick={centerOnMyWard}
            title="Center on My Ward (TMC Ward 4)"
            className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-teal-50 transition-colors"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>

        <div ref={mapContainerRef} className="w-full h-full min-h-[550px]" />
      </div>

      {/* Entity Details Drawer */}
      {selectedEntity && (
        <div className="absolute inset-x-4 bottom-20 z-30 max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                  selectedEntity.type === 'complaint'
                    ? 'bg-amber-100 text-amber-800'
                    : selectedEntity.type === 'parking'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {selectedEntity.type}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedEntity.type === 'complaint' && selectedEntity.data.ticketId}
                {selectedEntity.type === 'parking' && `${selectedEntity.data.availableSpaces} / ${selectedEntity.data.totalCapacity} Free`}
                {selectedEntity.type === 'transit' && 'Multi-Modal Hub'}
              </span>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedEntity.data.title || selectedEntity.data.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedEntity.data.location || selectedEntity.data.address || selectedEntity.data.line}
            </p>
          </div>

          {parkingBookingMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
              {parkingBookingMessage}
            </div>
          )}

          {/* Action Row depending on entity */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            {selectedEntity.type === 'complaint' && (
              <>
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Status: <strong>{selectedEntity.data.status}</strong>
                </span>
                <button
                  onClick={() => {
                    setSelectedEntity(null);
                    onNavigate('complaints');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition-colors flex items-center gap-1"
                >
                  <span>View Timeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {selectedEntity.type === 'parking' && (
              <>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span>Rate: <strong>₹{selectedEntity.data.ratePerHour}/hr</strong></span>
                  {selectedEntity.data.evCharging && (
                    <span className="ml-2 text-emerald-600 font-bold inline-flex items-center gap-0.5">
                      <Zap className="w-3 h-3" /> EV Fast Charger
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleBookParking(selectedEntity.data.id)}
                  disabled={selectedEntity.data.availableSpaces <= 0}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Reserve Slot</span>
                </button>
              </>
            )}

            {selectedEntity.type === 'transit' && (
              <>
                <span className="text-xs text-slate-500">
                  Central / Western integration
                </span>
                <button
                  onClick={() => {
                    setSelectedEntity(null);
                    onNavigate('journey-planner');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  <span>Plan Route Here</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
