import { useState } from 'react';
import { ScreenId, JourneyOption, UserProfile } from '../types';
import { getJourneyOptions } from '../services/dbService';
import { TopAppBar } from '../components/common/TopAppBar';
import {
  Navigation,
  Train,
  Bus,
  Clock,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  QrCode,
  Ticket,
  X,
  Check,
} from 'lucide-react';

interface JourneyPlannerScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

const PRESET_DESTINATIONS = [
  'Bandra Kurla Complex (BKC)',
  'Dadar Central & Western Interchange',
  'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
  'Andheri Metro Station',
  'Ghodbunder Road (Hiranandani)',
];

function generateRoutesForPoints(fromStation: string, toStation: string): JourneyOption[] {
  const fromClean = fromStation.trim() || 'Thane Station';
  const toClean = toStation.trim() || 'Bandra Kurla Complex';

  return [
    {
      id: `j-fast-${Date.now()}`,
      title: 'Fast Suburban Local + Metro Line Connector',
      from: fromClean,
      to: toClean,
      durationMinutes: 36,
      fare: '₹25',
      transfers: 1,
      summary: `Fast train from ${fromClean} + seamless automated metro interchange to ${toClean}`,
      tags: ['Fastest Route', 'High Frequency'],
      departureTime: 'Every 4 mins',
      arrivalTime: '36 mins total',
      modes: ['Train', 'Metro', 'Walk'],
      legs: [
        {
          mode: 'walk',
          lineName: 'Concourse Walkway & Escalator',
          fromStop: fromClean,
          toStop: 'Platform 3 / Fast Corridor',
          durationMinutes: 3,
          details: 'Direct skywalk connector with clear wayfinding',
          status: 'On Time',
        },
        {
          mode: 'train',
          lineName: 'Central Fast Line Express',
          fromStop: fromClean,
          toStop: 'Kurla Interchange',
          durationMinutes: 20,
          details: '12-car AC suburban rake with live GPS telemetry',
          status: 'On Time',
        },
        {
          mode: 'metro',
          lineName: 'Metro Line 2B / 3 Aqua Line',
          fromStop: 'Kurla Interchange',
          toStop: toClean,
          durationMinutes: 13,
          details: 'High frequency automated transit every 3 minutes',
          status: 'On Time',
        },
      ],
    },
    {
      id: `j-direct-${Date.now()}`,
      title: 'Direct Premium AC Electric Bus (Zero Transfers)',
      from: fromClean,
      to: toClean,
      durationMinutes: 48,
      fare: '₹35',
      transfers: 0,
      summary: `One-seat zero-transfer AC express with onboard Wi-Fi and live GPS telemetry`,
      tags: ['Direct Ride', 'Zero Transfers'],
      departureTime: 'Every 10 mins',
      arrivalTime: '48 mins total',
      modes: ['Bus'],
      legs: [
        {
          mode: 'bus',
          lineName: 'BEST AC Express Route C-42',
          fromStop: fromClean,
          toStop: toClean,
          durationMinutes: 48,
          details: 'Eastern Express Highway fast lane, digital ticket validation',
          status: 'On Time',
        },
      ],
    },
    {
      id: `j-eco-${Date.now()}`,
      title: 'Suburban Railway + Green Municipal Feeder',
      from: fromClean,
      to: toClean,
      durationMinutes: 42,
      fare: '₹15',
      transfers: 1,
      summary: `Civic transit budget option pairing suburban rail with electric minibus feeder`,
      tags: ['Lowest Fare', 'Eco-Friendly'],
      departureTime: 'Every 6 mins',
      arrivalTime: '42 mins total',
      modes: ['Train', 'Bus'],
      legs: [
        {
          mode: 'train',
          lineName: 'Suburban Slow Local',
          fromStop: fromClean,
          toStop: 'Sion / Vidyavihar Junction',
          durationMinutes: 27,
          details: 'Regular suburban commuter service',
          status: 'On Time',
        },
        {
          mode: 'bus',
          lineName: 'Municipal EV Feeder Minibus',
          fromStop: 'Vidyavihar Station East',
          toStop: toClean,
          durationMinutes: 15,
          details: 'Frequent local feeder connecting directly to destination',
          status: 'On Time',
        },
      ],
    },
  ];
}

