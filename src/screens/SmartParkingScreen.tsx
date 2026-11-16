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
  Search,
  Check,
  X,
  CreditCard,
  ChevronRight,
  QrCode,
  Navigation,
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
      const bay = `Level ${Math.floor(1 + Math.random() * 3)} · Bay ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(10 + Math.random() * 40)}`;

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
          expiresAt: 'Extended (+1 Hr)',
        };
      }
      return p;
    });
    setActivePasses(updated);
    saveActivePasses(updated);
    if (activePassModal?.id === pass.id) {
      setActivePassModal({ ...activePassModal, expiresAt: 'Extended (+1 Hr)' });
    }
  };

  return (
    <div id="screen-smart-parking" className="flex-1 flex flex-col bg-[#F5F5F7] dark:bg-[#000000] min-h-[780px] relative pb-16 font-sans">
      <TopAppBar
        currentScreen="parking"
        title="Smart Parking"
        subtitle="Real-time multi-level parking lot availability"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      <div className="px-5 sm:px-8 py-5 max-w-4xl mx-auto w-full space-y-6">
        {/* Active Passes Section */}
        {activePasses.length > 0 && (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] p-5 border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[#007AFF]">
                Active Parking Passes ({activePasses.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activePasses.map((pass) => (
                <div
                  key={pass.id}
                  className="bg-[#F5F5F7] dark:bg-[#2C2C2E] p-4 rounded-[16px] flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white truncate">
                      {pass.lotName}
                    </div>
                    <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                      {pass.bayNumber} · Valid until {pass.expiresAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActivePassModal(pass)}
                      className="px-3 py-1.5 rounded-full bg-[#007AFF] text-white text-[12px] font-semibold hover:bg-[#0062CC] transition-colors"
                    >
                      Show QR
                    </button>
                    <button
                      onClick={() => handleReleasePass(pass)}
                      className="text-[12px] text-[#FF3B30] hover:underline px-1"
                    >
                      Release
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Area Segmented Control */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parking facilities in Mumbai & Thane..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-[14px] text-[14px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25 transition-all"
            />
          </div>

          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 p-1 bg-[#E5E5EA]/60 dark:bg-[#2C2C2E] rounded-full">
              {(['All', 'Thane', 'BKC', 'Dadar', 'Borivali'] as const).map((area) => (
                <button
                  key={area}
                  onClick={() => setAreaFilter(area)}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                    areaFilter === area
                      ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold'
                      : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEvOnly(!evOnly)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium flex items-center gap-1 transition-all shrink-0 ${
                  evOnly
                    ? 'bg-[#34C759] text-white'
                    : 'bg-white dark:bg-[#1C1C1E] text-[#6E6E73] dark:text-[#86868B] border border-[#E5E5EA] dark:border-[#2C2C2E]'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>EV Only</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('map')}
                className="px-3 py-1 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all shrink-0 bg-[#007AFF] text-white shadow-xs hover:bg-[#0062CC]"
              >
                <MapPin className="w-3 h-3" />
                <span>Map View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Parking Facilities Cards List */}
        <div className="space-y-3.5">
          {filteredLots.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-[#E5E5EA] dark:border-[#2C2C2E] p-6 text-[14px] text-[#86868B]">
              No parking facilities found matching your criteria.
            </div>
          ) : (
            filteredLots.map((lot) => {
              const occupancyPercent = Math.round(((lot.totalCapacity - lot.availableSpaces) / lot.totalCapacity) * 100);

              return (
                <div
                  key={lot.id}
                  className="bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-[#E5E5EA] dark:border-[#2C2C2E] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white">
                          {lot.name}
                        </h3>
                        {hasEvCharging(lot) && (
                          <span className="text-[11px] font-semibold text-[#34C759]">
                            · EV Ready
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
                        <span>{getLotAddress(lot)}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className={`text-[14px] font-bold ${lot.availableSpaces > 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                        {lot.availableSpaces > 0 ? `${lot.availableSpaces} open` : 'Full'}
                      </div>
                      <div className="text-[11px] text-[#86868B]">
                        of {lot.totalCapacity} capacity
                      </div>
                    </div>
                  </div>

                  {/* Clean thin occupancy progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupancyPercent > 85 ? 'bg-[#FF3B30]' : occupancyPercent > 65 ? 'bg-[#FF9500]' : 'bg-[#34C759]'
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>

                  {/* Footer & Reserve Button */}
                  <div className="pt-2 border-t border-[#E5E5EA]/70 dark:border-[#2C2C2E]/70 flex items-center justify-between">
                    <div className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                      Rate: <strong className="text-[#1D1D1F] dark:text-white font-semibold">₹{getLotHourlyRate(lot)}/hr</strong>
                    </div>

                    <button
                      onClick={() => handleReserve(lot)}
                      disabled={lot.availableSpaces <= 0}
                      className="px-4 py-2 rounded-full bg-[#007AFF] hover:bg-[#0062CC] disabled:opacity-40 text-white text-[13px] font-semibold transition-all shadow-xs"
                    >
                      Reserve Slot
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Digital QR Parking Pass Modal */}
      {activePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-[#E5E5EA] dark:border-[#2C2C2E]">
            <div className="flex items-center justify-between border-b border-[#E5E5EA] dark:border-[#2C2C2E] pb-3">
              <div>
                <h4 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white">
                  Parking Pass
                </h4>
                <div className="text-[12px] text-[#007AFF] font-medium">
                  {activePassModal.slotToken}
                </div>
              </div>
              <button
                onClick={() => setActivePassModal(null)}
                className="p-1 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ParkingPassScannerCode
              value={activePassModal.slotToken}
              lotName={activePassModal.lotName}
              bayNumber={activePassModal.bayNumber}
              validUntil={activePassModal.expiresAt}
            />

            <div className="space-y-1.5 text-[13px] text-[#6E6E73] dark:text-[#86868B]">
              <div className="flex justify-between">
                <span>Bay</span>
                <span className="font-semibold text-[#1D1D1F] dark:text-white">{activePassModal.bayNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Valid Until</span>
                <span className="font-semibold text-[#1D1D1F] dark:text-white">{activePassModal.expiresAt}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleExtendPass(activePassModal)}
                className="py-2.5 rounded-[12px] bg-[#007AFF] text-white text-[13px] font-semibold hover:bg-[#0062CC] transition-colors"
              >
                Extend 1 Hr
              </button>
              <button
                onClick={() => handleReleasePass(activePassModal)}
                className="py-2.5 rounded-[12px] bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#FF3B30] text-[13px] font-semibold hover:opacity-85 transition-opacity"
              >
                Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
