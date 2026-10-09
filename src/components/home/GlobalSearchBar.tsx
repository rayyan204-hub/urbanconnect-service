import { useState, useMemo, useRef, useEffect, ElementType } from 'react';
import { ScreenId } from '../../types';
import {
  INITIAL_BUS_ROUTES,
  INITIAL_TRAINS,
  INITIAL_POSTS,
  INITIAL_LOST_FOUND,
  INITIAL_EVENTS,
  INITIAL_COMPLAINTS,
  INITIAL_DONORS,
} from '../../data/mockData';
import {
  Search,
  X,
  Bus,
  Train,
  MessageSquare,
  SearchCode,
  HeartPulse,
  HandHeart,
  AlertOctagon,
  User,
  PhoneCall,
  ChevronRight,
  ExternalLink,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';

export type SearchCategory = 'all' | 'services' | 'transit' | 'community';

export interface GlobalSearchResult {
  id: string;
  type: 'service' | 'transit' | 'community';
  title: string;
  subtitle: string;
  categoryLabel: string;
  targetScreen: ScreenId;
  icon: ElementType;
  iconBg: string;
  iconColor: string;
  badge: string;
  badgeColor: string;
  metadata?: string;
  searchTokens: string[];
}

interface GlobalSearchBarProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenHelpDeskModal?: () => void;
  onOpenWeatherModal?: () => void;
  className?: string;
}