export function JourneyPlannerScreen({ onNavigate, currentUser }: JourneyPlannerScreenProps) {
  const [origin, setOrigin] = useState('Thane Station West');
  const [destination, setDestination] = useState('Bandra Kurla Complex (BKC)');
  const [journeyOptions, setJourneyOptions] = useState<JourneyOption[]>(() =>
    generateRoutesForPoints('Thane Station West', 'Bandra Kurla Complex (BKC)')
  );
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [bookedPassOption, setBookedPassOption] = useState<JourneyOption | null>(null);
  const [passDownloaded, setPassDownloaded] = useState(false);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setJourneyOptions(generateRoutesForPoints(destination, temp));
  };

  const handleSearch = (from?: string, to?: string) => {
    const startPoint = from || origin;
    const endPoint = to || destination;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const computed = generateRoutesForPoints(startPoint, endPoint);
      setJourneyOptions(computed);
      if (computed.length > 0) {
        setSelectedJourneyId(computed[0].id);
      }
    }, 350);
  };

  const getModeIcon = (mode?: string) => {
    switch ((mode || '').toLowerCase()) {
      case 'train':
        return <Train className="w-3.5 h-3.5 text-blue-600" />;
      case 'metro':
        return <Zap className="w-3.5 h-3.5 text-purple-600" />;
      case 'bus':
        return <Bus className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Navigation className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getModes = (journey: JourneyOption): string[] => {
    if (journey.modes && Array.isArray(journey.modes) && journey.modes.length > 0) {
      return journey.modes;
    }
    if (journey.legs && Array.isArray(journey.legs) && journey.legs.length > 0) {
      const formatted = journey.legs.map((l) => {
        const m = (l.mode || '').toLowerCase();
        return m === 'train' ? 'Train' : m === 'metro' ? 'Metro' : m === 'bus' ? 'Bus' : 'Walk';
      });
      return Array.from(new Set(formatted));
    }
    return ['Multi-Modal'];
  };

  const getDisplayTitle = (journey: JourneyOption): string => {
    return journey.title || journey.summary || `${journey.from} ➔ ${journey.to}`;
  };

  const getDisplayFare = (journey: JourneyOption): string => {
    if (journey.fare) return journey.fare.startsWith('₹') ? journey.fare : `₹${journey.fare}`;
    if (journey.estimatedFare) return `₹${journey.estimatedFare}`;
    return '₹30';
  };

  return (
    <div id="screen-journey-planner" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] relative pb-16">
      <TopAppBar
        currentScreen="journey-planner"
        title="Multi-Modal Journey Planner"
        subtitle="Central • Western • Metro Lines • BEST • TMT"
        showBack
        onNavigate={onNavigate}
      />

      {/* Origin / Destination Search Card */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-2.5">
          <div className="relative flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 absolute left-3" />
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Origin (e.g. Thane Station, Majiwada)"
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwap}
              title="Swap origin and destination"
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-2xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center">
            <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-100 absolute left-3" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destination (e.g. BKC, Dadar, Andheri)"
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Popular:</span>
          {PRESET_DESTINATIONS.map((dest) => (
            <button
              key={dest}
              onClick={() => {
                setDestination(dest);
                handleSearch(origin, dest);
              }}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {dest.split(' (')[0]}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleSearch()}
          disabled={isSearching}
          className="mt-3 w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <span className="animate-pulse">Computing Fastest Real-time Routes...</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Find Fastest Multimodal Routes</span>
            </>
          )}
        </button>
      </div>

      {/* Disruption Alert Notice */}
      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px]">
          <strong>Central Railway Advisory:</strong> 5–8 min delay on slow locals via Platform 3 due to track maintenance between Mulund & Thane. Fast corridors operating on time.
        </p>
      </div>

      {/* Routes List */}
      <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Recommended Itineraries ({journeyOptions.length})
        </h3>

        {journeyOptions.map((opt) => {
          const isExpanded = selectedJourneyId === opt.id;

          return (
            <div
              key={opt.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all ${
                isExpanded
                  ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300'
              } p-4 sm:p-5 space-y-3`}
            >
              {/* Header */}
              <div
                onClick={() => setSelectedJourneyId(isExpanded ? null : opt.id)}
                className="cursor-pointer flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {getDisplayTitle(opt)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {getModes(opt).join(' + ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {opt.durationMinutes} mins
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {getDisplayFare(opt)}
                    </span>
                    <span>•</span>
                    <span>{opt.transfers} {opt.transfers === 1 ? 'transfer' : 'transfers'}</span>
                  </div>
                </div>

                <button className="p-1 text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Step-by-Step Breakdown when expanded */}
              {isExpanded && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                    {opt.legs && opt.legs.length > 0 ? (
                      opt.legs.map((leg, idx) => (
                        <div key={idx} className="relative text-xs">
                          <div className="absolute -left-[22px] top-0.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-600 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                {getModeIcon(leg.mode)}
                                {leg.lineName}
                              </span>
                              <span className="text-[11px] text-slate-400">{leg.durationMinutes} mins</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                              From <strong>{leg.fromStop}</strong> ➔ <strong>{leg.toStop}</strong>
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                  leg.status === 'On Time'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {leg.status}
                              </span>
                              <span className="text-[10px] text-slate-500">{leg.details}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : opt.steps && opt.steps.length > 0 ? (
                      opt.steps.map((step, idx) => (
                        <div key={idx} className="relative text-xs">
                          <div className="absolute -left-[22px] top-0.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-600 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                {getModeIcon(step.mode)}
                                {step.instruction}
                              </span>
                              <span className="text-[11px] text-slate-400">{step.duration}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              via {step.line}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">{opt.summary}</p>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="text-teal-900 dark:text-teal-200 font-semibold">
                        Departure: <strong>{opt.departureTime || 'Every 5-8 mins'}</strong> • Transit: <strong>{opt.durationMinutes} mins</strong>
                      </div>
                      <div className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5">
                        Integrated Fare: <strong>{getDisplayFare(opt)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('train-info')}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Live Board
                      </button>
                      <button
                        onClick={() => {
                          setBookedPassOption(opt);
                          setPassDownloaded(false);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Book QR Pass</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Digital Contactless QR Transit Pass Modal */}
      {bookedPassOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-teal-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Contactless Transit Pass</h4>
                  <span className="text-[10px] font-mono text-teal-600 font-bold">#MUM-QR-9428</span>
                </div>
              </div>
              <button
                onClick={() => setBookedPassOption(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated UTS / Chalo QR Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-teal-900 to-slate-900 text-white text-center space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-teal-300 font-mono tracking-wider uppercase">
                <span>Integrated Pass</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Active & Valid
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl inline-block shadow-lg mx-auto">
                <QrCode className="w-32 h-32 text-slate-950" />
              </div>

              <div>
                <p className="text-xs font-bold text-white">{bookedPassOption.from} ➔ {bookedPassOption.to}</p>
                <p className="text-[11px] text-teal-200 mt-0.5">
                  Passenger: {currentUser?.name || 'Aarav Deshmukh'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Valid across {getModes(bookedPassOption).join(' & ')} • Fare Paid: {getDisplayFare(bookedPassOption)}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Validity Window</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Next 3 Hours (Single Journey)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Turnstile Scanner</span>
                <span className="font-bold text-emerald-600">Scan at Metro AFC Gate / Local Barrier</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setPassDownloaded(true)}
                className="flex-1 py-2.5 rounded-xl border border-teal-600 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors flex items-center justify-center gap-1.5"
              >
                {passDownloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Saved to Wallet</span>
                  </>
                ) : (
                  <span>Save to Wallet</span>
                )}
              </button>
              <button
                onClick={() => setBookedPassOption(null)}
                className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
