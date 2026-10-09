import { useState, useEffect, FormEvent, useMemo } from 'react';
import { ScreenId, Complaint, ComplaintStatus, UserProfile } from '../types';
import {
  getComplaints,
  createComplaint,
  subscribeToCollection,
  COLLECTIONS,
  endorseComplaint,
  confirmCitizenResolution,
  computeSlaStatus,
  calculateDistanceMeters,
} from '../services/dbService';
import { TopAppBar } from '../components/common/TopAppBar';
import { OpenStreetMapPicker } from '../components/map/OpenStreetMapPicker';
import { OpenStreetMapView } from '../components/map/OpenStreetMapView';
import { LifecycleTimeline } from '../components/complaints/LifecycleTimeline';
import { EvidenceComparison } from '../components/complaints/EvidenceComparison';
import {
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Filter,
  X,
  Send,
  Building,
  RotateCcw,
  Map,
  List,
  Search,
  Camera,
  Navigation,
  Check,
  ChevronRight,
  ShieldCheck,
  Eye,
  ThumbsUp,
  Sparkles,
  Award,
  Wrench,
  Phone,
  Layers,
  RotateCw,
} from 'lucide-react';

interface ComplaintTrackingScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

const PRESET_CIVIC_IMAGES = [
  { label: 'Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80' },
  { label: 'Drainage', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80' },
  { label: 'Streetlight', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80' },
  { label: 'Garbage Dump', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80' },
];

export function ComplaintTrackingScreen({ onNavigate, currentUser }: ComplaintTrackingScreenProps) {
  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints());
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'mine'>('all');
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [showLocationPickerModal, setShowLocationPickerModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [reopenReasonText, setReopenReasonText] = useState('');
  const [showReopenInput, setShowReopenInput] = useState(false);
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Roads & Infrastructure');
  const [autoDetectedCategory, setAutoDetectedCategory] = useState<string | null>(null);
  const [categoryConfidence, setCategoryConfidence] = useState<number>(0);
  const [locationAddress, setLocationAddress] = useState('Majiwada Flyover, Thane West');
  const [selectedLat, setSelectedLat] = useState<number>(19.2085);
  const [selectedLng, setSelectedLng] = useState<number>(72.9815);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [dismissDuplicate, setDismissDuplicate] = useState(false);

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => setToastBanner(null), 3500);
  };

  // Subscribe to persistent dbService updates
  useEffect(() => {
    const unsub = subscribeToCollection(COLLECTIONS.COMPLAINTS, () => {
      const refreshed = getComplaints();
      setComplaints(refreshed);
      if (selectedComplaint) {
        const found = refreshed.find((c) => c.id === selectedComplaint.id);
        if (found) setSelectedComplaint(found);
      }
    });
    return unsub;
  }, [selectedComplaint]);

  // Smart Rule-Based Categorization with Confidence Score
  useEffect(() => {
    const combined = `${title} ${description}`.toLowerCase();
    let detected: string | null = null;
    let matchCount = 0;

    const roadKeywords = ['pothole', 'crater', 'bitumen', 'asphalt', 'flyover', 'divider', 'road', 'tar'];
    const drainKeywords = ['drain', 'clog', 'waterlog', 'stormwater', 'gutter', 'flood', 'silt', 'monsoon'];
    const lightKeywords = ['light', 'dark', 'pole', 'lamp', 'flicker', 'high-mast', 'electric', 'bulb'];
    const wasteKeywords = ['garbage', 'waste', 'debris', 'dump', 'trash', 'rubbish', 'plastic', 'bin', 'litter'];
    const waterKeywords = ['water', 'leak', 'pressure', 'pipe', 'tap', 'pipeline', 'contamination'];

    const roadMatches = roadKeywords.filter((k) => combined.includes(k)).length;
    const drainMatches = drainKeywords.filter((k) => combined.includes(k)).length;
    const lightMatches = lightKeywords.filter((k) => combined.includes(k)).length;
    const wasteMatches = wasteKeywords.filter((k) => combined.includes(k)).length;
    const waterMatches = waterKeywords.filter((k) => combined.includes(k)).length;

    const maxMatches = Math.max(roadMatches, drainMatches, lightMatches, wasteMatches, waterMatches);

    if (maxMatches > 0) {
      if (maxMatches === roadMatches) detected = 'Roads & Infrastructure';
      else if (maxMatches === drainMatches) detected = 'Drainage & Monsoon Resilience';
      else if (maxMatches === lightMatches) detected = 'Street Lighting & Power';
      else if (maxMatches === wasteMatches) detected = 'Sanitation & Waste Management';
      else if (maxMatches === waterMatches) detected = 'Water & Utilities';

      matchCount = maxMatches;
    }

    if (detected) {
      const confidence = Math.min(98, 78 + matchCount * 7);
      setAutoDetectedCategory(detected);
      setCategoryConfidence(confidence);
      setCategory(detected);
    } else {
      setAutoDetectedCategory(null);
      setCategoryConfidence(0);
    }
  }, [title, description]);

  // Smart Multi-Candidate Duplicate Detection with Real Distance
  const duplicateCandidates = useMemo(() => {
    if (dismissDuplicate || (!title.trim() && !locationAddress.trim())) return [];
    const query = `${title} ${locationAddress}`.toLowerCase();

    return complaints
      .filter((c) => {
        if (c.status === 'Resolved') return false;

        let distanceMeters = 999999;
        if (selectedLat && selectedLng && c.latitude && c.longitude) {
          distanceMeters = calculateDistanceMeters(selectedLat, selectedLng, c.latitude, c.longitude);
        }

        const words = c.title
          .toLowerCase()
          .split(' ')
          .filter((w) => w.length > 3);
        const hasKeywordMatch = words.some((w) => query.includes(w));
        const sameCategory = c.category === category;
        const isNearby = distanceMeters <= 400;

        return isNearby || (hasKeywordMatch && (sameCategory || distanceMeters <= 1200));
      })
      .map((c) => {
        let distanceM = 0;
        if (selectedLat && selectedLng && c.latitude && c.longitude) {
          distanceM = calculateDistanceMeters(selectedLat, selectedLng, c.latitude, c.longitude);
        }
        return {
          ...c,
          distanceMeters: distanceM,
        };
      })
      .slice(0, 3);
  }, [title, locationAddress, complaints, dismissDuplicate, selectedLat, selectedLng, category]);

  const handleRefresh = () => {
    setComplaints(getComplaints());
  };

  const handleEndorseDuplicate = (complaintId: string) => {
    endorseComplaint(complaintId, currentUser?.uid);
    setIsSubmitModalOpen(false);
    const existing = complaints.find((c) => c.id === complaintId);
    if (existing) {
      setSelectedComplaint(existing);
    }
    showToast('Duplicate endorsed! +10 Civic Points added to your profile.');
  };

  const handleVerifyResolution = (confirmed: boolean, feedback?: string) => {
    if (!selectedComplaint) return;
    const updated = confirmCitizenResolution(selectedComplaint.id, confirmed, feedback, currentUser?.uid);
    if (updated) {
      setSelectedComplaint(updated);
    }
    setShowReopenInput(false);
    setReopenReasonText('');
    showToast(
      confirmed
        ? 'Resolution certified! +50 Civic Points credited to your profile.'
        : 'Grievance re-opened. Field team notified for priority re-inspection.'
    );
  };

  const handleEndorseSelected = () => {
    if (!selectedComplaint) return;
    const updated = endorseComplaint(selectedComplaint.id, currentUser?.uid);
    if (updated) {
      setSelectedComplaint(updated);
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesScope = scopeFilter === 'all' || (currentUser?.uid && c.userId === currentUser.uid);
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesSearch =
      c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScope && matchesStatus && matchesCategory && matchesSearch;
  });

  const handleSubmitComplaint = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationAddress.trim()) return;

    createComplaint({
      userId: currentUser?.uid || 'usr-1',
      userName: currentUser?.name || 'Aarav Deshmukh',
      ward: currentUser?.ward || 'TMC Ward 4 - Majiwada & Naupada',
      title: title.trim(),
      category,
      department:
        category === 'Roads & Infrastructure'
          ? 'TMC Engineering & PWD'
          : category === 'Street Lighting & Power'
          ? 'TMC Electrical Dept'
          : category === 'Sanitation & Waste Management'
          ? 'TMC Solid Waste Management'
          : category === 'Water & Utilities'
          ? 'TMC Water Supply Dept'
          : category === 'Drainage & Monsoon Resilience'
          ? 'BMC / TMC Stormwater Drainage'
          : 'Civic Works & Maintenance',
      location: locationAddress,
      latitude: selectedLat,
      longitude: selectedLng,
      imageUrl: selectedImageUrl || undefined,
      description: description.trim() || 'Citizen reported issue via UrbanConnect mobile portal.',
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSelectedImageUrl('');
    setDismissDuplicate(false);
    setIsSubmitModalOpen(false);
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Resolved
          </span>
        );
      case 'Awaiting Citizen Confirmation':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 rounded-full animate-pulse">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Awaiting Confirmation
          </span>
        );
      case 'Resolution Evidence Added':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 rounded-full">
            <Camera className="w-3 h-3 text-amber-600" />
            Proof Uploaded
          </span>
        );
      case 'Work Started':
      case 'In Progress':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 rounded-full">
            <Wrench className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            Work Started
          </span>
        );
      case 'Assigned':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-indigo-600" />
            Assigned
          </span>
        );
      case 'Verified':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-full">
            <Check className="w-3 h-3 text-purple-600" />
            Verified
          </span>
        );
      case 'Under Review':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Reported
          </span>
        );
    }
  };

  return (
    <div id="screen-complaint-tracking" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] relative transition-colors pb-16">
      {/* Dynamic Toast Feedback Banner */}
      {toastBanner && (
        <div className="sticky top-0 z-50 px-4 py-2.5 bg-teal-600 text-white text-xs font-bold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-200 animate-spin" />
            <span>{toastBanner}</span>
          </div>
          <button onClick={() => setToastBanner(null)} className="text-teal-200 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <TopAppBar
        currentScreen="complaints"
        title="Civic Grievance Desk"
        subtitle="GPS-Powered Reporting & Tracking"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Action Header & View Switcher */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              viewMode === 'map'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>

        <button
          id="btn-submit-complaint"
          onClick={() => setIsSubmitModalOpen(true)}
          className="py-2 px-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Scope Filter: All Community vs My Complaints */}
      <div className="px-4 py-2 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScopeFilter('all')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
              scopeFilter === 'all'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            All Ward Complaints ({complaints.length})
          </button>
          <button
            onClick={() => setScopeFilter('mine')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
              scopeFilter === 'mine'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            My Filed Tickets ({complaints.filter((c) => c.userId === currentUser?.uid).length})
          </button>
        </div>

        <button
          onClick={handleRefresh}
          className="p-1.5 text-slate-500 hover:text-teal-700 dark:hover:text-teal-400 rounded-lg"
          title="Refresh Data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticket ID, issue, or street..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {(['All', 'Pending', 'Under Review', 'In Progress', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 dark:bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: MAP MODE */}
      {viewMode === 'map' ? (
        <div className="flex-1 p-4">
          <OpenStreetMapView
            complaints={filteredComplaints}
            centerLat={19.2085}
            centerLng={72.9815}
            zoom={13}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
          />
        </div>
      ) : (
        /* VIEW: LIST MODE */
        <div className="flex-1 p-4 space-y-3.5">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No complaints matching filter</p>
              <p className="text-[11px] text-slate-500">All municipal facilities in this section are certified clear.</p>
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setScopeFilter('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-3 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-semibold hover:bg-teal-800"
              >
                Show All Tickets
              </button>
            </div>
          ) : (
            filteredComplaints.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedComplaint(item)}
                id={`complaint-card-${item.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs hover:shadow-md transition-all space-y-2.5 cursor-pointer hover:border-teal-400 dark:hover:border-teal-700"
              >
                {/* Header: Ticket ID, Date & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-lg">
                      {item.ticketId}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.dateFiled}
                    </span>
                    {item.reopened && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 rounded-md">
                        Reopened
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const slaInfo = computeSlaStatus(item);
                      return (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${slaInfo.badgeColor}`}>
                          {slaInfo.label}
                        </span>
                      );
                    })()}
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Complaint Title & Description */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Optional Image Thumbnail Preview */}
                {item.imageUrl && (
                  <div className="h-28 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Location & Department */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                    <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    {item.department}
                  </span>
                </div>

                {/* Last Update */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                  <span className="font-bold text-teal-800 dark:text-teal-300 flex-shrink-0">Update:</span>
                  <span>{item.lastUpdate}</span>
                </div>

                <div className="flex items-center justify-end text-[11px] font-bold text-teal-700 dark:text-teal-400 gap-1 pt-0.5">
                  <span>View Full Status Timeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DETAILED COMPLAINT TIMELINE MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                    {selectedComplaint.ticketId}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Logged: {selectedComplaint.dateFiled}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedComplaint.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Badge & Endorse Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                {getStatusBadge(selectedComplaint.status)}
              </div>
              <button
                onClick={handleEndorseSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-all shadow-xs"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-teal-600" />
                <span>Endorse ({selectedComplaint.endorsementsCount || 1})</span>
              </button>
            </div>

            {/* Evidence Comparison if resolution proof exists */}
            {(selectedComplaint.resolutionEvidenceUrl ||
              selectedComplaint.status === 'Resolution Evidence Added' ||
              selectedComplaint.status === 'Awaiting Citizen Confirmation' ||
              selectedComplaint.status === 'Resolved') && (
              <EvidenceComparison
                complaint={selectedComplaint}
                canVerify={
                  selectedComplaint.status === 'Awaiting Citizen Confirmation' ||
                  selectedComplaint.status === 'Resolution Evidence Added'
                }
                onVerifyResolution={handleVerifyResolution}
              />
            )}

            {/* Original Image Preview if available and no resolution evidence yet */}
            {selectedComplaint.imageUrl &&
              !selectedComplaint.resolutionEvidenceUrl &&
              selectedComplaint.status !== 'Resolved' && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48">
                  <img
                    src={selectedComplaint.imageUrl}
                    alt={selectedComplaint.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

            {/* Details Description */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Citizen Report</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3 rounded-xl">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Location & GPS Info */}
            <div className="p-3 bg-teal-50/60 dark:bg-teal-950/40 rounded-xl border border-teal-200/80 dark:border-teal-800/60 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-teal-900 dark:text-teal-200">
                <MapPin className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 flex-shrink-0" />
                <span>{selectedComplaint.location}</span>
              </div>
              <p className="text-[10px] text-teal-700 dark:text-teal-300 font-mono">
                GPS Coordinates: {selectedComplaint.latitude || 19.2085}, {selectedComplaint.longitude || 72.9815}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Ward & Department: <strong>{selectedComplaint.ward || 'TMC Ward 4'}</strong> • {selectedComplaint.department}
              </p>
            </div>

            {/* Prototype 2: Assigned Field Officer & Direct Helpline */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 rounded-xl shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Assigned Field Officer
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {selectedComplaint.assignedOfficer || 'Municipal Inspection Desk'}
                  </p>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {selectedComplaint.department}
                  </span>
                </div>
              </div>

              {selectedComplaint.assignedOfficerPhone ? (
                <a
                  href={`tel:${selectedComplaint.assignedOfficerPhone}`}
                  className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Desk</span>
                </a>
              ) : (
                <span className="text-[10px] px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold shrink-0">
                  Direct Dispatch
                </span>
              )}
            </div>

            {/* Prototype 2: Consolidated Duplicates */}
            {selectedComplaint.duplicateReportIds && selectedComplaint.duplicateReportIds.length > 0 && (
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Consolidated Grievance Tickets ({selectedComplaint.duplicateReportIds.length})</span>
                </div>
                <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300">
                  Neighbors reported this same issue. Tickets merged into this master work order to prioritize resource allocation:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedComplaint.duplicateReportIds.map((dupId) => (
                    <span
                      key={dupId}
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      #{dupId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prototype 2: Citizen Confirmation Quality Status */}
            {selectedComplaint.citizenConfirmed && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">Citizen Verified & Signed Off: </span>
                  <span className="text-[11px]">{selectedComplaint.citizenFeedback || 'Repair verified satisfactory on ground.'} (+50 Civic Points Awarded)</span>
                </div>
              </div>
            )}

            {/* Resolution Evidence (Before vs After) */}
            {(selectedComplaint.imageUrl || selectedComplaint.resolutionEvidenceUrl) && (
              <EvidenceComparison
                complaint={selectedComplaint}
                canVerify={!selectedComplaint.citizenConfirmed && (selectedComplaint.status === 'Awaiting Citizen Confirmation' || selectedComplaint.status === 'Resolution Evidence Added')}
                onVerifyResolution={handleVerifyResolution}
              />
            )}

            {/* Citizen Resolution Verification & Reopen Action Panel */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Citizen Quality Audit & Reopen Desk
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Verify physical field completion or contest poor municipal workmanship.
                  </p>
                </div>
                {selectedComplaint.citizenConfirmed && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Verified
                  </span>
                )}
              </div>

              {/* If citizen wants to reopen or dispute */}
              {showReopenInput ? (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-2">
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Specify why ground resolution is incomplete:
                  </p>
                  <textarea
                    rows={2}
                    value={reopenReasonText}
                    onChange={(e) => setReopenReasonText(e.target.value)}
                    placeholder="e.g. Patchwork collapsed after rain, drainage still blocked..."
                    className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowReopenInput(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleVerifyResolution(false, reopenReasonText.trim() || 'Workmanship deemed unsatisfactory by resident.');
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                    >
                      Confirm Case Reopening
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {!selectedComplaint.citizenConfirmed && (selectedComplaint.status === 'Awaiting Citizen Confirmation' || selectedComplaint.status === 'Resolution Evidence Added') && (
                    <button
                      onClick={() => handleVerifyResolution(true)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Certify Resolution (+50 Civic Points)
                    </button>
                  )}

                  <button
                    onClick={() => setShowReopenInput(true)}
                    className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{selectedComplaint.reopened ? 'Update Reopen Complaint' : 'Reopen Grievance'}</span>
                  </button>

                  <button
                    onClick={handleEndorseSelected}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-teal-600" />
                    <span>Upvote ({selectedComplaint.endorsements || 1})</span>
                  </button>
                </div>
              )}
            </div>

            {/* 8-STAGE VERTICAL TIMELINE TRACKER */}
            <LifecycleTimeline complaint={selectedComplaint} />

            {/* Admin shortcut if user is admin */}
            {currentUser?.role === 'admin' && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setSelectedComplaint(null);
                    onNavigate('admin');
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Manage Status in Admin HQ
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMIT COMPLAINT MODAL (WITH OPENSTREETMAP PICKER & DUPLICATE DETECTION) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Submit Civic Grievance</h3>
                <p className="text-[10px] text-slate-500">Auto-categorized & checked for nearby duplicates</p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SMART MULTI-CANDIDATE DUPLICATE DETECTION INTELLIGENCE */}
            {duplicateCandidates.length > 0 && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-2xl space-y-2.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                  <div className="text-xs">
                    <p className="font-bold text-amber-900 dark:text-amber-200">
                      Nearby Grievances Found ({duplicateCandidates.length} Active {duplicateCandidates.length === 1 ? 'Report' : 'Reports'})
                    </p>
                    <p className="text-amber-800 dark:text-amber-300 text-[11px] mt-0.5">
                      Similar civic issues have been reported close to your location. Endorsing an existing ticket consolidates municipal work orders and awards you +10 points!
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {duplicateCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                          #{cand.ticketId}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {cand.distanceMeters !== undefined && cand.distanceMeters < 9999 && (
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-teal-600" />
                              {cand.distanceMeters < 1000
                                ? `${Math.round(cand.distanceMeters)}m away`
                                : `${(cand.distanceMeters / 1000).toFixed(1)}km away`}
                            </span>
                          )}
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                            {cand.status}
                          </span>
                        </div>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {cand.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {cand.location}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleEndorseDuplicate(cand.id)}
                          className="flex-1 py-1 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Endorse Existing (+10 pts)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSubmitModalOpen(false);
                            setSelectedComplaint(cand);
                          }}
                          className="py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold hover:bg-slate-200"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right pt-0.5">
                  <button
                    type="button"
                    onClick={() => setDismissDuplicate(true)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                  >
                    None of these / File New Report Separately
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitComplaint} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken water pipeline, Deep pothole"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              {/* SMART CATEGORY RECOMMENDATION BANNER */}
              {autoDetectedCategory && (
                <div className="p-2.5 bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate text-teal-900 dark:text-teal-200">
                      Suggested: <strong>{autoDetectedCategory}</strong>{' '}
                      <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">
                        ({categoryConfidence}% confidence)
                      </span>
                    </span>
                  </div>
                  {category !== autoDetectedCategory && (
                    <button
                      type="button"
                      onClick={() => setCategory(autoDetectedCategory)}
                      className="px-2 py-0.5 rounded-md bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-bold shrink-0"
                    >
                      Apply
                    </button>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  {autoDetectedCategory === category && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      Auto-Matched
                    </span>
                  )}
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-teal-500"
                >
                  <option value="Roads & Infrastructure">Roads & Infrastructure (PWD)</option>
                  <option value="Street Lighting & Power">Street Lighting & Power</option>
                  <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                  <option value="Water & Utilities">Water & Utilities</option>
                  <option value="Drainage & Monsoon Resilience">Drainage & Monsoon Resilience</option>
                  <option value="Public Transport & Bus Bays">Public Transport & Bus Bays</option>
                  <option value="Parks & Public Recreation">Parks & Public Recreation</option>
                </select>
              </div>

              {/* Location Picker Section */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Location (OpenStreetMap & GPS)
                </label>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-200 font-semibold truncate pr-2">
                      {locationAddress}
                    </span>
                    <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded flex-shrink-0">
                      {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLocationPickerModal(true)}
                    className="w-full py-1.5 bg-white dark:bg-slate-800 border border-teal-600 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-bold hover:bg-teal-50 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Change Pin on OpenStreetMap</span>
                  </button>
                </div>
              </div>

              {/* Image Upload / Presets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Attach Issue Photo (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Choose sample or URL</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                  {PRESET_CIVIC_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setSelectedImageUrl(img.url)}
                      className={`relative rounded-xl overflow-hidden h-14 border transition-all ${
                        selectedImageUrl === img.url
                          ? 'border-teal-600 ring-2 ring-teal-600'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={selectedImageUrl}
                  onChange={(e) => setSelectedImageUrl(e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Duration, landmark references, or traffic impact..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>File Complaint</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION PICKER SUB-MODAL */}
      {showLocationPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm">
            <OpenStreetMapPicker
              initialLat={selectedLat}
              initialLng={selectedLng}
              initialAddress={locationAddress}
              onLocationSelected={(loc) => {
                setSelectedLat(loc.lat);
                setSelectedLng(loc.lng);
                setLocationAddress(loc.address);
                setShowLocationPickerModal(false);
              }}
              onClose={() => setShowLocationPickerModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
