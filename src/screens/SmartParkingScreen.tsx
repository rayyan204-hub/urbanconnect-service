import { useState, useEffect } from 'react';
import { ScreenId, ParkingLot, UserProfile } from '../types';
import {
  getParkingLots,
  reserveParkingSlot,
  releaseParkingSlot,
  subscribeToCollection,
  COLLECTIONS,
} from '../services/dbService';
import { TopAppBar } from '../components/common/TopAppBar';
import { ParkingPassScannerCode } from '../components/common/ParkingPassScannerCode';
import {
  Car,
  MapPin,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  ChevronRight,
  Sparkles,
  QrCode,
  Navigation,
  RotateCcw,
  Trash2,
  Plus,
} from 'lucide-react';

interface SmartParkingScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

interface ActiveParkingPass {
  id: string;
  lotId: string;
  lotName: string;
  address: string;
  slotToken: string;
  bayNumber: string;
  reservedAt: string;
  expiresAt: string;
  ratePerHour: number;
  vehicleType: string;
}

const STORAGE_KEY_PASSES = 'urbanconnect_parking_passes';

function loadActivePasses(): ActiveParkingPass[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PASSES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveActivePasses(passes: ActiveParkingPass[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PASSES, JSON.stringify(passes));
  } catch (e) {
    console.error('Failed to save parking passes', e);
  }
}

