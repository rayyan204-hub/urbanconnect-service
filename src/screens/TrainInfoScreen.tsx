import { useState, useEffect } from 'react';
import { ScreenId, UserProfile } from '../types';
import { TopAppBar } from '../components/common/TopAppBar';
import {
  Train,
  Search,
  Clock,
  MapPin,
  Calendar,
  Ticket,
  QrCode,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  Layers,
  Sparkles,
  Info,
  Navigation,
  FileText,
} from 'lucide-react';
import {
  ALL_STATIONS,
  BookedRailTicket,
  IRCTCTrain,
  IRCTC_TRAIN_CATALOG,
  RailClassCode,
  RailQuotaCode,
  SuburbanTrain,
  SUBURBAN_STATIONS_LIST,
} from '../data/transitBookingData';
import {
  bookIRCTCTicket,
  getBookedRailTickets,
  getSuburbanTimetable,
  lookupPNRStatus,
  searchIRCTCTrains,
  subscribeToRailBookings,
  getMegaBlocks,
} from '../../src/services/railBookingService';
import { CoachBerthMapModal } from '../components/transit/CoachBerthMapModal';
import { RailETicketModal } from '../components/transit/RailETicketModal';
import { IRCTCBookingModal } from '../components/transit/IRCTCBookingModal';
import { UTSBookingModal } from '../components/transit/UTSBookingModal';
import { TrainTimetableView } from '../components/transit/TrainTimetableView';
import { FirestoreStatusBanner } from '../components/common/FirestoreStatusBanner';

interface TrainInfoScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

type MainTransitTab = 'timetable' | 'irctc' | 'mindicator' | 'pnr' | 'my-bookings';

