import { useState, useEffect } from 'react';
import { ScreenId, TrainSchedule, UserProfile } from '../types';
import { INITIAL_TRAINS } from '../data/mockData';
import { TopAppBar } from '../components/common/TopAppBar';
import { TrainInfoSkeleton } from '../components/common/SkeletonStates';
import {
  Search,
  Train,
  Clock,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  RotateCcw,
  QrCode,
  X,
  Ticket,
} from 'lucide-react';

interface TrainInfoScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

export function TrainInfoScreen({ onNavigate, currentUser }: TrainInfoScreenProps) {
  const [trains, setTrains] = useState<TrainSchedule[]>(INITIAL_TRAINS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeBoardingPass, setActiveBoardingPass] = useState<TrainSchedule | null>(null);

  // Simulate network fetch latency on mount
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const filteredTrains = trains.filter(
    (t) =>
      t.trainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.trainNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.origin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="screen-train-info" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] transition-colors">
      <TopAppBar
        currentScreen="train-info"
        title="Train & Metro Departures"
        subtitle="Central Railway & Metro Station"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Station Search Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-train"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by train name (e.g. Express, Metro) or destination..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Station Live Board */}
      <div className="p-4 space-y-3.5 pb-8">
        <div className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-3xl p-4 shadow-md flex items-center justify-between border border-slate-800">
          <div>
            <div className="text-[10px] font-mono tracking-wider text-teal-300 uppercase">
              Main Station Hub
            </div>
            <div className="text-sm font-extrabold text-white mt-0.5">
              City Grand Central Terminal
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-amber-300">09:41 AM</div>
            <div className="text-[10px] text-slate-400">All Platforms Active</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-1">
          <span>Scheduled Departures ({filteredTrains.length})</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
              title="Refresh Train Board"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
            </button>
            <span>Live Boarding Status</span>
          </div>
        </div>

        {/* Train Departures or Skeleton State */}
        {isLoading ? (
          <TrainInfoSkeleton count={4} />
        ) : filteredTrains.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <Train className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No trains match "{searchQuery}"</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Try searching by train name, destination, or train number.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-3 py-1.5 bg-indigo-700 text-white rounded-xl text-xs font-semibold hover:bg-indigo-800"
            >
              Show All Departures
            </button>
          </div>
        ) : (
          filteredTrains.map((train) => {
          let statusBadgeClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
          if (train.status === 'Boarding') {
            statusBadgeClass = 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800 animate-pulse';
          } else if (train.status === 'Delayed') {
            statusBadgeClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60';
          }

          return (
            <div
              key={train.id}
              id={`train-schedule-${train.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:shadow-md transition-all"
            >
              {/* Header: Train Number & Status */}
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <Train className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {train.trainName}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      #{train.trainNumber} • {train.frequency}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeClass}`}
                  >
                    {train.status} {train.delayMinutes ? `(+${train.delayMinutes}m)` : ''}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 mt-1">
                    {train.platform}
                  </span>
                </div>
              </div>

              {/* Timing & Origin -> Destination */}
              <div className="grid grid-cols-3 gap-2 items-center text-center py-2">
                <div className="text-left">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    {train.departureTime}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{train.origin}</div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Direct Express</span>
                  <div className="w-full flex items-center justify-center gap-1 text-slate-300 dark:text-slate-600">
                    <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />
                    <ArrowRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    {train.arrivalTime}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{train.destination}</div>
                </div>
              </div>

              {/* Bottom Action / Ticket */}
              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Standard Suburban / Metro Fare: ₹20</span>
                <button
                  onClick={() => setActiveBoardingPass(train)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Boarding Pass</span>
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Rail Boarding Pass Modal */}
      {activeBoardingPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Metro Rail Boarding Pass
                </h3>
              </div>
              <button
                onClick={() => setActiveBoardingPass(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-left">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-indigo-950 dark:text-indigo-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-700">
                  {activeBoardingPass.trainNumber}
                </span>
                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300">
                  Platform {activeBoardingPass.platform}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">{activeBoardingPass.trainName}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {activeBoardingPass.origin} ➔ {activeBoardingPass.destination}
              </p>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-indigo-200/80 dark:border-indigo-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Coach</span>
                  <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">Car C4</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Seat</span>
                  <strong className="text-xs font-bold text-indigo-900 dark:text-indigo-300">22B (Window)</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Departs</span>
                  <strong className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">{activeBoardingPass.departureTime}</strong>
                </div>
              </div>
            </div>

            {/* QR Code Pass */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-xs flex items-center justify-center border border-slate-200">
                <QrCode className="w-28 h-28 text-slate-800" />
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-2">
                RAIL-TICKET-{activeBoardingPass.trainNumber}-CONFIRMED
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Show barcode at rail station turnstile gate</span>
            </div>

            <button
              onClick={() => setActiveBoardingPass(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-700 hover:bg-slate-800 dark:hover:bg-indigo-800 text-white text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
