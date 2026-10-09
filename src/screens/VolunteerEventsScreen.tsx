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
  ArrowRight,
  Share2,
  RotateCcw,
  Plus,
  X,
  Check,
  Copy,
  Tag,
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

  // Share Modal & Toast State
  const [shareEvent, setShareEvent] = useState<VolunteerEvent | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Organize Event Modal State
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('Environment');
  const [newEventOrg, setNewEventOrg] = useState('Thane Civic Collective');
  const [newEventDate, setNewEventDate] = useState('Saturday, Next Week');
  const [newEventTime, setNewEventTime] = useState('08:00 AM - 11:30 AM');
  const [newEventLocation, setNewEventLocation] = useState('Upvan Lake Promenade, Thane West');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventCapacity, setNewEventCapacity] = useState('50');

  // Subscribe to live event updates from dbService
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
      location: newEventLocation.trim() || 'TMC Ward 4',
      description: newEventDesc.trim() || 'Join hands with local residents to improve civic amenities and urban green cover.',
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

  const handleShareClick = (event: VolunteerEvent) => {
    setShareEvent(event);
    setCopiedLink(false);
  };

  const handleCopyShareLink = () => {
    if (!shareEvent) return;
    const url = `${window.location.origin}/#volunteer-${shareEvent.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'All') return true;
    return e.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });


  return (
    <div id="screen-volunteer-events" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] transition-colors">
      <TopAppBar
        currentScreen="volunteer-events"
        title="Volunteer Events"
        subtitle="Civic Impact & Community Drives"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Hero Highlight Card */}
      <div className="p-4 space-y-3">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 dark:from-emerald-900 dark:to-teal-900 text-white rounded-3xl p-4 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
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
          <button
            onClick={() => setIsOrganizeModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2.5 bg-white text-teal-900 hover:bg-emerald-50 text-xs font-bold rounded-2xl shadow-sm flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-teal-700" />
            <span>Host a Drive</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List Header & Content */}
      <div className="px-4 pb-8 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            {selectedCategory === 'All' ? 'Upcoming Civic Drives' : `${selectedCategory} Drives`} ({filteredEvents.length})
          </span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 py-1 px-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-xs font-semibold disabled:opacity-50"
            title="Refresh Drives"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600 dark:text-teal-400' : ''}`} />
            <span>Sync Drives</span>
          </button>
        </div>

        {/* Events List or Skeleton State */}
        {isLoading ? (
          <VolunteerEventsSkeleton count={3} />
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No events found in this category</p>
            <p className="text-[11px] text-slate-500">Be the first to host a community drive in your neighborhood!</p>
            <button
              onClick={() => setIsOrganizeModalOpen(true)}
              className="mt-2 px-3 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-bold"
            >
              Host Drive
            </button>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const percentFilled = Math.min(100, Math.round((event.joinedCount / event.maxVolunteers) * 100));
            return (
              <div
                key={event.id}
                id={`event-card-${event.id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
              {/* Event Image */}
              <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
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
                  <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
                    {event.organization}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                    {event.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                      <span className="truncate">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                      <span className="truncate">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>Volunteer Capacity</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{percentFilled}% Filled</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                        : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
                    }`}
                  >
                    {event.isJoined ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
                    onClick={() => handleShareClick(event)}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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

      {/* Share Modal Dialog */}
      {shareEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Share Volunteer Drive</h4>
              </div>
              <button
                onClick={() => setShareEvent(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{shareEvent.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{shareEvent.location} • {shareEvent.date}</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-mono">
                {window.location.origin}/#volunteer-{shareEvent.id}
              </span>
              <button
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setShareEvent(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Organize Event Modal */}
      {isOrganizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Host a Community Drive</h4>
                  <p className="text-[10px] text-slate-500">Mobilize neighbors for a cleaner, greener ward</p>
                </div>
              </div>
              <button
                onClick={() => setIsOrganizeModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Drive Title *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Upvan Lake Edge Plastic Cleanup & Tree Plantation"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Environment">Environment</option>
                    <option value="Civic Action">Civic Action</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Max Volunteers</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={newEventCapacity}
                    onChange={(e) => setNewEventCapacity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="e.g. Talao Pali Promenade, Naupada"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                  <input
                    type="text"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    placeholder="e.g. Sunday, Oct 14"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Time</label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="e.g. 07:30 AM - 10:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Description & Goals</label>
                <textarea
                  rows={3}
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Describe the initiative, what to bring (gloves, water), and target outcomes..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOrganizeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Publish Civic Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