export function GlobalSearchBar({
  onNavigate,
  onOpenHelpDeskModal,
  className = '',
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pre-build index of searchable items
  const searchIndex: GlobalSearchResult[] = useMemo(() => {
    const items: GlobalSearchResult[] = [];

    // 1. SERVICES
    items.push(
      {
        id: 'srv-complaints',
        type: 'service',
        title: 'Complaint Tracking & Civic Grievances',
        subtitle: 'Log and track potholes, broken streetlights, water supply & waste issues',
        categoryLabel: 'Civic Service',
        targetScreen: 'complaints',
        icon: AlertOctagon,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-700',
        badge: 'Official Portal',
        badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
        metadata: 'TMC & BMC • 24/7 SLA Tracking',
        searchTokens: ['complaint', 'pothole', 'streetlamp', 'light', 'water', 'garbage', 'waste', 'grievance', 'report', 'fix', 'civic', 'tmc', 'bmc', 'naupada', 'dadar'],
      },
      {
        id: 'srv-bus',
        type: 'service',
        title: 'TMT & BEST Bus Timetable & Digital Pass',
        subtitle: 'Real-time timetable, bus stops, fares and contactless bus tickets',
        categoryLabel: 'Transit Service',
        targetScreen: 'bus-info',
        icon: Bus,
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-700',
        badge: 'Live GPS',
        badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        metadata: 'TMT, BEST & NMMT • Every 8-15 mins',
        searchTokens: ['bus', 'transit', 'route', 'stops', 'fare', 'pass', 'ticket', 'transport', 'schedule', 'tmt', 'best', 'nmmt'],
      },
      {
        id: 'srv-train',
        type: 'service',
        title: 'Mumbai Local Trains & Metro 1, 2A, 7',
        subtitle: 'Central Railway platform live status, Fast & Slow locals, Metro schedules',
        categoryLabel: 'Transit Service',
        targetScreen: 'train-info',
        icon: Train,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-700',
        badge: 'Platform Status',
        badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        metadata: 'Thane Central, Dadar & CSMT Hubs',
        searchTokens: ['train', 'metro', 'rail', 'platform', 'boarding', 'local train', 'fast local', 'kalyan', 'csmt', 'dadar', 'thane'],
      },
      {
        id: 'srv-blood',
        type: 'service',
        title: 'Blood Donation & Emergency Network',
        subtitle: 'Connect with verified local donors or broadcast urgent hospital blood requests',
        categoryLabel: 'Emergency Aid',
        targetScreen: 'blood-donation',
        icon: HeartPulse,
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-700',
        badge: 'Life-Saving',
        badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
        metadata: '6 Verified Donors • Thane, Mulund & Dadar',
        searchTokens: ['blood', 'donation', 'donor', 'hospital', 'o+', 'o-', 'a+', 'emergency', 'urgent', 'red cross', 'blood bank'],
      },
      {
        id: 'srv-lost-found',
        type: 'service',
        title: 'Lost & Found Registry',
        subtitle: 'Search and report lost pets, wallets, keys, phones and turned-in valuables',
        categoryLabel: 'Community Care',
        targetScreen: 'lost-found',
        icon: SearchCode,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-700',
        badge: 'Direct Contact',
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        metadata: 'Thane Station TMT Depot & RPF Dadar Desk',
        searchTokens: ['lost', 'found', 'wallet', 'keys', 'pet', 'dog', 'headphones', 'items', 'belongings'],
      },
      {
        id: 'srv-volunteer',
        type: 'service',
        title: 'Volunteer Events & Community Drives',
        subtitle: 'Join lake cleanup drives, tree planting, food pantries & digital clinics',
        categoryLabel: 'Civic Engagement',
        targetScreen: 'volunteer-events',
        icon: HandHeart,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-700',
        badge: 'Community Action',
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        metadata: 'Upvan Lake, Yeoor & Dadar Seva',
        searchTokens: ['volunteer', 'clean up', 'upvan', 'yeoor', 'trees', 'food bank', 'charity', 'senior clinic', 'event', 'community service'],
      },
      {
        id: 'srv-profile',
        type: 'service',
        title: 'Maharashtra Citizen Pass & Profile',
        subtitle: 'Municipal verified digital identity, Ward ID & contactless transit access',
        categoryLabel: 'Citizen Identity',
        targetScreen: 'profile',
        icon: User,
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-800',
        badge: 'Verified ID',
        badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
        metadata: 'Aadhaar / DigiLocker Linked • Ward 4 TMC',
        searchTokens: ['profile', 'citizen', 'id', 'card', 'smart pass', 'account', 'settings', 'nfc'],
      },
      {
        id: 'srv-hub',
        type: 'service',
        title: 'Municipal Services Directory',
        subtitle: 'Full catalog of city departments, utility payments, permits and licensing',
        categoryLabel: 'City Directory',
        targetScreen: 'services',
        icon: Layers,
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-700',
        badge: 'All Services',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
        metadata: 'TMC & BMC Civic Departments',
        searchTokens: ['services', 'department', 'permits', 'licensing', 'tax', 'utilities', 'directory', 'tmc', 'bmc'],
      }
    );

    // 2. TRANSIT INFO: BUS ROUTES
    INITIAL_BUS_ROUTES.forEach((bus) => {
      const stopNames = (bus.stops || []).map((s) => s.name).join(', ');
      items.push({
        id: `bus-${bus.id}`,
        type: 'transit',
        title: `Bus ${bus.busNumber}: ${bus.routeName}`,
        subtitle: `${bus.startPoint} ➔ ${bus.destination} • Fare: ${bus.fare}`,
        categoryLabel: 'Bus Route',
        targetScreen: 'bus-info',
        icon: Bus,
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-800',
        badge: `${bus.status} (${bus.nextDeparture})`,
        badgeColor:
          bus.status === 'Delayed'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200',
        metadata: `Stops: ${stopNames}`,
        searchTokens: [
          'bus',
          bus.busNumber.toLowerCase(),
          bus.routeName.toLowerCase(),
          bus.startPoint.toLowerCase(),
          bus.destination.toLowerCase(),
          bus.fare.toLowerCase(),
          ...bus.stops.map((s) => s.name.toLowerCase()),
        ],
      });
    });

    // 2. TRANSIT INFO: TRAIN SCHEDULES
    INITIAL_TRAINS.forEach((train) => {
      items.push({
        id: `train-${train.id}`,
        type: 'transit',
        title: `${train.trainNumber}: ${train.trainName}`,
        subtitle: `${train.origin} ➔ ${train.destination} • Departs ${train.departureTime}`,
        categoryLabel: 'Metro Rail',
        targetScreen: 'train-info',
        icon: Train,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-800',
        badge: `${train.platform} • ${train.status}`,
        badgeColor:
          train.status === 'Delayed'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-indigo-50 text-indigo-800 border-indigo-200',
        metadata: `Frequency: ${train.frequency} • Arrives ${train.arrivalTime}`,
        searchTokens: [
          'train',
          'rail',
          'metro',
          train.trainNumber.toLowerCase(),
          train.trainName.toLowerCase(),
          train.platform.toLowerCase(),
          train.origin.toLowerCase(),
          train.destination.toLowerCase(),
        ],
      });
    });

    // 3. COMMUNITY TOPICS: FEED POSTS
    INITIAL_POSTS.forEach((post) => {
      items.push({
        id: `post-${post.id}`,
        type: 'community',
        title: post.title,
        subtitle: post.description.slice(0, 110) + '...',
        categoryLabel: `Community • ${post.category}`,
        targetScreen: 'community',
        icon: MessageSquare,
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-800',
        badge: post.pinned ? 'Pinned Notice' : `${post.likes} Likes`,
        badgeColor: post.pinned ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-slate-100 text-slate-700 border-slate-200',
        metadata: `By ${post.author} (${post.authorRole}) • ${post.date}`,
        searchTokens: [
          'post',
          'feed',
          'discussion',
          post.title.toLowerCase(),
          post.author.toLowerCase(),
          post.category.toLowerCase(),
          ...post.description.toLowerCase().split(' ').filter((w) => w.length > 3),
        ],
      });
    });

    // 3. COMMUNITY TOPICS: LOST & FOUND ITEMS
    INITIAL_LOST_FOUND.forEach((item) => {
      items.push({
        id: `lf-${item.id}`,
        type: 'community',
        title: `${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title}`,
        subtitle: `${item.location} • ${item.date} • ${item.category}`,
        categoryLabel: 'Lost & Found',
        targetScreen: 'lost-found',
        icon: SearchCode,
        iconBg: item.type === 'lost' ? 'bg-rose-100' : 'bg-emerald-100',
        iconColor: item.type === 'lost' ? 'text-rose-700' : 'text-emerald-700',
        badge: item.reward || `${item.type.toUpperCase()}`,
        badgeColor: item.type === 'lost' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200',
        metadata: `Contact: ${item.contactName} (${item.contactPhone})`,
        searchTokens: [
          item.type,
          'item',
          item.title.toLowerCase(),
          item.category.toLowerCase(),
          item.location.toLowerCase(),
          item.contactName.toLowerCase(),
        ],
      });
    });

    // 3. COMMUNITY TOPICS: VOLUNTEER DRIVES
    INITIAL_EVENTS.forEach((evt) => {
      items.push({
        id: `evt-${evt.id}`,
        type: 'community',
        title: evt.title,
        subtitle: `${evt.date} • ${evt.location} • ${evt.organization}`,
        categoryLabel: 'Volunteer Drive',
        targetScreen: 'volunteer-events',
        icon: HandHeart,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-800',
        badge: `${evt.joinedCount}/${evt.maxVolunteers} Joined`,
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        metadata: `${evt.time} • ${evt.category}`,
        searchTokens: [
          'volunteer',
          'event',
          'drive',
          evt.title.toLowerCase(),
          evt.organization.toLowerCase(),
          evt.category.toLowerCase(),
          evt.location.toLowerCase(),
        ],
      });
    });

    // 3. COMMUNITY TOPICS: COMPLAINT TICKETS
    INITIAL_COMPLAINTS.forEach((comp) => {
      items.push({
        id: `comp-${comp.id}`,
        type: 'community',
        title: `Ticket ${comp.ticketId}: ${comp.title}`,
        subtitle: `${comp.location} • ${comp.department}`,
        categoryLabel: 'Civic Issue',
        targetScreen: 'complaints',
        icon: AlertOctagon,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-800',
        badge: comp.status,
        badgeColor:
          comp.status === 'Resolved'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : comp.status === 'In Progress'
            ? 'bg-blue-50 text-blue-800 border-blue-200'
            : 'bg-amber-50 text-amber-800 border-amber-200',
        metadata: `Filed: ${comp.dateFiled} • ${comp.lastUpdate}`,
        searchTokens: [
          'complaint',
          'ticket',
          comp.ticketId.toLowerCase(),
          comp.title.toLowerCase(),
          comp.category.toLowerCase(),
          comp.department.toLowerCase(),
          comp.location.toLowerCase(),
        ],
      });
    });

    // 3. COMMUNITY TOPICS: BLOOD DONORS
    INITIAL_DONORS.forEach((donor) => {
      items.push({
        id: `donor-${donor.id}`,
        type: 'community',
        title: `Blood Donor: ${donor.name} (${donor.bloodGroup})`,
        subtitle: `${donor.location} • ${donor.distance} • ${donor.verified ? 'Verified Citizen' : 'Unverified'}`,
        categoryLabel: 'Blood Donor',
        targetScreen: 'blood-donation',
        icon: HeartPulse,
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-700',
        badge: donor.isAvailable ? 'Available Now' : 'Recent Donor',
        badgeColor: donor.isAvailable ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200',
        metadata: `Direct contact: ${donor.phone}`,
        searchTokens: [
          'donor',
          'blood',
          donor.bloodGroup.toLowerCase(),
          donor.name.toLowerCase(),
          donor.location.toLowerCase(),
        ],
      });
    });

    return items;
  }, []);

  // Filtered results based on query and category
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default recommended / top items when search bar is focused but query empty
      return searchIndex.slice(0, 7);
    }

    const words = q.split(/\s+/).filter(Boolean);

    return searchIndex.filter((item) => {
      // Category match
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'services' && item.type !== 'service') return false;
        if (selectedCategory === 'transit' && item.type !== 'transit') return false;
        if (selectedCategory === 'community' && item.type !== 'community') return false;
      }

      // Substring check
      const tokens = Array.isArray(item.searchTokens) ? item.searchTokens.join(' ') : '';
      const fullText = `${item.title || ''} ${item.subtitle || ''} ${item.categoryLabel || ''} ${item.metadata || ''} ${tokens}`.toLowerCase();

      return words.every((word) => fullText.includes(word));
    });
  }, [query, selectedCategory, searchIndex]);

  // Counts by category for the filter tabs
  const categoryCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const words = q ? q.split(/\s+/).filter(Boolean) : [];

    const baseList = q
      ? searchIndex.filter((item) => {
          const tokens = Array.isArray(item.searchTokens) ? item.searchTokens.join(' ') : '';
          const fullText = `${item.title || ''} ${item.subtitle || ''} ${item.categoryLabel || ''} ${item.metadata || ''} ${tokens}`.toLowerCase();
          return words.every((word) => fullText.includes(word));
        })
      : searchIndex;

    return {
      all: baseList.length,
      services: baseList.filter((i) => i.type === 'service').length,
      transit: baseList.filter((i) => i.type === 'transit').length,
      community: baseList.filter((i) => i.type === 'community').length,
    };
  }, [query, searchIndex]);

  const handleSelectResult = (result: GlobalSearchResult) => {
    setIsOpen(false);
    setQuery('');
    onNavigate(result.targetScreen);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative z-30 ${className}`}>
      {/* Search Input Bar */}
      <div className="relative shadow-xs rounded-2xl">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-teal-700 dark:text-teal-400" />
        </div>

        <input
          ref={inputRef}
          id="global-search-input"
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder="Search services, transit schedules, community topics..."
          className="w-full pl-10 pr-16 py-2.5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 shadow-2xs transition-all"
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {query ? (
            <button
              id="btn-clear-global-search"
              type="button"
              onClick={clearSearch}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-200/80 dark:border-slate-600">
              ESC
            </span>
          )}
        </div>
      </div>

      {/* Quick Search Chips (Visible under input when not searching) */}
      {!isOpen && !query && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 px-0.5 text-[11px]">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            Try:
          </span>
          {[
            { label: 'Bus 104 Express', query: '104 Express' },
            { label: 'Coastal Train', query: 'Coastal' },
            { label: 'Report Pothole', query: 'Pothole' },
            { label: 'Blood Donors', query: 'Blood' },
            { label: 'River Cleanup', query: 'River' },
            { label: 'Lost Wallet', query: 'Wallet' },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleQuickSuggestion(chip.query)}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500 text-slate-700 dark:text-slate-300 hover:text-teal-900 dark:hover:text-teal-200 font-semibold whitespace-nowrap text-[10px] transition-colors shadow-2xs"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Global Search Results Drawer / Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-2xs"
            onClick={() => setIsOpen(false)}
          />

          <div
            id="global-search-results-panel"
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[480px] animate-in fade-in-50 zoom-in-95 duration-150 transition-colors"
          >
            {/* Header & Category Filters */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-slate-100">
                  <Search className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  <span>
                    {query ? (
                      <>
                        Results for &ldquo;<span className="text-teal-800 dark:text-teal-300">{query}</span>&rdquo;
                      </>
                    ) : (
                      'Quick Civic Directory & Top Results'
                    )}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-0.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {(
                  [
                    { id: 'all', label: 'All', count: categoryCounts.all },
                    { id: 'services', label: 'Services', count: categoryCounts.services },
                    { id: 'transit', label: 'Transit Info', count: categoryCounts.transit },
                    { id: 'community', label: 'Community', count: categoryCounts.community },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        selectedCategory === cat.id ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-1.5">
              {filteredResults.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">No matching municipal records found</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Try searching for bus lines like &ldquo;104&rdquo;, train lines like &ldquo;Coastal&rdquo;, or issues like &ldquo;pothole&rdquo; or &ldquo;blood&rdquo;.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5 justify-center">
                    {['Bus Schedules', 'Metro Rail', 'Pothole Grievance', 'Blood Donors', 'Lost Items'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleQuickSuggestion(term)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                filteredResults.map((result) => {
                  const Icon = result.icon;
                  return (
                    <div
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl transition-colors cursor-pointer flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl ${result.iconBg} dark:bg-slate-700/80 ${result.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              {result.categoryLabel}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${result.badgeColor}`}>
                              {result.badge}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors mt-0.5 truncate">
                            {result.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug mt-0.5">
                            {result.subtitle}
                          </p>
                          {result.metadata && (
                            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 truncate">
                              {result.metadata}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0 self-center">
                        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block">
                          Open
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer Tip */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-850 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-4">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Instant search across all municipal registries & live feeds</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('services');
                }}
                className="font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline"
              >
                Browse All Services ➔
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
