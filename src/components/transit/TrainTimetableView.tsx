import { useState, useEffect, useMemo } from 'react';
import {
  Train,
  Clock,
  MapPin,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Search,
  ArrowRight,
  ArrowLeftRight,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Ticket,
  Zap,
  Sparkles,
  Info,
  GitFork,
  Users,
  Compass,
} from 'lucide-react';
import {
  MUMBAI_STATIONS_MASTER,
  ALL_MUMBAI_SUBURBAN_TRAINS,
  searchTrainsBetweenStations,
  MumbaiStation,
  MatchedJourneyTrain,
  InterRouteSuggestion,
} from '../../data/mumbaiTrainMasterData';
import { ACTUAL_TRAIN_TIMETABLE, TrainTimetableEntry, ALL_TRANSIT_STATIONS } from '../../data/actualTransitTimetables';
import { getTransitBookmarks, saveTransitBookmark, removeTransitBookmark } from '../../services/dbService';
import { UserProfile, TransitBookmark } from '../../types';

interface TrainTimetableViewProps {
  currentUser?: UserProfile | null;
  onBookTicket?: (trainNumber: string, trainName: string, origin: string, destination: string) => void;
}

type ViewMode = 'journey' | 'departureBoard';

export function TrainTimetableView({ currentUser, onBookTicket }: TrainTimetableViewProps) {
  // Mode selection: Point-to-point journey finder vs Station departure board
  const [viewMode, setViewMode] = useState<ViewMode>('journey');

  // Source & Destination Station States
  const [sourceStation, setSourceStation] = useState<string>('CSMT');
  const [destStation, setDestStation] = useState<string>('TNA');

  // Filter states
  const [speedFilter, setSpeedFilter] = useState<'ALL' | 'AC' | 'FAST' | 'SLOW'>('ALL');
  const [selectedLine, setSelectedLine] = useState<string>('ALL');
  const [selectedDirection, setSelectedDirection] = useState<'ALL' | 'UP' | 'DOWN'>('ALL');
  const [departureBoardStation, setDepartureBoardStation] = useState<string>('CSMT');
  const [searchQuery, setSearchQuery] = useState('');

  // UI States
  const [expandedJourneyId, setExpandedJourneyId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<TransitBookmark[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Group stations by suburban line for structured selector
  const groupedStations = useMemo<Record<string, MumbaiStation[]>>(() => {
    const groups: Record<string, MumbaiStation[]> = {
      'Central Railway (CR)': [],
      'Western Railway (WR)': [],
      'Harbour Railway Line': [],
      'Trans-Harbour Line': [],
      'Uran Line': [],
    };

    MUMBAI_STATIONS_MASTER.forEach((stn) => {
      if (stn.line === 'Central') groups['Central Railway (CR)'].push(stn);
      else if (stn.line === 'Western') groups['Western Railway (WR)'].push(stn);
      else if (stn.line === 'Harbour') groups['Harbour Railway Line'].push(stn);
      else if (stn.line === 'TransHarbour') groups['Trans-Harbour Line'].push(stn);
      else if (stn.line === 'Uran') groups['Uran Line'].push(stn);
    });

    return groups;
  }, []);

  useEffect(() => {
    setBookmarks(getTransitBookmarks(currentUser?.uid));
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isBookmarked = (trainNumber: string) => {
    return bookmarks.some((b) => b.routeNumber === trainNumber);
  };

  const handleToggleBookmark = async (train: TrainTimetableEntry) => {
    const existing = bookmarks.find((b) => b.routeNumber === train.trainNumber);
    if (existing) {
      await removeTransitBookmark(existing.id, currentUser?.uid);
      setBookmarks(getTransitBookmarks(currentUser?.uid));
      showToast(`Removed train ${train.trainNumber} from saved timetables`);
    } else {
      await saveTransitBookmark({
        userId: currentUser?.uid || 'guest-commuter',
        itemType: 'train',
        routeNumber: train.trainNumber,
        routeName: train.trainName,
        origin: train.origin,
        destination: train.destination,
        departureTime: train.departureTime,
      });
      setBookmarks(getTransitBookmarks(currentUser?.uid));
      showToast(`Saved ${train.trainName} to Firebase Firestore!`);
    }
  };

  // Swap Source and Destination
  const handleSwapStations = () => {
    const temp = sourceStation;
    setSourceStation(destStation);
    setDestStation(temp);
  };

  // Quick preset route pairs
  const quickRoutePresets = [
    { from: 'CSMT', to: 'TNA', label: 'CSMT ↔ Thane' },
    { from: 'CCG', to: 'BVI', label: 'Churchgate ↔ Borivali' },
    { from: 'CSMT', to: 'PNVL', label: 'CSMT ↔ Panvel' },
    { from: 'TNA', to: 'PNVL', label: 'Thane ↔ Panvel' },
    { from: 'DR', to: 'KYN', label: 'Dadar ↔ Kalyan' },
    { from: 'ADH', to: 'CCG', label: 'Andheri ↔ Churchgate' },
    { from: 'CSMT', to: 'GMN', label: 'CSMT ↔ Goregaon' },
    { from: 'VSH', to: 'TNA', label: 'Vashi ↔ Thane' },
  ];

  // Point-to-Point Search results calculation
  const journeySearchResults = useMemo(() => {
    if (!sourceStation || !destStation || sourceStation === destStation) {
      return { directTrains: [], interchangeSuggestions: [], sourceObj: undefined, destObj: undefined };
    }

    const res = searchTrainsBetweenStations(sourceStation, destStation);

    // Apply speed filter to direct trains
    let filteredDirect = res.directTrains;
    if (speedFilter === 'AC') {
      filteredDirect = filteredDirect.filter((j) => j.train.rakeType === 'AC LOCAL' || j.train.speedType.includes('AC'));
    } else if (speedFilter === 'FAST') {
      filteredDirect = filteredDirect.filter((j) => j.train.speedType.includes('FAST'));
    } else if (speedFilter === 'SLOW') {
      filteredDirect = filteredDirect.filter((j) => j.train.speedType === 'SLOW');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredDirect = filteredDirect.filter(
        (j) =>
          j.train.trainName.toLowerCase().includes(q) ||
          j.train.trainNumber.toLowerCase().includes(q) ||
          j.train.line.toLowerCase().includes(q)
      );
    }

    return {
      directTrains: filteredDirect,
      interchangeSuggestions: res.interchangeSuggestions,
      sourceObj: res.sourceStationObj,
      destObj: res.destStationObj,
    };
  }, [sourceStation, destStation, speedFilter, searchQuery]);

  // Departure Board Filtered Trains
  const departureBoardTrains = useMemo(() => {
    return ALL_MUMBAI_SUBURBAN_TRAINS.filter((train) => {
      if (selectedLine !== 'ALL' && train.line !== selectedLine) return false;
      if (selectedDirection !== 'ALL' && train.direction !== selectedDirection) return false;
      if (departureBoardStation !== 'ALL') {
        const stopsAtStation =
          train.originCode === departureBoardStation ||
          train.destCode === departureBoardStation ||
          train.stops.some((s) => s.stationCode === departureBoardStation);
        if (!stopsAtStation) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = train.trainName.toLowerCase().includes(q);
        const matchNum = train.trainNumber.toLowerCase().includes(q);
        const matchOrigin = train.origin.toLowerCase().includes(q);
        const matchDest = train.destination.toLowerCase().includes(q);
        const matchStop = train.stops.some((s) => s.stationName.toLowerCase().includes(q));
        if (!matchName && !matchNum && !matchOrigin && !matchDest && !matchStop) return false;
      }
      return true;
    });
  }, [selectedLine, selectedDirection, departureBoardStation, searchQuery]);

  const sourceName =
    MUMBAI_STATIONS_MASTER.find((s) => s.code === sourceStation)?.name || sourceStation;
  const destName =
    MUMBAI_STATIONS_MASTER.find((s) => s.code === destStation)?.name || destStation;

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-900 text-white shadow-xl border border-emerald-500/50 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Mode Toggle Tab */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-100 dark:bg-stone-900/90 rounded-2xl border border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setViewMode('journey')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            viewMode === 'journey'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Find Trains: Source ➔ Destination</span>
        </button>
        <button
          onClick={() => setViewMode('departureBoard')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            viewMode === 'departureBoard'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Station Departure Board</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: SOURCE TO DESTINATION JOURNEY FINDER             */}
      {/* ======================================================== */}
      {viewMode === 'journey' && (
        <div className="space-y-4">
          {/* Station Selection Box */}
          <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 uppercase tracking-wider">
                <Train className="w-4 h-4 text-emerald-600" />
                Select Journey Stations
              </span>
              <span className="text-[11px] font-medium text-stone-500">
                CR • WR • Harbour • Trans-Harbour
              </span>
            </div>

            {/* Source - Swap - Destination Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
              {/* Source Station */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Source (From Station)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-400 pointer-events-none" />
                  <select
                    value={sourceStation}
                    onChange={(e) => setSourceStation(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {(Object.entries(groupedStations) as [string, MumbaiStation[]][]).map(([lineName, stations]) => (
                      <optgroup key={lineName} label={lineName}>
                        {stations.map((stn) => (
                          <option key={`src-${stn.code}`} value={stn.code}>
                            {stn.name} ({stn.code})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Station Swap Button */}
              <div className="flex justify-center md:pt-5">
                <button
                  onClick={handleSwapStations}
                  className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-stone-600 dark:text-stone-300 hover:text-emerald-700 transition-all shadow-xs group"
                  title="Swap Source and Destination"
                >
                  <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>

              {/* Destination Station */}
              <div>
                <label className="block text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Destination (To Station)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-400 pointer-events-none" />
                  <select
                    value={destStation}
                    onChange={(e) => setDestStation(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  >
                    {(Object.entries(groupedStations) as [string, MumbaiStation[]][]).map(([lineName, stations]) => (
                      <optgroup key={lineName} label={lineName}>
                        {stations.map((stn) => (
                          <option key={`dst-${stn.code}`} value={stn.code}>
                            {stn.name} ({stn.code})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Popular Route Presets */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                Popular Suburban Commute Routes:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {quickRoutePresets.map((preset) => (
                  <button
                    key={`${preset.from}-${preset.to}`}
                    onClick={() => {
                      setSourceStation(preset.from);
                      setDestStation(preset.to);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                      sourceStation === preset.from && destStation === preset.to
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed & Rake Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-stone-500 mr-1">Train Speed:</span>
                {(['ALL', 'AC', 'FAST', 'SLOW'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSpeedFilter(type)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      speedFilter === type
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {type === 'ALL'
                      ? 'All Trains'
                      : type === 'AC'
                      ? '❄️ AC Local Only'
                      : type === 'FAST'
                      ? '⚡ Fast Only'
                      : 'Slow (All Stops)'}
                  </button>
                ))}
              </div>

              {/* Keyword Search */}
              <div className="relative min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter train # or name..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-stone-50 dark:bg-stone-800/60 rounded-lg text-xs text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Results Summary & Fare Overview */}
          {sourceStation !== destStation && (
            <div className="p-3.5 bg-stone-100/90 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {sourceName} ➔ {destName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                  {journeySearchResults.directTrains.length} Direct Train
                  {journeySearchResults.directTrains.length === 1 ? '' : 's'}
                </span>
              </div>

              {journeySearchResults.directTrains.length > 0 && (
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="text-stone-600 dark:text-stone-400">
                    II Class: <strong className="text-stone-900 dark:text-stone-100 font-sans">₹{journeySearchResults.directTrains[0].fareEstimate.secondClass}</strong>
                  </span>
                  <span className="text-stone-600 dark:text-stone-400">
                    I Class: <strong className="text-stone-900 dark:text-stone-100 font-sans">₹{journeySearchResults.directTrains[0].fareEstimate.firstClass}</strong>
                  </span>
                  <span className="text-stone-600 dark:text-stone-400">
                    AC EMU: <strong className="text-stone-900 dark:text-stone-100 font-sans">₹{journeySearchResults.directTrains[0].fareEstimate.acLocal}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Direct Trains List */}
          {sourceStation === destStation ? (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <Info className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Source and Destination are identical
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Please pick two different stations to look up Suburban routes.
              </p>
            </div>
          ) : journeySearchResults.directTrains.length > 0 ? (
            <div className="space-y-3">
              {journeySearchResults.directTrains.map((match) => {
                const train = match.train;
                const isExpanded = expandedJourneyId === train.id;
                const bookmarked = isBookmarked(train.trainNumber);

                return (
                  <div
                    key={train.id}
                    className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:border-emerald-500/40 transition-all"
                  >
                    {/* Journey Header Card */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedJourneyId(isExpanded ? null : train.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-sm text-stone-900 dark:text-stone-100">
                              {train.trainNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                train.line === 'Central'
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                  : train.line === 'Western'
                                  ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                                  : train.line === 'Harbour'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                              }`}
                            >
                              {train.line} Line
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300">
                              {train.rakeType}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                train.speedType.includes('FAST')
                                  ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              }`}
                            >
                              {train.speedType}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" />
                              {train.crowdLevel}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                            {train.trainName}
                          </h4>

                          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <strong className="text-stone-800 dark:text-stone-200">
                                {match.sourceStop.stationName}
                              </strong>{' '}
                              ({match.sourceStop.departureTime})
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              <strong className="text-stone-800 dark:text-stone-200">
                                {match.destStop.stationName}
                              </strong>{' '}
                              ({match.destStop.arrivalTime})
                            </span>
                          </div>
                        </div>

                        {/* Timing and Platform Box */}
                        <div className="flex flex-col items-end shrink-0">
                          <div className="text-right">
                            <span className="font-black text-base font-mono text-emerald-700 dark:text-emerald-400">
                              {match.sourceStop.departureTime}
                            </span>
                            <span className="block text-[11px] font-mono text-stone-500">
                              Arr: {match.destStop.arrivalTime} (~{match.durationMinutes}m)
                            </span>
                          </div>
                          <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {match.sourceStop.platform || train.platform}
                          </span>
                        </div>
                      </div>

                      {/* Journey Meta Footer */}
                      <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {match.stopsCount} halts • Frequency: {train.frequency}
                        </span>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {/* Bookmark to Firebase */}
                          <button
                            onClick={() => handleToggleBookmark(train)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              bookmarked
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600'
                                : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:text-stone-700'
                            }`}
                            title={bookmarked ? 'Saved in Firebase' : 'Bookmark to Firebase'}
                          >
                            {bookmarked ? (
                              <BookmarkCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Quick Ticket Action */}
                          {onBookTicket && (
                            <button
                              onClick={() =>
                                onBookTicket(
                                  train.trainNumber,
                                  train.trainName,
                                  match.sourceStop.stationName,
                                  match.destStop.stationName
                                )
                              }
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Ticket className="w-3 h-3" />
                              <span>Book UTS Ticket</span>
                            </button>
                          )}

                          {/* Collapse button */}
                          <button
                            onClick={() => setExpandedJourneyId(isExpanded ? null : train.id)}
                            className="p-1 text-stone-400 hover:text-stone-600"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Intermediate Stops Table */}
                    {isExpanded && (
                      <div className="bg-stone-50/70 dark:bg-stone-950/40 p-4 border-t border-stone-200 dark:border-stone-800">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            Intermediate Stops on Journey ({match.stopsSlice.length} Stations)
                          </span>
                          <span className="text-[11px] font-mono text-stone-500">
                            Fare: II Class ₹{match.fareEstimate.secondClass} • I Class ₹{match.fareEstimate.firstClass}
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-medium">
                            <thead>
                              <tr className="border-b border-stone-200 dark:border-stone-800 text-[10px] text-stone-400 uppercase tracking-wider">
                                <th className="py-1.5 pr-2">Station</th>
                                <th className="py-1.5 px-2">Arrival</th>
                                <th className="py-1.5 px-2">Departure</th>
                                <th className="py-1.5 px-2">Halt</th>
                                <th className="py-1.5 px-2">Platform</th>
                                <th className="py-1.5 pl-2 text-right">Distance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60 font-mono">
                              {match.stopsSlice.map((stop, idx) => {
                                const isStart = idx === 0;
                                const isEnd = idx === match.stopsSlice.length - 1;
                                return (
                                  <tr
                                    key={idx}
                                    className={`hover:bg-emerald-500/5 ${
                                      isStart || isEnd
                                        ? 'font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                                        : 'text-stone-800 dark:text-stone-200'
                                    }`}
                                  >
                                    <td className="py-1.5 pr-2 font-sans flex items-center gap-1.5">
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                          isStart
                                            ? 'bg-emerald-500 ring-2 ring-emerald-300'
                                            : isEnd
                                            ? 'bg-rose-500 ring-2 ring-rose-300'
                                            : 'bg-stone-300 dark:bg-stone-600'
                                        }`}
                                      />
                                      <span>{stop.stationName}</span>
                                    </td>
                                    <td className="py-1.5 px-2">{stop.arrivalTime}</td>
                                    <td className="py-1.5 px-2">{stop.departureTime}</td>
                                    <td className="py-1.5 px-2 text-stone-500">
                                      {stop.haltMinutes > 0 ? `${stop.haltMinutes}m` : '-'}
                                    </td>
                                    <td className="py-1.5 px-2">{stop.platform || '-'}</td>
                                    <td className="py-1.5 pl-2 text-right text-stone-500">
                                      {stop.distanceKm !== undefined ? `${stop.distanceKm} km` : '-'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* No direct train - Smart 1-Hop Interchange Routing */
            <div className="space-y-4">
              <div className="p-6 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
                <GitFork className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  No Direct Train on Single Line
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  {sourceName} and {destName} are situated across different suburban rail corridors. See the recommended 1-hop interchange below.
                </p>
              </div>

              {journeySearchResults.interchangeSuggestions.map((inter, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-amber-500/30 overflow-hidden shadow-xs"
                >
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-4 border-b border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <GitFork className="w-4 h-4 text-amber-600" />
                        Recommended Interchange via {inter.transferStation.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300">
                        Total Est. Duration: ~{inter.totalDurationMinutes} mins
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 font-medium">
                      {inter.instructions}
                    </p>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Leg 1 */}
                    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                          Leg 1: {inter.leg1.train.line} Line
                        </span>
                        <span className="text-[11px] font-mono text-stone-500">
                          {inter.leg1.durationMinutes} mins
                        </span>
                      </div>
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        {inter.leg1.train.trainNumber} - {inter.leg1.train.trainName}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400">
                        Board at <strong>{inter.leg1.sourceStop.stationName}</strong> ({inter.leg1.sourceStop.departureTime}) ➔ Alight at <strong>{inter.leg1.destStop.stationName}</strong> ({inter.leg1.destStop.arrivalTime})
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        {inter.leg1.sourceStop.platform || inter.leg1.train.platform}
                      </span>
                    </div>

                    {/* Leg 2 */}
                    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-400">
                          Leg 2: {inter.leg2.train.line} Line
                        </span>
                        <span className="text-[11px] font-mono text-stone-500">
                          {inter.leg2.durationMinutes} mins
                        </span>
                      </div>
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        {inter.leg2.train.trainNumber} - {inter.leg2.train.trainName}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400">
                        Switch platforms at <strong>{inter.leg2.sourceStop.stationName}</strong> ({inter.leg2.sourceStop.departureTime}) ➔ Final stop <strong>{inter.leg2.destStop.stationName}</strong> ({inter.leg2.destStop.arrivalTime})
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                        {inter.leg2.sourceStop.platform || inter.leg2.train.platform}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: STATION DEPARTURE BOARD & FLEET TIMETABLE        */}
      {/* ======================================================== */}
      {viewMode === 'departureBoard' && (
        <div className="space-y-4">
          {/* Station Departure Board Selector Header */}
          <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Station Departure Board Selector */}
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                  Station Departure Board
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-stone-400 pointer-events-none" />
                  <select
                    value={departureBoardStation}
                    onChange={(e) => setDepartureBoardStation(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-800/80 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="ALL">All Stations (Mumbai Network)</option>
                    {(Object.entries(groupedStations) as [string, MumbaiStation[]][]).map(([lineName, stations]) => (
                      <optgroup key={`board-${lineName}`} label={lineName}>
                        {stations.map((stn) => (
                          <option key={stn.code} value={stn.code}>
                            {stn.name} ({stn.code})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search bar */}
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                  Search Train / Destination
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. 95311, Kalyan, Virar AC, Panvel..."
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800/80 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </div>

            {/* Line Pill Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'ALL', label: 'All Rail Lines' },
                { id: 'Central', label: 'Central Line' },
                { id: 'Western', label: 'Western Line' },
                { id: 'Harbour', label: 'Harbour Line' },
                { id: 'TransHarbour', label: 'Trans-Harbour' },
                { id: 'Uran', label: 'Uran Line' },
              ].map((line) => (
                <button
                  key={line.id}
                  onClick={() => setSelectedLine(line.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                    selectedLine === line.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {line.label}
                </button>
              ))}
            </div>

            {/* Direction Switcher */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 font-medium">
                Showing{' '}
                <strong className="text-stone-900 dark:text-stone-100">
                  {departureBoardTrains.length}
                </strong>{' '}
                scheduled trains
              </span>
              <div className="flex items-center gap-1">
                {(['ALL', 'DOWN', 'UP'] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setSelectedDirection(dir)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      selectedDirection === dir
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                        : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                  >
                    {dir === 'ALL'
                      ? 'Both Ways'
                      : dir === 'DOWN'
                      ? 'DOWN (Outbound)'
                      : 'UP (City Inbound)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Departure Board Cards */}
          <div className="space-y-3">
            {departureBoardTrains.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
                <Train className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  No trains found matching criteria
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Try switching line filters or searching for another station.
                </p>
              </div>
            ) : (
              departureBoardTrains.map((train) => {
                const isExpanded = expandedJourneyId === train.id;
                const bookmarked = isBookmarked(train.trainNumber);

                return (
                  <div
                    key={train.id}
                    className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:border-emerald-500/40 transition-all"
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedJourneyId(isExpanded ? null : train.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-sm text-stone-900 dark:text-stone-100">
                              {train.trainNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                train.line === 'Central'
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                  : train.line === 'Western'
                                  ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                                  : train.line === 'Harbour'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                              }`}
                            >
                              {train.line} Line
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300">
                              {train.rakeType}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                train.speedType.includes('FAST')
                                  ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              }`}
                            >
                              {train.speedType}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                            <span>{train.origin}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{train.destination}</span>
                          </h4>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <div className="text-right">
                            <span className="font-black text-base font-mono text-emerald-700 dark:text-emerald-400">
                              {train.departureTime}
                            </span>
                            <span className="block text-[11px] font-mono text-stone-500">
                              Arr: {train.arrivalTime} ({train.durationMinutes}m)
                            </span>
                          </div>
                          <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {train.platform}
                          </span>
                        </div>
                      </div>

                      {/* Meta Footer */}
                      <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {train.stops.length} Stops • Frequency: {train.frequency}
                        </span>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleBookmark(train)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              bookmarked
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600'
                                : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:text-stone-700'
                            }`}
                            title={bookmarked ? 'Saved in Firebase' : 'Bookmark to Firebase'}
                          >
                            {bookmarked ? (
                              <BookmarkCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {onBookTicket && (
                            <button
                              onClick={() =>
                                onBookTicket(
                                  train.trainNumber,
                                  train.trainName,
                                  train.origin,
                                  train.destination
                                )
                              }
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Ticket className="w-3 h-3" />
                              <span>Book</span>
                            </button>
                          )}

                          <button
                            onClick={() => setExpandedJourneyId(isExpanded ? null : train.id)}
                            className="p-1 text-stone-400 hover:text-stone-600"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Stops Table */}
                    {isExpanded && (
                      <div className="bg-stone-50/70 dark:bg-stone-950/40 p-4 border-t border-stone-200 dark:border-stone-800">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            Complete Station Schedule ({train.stops.length} Halts)
                          </span>
                          <span className="text-[11px] font-mono text-stone-500">
                            {train.speedType} • Platform {train.platform}
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-medium">
                            <thead>
                              <tr className="border-b border-stone-200 dark:border-stone-800 text-[10px] text-stone-400 uppercase tracking-wider">
                                <th className="py-1.5 pr-2">Station</th>
                                <th className="py-1.5 px-2">Arrival</th>
                                <th className="py-1.5 px-2">Departure</th>
                                <th className="py-1.5 px-2">Halt</th>
                                <th className="py-1.5 px-2">PF</th>
                                <th className="py-1.5 pl-2 text-right">Dist (km)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60 font-mono">
                              {train.stops.map((stop, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-emerald-500/5 text-stone-800 dark:text-stone-200"
                                >
                                  <td className="py-1.5 pr-2 font-sans font-semibold flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span>{stop.stationName}</span>
                                  </td>
                                  <td className="py-1.5 px-2">{stop.arrivalTime}</td>
                                  <td className="py-1.5 px-2 font-bold">{stop.departureTime}</td>
                                  <td className="py-1.5 px-2 text-stone-500">
                                    {stop.haltMinutes > 0 ? `${stop.haltMinutes}m` : 'Term'}
                                  </td>
                                  <td className="py-1.5 px-2">{stop.platform || '-'}</td>
                                  <td className="py-1.5 pl-2 text-right text-stone-500">
                                    {stop.distanceKm ?? '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
