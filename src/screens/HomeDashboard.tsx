import { useState, ElementType } from 'react';
import { ScreenId, UserProfile } from '../types';
import {
  Search,
  MessageSquare,
  SearchCode,
  HeartPulse,
  HandHeart,
  Bus,
  Train,
  AlertOctagon,
  User,
  ChevronRight,
  Sun,
  Wind,
  PhoneCall,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Clock,
  Compass,
  LogIn,
  X,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Gauge,
  Phone,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

interface FeatureCardConfig {
  id: ScreenId;
  category: 'transit' | 'community' | 'aid' | 'civic';
  title: string;
  subtitle: string;
  badge: string;
  icon: ElementType;
  iconColor: string;
  iconBg: string;
  cardBg: string;
  accentBorder: string;
}

const FEATURE_CARDS: FeatureCardConfig[] = [
  {
    id: 'community',
    category: 'community',
    title: 'Community Feed',
    subtitle: 'Civic notices, neighborhood updates & polls',
    badge: '3 New Today',
    icon: MessageSquare,
    iconColor: 'text-teal-700',
    iconBg: 'bg-teal-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-teal-500',
  },
  {
    id: 'lost-found',
    category: 'community',
    title: 'Lost & Found',
    subtitle: 'Report or claim lost personal belongings & pets',
    badge: '4 Active Items',
    icon: SearchCode,
    iconColor: 'text-amber-700',
    iconBg: 'bg-amber-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-amber-500',
  },
  {
    id: 'blood-donation',
    category: 'aid',
    title: 'Blood Donation',
    subtitle: 'Emergency donors network & urgent requests',
    badge: '6 Donors Nearby',
    icon: HeartPulse,
    iconColor: 'text-rose-700',
    iconBg: 'bg-rose-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-rose-500',
  },
  {
    id: 'volunteer-events',
    category: 'aid',
    title: 'Volunteer Events',
    subtitle: 'City cleanup drives, senior aid & food pantry',
    badge: '3 Open Drives',
    icon: HandHeart,
    iconColor: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-emerald-500',
  },
  {
    id: 'bus-info',
    category: 'transit',
    title: 'Bus Information',
    subtitle: 'Live routes, frequency, fares & timetable',
    badge: 'Live Schedules',
    icon: Bus,
    iconColor: 'text-cyan-700',
    iconBg: 'bg-cyan-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-cyan-500',
  },
  {
    id: 'train-info',
    category: 'transit',
    title: 'Train Information',
    subtitle: 'Metro & regional rail schedule & platform status',
    badge: 'Platform Live',
    icon: Train,
    iconColor: 'text-indigo-700',
    iconBg: 'bg-indigo-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-indigo-500',
  },
  {
    id: 'complaints',
    category: 'civic',
    title: 'Complaint Tracking',
    subtitle: 'Log municipal grievances: roads, lights, water',
    badge: '1 In Progress',
    icon: AlertOctagon,
    iconColor: 'text-orange-700',
    iconBg: 'bg-orange-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-orange-500',
  },
  {
    id: 'profile',
    category: 'civic',
    title: 'Citizen Profile',
    subtitle: 'Smart City Card & Digital Identity',
    badge: 'Verified ID',
    icon: User,
    iconColor: 'text-teal-800',
    iconBg: 'bg-teal-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-teal-500',
  },
];

export function HomeDashboard({ onNavigate, currentUser }: HomeDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'transit' | 'community' | 'aid' | 'civic'>('all');
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showHelpDeskModal, setShowHelpDeskModal] = useState(false);
  const [dismissAdvisory, setDismissAdvisory] = useState(false);
  const [callingState, setCallingState] = useState<string | null>(null);

  const filteredCards = FEATURE_CARDS.filter((card) => {
    const matchesCategory = activeCategory === 'all' || card.category === activeCategory;
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSimulateCall = (department: string, number: string) => {
    setCallingState(`Connecting to ${department} (${number})...`);
    setTimeout(() => {
      setCallingState(null);
      setShowHelpDeskModal(false);
    }, 2000);
  };

  return (
    <div id="screen-home-dashboard" className="flex-1 flex flex-col bg-slate-50 min-h-[780px]">
      {/* Top Banner / Welcome Area */}
      <div className="bg-gradient-to-b from-teal-900 via-teal-900 to-teal-800 text-white px-5 pt-4 pb-6 rounded-b-[32px] shadow-sm relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between mb-3.5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-800/80 border border-teal-700 text-[10px] font-bold text-teal-200 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {currentUser?.ward || 'Smart City Hub'}
            </div>
            <h2 className="text-xl font-black text-white mt-1.5 tracking-tight">
              {currentUser ? `Welcome, ${currentUser.name.split(' ')[0]} 👋` : 'Welcome, Citizen 👋'}
            </h2>
          </div>

          {currentUser ? (
            <button
              id="btn-home-avatar"
              onClick={() => onNavigate('profile')}
              className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-teal-400/50 shadow-xs flex-shrink-0 hover:scale-105 transition-transform"
              title="View Profile"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-teal-900 font-bold text-xs shadow-xs hover:bg-teal-50 transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-teal-700" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* City Stats / Weather / AQI Interactive Pill */}
        <button
          onClick={() => setShowWeatherModal(true)}
          className="w-full flex items-center justify-between bg-teal-950/40 hover:bg-teal-950/60 border border-teal-600/30 rounded-2xl px-3.5 py-2 text-xs text-teal-100 backdrop-blur-xs transition-all text-left group"
          title="Click to view full city environmental metrics"
        >
          <div className="flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-300 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[11px]">24°C Sunny</span>
          </div>
          <div className="h-3 w-px bg-teal-700/60" />
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
            <span className="text-[11px]">AQI <strong className="text-emerald-300 font-bold">38 (Good)</strong></span>
          </div>
          <div className="h-3 w-px bg-teal-700/60" />
          <span className="text-[11px] text-teal-200 font-medium flex items-center gap-1">
            <span>Details</span>
            <ChevronRight className="w-3 h-3 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="px-4 py-3 -mt-3 flex-1 flex flex-col space-y-3.5">
        {/* Search Bar */}
        <div className="relative z-10 shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="home-search-bar"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services, bus lines, donor registry..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Live Civic Bulletin Marquee (Dismissible) */}
        {!dismissAdvisory && (
          <div className="p-2.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/90 rounded-2xl flex items-center justify-between gap-2 shadow-2xs text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping flex-shrink-0" />
              <p className="text-[11px] text-teal-950 font-medium truncate">
                <strong className="font-bold text-teal-900">Transit Notice:</strong> Track 3 maintenance at Grand Central rail tonight from 11:30 PM.
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onNavigate('train-info')}
                className="text-[10px] font-bold text-teal-800 bg-white hover:bg-teal-100/60 px-2 py-0.5 rounded-lg border border-teal-200 transition-colors"
              >
                View
              </button>
              <button
                onClick={() => setDismissAdvisory(true)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Dismiss Notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Action Shortcuts (Pills for top citizen tasks) */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            Quick Actions
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button
              id="quick-action-bus"
              onClick={() => onNavigate('bus-info')}
              className="p-2 bg-white hover:bg-cyan-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <Bus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Live Bus</span>
            </button>

            <button
              id="quick-action-complaint"
              onClick={() => onNavigate('complaints')}
              className="p-2 bg-white hover:bg-orange-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Report</span>
            </button>

            <button
              id="quick-action-blood"
              onClick={() => onNavigate('blood-donation')}
              className="p-2 bg-white hover:bg-rose-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Blood Aid</span>
            </button>

            <button
              id="quick-action-community"
              onClick={() => onNavigate('community')}
              className="p-2 bg-white hover:bg-teal-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Post Feed</span>
            </button>
          </div>
        </div>

        {/* Category Navigation Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {(
            [
              { id: 'all', label: 'All Services' },
              { id: 'transit', label: 'Transit & Rail' },
              { id: 'community', label: 'Community' },
              { id: 'aid', label: 'Civic Aid' },
              { id: 'civic', label: 'Governance' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feature Cards List/Grid */}
        <div
          id="feature-cards-grid"
          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-2"
        >
          {filteredCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                id={`feature-card-${card.id}`}
                onClick={() => onNavigate(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onNavigate(card.id)}
                className={`p-3.5 rounded-2xl ${card.cardBg} border ${card.accentBorder} shadow-2xs hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between group active:scale-[0.99]`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {card.badge}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {card.title}
                    </h4>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Citizen Helpline Quick Pill */}
        <div
          onClick={() => setShowHelpDeskModal(true)}
          className="p-3 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-between gap-3 mt-auto cursor-pointer hover:bg-teal-100/70 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-950">City Help Desk: Dial 311</div>
              <div className="text-[10px] text-teal-700">24/7 Municipal & Emergency Dispatch Directory</div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowHelpDeskModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-2xs flex-shrink-0"
          >
            Directory
          </button>
        </div>
      </div>

      {/* Weather & Environmental Details Modal */}
      {showWeatherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  City Environmental Dashboard
                </h3>
              </div>
              <button
                onClick={() => setShowWeatherModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Weather Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                <div className="text-slate-500 text-[11px] font-medium">Temperature</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">24°C</div>
                <div className="text-[10px] text-amber-700 mt-1">High 26° • Low 18°</div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                <div className="text-slate-500 text-[11px] font-medium">Air Quality Index</div>
                <div className="text-lg font-black text-emerald-800 mt-0.5">38 AQI</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-1">Good • Safe for all</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="text-slate-500 text-[11px] font-medium">Relative Humidity</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                  <span>45%</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Comfortable range</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="text-slate-500 text-[11px] font-medium">Wind & UV Index</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  <span>12 km/h WNW</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">UV Index: 4 (Moderate)</div>
              </div>
            </div>

            {/* Particulate Matter Readings */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Real-Time Sensor Feed (Ward 14)
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>PM2.5 (Fine particulate)</span>
                <strong className="text-slate-900">8.4 µg/m³ (Clean)</strong>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>PM10 (Dust & pollen)</span>
                <strong className="text-slate-900">17.2 µg/m³</strong>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Ozone & Carbon Monoxide</span>
                <strong className="text-slate-900">Optimal levels</strong>
              </div>
            </div>

            <button
              onClick={() => setShowWeatherModal(false)}
              className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Municipal Helplines & Emergency Directory Modal */}
      {showHelpDeskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Municipal Helpline Directory
                </h3>
              </div>
              <button
                onClick={() => setShowHelpDeskModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {callingState ? (
              <div className="p-6 text-center space-y-2 bg-teal-50 rounded-2xl border border-teal-200">
                <span className="w-3 h-3 rounded-full bg-teal-600 animate-ping inline-block" />
                <p className="text-xs font-bold text-teal-950">{callingState}</p>
                <p className="text-[10px] text-teal-700">Simulating municipal dispatch patch...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {[
                  {
                    name: '311 City Services & Potholes',
                    desc: 'Municipal grievances, streetlights, sanitation',
                    number: '311',
                    badge: '24/7 Citizen',
                    color: 'text-teal-700 bg-teal-50 border-teal-200',
                  },
                  {
                    name: '911 Police & First Responders',
                    desc: 'Immediate life danger or crimes in progress',
                    number: '911',
                    badge: 'Emergency',
                    color: 'text-rose-700 bg-rose-50 border-rose-200',
                  },
                  {
                    name: 'Ambulance & Emergency Medical',
                    desc: 'City trauma center & paramedic dispatch',
                    number: '102',
                    badge: 'Hospital',
                    color: 'text-rose-700 bg-rose-50 border-rose-200',
                  },
                  {
                    name: 'Fire Department & Rescue',
                    desc: 'Fire hazards, structural collapse, gas leaks',
                    number: '101',
                    badge: 'Fire Ops',
                    color: 'text-amber-700 bg-amber-50 border-amber-200',
                  },
                  {
                    name: 'Municipal Water Board Emergency',
                    desc: 'Pipeline bursts, water contamination, main leaks',
                    number: '311-W',
                    badge: 'Utilities',
                    color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
                  },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2 hover:border-teal-500 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">{item.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${item.color}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => handleSimulateCall(item.name, item.number)}
                      className="px-2.5 py-1 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1 flex-shrink-0 shadow-2xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{item.number}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowHelpDeskModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

