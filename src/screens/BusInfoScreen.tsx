import { useState, useEffect } from 'react';
import { ScreenId, BusRoute, UserProfile } from '../types';
import { INITIAL_BUS_ROUTES } from '../data/mockData';
import { TopAppBar } from '../components/common/TopAppBar';
import { BusInfoSkeleton } from '../components/common/SkeletonStates';
import {
  Search,
  Bus,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Ticket,
  CheckCircle2,
  RotateCcw,
  QrCode,
  X,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

interface BusInfoScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

export function BusInfoScreen({ onNavigate, currentUser }: BusInfoScreenProps) {
  const [routes, setRoutes] = useState<BusRoute[]>(INITIAL_BUS_ROUTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>('bus-1');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTicketRoute, setActiveTicketRoute] = useState<BusRoute | null>(null);
  const [ticketValidated, setTicketValidated] = useState(false);

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

  const handleBookTicket = (route: BusRoute) => {
    setActiveTicketRoute(route);
    setTicketValidated(false);
  };

  const filteredRoutes = routes.filter((r) =>
    r.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.startPoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="screen-bus-info" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] transition-colors">
      <TopAppBar
        currentScreen="bus-info"
        title="Bus Transit & Timetable"
        subtitle="Municipal City Transit Network"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Search Bus Number or Route */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-bus"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by bus number (e.g. 104, Line 22) or station..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Route List */}
      <div className="p-4 space-y-3.5 pb-8">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>Active City Bus Lines ({filteredRoutes.length})</span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
              title="Refresh Transit Tracker"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-600 dark:text-cyan-400' : ''}`} />
            </button>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live GPS Tracking
            </span>
          </div>
        </div>

        {/* Bus Routes or Skeleton State */}
        {isLoading ? (
          <BusInfoSkeleton count={4} />
        ) : filteredRoutes.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <Bus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No bus routes match "{searchQuery}"</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Try searching by bus number or stop name.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-3 py-1.5 bg-cyan-700 text-white rounded-xl text-xs font-semibold hover:bg-cyan-800"
            >
              Show All Routes
            </button>
          </div>
        ) : (
          filteredRoutes.map((route) => {
            const isExpanded = expandedRouteId === route.id;
            return (
              <div
                key={route.id}
                id={`bus-route-card-${route.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
              {/* Route Summary Header */}
              <div
                onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                className="p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-xl bg-cyan-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5">
                      <Bus className="w-3.5 h-3.5" />
                      <span>{route.busNumber}</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        route.status === 'On Time'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {route.status} {route.delayMinutes ? `(+${route.delayMinutes}m)` : ''}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold text-teal-800 dark:text-teal-400">
                      Departs in {route.nextDeparture}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">Freq: {route.frequency}</div>
                  </div>
                </div>

                {/* Route Path */}
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {route.routeName}
                </h4>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mt-2">
                  <div className="flex items-center gap-1 text-[11px] truncate max-w-[200px]">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{route.startPoint}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{route.destination}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Ticket className="w-3 h-3" />
                      {route.fare}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Timetable / Stops Timeline */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 bg-slate-50/70 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    <span>Station Timetable & Live Route Progress</span>
                  </div>

                  <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200 dark:before:bg-teal-800">
                    {route.stops.map((stop, idx) => (
                      <div key={idx} className="relative flex items-center justify-between text-xs">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            stop.isPassed
                              ? 'bg-emerald-500 border-white text-white'
                              : 'bg-white dark:bg-slate-900 border-teal-600 dark:border-teal-400'
                          }`}
                        >
                          {stop.isPassed && <CheckCircle2 className="w-2.5 h-2.5" />}
                        </div>

                        <div className="min-w-0 pr-2">
                          <span
                            className={`font-semibold ${
                              stop.isPassed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {stop.name}
                          </span>
                        </div>

                        <span
                          className={`text-[11px] font-mono flex-shrink-0 ${
                            stop.isPassed ? 'text-slate-400 dark:text-slate-500' : 'text-teal-700 dark:text-teal-400 font-bold'
                          }`}
                        >
                          {stop.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button
                      onClick={() => handleBookTicket(route)}
                      className="text-xs font-bold text-teal-800 dark:text-teal-200 hover:text-teal-900 bg-teal-100 dark:bg-teal-900/60 hover:bg-teal-200/80 dark:hover:bg-teal-800/80 px-3.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-700 transition-colors shadow-2xs"
                    >
                      Book Digital Ticket ({route.fare})
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        }))}
      </div>

      {/* Digital Bus Pass Modal */}
      {activeTicketRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Contactless Transit Pass
                </h3>
              </div>
              <button
                onClick={() => setActiveTicketRoute(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-left">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-teal-900 dark:text-teal-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-700">
                  {activeTicketRoute.busNumber}
                </span>
                <span className="text-xs font-bold text-teal-800 dark:text-teal-400">{activeTicketRoute.fare} Paid</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">{activeTicketRoute.routeName}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {activeTicketRoute.startPoint} ➔ {activeTicketRoute.destination}
              </p>
            </div>

            {/* Simulated QR Code Pass */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-xs flex items-center justify-center border border-slate-200">
                <QrCode className="w-28 h-28 text-slate-800" />
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-2">
                UC-BUS-{activeTicketRoute.busNumber}-{Date.now().toString().slice(-4)}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Valid for 90 minutes across all city zones</span>
            </div>

            {/* Turnstile Tap Simulation */}
            <button
              onClick={() => setTicketValidated(true)}
              className="w-full py-2 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{ticketValidated ? '✓ Scanned at Front Fare Gate' : 'Tap Phone to Turnstile Reader'}</span>
            </button>

            <button
              onClick={() => setActiveTicketRoute(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-teal-700 hover:bg-slate-800 dark:hover:bg-teal-800 text-white text-xs font-bold"
            >
              Close Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
