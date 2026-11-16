import { useState, useEffect } from 'react';
import { ScreenId, BusRoute, UserProfile } from '../types';
import { INITIAL_BUS_ROUTES } from '../data/mockData';
import { TopAppBar } from '../components/common/TopAppBar';
import { BusInfoSkeleton } from '../components/common/SkeletonStates';
import {
  Search,
  Bus,
  Clock,
  ChevronDown,
  ChevronUp,
  Ticket,
  CheckCircle2,
  RotateCcw,
  QrCode,
  X,
  Smartphone,
  Calendar,
} from 'lucide-react';
import { BusTimetableView } from '../components/transit/BusTimetableView';
import { FirestoreStatusBanner } from '../components/common/FirestoreStatusBanner';

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
  const [activeBusTab, setActiveBusTab] = useState<'timetables' | 'live-tracker'>('timetables');

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
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
    <div id="screen-bus-info" className="flex-1 flex flex-col bg-[#F5F5F7] dark:bg-[#000000] min-h-[780px] transition-colors font-sans pb-16">
      <TopAppBar
        currentScreen="bus-info"
        title="Bus Transit"
        subtitle="Real-time timetables and municipal electric lines"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Cloud Firestore Database Banner */}
      <div className="px-5 sm:px-8 pt-3 max-w-2xl mx-auto w-full">
        <FirestoreStatusBanner />
      </div>

      {/* Main Mode Switcher: Timetables vs Live Radar */}
      <div className="px-5 sm:px-8 py-2 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#E5E5EA] dark:bg-[#1C1C1E] rounded-2xl">
          <button
            onClick={() => setActiveBusTab('timetables')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeBusTab === 'timetables'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#007AFF] shadow-xs'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Official Timetables & Depots</span>
          </button>

          <button
            onClick={() => setActiveBusTab('live-tracker')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeBusTab === 'live-tracker'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#007AFF] shadow-xs'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Live Radar Tracker</span>
          </button>
        </div>
      </div>

      {activeBusTab === 'timetables' ? (
        <div className="px-5 sm:px-8 py-2 max-w-2xl mx-auto w-full">
          <BusTimetableView
            currentUser={currentUser}
            onBookPass={(bus) => {
              // Map timetable bus to route format for ticket modal
              handleBookTicket({
                id: bus.id,
                busNumber: bus.routeNumber,
                routeName: bus.routeName,
                startPoint: bus.origin,
                destination: bus.destination,
                frequency: bus.peakHeadway,
                fare: bus.fare,
                nextDeparture: bus.nextDeparture,
                status: 'On Time',
                stops: bus.stops.map((s) => ({
                  name: s.name,
                  time: s.scheduledArrival,
                  isPassed: s.isPassed,
                })),
              });
            }}
          />
        </div>
      ) : (
        <>
          {/* Search Bus Number or Route */}
          <div className="px-5 sm:px-8 py-3.5 bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xl border-b border-[#E5E5EA] dark:border-[#2C2C2E] sticky top-0 z-20 transition-colors">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="input-search-bus"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by bus number (e.g. 104, Line 22) or station..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[14px] text-[14px] font-medium text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25 transition-all"
              />
            </div>
          </div>

          {/* Route List */}
          <div className="px-5 sm:px-8 py-4 space-y-4 max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between text-[13px] text-[#6E6E73] dark:text-[#86868B] px-1">
              <span>Active Lines ({filteredRoutes.length})</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-1 text-[#6E6E73] dark:text-[#86868B] hover:text-[#007AFF] transition-colors disabled:opacity-50"
                  title="Refresh Transit Tracker"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#007AFF]' : ''}`} />
                </button>
                <span className="flex items-center gap-1.5 text-[#34C759] font-medium text-[12px]">
                  <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                  Live Telemetry
                </span>
              </div>
            </div>

        {/* Bus Routes or Skeleton State */}
        {isLoading ? (
          <BusInfoSkeleton count={4} />
        ) : filteredRoutes.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
            <Bus className="w-8 h-8 text-[#86868B] mx-auto mb-2" />
            <p className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white">No bus lines match "{searchQuery}"</p>
            <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-1">Try searching by bus number or stop name.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3.5 px-4 py-2 bg-[#007AFF] text-white rounded-full text-[13px] font-semibold hover:bg-[#0062CC] transition-colors"
            >
              Show All Lines
            </button>
          </div>
        ) : (
          filteredRoutes.map((route) => {
            const isExpanded = expandedRouteId === route.id;
            return (
              <div
                key={route.id}
                id={`bus-route-card-${route.id}`}
                className="bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-black/[0.04] dark:border-white/[0.06] overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                {/* Route Summary Header */}
                <div
                  onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                  className="p-4 sm:p-5 cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-[10px] bg-[#007AFF] text-white font-bold text-[12px] flex items-center gap-1.5 shadow-xs">
                        <Bus className="w-3.5 h-3.5" />
                        <span>{route.busNumber}</span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          route.status === 'On Time'
                            ? 'bg-[#34C759]/10 text-[#34C759]'
                            : 'bg-[#FF9500]/10 text-[#FF9500]'
                        }`}
                      >
                        {route.status} {route.delayMinutes ? `(+${route.delayMinutes}m)` : ''}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-[13px] font-semibold text-[#007AFF]">
                        {route.nextDeparture}
                      </div>
                      <div className="text-[11px] text-[#86868B]">Every {route.frequency}</div>
                    </div>
                  </div>

                  {/* Route Path */}
                  <h4 className="text-[15px] font-semibold text-[#1D1D1F] dark:text-white leading-snug">
                    {route.routeName}
                  </h4>

                  <div className="flex items-center justify-between text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-2.5">
                    <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                      <span className="font-medium text-[#1D1D1F] dark:text-white">{route.startPoint}</span>
                      <span className="text-[#86868B]">→</span>
                      <span className="font-medium text-[#1D1D1F] dark:text-white">{route.destination}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[12px] font-semibold text-[#1D1D1F] dark:text-white bg-[#F5F5F7] dark:bg-[#2C2C2E] px-2.5 py-1 rounded-[10px] flex items-center gap-1">
                        <Ticket className="w-3 h-3 text-[#007AFF]" />
                        {route.fare}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#86868B]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#86868B]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Timetable / Stops Timeline */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 bg-[#F5F5F7]/60 dark:bg-[#2C2C2E]/40 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#007AFF]" />
                      <span>Live Progression & Stops</span>
                    </div>

                    <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E5EA] dark:before:bg-[#3A3A3C]">
                      {route.stops.map((stop, idx) => (
                        <div key={idx} className="relative flex items-center justify-between text-[13px]">
                          {/* Dot indicator */}
                          <div
                            className={`absolute -left-5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              stop.isPassed
                                ? 'bg-[#34C759] border-white text-white'
                                : 'bg-white dark:bg-[#1C1C1E] border-[#007AFF]'
                            }`}
                          >
                            {stop.isPassed && <CheckCircle2 className="w-2.5 h-2.5" />}
                          </div>

                          <div className="min-w-0 pr-2">
                            <span
                              className={`font-medium ${
                                stop.isPassed ? 'text-[#86868B] line-through' : 'text-[#1D1D1F] dark:text-white'
                              }`}
                            >
                              {stop.name}
                            </span>
                          </div>

                          <span
                            className={`text-[12px] shrink-0 ${
                              stop.isPassed ? 'text-[#86868B]' : 'text-[#007AFF] font-semibold'
                            }`}
                          >
                            {stop.time}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex justify-end">
                      <button
                        onClick={() => handleBookTicket(route)}
                        className="text-[13px] font-semibold text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Book Digital Ticket ({route.fare})</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </>
      )}

      {/* Apple Wallet Style Digital Bus Pass Modal */}
      {activeTicketRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] text-center space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-[13px] font-bold text-[#1D1D1F] dark:text-white">
                  Contactless Transit Pass
                </h3>
              </div>
              <button
                onClick={() => setActiveTicketRoute(null)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[20px] text-left">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#007AFF] bg-white dark:bg-[#1C1C1E] px-2.5 py-0.5 rounded-[8px] shadow-xs">
                  {activeTicketRoute.busNumber}
                </span>
                <span className="text-[12px] font-semibold text-[#34C759]">{activeTicketRoute.fare} Paid</span>
              </div>
              <h4 className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white mt-2">{activeTicketRoute.routeName}</h4>
              <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                {activeTicketRoute.startPoint} → {activeTicketRoute.destination}
              </p>
            </div>

            {/* Apple Wallet QR */}
            <div className="p-5 bg-white dark:bg-[#2C2C2E] rounded-[20px] border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center">
              <div className="p-3 bg-white rounded-[16px] shadow-xs flex items-center justify-center">
                <QrCode className="w-32 h-32 text-[#1D1D1F]" />
              </div>
              <span className="text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mt-2.5">
                PASS #{activeTicketRoute.busNumber}-{Date.now().toString().slice(-4)}
              </span>
              <span className="text-[11px] text-[#86868B] mt-0.5">Valid for 90 minutes across all city zones</span>
            </div>

            {/* Tap Feedback */}
            <button
              onClick={() => setTicketValidated(true)}
              className="w-full py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-[#007AFF]" />
              <span>{ticketValidated ? '✓ Scanned at Front Fare Gate' : 'Tap Phone to Turnstile Reader'}</span>
            </button>

            <button
              onClick={() => setActiveTicketRoute(null)}
              className="w-full py-3 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-[14px] font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
