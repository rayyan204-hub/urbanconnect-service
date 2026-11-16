import { useState, useEffect, FormEvent } from 'react';
import { ScreenId, VolunteerEvent, UserProfile } from '../types';
import {
  getVolunteerEvents,
  joinVolunteerEvent,
  createVolunteerEvent,
  subscribeToCollection,
  COLLECTIONS,
} from '../services/dbService';
import { TopAppBar } from '../components/common/TopAppBar';
import { VolunteerEventsSkeleton } from '../components/common/SkeletonStates';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Plus,
  X,
  Share2,
  Check,
} from 'lucide-react';

interface VolunteerEventsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

const CATEGORIES = ['All', 'Environment', 'Civic Action', 'Healthcare', 'Education'];

export function VolunteerEventsScreen({ onNavigate, currentUser }: VolunteerEventsScreenProps) {
  const [events, setEvents] = useState<VolunteerEvent[]>(() => getVolunteerEvents());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Organize Event Modal State
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('Environment');
  const [newEventOrg, setNewEventOrg] = useState('Thane Civic Collective');
  const [newEventDate, setNewEventDate] = useState('Saturday, Next Week');
  const [newEventTime, setNewEventTime] = useState('08:00 AM - 11:30 AM');
  const [newEventLocation, setNewEventLocation] = useState('Upvan Lake Promenade');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventCapacity, setNewEventCapacity] = useState('50');

  useEffect(() => {
    setIsLoading(true);
    setEvents(getVolunteerEvents());
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    const unsub = subscribeToCollection(COLLECTIONS.VOLUNTEER_EVENTS, () => {
      setEvents(getVolunteerEvents());
    });

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setEvents(getVolunteerEvents());
    setTimeout(() => {
      setIsLoading(false);
    }, 350);
  };

  const handleToggleJoin = (id: string) => {
    const userUid = currentUser?.uid || currentUser?.citizenId || 'usr-1';
    joinVolunteerEvent(id, userUid);
    setEvents(getVolunteerEvents());
  };

  const handleCreateEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    createVolunteerEvent({
      title: newEventTitle.trim(),
      category: newEventCategory,
      organization: newEventOrg.trim() || 'Thane Citizen Volunteers',
      date: newEventDate,
      time: newEventTime,
      location: newEventLocation.trim() || 'Municipal Ward 4',
      description: newEventDesc.trim() || 'Join hands with local residents to improve civic amenities.',
      maxVolunteers: parseInt(newEventCapacity, 10) || 40,
      imageUrl:
        newEventCategory === 'Environment'
          ? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'
          : newEventCategory === 'Healthcare'
          ? 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80',
    });

    setIsOrganizeModalOpen(false);
    setNewEventTitle('');
    setNewEventDesc('');
    setEvents(getVolunteerEvents());
  };

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'All') return true;
    return e.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div id="screen-volunteer-events" className="flex-1 flex flex-col bg-[#F5F5F7] dark:bg-[#000000] min-h-[780px] font-sans pb-16 transition-colors">
      <TopAppBar
        currentScreen="volunteer-events"
        title="Volunteer Drives"
        subtitle="Civic impact and community neighborhood initiatives"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
        rightAction={
          <button
            onClick={() => setIsOrganizeModalOpen(true)}
            className="px-4 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-full text-[13px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Host</span>
          </button>
        }
      />

      <div className="px-5 sm:px-8 py-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* Apple Style Editorial Highlight Card */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 border border-black/[0.04] dark:border-white/[0.06] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#007AFF] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Community Impact</span>
            </div>
            <h3 className="text-[17px] font-bold text-[#1D1D1F] dark:text-white leading-snug">
              Make Your Neighborhood Greener & Cleaner
            </h3>
            <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Earn certified civic service credits and join passionate fellow residents on weekends.
            </p>
          </div>
          <button
            onClick={() => setIsOrganizeModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2.5 bg-[#007AFF] hover:bg-[#0062CC] text-white text-[13px] font-semibold rounded-full shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Organize Drive</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#007AFF] text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-[#1C1C1E] text-[#6E6E73] dark:text-[#86868B] border border-black/[0.04] dark:border-white/[0.06] hover:bg-[#F5F5F7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between text-[13px] text-[#6E6E73] dark:text-[#86868B] px-1">
          <span>
            Upcoming Drives ({filteredEvents.length})
          </span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 hover:text-[#007AFF] transition-colors disabled:opacity-50"
            title="Refresh Drives"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#007AFF]' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {/* Events List or Skeleton State */}
        {isLoading ? (
          <VolunteerEventsSkeleton count={3} />
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.04] dark:border-white/[0.06] p-6 space-y-2 shadow-xs">
            <Users className="w-8 h-8 text-[#86868B] mx-auto" />
            <p className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white">No drives in this category</p>
            <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">Be the first to host a community drive!</p>
            <button
              onClick={() => setIsOrganizeModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-full bg-[#007AFF] text-white text-[13px] font-semibold"
            >
              Host Drive
            </button>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isUserJoined = event.registeredUserIds?.includes(currentUser?.uid || 'usr-1');
            const percentFilled = Math.min(100, Math.round((event.joinedCount / event.maxVolunteers) * 100));

            return (
              <div
                key={event.id}
                id={`event-card-${event.id}`}
                className="bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.04] dark:border-white/[0.06] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Image */}
                <div className="w-full h-44 bg-[#F5F5F7] dark:bg-[#2C2C2E] relative overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md">
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/80 text-[#1D1D1F] dark:text-white backdrop-blur-md shadow-xs">
                      {event.joinedCount} of {event.maxVolunteers} joined
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] font-semibold text-[#007AFF] uppercase tracking-wide">
                      {event.organization}
                    </div>
                    <h4 className="text-[16px] font-bold text-[#1D1D1F] dark:text-white mt-1 leading-snug">
                      {event.title}
                    </h4>
                    <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-1.5 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                      <span>{event.date}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#007AFF]" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="w-full h-1.5 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#34C759] transition-all duration-300"
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>

                  {/* Join Action */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[12px] font-medium text-[#34C759]">
                      {event.maxVolunteers - event.joinedCount} spots remaining
                    </span>
                    <button
                      onClick={() => handleToggleJoin(event.id)}
                      className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 transition-all ${
                        isUserJoined
                          ? 'bg-[#34C759]/10 text-[#34C759]'
                          : 'bg-[#007AFF] hover:bg-[#0062CC] text-white shadow-xs'
                      }`}
                    >
                      {isUserJoined ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Registered</span>
                        </>
                      ) : (
                        <span>Join Volunteer Drive</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Organize Modal */}
      {isOrganizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
              <h3 className="text-[17px] font-bold text-[#1D1D1F] dark:text-white">
                Host a Community Drive
              </h3>
              <button
                onClick={() => setIsOrganizeModalOpen(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F] rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                  Drive Title
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Lake Promenade Clean-up Drive"
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                    Category
                  </label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[13px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                  >
                    <option value="Environment">Environment</option>
                    <option value="Civic Action">Civic Action</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                    Max Volunteers
                  </label>
                  <input
                    type="number"
                    value={newEventCapacity}
                    onChange={(e) => setNewEventCapacity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[13px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="e.g. Upvan Lake Amphitheatre"
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="What volunteers will do, equipment needed..."
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOrganizeModalOpen(false)}
                  className="flex-1 py-3 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[14px] font-medium text-[#6E6E73] dark:text-[#86868B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-[#007AFF] text-white text-[14px] font-semibold"
                >
                  Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
