import { useState } from 'react';
import { ScreenId, JourneyOption, UserProfile } from '../types';
import { TopAppBar } from '../components/common/TopAppBar';
import {
  Navigation,
  Train,
  Bus,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  Search,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface JourneyPlannerScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

const PRESET_DESTINATIONS = [
  'Bandra Kurla Complex (BKC)',
  'Dadar Central Interchange',
  'CSMT Terminus',
  'Andheri Metro',
  'Ghodbunder Road',
];

function generateRoutesForPoints(fromStation: string, toStation: string): JourneyOption[] {
  const fromClean = fromStation.trim() || 'Thane Station';
  const toClean = toStation.trim() || 'Bandra Kurla Complex';

  return [
    {
      id: `j-fast-${Date.now()}`,
      title: 'Fast Suburban Local + Metro Connector',
      from: fromClean,
      to: toClean,
      durationMinutes: 36,
      fare: '₹25',
      transfers: 1,
      summary: `Fast train from ${fromClean} + automated metro connector to ${toClean}`,
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
          details: '12-car AC suburban rake with live telemetry',
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
      title: 'Direct AC Electric Bus (Zero Transfers)',
      from: fromClean,
      to: toClean,
      durationMinutes: 48,
      fare: '₹35',
      transfers: 0,
      summary: `One-seat zero-transfer AC express with onboard Wi-Fi and live telemetry`,
      tags: ['Direct Ride', 'Zero Transfers'],
      departureTime: 'Every 10 mins',
      arrivalTime: '48 mins total',
      modes: ['Bus'],
      legs: [
        {
          mode: 'bus',
          lineName: 'TMT Premium Electric Express',
          fromStop: fromClean,
          toStop: toClean,
          durationMinutes: 48,
          details: 'Dedicated transit corridor with minimal stops',
          status: 'On Time',
        },
      ],
    },
    {
      id: `j-budget-${Date.now()}`,
      title: 'Suburban Slow Corridor (Budget Option)',
      from: fromClean,
      to: toClean,
      durationMinutes: 52,
      fare: '₹10',
      transfers: 1,
      summary: `All-stop suburban transit via central municipal rail line`,
      tags: ['Lowest Fare'],
      departureTime: 'Every 6 mins',
      arrivalTime: '52 mins total',
      modes: ['Train', 'Walk'],
      legs: [
        {
          mode: 'train',
          lineName: 'Main Suburban Line Slow',
          fromStop: fromClean,
          toStop: toClean,
          durationMinutes: 46,
          details: 'All-station transit stopping across all local platforms',
          status: 'On Time',
        },
        {
          mode: 'walk',
          lineName: 'Station Exit Boulevard',
          fromStop: toClean,
          toStop: `${toClean} Commercial District`,
          durationMinutes: 6,
          details: 'Shaded pedestrian pathway',
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
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(
    journeyOptions[0]?.id || null
  );
  const [isSearching, setIsSearching] = useState(false);

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
    }, 300);
  };

  const getModeIcon = (mode?: string) => {
    switch ((mode || '').toLowerCase()) {
      case 'train':
        return <Train className="w-3.5 h-3.5 text-[#007AFF]" />;
      case 'metro':
        return <Zap className="w-3.5 h-3.5 text-[#5856D6]" />;
      case 'bus':
        return <Bus className="w-3.5 h-3.5 text-[#34C759]" />;
      default:
        return <Navigation className="w-3.5 h-3.5 text-[#86868B]" />;
    }
  };

  const getModes = (journey: JourneyOption): string[] => {
    if (journey.modes && Array.isArray(journey.modes) && journey.modes.length > 0) {
      return journey.modes;
    }
    return ['Multimodal'];
  };

  return (
    <div id="screen-journey-planner" className="flex-1 flex flex-col bg-[#F5F5F7] dark:bg-[#000000] min-h-[780px] font-sans pb-16 transition-colors">
      <TopAppBar
        currentScreen="journey-planner"
        title="Trip Planner"
        subtitle="Suburban locals, metro lines & electric bus routes"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Origin / Destination Search Card */}
      <div className="px-5 sm:px-8 py-4 bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xl border-b border-[#E5E5EA] dark:border-[#2C2C2E] shadow-xs">
        <div className="space-y-2 max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#34C759] absolute left-3.5" />
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Origin station or street..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[14px] text-[14px] text-[#1D1D1F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25 transition-all"
            />
          </div>

          <div className="flex justify-center -my-1.5 relative z-10">
            <button
              onClick={handleSwap}
              title="Swap origin and destination"
              className="p-1.5 rounded-full bg-white dark:bg-[#1C1C1E] text-[#6E6E73] dark:text-[#86868B] border border-[#E5E5EA] dark:border-[#2C2C2E] hover:text-[#007AFF] transition-colors shadow-xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] absolute left-3.5" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destination..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[14px] text-[14px] text-[#1D1D1F] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25 transition-all"
            />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2">
            <span className="text-[11px] text-[#86868B] font-medium shrink-0">Popular:</span>
            {PRESET_DESTINATIONS.map((dest) => (
              <button
                key={dest}
                onClick={() => {
                  setDestination(dest);
                  handleSearch(origin, dest);
                }}
                className="shrink-0 px-3 py-1 rounded-full text-[12px] font-medium bg-[#F5F5F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white transition-colors"
              >
                {dest.split(' (')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="mt-3 w-full py-3 rounded-full bg-[#007AFF] hover:bg-[#0062CC] disabled:opacity-60 text-white text-[14px] font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <span>Computing Best Routes...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Fastest Routes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="max-w-2xl mx-auto w-full px-5 sm:px-8 pt-3">
        <div className="p-3 bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-[16px] flex items-start gap-2.5 text-[12px] text-[#1D1D1F] dark:text-white">
          <AlertTriangle className="w-4 h-4 text-[#FF9500] shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Suburban Advisory:</strong> 5–8 min delay on slow locals via Platform 3 due to maintenance between Mulund & Thane. Fast corridors operating on time.
          </p>
        </div>
      </div>

      {/* Routes List */}
      <div className="px-5 sm:px-8 py-4 space-y-4 max-w-2xl mx-auto w-full flex-1">
        <h3 className="text-[13px] font-semibold text-[#6E6E73] dark:text-[#86868B] px-1">
          Recommended Itineraries ({journeyOptions.length})
        </h3>

        {journeyOptions.map((opt) => {
          const isExpanded = selectedJourneyId === opt.id;

          return (
            <div
              key={opt.id}
              className={`bg-white dark:bg-[#1C1C1E] rounded-[24px] border transition-all ${
                isExpanded
                  ? 'border-[#007AFF]/40 ring-2 ring-[#007AFF]/15 shadow-md'
                  : 'border-black/[0.04] dark:border-white/[0.06] shadow-xs'
              } p-4 sm:p-5 space-y-3`}
            >
              {/* Header */}
              <div
                onClick={() => setSelectedJourneyId(isExpanded ? null : opt.id)}
                className="cursor-pointer flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-[#1D1D1F] dark:text-white">
                      {opt.title}
                    </span>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF]">
                      {getModes(opt).join(' + ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-1.5">
                    <span className="flex items-center gap-1 font-semibold text-[#1D1D1F] dark:text-white">
                      <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
                      {opt.durationMinutes} mins
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-[#34C759]">
                      {opt.fare}
                    </span>
                    <span>•</span>
                    <span>{opt.transfers === 0 ? 'Direct ride' : `${opt.transfers} transfer`}</span>
                  </div>
                </div>

                <button className="p-1 text-[#86868B]">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Step-by-Step Breakdown when expanded */}
              {isExpanded && (
                <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] space-y-3">
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E5EA] dark:before:bg-[#2C2C2E]">
                    {opt.legs && opt.legs.length > 0 ? (
                      opt.legs.map((leg, idx) => (
                        <div key={idx} className="relative text-[13px]">
                          <div className="absolute -left-[22px] top-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#1C1C1E] border-2 border-[#007AFF] flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                                {getModeIcon(leg.mode)}
                                {leg.lineName}
                              </span>
                              <span className="text-[12px] text-[#86868B]">{leg.durationMinutes} mins</span>
                            </div>
                            <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                              {leg.fromStop} → {leg.toStop}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : null}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onNavigate('bus-info')}
                      className="px-4 py-1.5 rounded-full bg-[#007AFF] text-white text-[12px] font-semibold hover:bg-[#0062CC] transition-colors"
                    >
                      Book Ticket on Route
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
