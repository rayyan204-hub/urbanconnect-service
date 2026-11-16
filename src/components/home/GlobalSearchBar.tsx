import { useState, useMemo, useRef, useEffect, ElementType } from 'react';
import { ScreenId } from '../../types';
import {
  INITIAL_BUS_ROUTES,
  INITIAL_POSTS,
  INITIAL_LOST_FOUND,
  INITIAL_EVENTS,
  INITIAL_COMPLAINTS,
  INITIAL_DONORS,
} from '../../data/mockData';
import { IRCTC_TRAIN_CATALOG } from '../../data/transitBookingData';
import {
  Search,
  X,
  Bus,
  Train,
  MessageSquare,
  HeartPulse,
  AlertCircle,
  MapPin,
  ChevronRight,
  Car,
  Navigation,
  Activity,
} from 'lucide-react';

export interface GlobalSearchResult {
  id: string;
  type: 'service' | 'transit' | 'community' | 'complaint';
  title: string;
  subtitle: string;
  categoryLabel: string;
  targetScreen: ScreenId;
  icon: ElementType;
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
  onOpenWeatherModal,
  className = '',
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: GlobalSearchResult[] = [];

    // Core Services
    const SERVICES: { id: string; title: string; subtitle: string; screen: ScreenId; icon: ElementType }[] = [
      { id: 's-report', title: 'Report an Issue / Pothole', subtitle: 'Lodge municipal grievance to TMC / BMC', screen: 'complaints', icon: AlertCircle },
      { id: 's-train', title: 'Train & Suburban Locals', subtitle: 'IRCTC reservations, live platform board, UTS passes', screen: 'train-info', icon: Train },
      { id: 's-bus', title: 'TMT & BEST Bus Timetables', subtitle: 'Corridors, live routes, passes', screen: 'bus-info', icon: Bus },
      { id: 's-parking', title: 'Smart Parking Lots', subtitle: 'Find & reserve parking slots', screen: 'parking', icon: Car },
      { id: 's-map', title: 'City Map (GIS)', subtitle: 'Interactive civic amenities & alerts', screen: 'map', icon: MapPin },
      { id: 's-journey', title: 'Trip Planner', subtitle: 'Fast multi-modal transit routing', screen: 'journey-planner', icon: Navigation },
      { id: 's-blood', title: 'Blood Donor Network', subtitle: 'Verified emergency donor matching', screen: 'blood-donation', icon: HeartPulse },
      { id: 's-analytics', title: 'Civic Analytics & Ward Index', subtitle: 'Municipal performance scores', screen: 'analytics', icon: Activity },
      { id: 's-community', title: 'Community Feed & Initiatives', subtitle: 'Neighborhood news and events', screen: 'community', icon: MessageSquare },
    ];

    SERVICES.forEach((s) => {
      if (s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q)) {
        items.push({
          id: s.id,
          type: 'service',
          title: s.title,
          subtitle: s.subtitle,
          categoryLabel: 'City Service',
          targetScreen: s.screen,
          icon: s.icon,
        });
      }
    });

    // Train catalog
    IRCTC_TRAIN_CATALOG.forEach((t) => {
      if (
        t.trainNumber.toLowerCase().includes(q) ||
        t.trainName.toLowerCase().includes(q) ||
        t.originName.toLowerCase().includes(q) ||
        t.destinationName.toLowerCase().includes(q)
      ) {
        items.push({
          id: `train-${t.trainNumber}`,
          type: 'transit',
          title: `${t.trainNumber} · ${t.trainName}`,
          subtitle: `${t.originName} → ${t.destinationName} (${t.departureTime})`,
          categoryLabel: 'Train Schedule',
          targetScreen: 'train-info',
          icon: Train,
        });
      }
    });

    // Bus routes
    INITIAL_BUS_ROUTES.forEach((b) => {
      if (
        b.busNumber.toLowerCase().includes(q) ||
        b.routeName.toLowerCase().includes(q) ||
        b.startPoint.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q)
      ) {
        items.push({
          id: `bus-${b.busNumber}`,
          type: 'transit',
          title: `Bus ${b.busNumber}: ${b.routeName}`,
          subtitle: `${b.startPoint} to ${b.destination}`,
          categoryLabel: 'Bus Route',
          targetScreen: 'bus-info',
          icon: Bus,
        });
      }
    });

    return items.slice(0, 6);
  }, [query]);

  const handleSelect = (screen: ScreenId) => {
    setIsOpen(false);
    setQuery('');
    onNavigate(screen);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Clean iOS Search Field */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city services, transit, or issues..."
          className="w-full bg-[#E5E5EA]/60 dark:bg-[#2C2C2E]/60 text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] text-[14px] pl-10 pr-9 py-2.5 rounded-[12px] border-none outline-none focus:ring-2 focus:ring-[#007AFF]/25 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 p-0.5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white rounded-full"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1C1C1E] rounded-[16px] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-[0_12px_32px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
          {results.length > 0 ? (
            <div className="divide-y divide-[#E5E5EA]/60 dark:divide-[#2C2C2E]/60">
              {results.map((res) => {
                const Icon = res.icon;
                return (
                  <button
                    key={res.id}
                    onClick={() => handleSelect(res.targetScreen)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium text-[#1D1D1F] dark:text-white truncate">
                          {res.title}
                        </div>
                        <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] truncate">
                          {res.subtitle}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-white shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-[13px] text-[#86868B]">
              No city services found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