export function TrainInfoScreen({ onNavigate, currentUser }: TrainInfoScreenProps) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<MainTransitTab>('timetable');

  // IRCTC Search States
  const [irctcFrom, setIrctcFrom] = useState('TNA');
  const [irctcTo, setIrctcTo] = useState('CSMT');
  const [journeyDate, setJourneyDate] = useState('Tomorrow');
  const [selectedQuota, setSelectedQuota] = useState<RailQuotaCode>('GN');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [irctcSearchQuery, setIrctcSearchQuery] = useState('');

  // m-Indicator States
  const [suburbanLine, setSuburbanLine] = useState<'Central' | 'Western' | 'Harbour' | 'TransHarbour' | 'Metro1' | 'Metro3'>('Central');
  const [suburbanDirection, setSuburbanDirection] = useState<'UP' | 'DOWN' | 'ALL'>('DOWN');
  const [suburbanSpeedFilter, setSuburbanSpeedFilter] = useState<'ALL' | 'FAST' | 'SLOW' | 'AC'>('ALL');
  const [suburbanStationSearch, setSuburbanStationSearch] = useState('');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // PNR Search States
  const [pnrInput, setPnrInput] = useState('');
  const [pnrResult, setPnrResult] = useState<BookedRailTicket | null>(null);
  const [pnrSearchError, setPnrSearchError] = useState<string | null>(null);
  const [isSearchingPNR, setIsSearchingPNR] = useState(false);

  // My Bookings & Storage
  const [bookedTickets, setBookedTickets] = useState<BookedRailTicket[]>(getBookedRailTickets);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'irctc' | 'uts'>('all');

  // Modals
  const [bookingModalTrain, setBookingModalTrain] = useState<{ train: IRCTCTrain; classCode: string } | null>(null);
  const [isUTSModalOpen, setIsUTSModalOpen] = useState(false);
  const [activeViewingTicket, setActiveViewingTicket] = useState<BookedRailTicket | null>(null);
  const [coachMapModalData, setCoachMapModalData] = useState<{
    coach?: string;
    berth?: number;
    berthType?: string;
    classCode?: string;
  } | null>(null);

  // Sync reactive updates from localStorage
  useEffect(() => {
    const unsub = subscribeToRailBookings(() => {
      setBookedTickets(getBookedRailTickets());
    });
    return () => unsub();
  }, []);

  // Filtered IRCTC Trains
  const irctcTrains = searchIRCTCTrains(irctcFrom, irctcTo).filter((t) => {
    if (!irctcSearchQuery) return true;
    const q = irctcSearchQuery.toLowerCase();
    return (
      t.trainName.toLowerCase().includes(q) ||
      t.trainNumber.toLowerCase().includes(q) ||
      t.destinationName.toLowerCase().includes(q) ||
      t.originName.toLowerCase().includes(q)
    );
  });

  // Filtered Suburban Trains
  const suburbanTrains = getSuburbanTimetable(suburbanLine, suburbanDirection, suburbanSpeedFilter).filter((train) => {
    if (!suburbanStationSearch) return true;
    const q = suburbanStationSearch.toLowerCase();
    return (
      train.destName.toLowerCase().includes(q) ||
      train.originName.toLowerCase().includes(q) ||
      train.stops.some((s) => s.stationName.toLowerCase().includes(q))
    );
  });

  const megaBlocks = getMegaBlocks();

  // Swap IRCTC stations
  const handleSwapIRCTCStations = () => {
    const temp = irctcFrom;
    setIrctcFrom(irctcTo);
    setIrctcTo(temp);
  };

  // Perform PNR Lookup
  const handleLookupPNR = (queryOverride?: string) => {
    const q = (queryOverride || pnrInput).trim();
    if (!q) {
      setPnrSearchError('Please enter a 10-digit PNR number or UTS Pass ID.');
      return;
    }

    setIsSearchingPNR(true);
    setPnrSearchError(null);

    setTimeout(() => {
      setIsSearchingPNR(false);
      const res = lookupPNRStatus(q);
      if (res) {
        setPnrResult(res);
      } else {
        setPnrSearchError(`No reservation record found for PNR "${q}". Please check the digits.`);
      }
    }, 450);
  };

  return (
    <div
      id="screen-train-info"
      className="flex-1 flex flex-col bg-[#faf9f5] dark:bg-[#101114] min-h-[780px] transition-colors font-sans"
    >
      <TopAppBar
        currentScreen="train-info"
        title="Rail & Suburban Transit"
        subtitle="IRCTC Rail Connect & m-Indicator Suburban"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Main Segmented Mode Switcher (IRCTC / m-Indicator / PNR / Bookings) */}
      <div className="bg-[#142821] dark:bg-[#0c1411] px-3 pt-3 pb-3 border-b border-stone-800 text-stone-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider text-emerald-400 uppercase font-bold">
              INDIAN RAILWAYS & MUMBAI SUBURBAN NETWORK
            </span>
          </div>
          <span className="text-[10px] font-mono text-stone-400">
            Active PNRs: {bookedTickets.length}
          </span>
        </div>

        {/* Segmented Button Bar with Timetable Tab */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-stone-900/80 rounded-2xl border border-stone-800">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'timetable'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Timetable</span>
          </button>

          <button
            onClick={() => setActiveTab('irctc')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'irctc'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Train className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">IRCTC Trains</span>
          </button>

          <button
            onClick={() => setActiveTab('mindicator')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'mindicator'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">m-Indicator</span>
          </button>

          <button
            onClick={() => setActiveTab('pnr')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'pnr'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">PNR Status</span>
          </button>

          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 relative ${
              activeTab === 'my-bookings'
                ? 'bg-stone-100 text-stone-900 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">My Passes</span>
            {bookedTickets.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
                {bookedTickets.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Cloud Firestore Status Banner */}
      <div className="px-3 pt-3">
        <FirestoreStatusBanner />
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: ACTUAL COMPREHENSIVE TRAIN TIMETABLES & SCHEDULES                 */}
      {/* ========================================================================= */}
      {activeTab === 'timetable' && (
        <div className="flex-1 p-3 sm:p-4 space-y-4 pb-12">
          <TrainTimetableView
            currentUser={currentUser}
            onBookTicket={(num, name, orig, dest) => {
              setIsUTSModalOpen(true);
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: IRCTC RAIL CONNECT RESERVATION ENGINE                                */}
      {/* ========================================================================= */}
      {activeTab === 'irctc' && (
        <div className="flex-1 p-3 sm:p-4 space-y-4 pb-12">
          {/* IRCTC Search Card */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-sm">
                  CR & WR RESERVATION
                </span>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Search Express & Vande Bharat
                </span>
              </div>
              <button
                onClick={handleSwapIRCTCStations}
                className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 p-1 text-xs font-bold flex items-center gap-1"
                title="Swap stations"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="text-[11px]">Swap</span>
              </button>
            </div>

            {/* Stations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                  From (Source Station)
                </label>
                <select
                  value={irctcFrom}
                  onChange={(e) => setIrctcFrom(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
                >
                  {ALL_STATIONS.map((st) => (
                    <option key={`irctc-from-${st.code}`} value={st.code}>
                      {st.code} - {st.name} ({st.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                  To (Destination)
                </label>
                <select
                  value={irctcTo}
                  onChange={(e) => setIrctcTo(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
                >
                  {ALL_STATIONS.map((st) => (
                    <option key={`irctc-to-${st.code}`} value={st.code}>
                      {st.code} - {st.name} ({st.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quota & Date Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                  Travel Date
                </label>
                <select
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200"
                >
                  <option value="Today">Today, Oct 10</option>
                  <option value="Tomorrow">Tomorrow, Oct 11</option>
                  <option value="Day After">Sunday, Oct 12</option>
                  <option value="Next Weekend">Next Weekend</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                  Quota
                </label>
                <select
                  value={selectedQuota}
                  onChange={(e) => setSelectedQuota(e.target.value as RailQuotaCode)}
                  className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200"
                >
                  <option value="GN">General (GN)</option>
                  <option value="TQ">Tatkal (TQ)</option>
                  <option value="PT">Premium Tatkal</option>
                  <option value="LD">Ladies (LD)</option>
                  <option value="SS">Sr. Citizen (SS)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                  Filter by Name / Train #
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={irctcSearchQuery}
                    onChange={(e) => setIrctcSearchQuery(e.target.value)}
                    placeholder="e.g. Vande Bharat, 12124..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search Result Statistics */}
          <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 px-1">
            <span className="font-bold">
              Available Express Trains ({irctcTrains.length})
            </span>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              Live Seat Allocation Active
            </span>
          </div>

          {/* Trains Listing Cards */}
          <div className="space-y-3.5">
            {irctcTrains.map((train) => (
              <div
                key={train.trainNumber}
                className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                {/* Header: Number, Name, Type, Rating */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0f284e]/10 dark:bg-white/10 text-[#0f284e] dark:text-amber-300 flex items-center justify-center font-black">
                      <Train className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-amber-700 dark:text-amber-400">
                          #{train.trainNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {train.trainType}
                        </span>
                        {train.pantry && (
                          <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">
                            ✓ Pantry
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-stone-900 dark:text-stone-100 mt-0.5">
                        {train.trainName}
                      </h4>
                    </div>
                  </div>

                  {/* Live Status Badge */}
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-block">
                      {train.liveStatus.statusText}
                    </span>
                    <div className="text-[9px] font-mono text-stone-400 mt-0.5">
                      {train.liveStatus.lastUpdated}
                    </div>
                  </div>
                </div>

                {/* Timetable Corridor */}
                <div className="grid grid-cols-3 gap-2 items-center text-center py-1">
                  <div className="text-left">
                    <div className="text-base font-black font-mono text-stone-900 dark:text-stone-100">
                      {train.departureTime}
                    </div>
                    <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {train.originCode}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">{train.originName}</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-stone-500 font-bold">
                      {train.duration}
                    </span>
                    <div className="w-full flex items-center justify-center gap-1 text-stone-300 dark:text-stone-700 my-1">
                      <div className="h-0.5 flex-1 bg-stone-200 dark:bg-stone-800" />
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                      <div className="h-0.5 flex-1 bg-stone-200 dark:bg-stone-800" />
                    </div>
                    <span className="text-[9px] text-stone-400">
                      Runs: {train.runsOn.join(' ')}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black font-mono text-stone-900 dark:text-stone-100">
                      {train.arrivalTime}
                    </div>
                    <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {train.destinationCode}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">{train.destinationName}</div>
                  </div>
                </div>

                {/* Class Availability Matrix */}
                <div>
                  <div className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                    Select Class for Instant Reservation
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {train.classes.map((cls) => {
                      const isAvail = cls.status === 'AVAILABLE';
                      const isRac = cls.status === 'RAC';
                      return (
                        <button
                          key={cls.classCode}
                          onClick={() =>
                            setBookingModalTrain({
                              train,
                              classCode: cls.classCode,
                            })
                          }
                          className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                            isAvail
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500'
                              : isRac
                              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 hover:border-amber-500'
                              : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-black text-stone-900 dark:text-stone-100">
                              {cls.classCode}
                            </span>
                            <span className="font-mono text-xs font-black text-stone-800 dark:text-stone-200">
                              ₹{cls.fare}
                            </span>
                          </div>
                          <div
                            className={`text-[10px] font-black font-mono mt-1 ${
                              isAvail
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : isRac
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-stone-500'
                            }`}
                          >
                            {cls.statusText}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Tools: Coach Map & Route */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() =>
                      setCoachMapModalData({
                        coach: 'B3',
                        berth: 24,
                        berthType: 'Lower (LB)',
                        classCode: train.classes[0]?.classCode || '3A',
                      })
                    }
                    className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-semibold flex items-center gap-1.5 hover:underline"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View Coach Position & Berth Layout</span>
                  </button>

                  <button
                    onClick={() =>
                      setBookingModalTrain({
                        train,
                        classCode: train.classes[0]?.classCode || 'CC',
                      })
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Book Ticket</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: m-INDICATOR MUMBAI SUBURBAN LIVE TIMETABLE                          */}
      {/* ========================================================================= */}
      {activeTab === 'mindicator' && (
        <div className="flex-1 p-3 sm:p-4 space-y-4 pb-12">
          {/* Sunday Mega Block Announcement Banner */}
          {megaBlocks.length > 0 && (
            <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-400/60 dark:border-amber-800 rounded-3xl p-3.5 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Sunday Mega Block Maintenance Alert (m-Indicator Live)</span>
              </div>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-400 leading-relaxed">
                <strong>{megaBlocks[0].line}:</strong> {megaBlocks[0].section} • {megaBlocks[0].timing}. {megaBlocks[0].impact}
              </p>
            </div>
          )}

          {/* Suburban Line Selector (Central / Western / Harbour / Trans-Harbour / Metro) */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400">
                SUBURBAN CORRIDOR SELECTOR
              </span>
              <button
                onClick={() => setIsUTSModalOpen(true)}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Book UTS Suburban Ticket</span>
              </button>
            </div>

            {/* Line Pill Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {(
                [
                  { id: 'Central', label: 'Central Line' },
                  { id: 'Western', label: 'Western Line' },
                  { id: 'Harbour', label: 'Harbour Line' },
                  { id: 'TransHarbour', label: 'Trans-Harbour' },
                  { id: 'Metro1', label: 'Metro 1' },
                  { id: 'Metro3', label: 'Metro 3 Aqua' },
                ] as const
              ).map((line) => (
                <button
                  key={line.id}
                  onClick={() => setSuburbanLine(line.id)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                    suburbanLine === line.id
                      ? 'bg-emerald-800 text-white border-emerald-700 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                  }`}
                >
                  {line.label}
                </button>
              ))}
            </div>

            {/* Direction & Speed Filter */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-stone-800 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase mr-1">Direction:</span>
                <button
                  onClick={() => setSuburbanDirection('DOWN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    suburbanDirection === 'DOWN'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Down ➔
                </button>
                <button
                  onClick={() => setSuburbanDirection('UP')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    suburbanDirection === 'UP'
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Up ➔
                </button>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase mr-1">Rake:</span>
                {(['ALL', 'FAST', 'SLOW', 'AC'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSuburbanSpeedFilter(type)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      suburbanSpeedFilter === type
                        ? 'bg-emerald-700 text-white'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Iconic m-Indicator Departure Board */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
              <span>Next Local Departures ({suburbanTrains.length})</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                Live GPS Telemetry Synced
              </span>
            </div>

            {suburbanTrains.map((train) => {
              const isFast = train.speedType.includes('FAST');
              const isAC = train.speedType.startsWith('AC');
              const isExpanded = expandedRouteId === train.id;

              return (
                <div
                  key={train.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-3.5 shadow-xs hover:border-emerald-600 transition-all space-y-2.5"
                >
                  {/* Top Row: Destination Badge, Name, Speed, Countdown */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Iconic m-Indicator Circle Destination Badge */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono text-base font-black text-white shadow-xs shrink-0 ${
                          train.destCode === 'K'
                            ? 'bg-red-700'
                            : train.destCode === 'C'
                            ? 'bg-blue-700'
                            : train.destCode === 'N'
                            ? 'bg-amber-600'
                            : train.destCode === 'VR'
                            ? 'bg-purple-700'
                            : train.destCode === 'PL'
                            ? 'bg-teal-700'
                            : 'bg-emerald-700'
                        }`}
                      >
                        {train.destCode}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                            {train.destName}
                          </h4>
                          {/* Speed Badges */}
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md text-white font-mono ${
                              isAC
                                ? 'bg-cyan-600'
                                : isFast
                                ? 'bg-red-600'
                                : 'bg-emerald-600'
                            }`}
                          >
                            {train.speedType.replace('_', ' ')}
                          </span>
                          <span className="text-[9px] font-mono text-stone-500 bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded-sm">
                            {train.carLength}
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                          From: {train.originName} • {train.platform}
                        </div>
                      </div>
                    </div>

                    {/* Countdown and Dep Time */}
                    <div className="text-right">
                      <div className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                        In {train.expectedInMinutes}m
                      </div>
                      <div className="text-sm font-black font-mono text-stone-900 dark:text-stone-100">
                        {train.departureTime}
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Bar */}
                  <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-950 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
                    <span className="flex items-center gap-1 truncate">
                      <Navigation className="w-3 h-3 text-emerald-600 shrink-0" />
                      <strong className="text-stone-800 dark:text-stone-200">
                        {train.liveLocationText}
                      </strong>
                    </span>

                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0 ml-2">
                      Crowd: {train.crowdLevel}
                    </span>
                  </div>

                  {/* Actions: Route Stops & UTS Book */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      onClick={() => setExpandedRouteId(isExpanded ? null : train.id)}
                      className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-bold flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Station Stops' : 'View Stops'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setIsUTSModalOpen(true)}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1"
                    >
                      <Ticket className="w-3 h-3" />
                      <span>Book UTS Ticket (₹10)</span>
                    </button>
                  </div>

                  {/* Expanded Route Stops Timeline */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-stone-200 dark:border-stone-800 animate-in fade-in duration-150">
                      <div className="text-[10px] font-mono font-bold text-stone-400 uppercase mb-2">
                        Halts for this service
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {train.stops.map((stop, sIdx) => (
                          <div
                            key={sIdx}
                            className={`px-2.5 py-1.5 rounded-xl text-center shrink-0 border ${
                              stop.isPassed
                                ? 'bg-stone-100 dark:bg-stone-950 text-stone-400 border-stone-200 dark:border-stone-800 line-through'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 font-bold'
                            }`}
                          >
                            <div className="text-xs">{stop.stationName}</div>
                            <div className="font-mono text-[9px] opacity-80">{stop.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PNR STATUS ENQUIRY & LIVE PASSENGER AUDIT                            */}
      {/* ========================================================================= */}
      {activeTab === 'pnr' && (
        <div className="flex-1 p-3 sm:p-4 space-y-4 pb-12">
          {/* PNR Search Card */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-sm">
                CRIS & IRCTC DATABASE QUERY
              </span>
              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 mt-1">
                Real-Time PNR Status & Passenger Allocation
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Check current charting status, berth confirmation (WL ➔ CNF), and platform number.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value)}
                placeholder="Enter 10-digit PNR (e.g. 8421948201)..."
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-mono font-bold text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleLookupPNR()}
                disabled={isSearchingPNR}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{isSearchingPNR ? 'Searching...' : 'Enquire'}</span>
              </button>
            </div>

            {/* Quick Demo PNR Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-mono text-stone-400">Quick Test:</span>
              {bookedTickets.map((t) => (
                <button
                  key={t.pnr}
                  onClick={() => {
                    setPnrInput(t.pnr);
                    handleLookupPNR(t.pnr);
                  }}
                  className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-mono text-[10px] font-bold"
                >
                  {t.pnr}
                </button>
              ))}
            </div>

            {pnrSearchError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{pnrSearchError}</span>
              </div>
            )}
          </div>

          {/* PNR Result Display */}
          {pnrResult && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black font-mono text-stone-900 dark:text-stone-100">
                      PNR: {pnrResult.pnr}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                      {pnrResult.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-600 dark:text-stone-300 mt-0.5">
                    {pnrResult.trainNumber} - {pnrResult.trainName}
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                    {pnrResult.chartStatus}
                  </span>
                  <div className="text-[10px] font-mono text-stone-400 mt-1">
                    Platform {pnrResult.platform}
                  </div>
                </div>
              </div>

              {/* Journey Route */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-100 dark:border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Boarding</span>
                  <strong className="text-xs text-stone-900 dark:text-stone-100">{pnrResult.fromName}</strong>
                  <div className="font-mono text-[11px] text-stone-500 mt-0.5">{pnrResult.departureTime}</div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-100 dark:border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Destination</span>
                  <strong className="text-xs text-stone-900 dark:text-stone-100">{pnrResult.toName}</strong>
                  <div className="font-mono text-[11px] text-stone-500 mt-0.5">{pnrResult.arrivalTime}</div>
                </div>
              </div>

              {/* Passenger List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  Passenger Current Allocation:
                </span>
                {pnrResult.passengers.map((p, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{p.name}</span>
                      <span className="text-[11px] text-stone-400 ml-1.5">({p.age} yrs, {p.gender})</span>
                    </div>

                    <div className="font-mono text-right">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                        Coach {p.allottedCoach} • Berth {p.allottedBerth} ({p.allottedBerthType})
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* View Full E-Ticket / Barcode Button */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => setActiveViewingTicket(pnrResult)}
                  className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show E-Ticket Barcode / QR</span>
                </button>

                <button
                  onClick={() =>
                    setCoachMapModalData({
                      coach: pnrResult.passengers[0]?.allottedCoach || 'B3',
                      berth: pnrResult.passengers[0]?.allottedBerth || 24,
                      berthType: pnrResult.passengers[0]?.allottedBerthType || 'Lower (LB)',
                      classCode: pnrResult.classCode || '3A',
                    })
                  }
                  className="py-2.5 px-3 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 rounded-2xl text-xs font-bold transition-colors"
                >
                  Coach Map
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MY BOOKINGS & PASSES WALLET                                        */}
      {/* ========================================================================= */}
      {activeTab === 'my-bookings' && (
        <div className="flex-1 p-3 sm:p-4 space-y-4 pb-12">
          {/* Header & Filter */}
          <div className="flex items-center justify-between text-xs">
            <div>
              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100">
                Active Rail Tickets & Passes
              </h3>
              <p className="text-[11px] text-stone-500">
                Stored in offline wallet with verified optical codes
              </p>
            </div>

            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800">
              {(['all', 'irctc', 'uts'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setBookingFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    bookingFilter === filter
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Listing */}
          {bookedTickets.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
              <Ticket className="w-10 h-10 text-stone-400 mx-auto" />
              <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                No tickets in wallet
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Search IRCTC trains or book an instant UTS suburban pass to generate your tickets.
              </p>
              <button
                onClick={() => setActiveTab('irctc')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
              >
                Search Trains
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookedTickets
                .filter((t) => {
                  if (bookingFilter === 'irctc') return t.bookingType === 'IRCTC_RESERVED';
                  if (bookingFilter === 'uts') return t.bookingType === 'UTS_SUBURBAN';
                  return true;
                })
                .map((ticket) => {
                  const isCancelled = ticket.status === 'CANCELLED';
                  const isUTS = ticket.bookingType === 'UTS_SUBURBAN';

                  return (
                    <div
                      key={ticket.id}
                      className={`bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border transition-all space-y-3 ${
                        isCancelled
                          ? 'border-red-200 dark:border-red-950 opacity-60'
                          : 'border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md'
                      }`}
                    >
                      {/* Ticket Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-sm ${
                              isUTS
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}
                          >
                            {isUTS ? 'UTS SUBURBAN' : 'IRCTC RESERVED'}
                          </span>
                          <span className="font-mono text-xs font-black text-stone-900 dark:text-stone-100">
                            PNR: {ticket.pnr}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCancelled
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      {/* Train & Journey Path */}
                      <div>
                        <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                          {ticket.trainName}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 mt-1">
                          <span>
                            {ticket.fromName} ({ticket.fromCode}) ➔ {ticket.toName} ({ticket.toCode})
                          </span>
                          <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                            {ticket.departureTime}
                          </span>
                        </div>
                      </div>

                      {/* Coach & Berth details */}
                      <div className="p-2.5 bg-stone-50 dark:bg-stone-950 rounded-2xl flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-stone-500">Coach: </span>
                          <strong className="text-stone-900 dark:text-stone-100">
                            {ticket.passengers[0]?.allottedCoach || 'EMU'}
                          </strong>
                          <span className="text-stone-500 ml-2">Berth: </span>
                          <strong className="text-stone-900 dark:text-stone-100">
                            {ticket.passengers[0]?.allottedBerth} ({ticket.passengers[0]?.allottedBerthType})
                          </strong>
                        </div>
                        <div className="font-bold text-emerald-700 dark:text-emerald-400">
                          ₹{ticket.totalFare}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => setActiveViewingTicket(ticket)}
                          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Show QR / Barcode</span>
                        </button>

                        {!isUTS && (
                          <button
                            onClick={() =>
                              setCoachMapModalData({
                                coach: ticket.passengers[0]?.allottedCoach || 'B3',
                                berth: ticket.passengers[0]?.allottedBerth || 24,
                                berthType: ticket.passengers[0]?.allottedBerthType || 'Lower (LB)',
                                classCode: ticket.classCode,
                              })
                            }
                            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 text-xs font-semibold hover:underline"
                          >
                            Coach Layout
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                     */}
      {/* ========================================================================= */}

      {/* 1. IRCTC Booking Modal */}
      {bookingModalTrain && (
        <IRCTCBookingModal
          train={bookingModalTrain.train}
          classCode={bookingModalTrain.classCode}
          quota={selectedQuota}
          journeyDate={journeyDate}
          onClose={() => setBookingModalTrain(null)}
          onBookingSuccess={(newTicket) => {
            setBookingModalTrain(null);
            setBookedTickets(getBookedRailTickets());
            setActiveViewingTicket(newTicket);
          }}
        />
      )}

      {/* 2. UTS Suburban Ticket Modal */}
      {isUTSModalOpen && (
        <UTSBookingModal
          initialFrom="Thane"
          initialTo="CSMT"
          onClose={() => setIsUTSModalOpen(false)}
          onBookingSuccess={(newTicket) => {
            setIsUTSModalOpen(false);
            setBookedTickets(getBookedRailTickets());
            setActiveViewingTicket(newTicket);
          }}
        />
      )}

      {/* 3. Rail E-Ticket / Barcode & QR Modal */}
      {activeViewingTicket && (
        <RailETicketModal
          ticket={activeViewingTicket}
          onClose={() => setActiveViewingTicket(null)}
          onTicketUpdated={() => setBookedTickets(getBookedRailTickets())}
        />
      )}

      {/* 4. Coach Position & Berth Layout Modal */}
      {coachMapModalData && (
        <CoachBerthMapModal
          coachNumber={coachMapModalData.coach}
          berthNumber={coachMapModalData.berth}
          berthType={coachMapModalData.berthType}
          classCode={coachMapModalData.classCode}
          onClose={() => setCoachMapModalData(null)}
        />
      )}
    </div>
  );
}