export function SmartParkingScreen({ onNavigate, currentUser }: SmartParkingScreenProps) {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(getParkingLots());
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<'All' | 'Thane' | 'Dadar' | 'BKC' | 'Borivali'>('All');
  const [evOnly, setEvOnly] = useState(false);
  const [activePasses, setActivePasses] = useState<ActiveParkingPass[]>(() => loadActivePasses());
  const [activePassModal, setActivePassModal] = useState<ActiveParkingPass | null>(null);

  useEffect(() => {
    const unsub = subscribeToCollection(COLLECTIONS.PARKING, () => {
      setParkingLots(getParkingLots());
    });
    return unsub;
  }, []);

  const getLotAddress = (lot: ParkingLot) => lot.address || lot.location || 'Thane Central';
  const getLotHourlyRate = (lot: ParkingLot) => {
    if (lot.ratePerHour) return lot.ratePerHour;
    const parsed = parseInt((lot.hourlyRate || '').replace(/\D/g, ''), 10);
    return isNaN(parsed) ? 30 : parsed;
  };
  const getLotVehicleType = (lot: ParkingLot) => lot.vehicleType || 'Cars & Two-Wheelers';
  const hasEvCharging = (lot: ParkingLot) =>
    Boolean(lot.evCharging || (lot.features && lot.features.some((f) => f.toLowerCase().includes('ev'))));

  const filteredLots = parkingLots.filter((lot) => {
    const address = getLotAddress(lot);
    const matchesSearch =
      lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea =
      areaFilter === 'All' ||
      (areaFilter === 'Thane' && (address.includes('Thane') || lot.name.includes('Thane') || lot.name.includes('Talao') || lot.name.includes('Majiwada'))) ||
      (areaFilter === 'Dadar' && address.includes('Dadar')) ||
      (areaFilter === 'BKC' && (address.includes('BKC') || lot.name.includes('Bourse'))) ||
      (areaFilter === 'Borivali' && address.includes('Borivali'));
    const matchesEV = !evOnly || hasEvCharging(lot);
    return matchesSearch && matchesArea && matchesEV;
  });

  const handleReserve = (lot: ParkingLot) => {
    const result = reserveParkingSlot(lot.id);
    if (result.success) {
      const now = new Date();
      const expires = new Date(now.getTime() + 60 * 60 * 1000);
      const token = `UC-PARK-${Math.floor(1000 + Math.random() * 9000)}`;
      const bay = `Level ${Math.floor(1 + Math.random() * 3)} • Bay ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(10 + Math.random() * 40)}`;

      const newPass: ActiveParkingPass = {
        id: `pass-${Date.now()}`,
        lotId: lot.id,
        lotName: lot.name,
        address: getLotAddress(lot),
        slotToken: token,
        bayNumber: bay,
        reservedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        expiresAt: expires.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ratePerHour: getLotHourlyRate(lot),
        vehicleType: getLotVehicleType(lot),
      };

      const updated = [newPass, ...activePasses];
      setActivePasses(updated);
      saveActivePasses(updated);
      setActivePassModal(newPass);
    }
  };

  const handleReleasePass = (pass: ActiveParkingPass) => {
    releaseParkingSlot(pass.lotId);
    const updated = activePasses.filter((p) => p.id !== pass.id);
    setActivePasses(updated);
    saveActivePasses(updated);
    if (activePassModal?.id === pass.id) {
      setActivePassModal(null);
    }
  };

  const handleExtendPass = (pass: ActiveParkingPass) => {
    const updated = activePasses.map((p) => {
      if (p.id === pass.id) {
        return {
          ...p,
          expiresAt: 'Extended (+1 Hour)',
        };
      }
      return p;
    });
    setActivePasses(updated);
    saveActivePasses(updated);
    if (activePassModal?.id === pass.id) {
      setActivePassModal({ ...activePassModal, expiresAt: 'Extended (+1 Hour)' });
    }
  };

  const getStatusBadge = (status: ParkingLot['status'], spaces: number) => {
    if (status === 'Available') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {spaces} Slots Available
        </span>
      );
    }
    if (status === 'Fast Filling') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Fast Filling ({spaces} left)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 px-2.5 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Full
      </span>
    );
  };

  return (
    <div id="screen-smart-parking" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] relative pb-16">
      <TopAppBar
        currentScreen="parking"
        title="Smart Parking Desk"
        subtitle="Live Occupancy & Municipal Slot Reservation"
        showBack
        onNavigate={onNavigate}
      />

      {/* Hero Banner / Fast Stats */}
      <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-200" />
            <h2 className="text-sm font-black uppercase tracking-wider">Connected Parking Network</h2>
          </div>
          <p className="text-xs text-blue-100/90 mt-0.5">
            Real-time optical sensor telemetry across Thane Municipal & BMC multi-level plazas.
          </p>
        </div>

        <button
          onClick={() => onNavigate('map')}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>View on Map</span>
        </button>
      </div>

      {/* Active Passes Section */}
      {activePasses.length > 0 && (
        <div className="p-4 bg-teal-50/80 dark:bg-teal-950/30 border-b border-teal-200 dark:border-teal-900/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Your Active Parking Passes ({activePasses.length})</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activePasses.map((pass) => (
              <div
                key={pass.id}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-teal-200 dark:border-teal-800 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                      {pass.slotToken}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {pass.bayNumber}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{pass.lotName}</p>
                  <p className="text-[10px] text-slate-500">Valid until: {pass.expiresAt}</p>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => setActivePassModal(pass)}
                    className="px-2.5 py-1 rounded-xl bg-teal-700 text-white text-[11px] font-bold hover:bg-teal-800 transition-colors flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>View Pass</span>
                  </button>
                  <button
                    onClick={() => handleReleasePass(pass)}
                    className="px-2 py-1 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 text-[10px] font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    Release Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parking by area (Talao Pali, Majiwada, BKC, Dadar)..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {(['All', 'Thane', 'BKC', 'Dadar', 'Borivali'] as const).map((area) => (
              <button
                key={area}
                onClick={() => setAreaFilter(area)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  areaFilter === area
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          <button
            onClick={() => setEvOnly(!evOnly)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border transition-all ${
              evOnly
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>EV Chargers Only</span>
          </button>
        </div>
      </div>

      {/* Parking Lots List */}
      <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
        {filteredLots.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <Car className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No parking facilities match filter</p>
            <p className="text-[11px] text-slate-500">Try switching your area filter to All or disable EV-only.</p>
          </div>
        ) : (
          filteredLots.map((lot) => {
            const occupancyPercent = Math.round(((lot.totalCapacity - lot.availableSpaces) / lot.totalCapacity) * 100);

            return (
              <div
                key={lot.id}
                id={`parking-card-${lot.id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {lot.name}
                      </h3>
                      {hasEvCharging(lot) && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-md">
                          <Zap className="w-3 h-3 text-emerald-600" /> EV Charger
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {getLotAddress(lot)}
                    </p>
                  </div>

                  {getStatusBadge(lot.status, lot.availableSpaces)}
                </div>

                {/* Occupancy Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Occupancy Rate</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {occupancyPercent}% ({lot.totalCapacity - lot.availableSpaces}/{lot.totalCapacity} filled)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        occupancyPercent > 90
                          ? 'bg-rose-500'
                          : occupancyPercent > 65
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>

                {/* Details Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400">Hourly Rate:</span>{' '}
                    <strong className="text-slate-900 dark:text-white">₹{getLotHourlyRate(lot)}/hr</strong>
                    <span className="text-[10px] text-slate-400 ml-1.5">({getLotVehicleType(lot)})</span>
                  </div>

                  <button
                    onClick={() => handleReserve(lot)}
                    disabled={lot.availableSpaces <= 0}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Reserve 1-Hr Slot</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Digital QR Parking Pass Modal */}
      {activePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-teal-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Municipal Parking Pass</h4>
                  <span className="text-[10px] font-mono text-teal-600 font-bold">{activePassModal.slotToken}</span>
                </div>
              </div>
              <button
                onClick={() => setActivePassModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Optical Barcode & QR Code Presentation Box */}
            <div className="pt-1">
              <ParkingPassScannerCode
                value={activePassModal.slotToken}
                lotName={activePassModal.lotName}
                bayNumber={activePassModal.bayNumber}
                validUntil={activePassModal.expiresAt}
              />
            </div>

            {/* Slot & Time Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Facility</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{activePassModal.lotName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Assigned Bay</span>
                <span className="font-bold text-teal-700 dark:text-teal-400">{activePassModal.bayNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Valid Until</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activePassModal.expiresAt}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Tariff</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{activePassModal.ratePerHour}/hr (Paid via FASTag/Wallet)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActivePassModal(null);
                    onNavigate('map');
                  }}
                  className="py-2.5 rounded-xl border border-teal-600 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-50 dark:hover:bg-teal-950/30 flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </button>
                <button
                  onClick={() => handleExtendPass(activePassModal)}
                  className="py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Extend 1 Hr</span>
                </button>
              </div>

              <button
                onClick={() => handleReleasePass(activePassModal)}
                className="w-full py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                Release / Vacate Slot Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
