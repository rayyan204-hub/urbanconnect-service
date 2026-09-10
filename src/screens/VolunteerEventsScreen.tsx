import { useState, useEffect } from 'react';
import { ScreenId, VolunteerEvent, UserProfile } from '../types';
import { INITIAL_EVENTS } from '../data/mockData';
import { TopAppBar } from '../components/common/TopAppBar';
import { VolunteerEventsSkeleton } from '../components/common/SkeletonStates';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Share2,
  RotateCcw,
} from 'lucide-react';

interface VolunteerEventsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

export function VolunteerEventsScreen({ onNavigate, currentUser }: VolunteerEventsScreenProps) {
  const [events, setEvents] = useState<VolunteerEvent[]>(INITIAL_EVENTS);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleToggleJoin = (id: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === id) {
          const nextJoined = !evt.isJoined;
          return {
            ...evt,
            isJoined: nextJoined,
            joinedCount: nextJoined ? evt.joinedCount + 1 : evt.joinedCount - 1,
          };
        }
        return evt;
      })
    );
  };

  return (
    <div id="screen-volunteer-events" className="flex-1 flex flex-col bg-slate-50 min-h-[780px]">
      <TopAppBar
        currentScreen="volunteer-events"
        title="Volunteer Events"
        subtitle="Civic Impact & Community Drives"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Hero Highlight Card */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-3xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Citizen Community Action</span>
          </div>
          <h3 className="text-base font-extrabold text-white leading-snug">
            Make Your Neighborhood Greener, Safer & Cleaner
          </h3>
          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            Earn certified civic service credits and meet passionate fellow residents.
          </p>
        </div>
      </div>

      {/* Events List Header & Content */}
      <div className="px-4 pb-8 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Upcoming Civic Drives ({events.length})</span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 text-slate-500 hover:text-teal-700 py-1 px-2 rounded-lg hover:bg-slate-200/60 transition-colors text-xs font-semibold disabled:opacity-50"
            title="Refresh Drives"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            <span>Sync Drives</span>
          </button>
        </div>

        {/* Events List or Skeleton State */}
        {isLoading ? (
          <VolunteerEventsSkeleton count={3} />
        ) : (
          events.map((event) => {
            const percentFilled = Math.min(100, Math.round((event.joinedCount / event.maxVolunteers) * 100));
            return (
              <div
                key={event.id}
                id={`event-card-${event.id}`}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
              {/* Event Image */}
              <div className="w-full h-40 bg-slate-100 relative overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
                    {event.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                    {event.joinedCount}/{event.maxVolunteers} Joined
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide">
                    {event.organization}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                    {event.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span className="truncate">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span className="truncate">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>Volunteer Capacity</span>
                      <span className="font-semibold text-slate-700">{percentFilled}% Filled</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Join / RSVP Button */}
                <div className="pt-4 mt-2 flex items-center gap-2">
                  <button
                    id={`btn-join-event-${event.id}`}
                    onClick={() => handleToggleJoin(event.id)}
                    className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      event.isJoined
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
                    }`}
                  >
                    {event.isJoined ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Registered as Volunteer</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        <span>Join Event</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => alert(`Share link for: ${event.title}`)}
                    className="p-3 rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                    title="Share Event"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
