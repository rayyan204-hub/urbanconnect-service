import { useState, useEffect } from 'react';
import {
  Bus,
  Clock,
  MapPin,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Search,
  ArrowRight,
  Ticket,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ACTUAL_BUS_TIMETABLE, BusTimetableEntry } from '../../data/actualTransitTimetables';
import { getTransitBookmarks, saveTransitBookmark, removeTransitBookmark } from '../../services/dbService';
import { UserProfile, TransitBookmark } from '../../types';

interface BusTimetableViewProps {
  currentUser?: UserProfile | null;
  onBookPass?: (route: BusTimetableEntry) => void;
}

export function BusTimetableView({ currentUser, onBookPass }: BusTimetableViewProps) {
  const [selectedAgency, setSelectedAgency] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>('bus-tmt-65');
  const [viewMode, setViewMode] = useState<'timetables' | 'departures'>('timetables');
  const [selectedTerminal, setSelectedTerminal] = useState<string>('ALL');
  const [bookmarks, setBookmarks] = useState<TransitBookmark[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setBookmarks(getTransitBookmarks(currentUser?.uid));
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isBookmarked = (routeNumber: string) => {
    return bookmarks.some((b) => b.routeNumber === routeNumber);
  };

  const handleToggleBookmark = async (bus: BusTimetableEntry) => {
    const existing = bookmarks.find((b) => b.routeNumber === bus.routeNumber);
    if (existing) {
      await removeTransitBookmark(existing.id, currentUser?.uid);
      setBookmarks(getTransitBookmarks(currentUser?.uid));
      showToast(`Removed bus ${bus.routeNumber} from saved timetables`);
    } else {
      await saveTransitBookmark({
        userId: currentUser?.uid || 'guest-commuter',
        itemType: 'bus',
        routeNumber: bus.routeNumber,
        routeName: bus.routeName,
        origin: bus.origin,
        destination: bus.destination,
        departureTime: bus.nextDeparture,
      });
      setBookmarks(getTransitBookmarks(currentUser?.uid));
      showToast(`Saved ${bus.routeNumber} to Firebase Firestore!`);
    }
  };

  const terminals = [
    { id: 'ALL', name: 'All Terminals & Depots' },
    { id: 'Thane', name: 'Thane Station (West / East CIDCO)' },
    { id: 'Borivali', name: 'Borivali Station (East) Sukurwadi' },
    { id: 'BKC', name: 'BKC Canara Bank / MCA Club' },
    { id: 'CSMT', name: 'CSMT General Post Office' },
    { id: 'Dadar', name: 'Dadar Asiad / Shivaji Park' },
    { id: 'Vashi', name: 'Vashi Highway Bus Depot' },
    { id: 'Upvan', name: 'Upvan Lake - Yeoor Gate' },
  ];

  const filteredBuses = ACTUAL_BUS_TIMETABLE.filter((bus) => {
    if (selectedAgency !== 'ALL' && bus.agency !== selectedAgency) return false;
    if (selectedTerminal !== 'ALL') {
      const matchTerm =
        bus.origin.toLowerCase().includes(selectedTerminal.toLowerCase()) ||
        bus.destination.toLowerCase().includes(selectedTerminal.toLowerCase()) ||
        bus.stops.some((s) => s.name.toLowerCase().includes(selectedTerminal.toLowerCase()));
      if (!matchTerm) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = bus.routeNumber.toLowerCase().includes(q);
      const matchName = bus.routeName.toLowerCase().includes(q);
      const matchOrigin = bus.origin.toLowerCase().includes(q);
      const matchDest = bus.destination.toLowerCase().includes(q);
      const matchStop = bus.stops.some((s) => s.name.toLowerCase().includes(q));
      if (!matchNum && !matchName && !matchOrigin && !matchDest && !matchStop) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-900 text-white shadow-xl border border-emerald-500/50 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Switcher Card */}
      <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Terminal Departure Board Selector */}
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
              Terminal / Bus Depot Board
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-[#86868B] pointer-events-none" />
              <select
                value={selectedTerminal}
                onChange={(e) => setSelectedTerminal(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl text-xs font-semibold text-[#1D1D1F] dark:text-white border-none focus:ring-2 focus:ring-[#007AFF]/25"
              >
                {terminals.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
              Search Route / Bus No.
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#86868B] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 65 AC, AC-700, Ghodbunder, Borivali..."
                className="w-full pl-9 pr-3 py-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl text-xs font-semibold text-[#1D1D1F] dark:text-white border-none focus:ring-2 focus:ring-[#007AFF]/25"
              />
            </div>
          </div>
        </div>

        {/* Agency Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'ALL', label: 'All Municipal Agencies' },
            { id: 'TMT', label: 'TMT (Thane Municipal)' },
            { id: 'BEST', label: 'BEST (Brihanmumbai)' },
            { id: 'NMMT', label: 'NMMT (Navi Mumbai)' },
            { id: 'MSRTC', label: 'MSRTC Shivneri' },
          ].map((ag) => (
            <button
              key={ag.id}
              onClick={() => setSelectedAgency(ag.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                selectedAgency === ag.id
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              {ag.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
          <span className="text-[#6E6E73] dark:text-[#86868B]">
            Showing <strong className="text-[#1D1D1F] dark:text-white">{filteredBuses.length}</strong> official routes with daily schedules
          </span>
          <span className="text-[11px] text-[#34C759] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
            Live Electric Fleet Sync
          </span>
        </div>
      </div>

      {/* Bus Route Timetables Cards */}
      <div className="space-y-3">
        {filteredBuses.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
            <Bus className="w-8 h-8 text-[#86868B] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1D1D1F] dark:text-white">No bus timetables found</p>
            <p className="text-xs text-[#86868B] mt-1">Try resetting the terminal filter or searching by route name.</p>
            <button
              onClick={() => {
                setSelectedAgency('ALL');
                setSelectedTerminal('ALL');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-1.5 bg-[#007AFF] text-white text-xs font-bold rounded-xl hover:bg-[#0062CC] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredBuses.map((bus) => {
            const isExpanded = expandedRouteId === bus.id;
            const bookmarked = isBookmarked(bus.routeNumber);

            return (
              <div
                key={bus.id}
                className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-xs hover:border-[#007AFF]/40 transition-all"
              >
                {/* Header */}
                <div className="p-4 cursor-pointer" onClick={() => setExpandedRouteId(isExpanded ? null : bus.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#007AFF] text-white font-mono font-bold text-xs flex items-center gap-1">
                          <Bus className="w-3 h-3" />
                          {bus.routeNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-[#6E6E73] dark:text-[#86868B]">
                          {bus.agency}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                          {bus.busType}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                          {bus.totalTripsPerDay} Trips/Day
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                        <span>{bus.origin}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                        <span>{bus.destination}</span>
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-sm text-[#007AFF]">
                        In {bus.nextDeparture}
                      </div>
                      <span className="text-[11px] font-semibold text-[#86868B]">
                        Fare: {bus.fare}
                      </span>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="mt-3 pt-2.5 border-t border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center justify-between text-xs text-[#6E6E73] dark:text-[#86868B]">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-[#86868B]" />
                      Operates {bus.firstBus} to {bus.lastBus} (Every {bus.peakHeadway} peak)
                    </span>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleBookmark(bus)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          bookmarked
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600'
                            : 'border-[#E5E5EA] dark:border-[#2C2C2E] text-[#86868B] hover:text-[#1D1D1F]'
                        }`}
                        title={bookmarked ? 'Saved in Firebase' : 'Bookmark to Firebase'}
                      >
                        {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>

                      {onBookPass && (
                        <button
                          onClick={() => onBookPass(bus)}
                          className="px-2.5 py-1 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Ticket className="w-3 h-3" />
                          <span>Get Pass</span>
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedRouteId(isExpanded ? null : bus.id)}
                        className="p-1 text-[#86868B] hover:text-[#1D1D1F]"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Daily Schedule & Stop List */}
                {isExpanded && (
                  <div className="bg-[#F5F5F7]/80 dark:bg-[#151516] p-4 border-t border-[#E5E5EA] dark:border-[#2C2C2E] space-y-4">
                    {/* All Scheduled Departures Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#1D1D1F] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
                          Daily Departure Timetable from {bus.origin.slice(0, 24)}... ({bus.departureTimes.length} Runs)
                        </span>
                        <span className="text-[10px] text-[#86868B]">
                          First: {bus.firstBus} | Last: {bus.lastBus}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white dark:bg-[#1C1C1E] rounded-xl border border-[#E5E5EA] dark:border-[#2C2C2E]">
                        {bus.departureTimes.map((time, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold ${
                              time.includes('08:') || time.includes('09:')
                                ? 'bg-[#007AFF]/10 text-[#007AFF] font-bold border border-[#007AFF]/20'
                                : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white'
                            }`}
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stop by stop table */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#1D1D1F] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Intermediate Stops & Stage Fares
                        </span>
                        <span className="text-[10px] text-[#86868B] font-mono">
                          {bus.stops.length} Halts
                        </span>
                      </div>

                      <div className="overflow-x-auto bg-white dark:bg-[#1C1C1E] rounded-xl border border-[#E5E5EA] dark:border-[#2C2C2E]">
                        <table className="w-full text-left text-xs font-medium">
                          <thead>
                            <tr className="border-b border-[#E5E5EA] dark:border-[#2C2C2E] text-[10px] text-[#86868B] uppercase tracking-wider">
                              <th className="py-2 pl-3 pr-2">Bus Stop</th>
                              <th className="py-2 px-2">Offset</th>
                              <th className="py-2 px-2">Next Run</th>
                              <th className="py-2 pr-3 text-right">Fare from Terminal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5E5EA]/60 dark:divide-[#2C2C2E]/60 font-mono text-[11px]">
                            {bus.stops.map((stop, idx) => (
                              <tr
                                key={idx}
                                className={`hover:bg-[#007AFF]/5 ${
                                  stop.isPassed ? 'text-[#86868B] line-through' : 'text-[#1D1D1F] dark:text-white'
                                }`}
                              >
                                <td className="py-1.5 pl-3 pr-2 font-sans font-semibold flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] shrink-0" />
                                  <span>{stop.name}</span>
                                </td>
                                <td className="py-1.5 px-2 text-[#86868B]">+{stop.arrivalOffsetMinutes}m</td>
                                <td className="py-1.5 px-2 font-bold text-[#007AFF]">{stop.scheduledArrival}</td>
                                <td className="py-1.5 pr-3 text-right font-bold">₹{stop.stageFare}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
