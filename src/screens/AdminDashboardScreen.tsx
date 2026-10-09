import { useState, useEffect, FormEvent } from 'react';
import { ScreenId, UserProfile, Complaint, ComplaintStatus, CommunityPost, VolunteerEvent, BusRoute, TrainSchedule } from '../types';
import { TopAppBar } from '../components/common/TopAppBar';
import {
  getComplaints,
  updateComplaintStatus,
  updateComplaintResolutionEvidence,
  COMPLAINT_STAGES,
  getCommunityPosts,
  deleteCommunityPost,
  createCommunityPost,
  getVolunteerEvents,
  createVolunteerEvent,
  getBusRoutes,
  createBusRoute,
  getTrainSchedules,
  createTrainSchedule,
  getUsers,
  resetAllDataToDefault,
  subscribeToCollection,
  COLLECTIONS,
} from '../services/dbService';
import {
  ShieldAlert,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Bus,
  Train,
  CheckCircle2,
  Trash2,
  Pin,
  Plus,
  RotateCcw,
  Users,
  Search,
  Check,
  Send,
} from 'lucide-react';

interface AdminDashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser: UserProfile | null;
}

export function AdminDashboardScreen({ onNavigate, currentUser }: AdminDashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<'complaints' | 'community' | 'events' | 'transit' | 'system'>('complaints');

  // State collections
  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints());
  const [posts, setPosts] = useState<CommunityPost[]>(getCommunityPosts());
  const [events, setEvents] = useState<VolunteerEvent[]>(getVolunteerEvents());
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(getBusRoutes());
  const [trains, setTrains] = useState<TrainSchedule[]>(getTrainSchedules());
  const [usersList, setUsersList] = useState<UserProfile[]>(getUsers());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');

  // Selected complaint for modal editing
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [editStatus, setEditStatus] = useState<ComplaintStatus>('In Progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [resolutionEvidenceUrl, setResolutionEvidenceUrl] = useState('');

  // New Event Form State
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventOrg, setEventOrg] = useState('Thane Municipal Youth Council');
  const [eventCategory, setEventCategory] = useState('Environment');
  const [eventDate, setEventDate] = useState('Saturday, Sep 20, 2026');
  const [eventTime, setEventTime] = useState('08:00 AM - 11:30 AM');
  const [eventLocation, setEventLocation] = useState('Upvan Lake, Thane West');
  const [eventMaxVolunteers, setEventMaxVolunteers] = useState(50);
  const [eventDesc, setEventDesc] = useState('');

  // New Transit Form State
  const [showNewBusModal, setShowNewBusModal] = useState(false);
  const [busNumber, setBusNumber] = useState('TMT 112 Express');
  const [busRouteName, setBusRouteName] = useState('Thane Station (W) to Ovala');
  const [busStart, setBusStart] = useState('Thane Station (W)');
  const [busDest, setBusDest] = useState('Ovala Naka');
  const [busFare, setBusFare] = useState('₹18');
  const [busFreq, setBusFreq] = useState('Every 15 mins');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync with dbService subscriptions
  useEffect(() => {
    const unsubComplaints = subscribeToCollection(COLLECTIONS.COMPLAINTS, () => setComplaints(getComplaints()));
    const unsubPosts = subscribeToCollection(COLLECTIONS.POSTS, () => setPosts(getCommunityPosts()));
    const unsubEvents = subscribeToCollection(COLLECTIONS.VOLUNTEER_EVENTS, () => setEvents(getVolunteerEvents()));
    const unsubBus = subscribeToCollection(COLLECTIONS.BUS_ROUTES, () => setBusRoutes(getBusRoutes()));
    const unsubTrains = subscribeToCollection(COLLECTIONS.TRAIN_ROUTES, () => setTrains(getTrainSchedules()));
    const unsubUsers = subscribeToCollection(COLLECTIONS.USERS, () => setUsersList(getUsers()));

    return () => {
      unsubComplaints();
      unsubPosts();
      unsubEvents();
      unsubBus();
      unsubTrains();
      unsubUsers();
    };
  }, []);

  // Update Complaint Handler
  const handleUpdateStatus = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    if (
      editStatus === 'Resolution Evidence Added' ||
      editStatus === 'Awaiting Citizen Confirmation' ||
      editStatus === 'Resolved'
    ) {
      if (resolutionEvidenceUrl.trim()) {
        updateComplaintResolutionEvidence(
          selectedComplaint.id,
          resolutionEvidenceUrl.trim(),
          resolutionNote.trim() || 'Official resolution evidence uploaded by field crew.',
          assignedOfficer.trim() || undefined
        );
      } else {
        updateComplaintStatus(
          selectedComplaint.id,
          editStatus,
          resolutionNote.trim() || `Status updated to ${editStatus} by Municipal Officer.`,
          assignedOfficer.trim() || undefined
        );
      }
    } else {
      updateComplaintStatus(
        selectedComplaint.id,
        editStatus,
        resolutionNote.trim() || `Status updated to ${editStatus} by Municipal Officer.`,
        assignedOfficer.trim() || undefined
      );
    }

    showToast(`Ticket ${selectedComplaint.ticketId} updated to ${editStatus}.`);
    setSelectedComplaint(null);
    setResolutionNote('');
  };

  // Community Post actions
  const handleDeletePost = (postId: string) => {
    deleteCommunityPost(postId);
    showToast('Post removed by administrator.');
  };

  const handleTogglePin = (post: CommunityPost) => {
    // In dbService, toggle pinned
    const allPosts = getCommunityPosts();
    const idx = allPosts.findIndex((p) => p.id === post.id);
    if (idx !== -1) {
      allPosts[idx] = { ...allPosts[idx], pinned: !allPosts[idx].pinned };
      localStorage.setItem(COLLECTIONS.POSTS, JSON.stringify(allPosts));
      setPosts([...allPosts]);
      showToast(allPosts[idx].pinned ? 'Post pinned to top of Community Feed.' : 'Post unpinned.');
    }
  };

  // Create Volunteer Event
  const handleCreateEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventLocation.trim()) return;

    createVolunteerEvent({
      title: eventTitle,
      organization: eventOrg,
      category: eventCategory,
      date: eventDate,
      time: eventTime,
      location: eventLocation,
      latitude: 19.2085,
      longitude: 72.9815,
      description: eventDesc || 'Civic initiative organized by local administration.',
      maxVolunteers: Number(eventMaxVolunteers) || 50,
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    });

    showToast('New volunteer drive published successfully.');
    setShowNewEventModal(false);
    setEventTitle('');
    setEventDesc('');
  };

  // Create Bus Route
  const handleCreateBus = (e: FormEvent) => {
    e.preventDefault();
    if (!busNumber.trim() || !busRouteName.trim()) return;

    createBusRoute({
      busNumber,
      routeName: busRouteName,
      startPoint: busStart,
      destination: busDest,
      frequency: busFreq,
      fare: busFare,
      nextDeparture: '5 mins',
      status: 'On Time',
      stops: [
        { name: busStart, time: '09:00 AM', isPassed: true },
        { name: 'Teen Hath Naka', time: '09:12 AM', isPassed: false },
        { name: busDest, time: '09:45 AM', isPassed: false },
      ],
    });

    showToast(`Bus route ${busNumber} added to civic timetable.`);
    setShowNewBusModal(false);
  };

  // Filtered Complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesQuery =
      c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div id="screen-admin" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] transition-colors pb-16">
      <TopAppBar
        currentScreen="admin"
        title="Admin Operations HQ"
        subtitle="Civic Grievance & Content Management"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Admin Role Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white px-4 py-3 border-b border-teal-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/40">
            <ShieldAlert className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">Administrative Portal</span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono">Role: admin</span>
            </div>
            <p className="text-[11px] text-slate-300">Direct control over complaints, feed, events & transit data</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('profile')}
          className="text-[11px] font-semibold text-teal-300 hover:text-white bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
        >
          Exit Admin
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mx-4 mt-2 p-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === 'complaints'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Grievances ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === 'community'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Feed ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === 'events'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transit')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === 'transit'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bus className="w-3.5 h-3.5" />
          <span>Transit</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === 'system'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>System</span>
        </button>
      </div>

      {/* Tab 1: Complaints Management */}
      {activeTab === 'complaints' && (
        <div className="p-4 space-y-3 flex-1">
          {/* Search & Status Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ticket ID, title, or road..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {(['All', 'Pending', 'Under Review', 'In Progress', 'Resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? 'bg-slate-900 dark:bg-teal-700 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* List of complaints */}
          <div className="space-y-2.5">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No complaints found</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Try altering the search or status filter</p>
              </div>
            ) : (
              filteredComplaints.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                          {comp.ticketId}
                        </span>
                        <span className="text-[10px] text-slate-400">• {comp.dateFiled}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">{comp.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{comp.location}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${
                        comp.status === 'Resolved'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : comp.status === 'In Progress'
                          ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                          : comp.status === 'Under Review'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-xl text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Latest Note: </span>
                    {comp.lastUpdate}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500">Dept: {comp.department}</span>
                    <button
                      onClick={() => {
                        setSelectedComplaint(comp);
                        setEditStatus(comp.status);
                        setResolutionNote(comp.lastUpdate || '');
                        setAssignedOfficer(comp.assignedOfficer || 'Inspector Rajesh Patil');
                        setResolutionEvidenceUrl(
                          comp.resolutionEvidenceUrl ||
                            'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80'
                        );
                      }}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <span>Update Status</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Community Feed Admin */}
      {activeTab === 'community' && (
        <div className="p-4 space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Moderate Neighborhood Feed</h3>
            <span className="text-[11px] text-slate-500">{posts.length} Active Posts</span>
          </div>

          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img src={post.avatar} alt={post.author} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block leading-tight">
                        {post.author}
                      </span>
                      <span className="text-[10px] text-slate-400">{post.authorRole} • {post.date}</span>
                    </div>
                  </div>

                  {post.pinned && (
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" />
                      Pinned
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{post.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{post.description}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">{post.category}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePin(post)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
                    >
                      <Pin className="w-3 h-3" />
                      <span>{post.pinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Volunteer Events Admin */}
      {activeTab === 'events' && (
        <div className="p-4 space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Volunteer Drives</h3>
              <p className="text-[11px] text-slate-500">Create civic drives & inspect registrations</p>
            </div>
            <button
              onClick={() => setShowNewEventModal(true)}
              className="py-1.5 px-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Drive</span>
            </button>
          </div>

          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                      {evt.category} • {evt.organization}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">{evt.title}</h4>
                    <p className="text-[11px] text-slate-500">{evt.date} • {evt.time}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">{evt.location}</p>
                  </div>

                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl">
                    {evt.joinedCount} / {evt.maxVolunteers}
                  </span>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-xl text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Registered Citizen IDs: </span>
                  {Array.isArray(evt.registeredUserIds) && evt.registeredUserIds.length > 0
                    ? evt.registeredUserIds.join(', ')
                    : 'Aarav Deshmukh (usr-1), Pooja Kulkarni (usr-2)'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Transit Admin */}
      {activeTab === 'transit' && (
        <div className="p-4 space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Municipal Transit Schedules</h3>
              <p className="text-[11px] text-slate-500">TMT / BEST bus routes and suburban lines</p>
            </div>
            <button
              onClick={() => setShowNewBusModal(true)}
              className="py-1.5 px-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Route</span>
            </button>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Bus Routes ({busRoutes.length})</h4>
            {busRoutes.map((bus) => (
              <div
                key={bus.id}
                className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{bus.busNumber}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                      Fare: {bus.fare}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{bus.routeName}</p>
                </div>
                <span className="text-[11px] font-mono text-slate-500">{bus.frequency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: System Admin */}
      {activeTab === 'system' && (
        <div className="p-4 space-y-4 flex-1">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              UrbanConnect Firestore Simulation Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Prototype 2 operates on 10 interconnected collections with zero hosting or paid API costs. You can inspect active collections or reset the sandbox state.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Users Collection</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{usersList.length} profiles</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Complaints Collection</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{complaints.length} tickets</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Community Posts</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{posts.length} posts</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Transit Routes</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{busRoutes.length + trains.length} routes</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset all collections to initial seed data?')) {
                    resetAllDataToDefault();
                    showToast('All collections restored to clean seed data.');
                  }
                }}
                className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Database to Default Seed Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Update Complaint Status */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  {selectedComplaint.ticketId}
                </span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Update Civic Ticket
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Lifecycle Stage (8-Stage Process)
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {COMPLAINT_STAGES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`p-2 rounded-xl text-[11px] font-bold text-left border transition-all truncate ${
                        editStatus === st
                          ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Field Officer
                </label>
                <input
                  type="text"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  placeholder="e.g. Inspector Rajesh Patil (Road Maintenance Dept)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Evidence Photo URL (After Repair)
                </label>
                <input
                  type="url"
                  value={resolutionEvidenceUrl}
                  onChange={(e) => setResolutionEvidenceUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
                />
                {resolutionEvidenceUrl && (
                  <div className="mt-1.5 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img
                      src={resolutionEvidenceUrl}
                      alt="Resolution Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supervisor Resolution Note
                </label>
                <textarea
                  rows={2}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Cold-mix patch crew dispatched, road compaction completed."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Stage & Notify Citizen</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Volunteer Event */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Publish Volunteer Drive</h3>
            <form onSubmit={handleCreateEvent} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500">Event Title</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Talao Pali Promenade Clean-Up"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Category</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option>Environment</option>
                    <option>Community Aid</option>
                    <option>Food Security</option>
                    <option>Education</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Max Capacity</label>
                  <input
                    type="number"
                    value={eventMaxVolunteers}
                    onChange={(e) => setEventMaxVolunteers(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500">Location</label>
                <input
                  type="text"
                  required
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500">Brief Description</label>
                <textarea
                  rows={2}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Details for citizen volunteers..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewEventModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Bus Route */}
      {showNewBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Add Municipal Bus Route</h3>
            <form onSubmit={handleCreateBus} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500">Bus Number</label>
                <input
                  type="text"
                  required
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500">Route Name</label>
                <input
                  type="text"
                  required
                  value={busRouteName}
                  onChange={(e) => setBusRouteName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Fare</label>
                  <input
                    type="text"
                    value={busFare}
                    onChange={(e) => setBusFare(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Frequency</label>
                  <input
                    type="text"
                    value={busFreq}
                    onChange={(e) => setBusFreq(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewBusModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl"
                >
                  Add Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
