import { useState, useEffect, ElementType } from 'react';
import { ScreenId, UserProfile } from '../types';
import { GlobalSearchBar } from '../components/home/GlobalSearchBar';
import { WeatherForecastWidget } from '../components/home/WeatherForecastWidget';
import { WeatherData } from '../services/weatherService';
import { NotificationsModal } from '../components/common/NotificationsModal';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import {
  getNotifications,
  getComplaints,
  getCommunityPosts,
  getVolunteerEvents,
  subscribeToCollection,
  COLLECTIONS,
} from '../services/dbService';
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
  Bell,
  ShieldAlert,
  MapPin,
  Car,
  Navigation,
  Activity,
  Award,
  Bot,
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
  onOpenAIChat?: () => void;
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
    id: 'map',
    category: 'civic',
    title: 'Unified Civic Map',
    subtitle: 'Interactive OpenStreetMap with complaints, parking & transit layers',
    badge: 'Live Map GIS',
    icon: MapPin,
    iconColor: 'text-teal-700',
    iconBg: 'bg-teal-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-teal-500',
  },
  {
    id: 'parking',
    category: 'transit',
    title: 'Smart Parking Desk',
    subtitle: 'Real-time multi-level occupancy meters & EV slot reservations',
    badge: 'Live Vacancy',
    icon: Car,
    iconColor: 'text-blue-700',
    iconBg: 'bg-blue-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-blue-500',
  },
  {
    id: 'journey-planner',
    category: 'transit',
    title: 'Multi-Modal Journey Planner',
    subtitle: 'Central & Western locals, Metro 1/2A/7 & bus recommendations',
    badge: 'Fast Routes',
    icon: Navigation,
    iconColor: 'text-indigo-700',
    iconBg: 'bg-indigo-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-indigo-500',
  },
  {
    id: 'analytics',
    category: 'civic',
    title: 'Civic Analytics & Ward Index',
    subtitle: 'Municipal service SLA scores, citizen rating & points leaderboard',
    badge: 'Grade A Audit',
    icon: Activity,
    iconColor: 'text-purple-700',
    iconBg: 'bg-purple-100',
    cardBg: 'bg-white',
    accentBorder: 'border-slate-200/90 hover:border-purple-500',
  },
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

export function HomeDashboard({ onNavigate, currentUser, onOpenAIChat }: HomeDashboardProps) {
  const { t, currentLanguageInfo } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'transit' | 'community' | 'aid' | 'civic'>('all');
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [liveWeather, setLiveWeather] = useState<WeatherData | null>(null);
  const [showHelpDeskModal, setShowHelpDeskModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    return getNotifications().filter((n) => !n.read).length;
  });
  const [dismissAdvisory, setDismissAdvisory] = useState(false);
  const [callingState, setCallingState] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToCollection(COLLECTIONS.NOTIFICATIONS, () => {
      setUnreadCount(getNotifications().filter((n) => !n.read).length);
    });
    return () => unsub();
  }, []);

  const filteredCards = FEATURE_CARDS.filter((card) => {
    return activeCategory === 'all' || card.category === activeCategory;
  });

  const handleSimulateCall = (department: string, number: string) => {
    setCallingState(`Connecting to ${department} (${number})...`);
    setTimeout(() => {
      setCallingState(null);
      setShowHelpDeskModal(false);
    }, 2000);
  };

  return (
    <div id="screen-home-dashboard" className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 min-h-[780px] transition-colors">
      {/* Top Banner / Welcome Area */}
      <div className="bg-gradient-to-b from-teal-900 via-teal-900 to-teal-800 dark:from-teal-950 dark:via-slate-900 dark:to-slate-900 text-white px-5 pt-4 pb-6 rounded-b-[32px] shadow-sm relative overflow-hidden transition-colors">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between mb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-800/80 dark:bg-teal-950/80 border border-teal-700 dark:border-teal-800 text-[10px] font-bold text-teal-200 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {currentUser?.ward || 'TMC Ward 4'}
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-[10px] font-bold text-amber-200 transition-colors"
                title="View Civic Points & Ward Health"
              >
                <Award className="w-3 h-3 text-amber-300" />
                <span>{currentUser?.civicPoints || 420} pts</span>
              </button>
            </div>
            <h2 className="text-xl font-black text-white mt-1.5 tracking-tight">
              {currentUser
                ? `${t('home_welcome_back', 'Welcome back')}, ${currentUser.name.split(' ')[0]} 👋`
                : `${t('home_welcome_back', 'Welcome back')}, Citizen 👋`}
            </h2>
          </div>

          {/* Action cluster: Language Switcher, Admin shortcut, Notifications bell & Profile */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <LanguageSwitcher variant="pill" />

            {currentUser?.role === 'admin' && (
              <button
                id="btn-home-admin"
                onClick={() => onNavigate('admin')}
                title="Admin Operations HQ"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-black text-[11px] shadow-xs hover:bg-amber-300 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            <button
              id="btn-home-notifications"
              onClick={() => setShowNotificationsModal(true)}
              className="relative p-2 rounded-xl bg-teal-800/80 hover:bg-teal-700 text-teal-100 border border-teal-700/60 shadow-xs transition-colors"
              title="Civic Alerts & Notices"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center ring-2 ring-teal-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

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
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-200 font-bold text-xs shadow-xs hover:bg-teal-50 dark:hover:bg-slate-700 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>


        {/* City Stats / Weather / AQI Interactive Pill */}
        <button
          onClick={() => {
            const widgetEl = document.getElementById('weather-forecast-widget');
            if (widgetEl) {
              widgetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
              setShowWeatherModal(true);
            }
          }}
          className="w-full flex items-center justify-between bg-teal-950/40 hover:bg-teal-950/60 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-teal-600/30 dark:border-slate-700/80 rounded-2xl px-3 py-2 text-xs text-teal-100 backdrop-blur-xs transition-all text-left group overflow-x-auto no-scrollbar gap-2"
          title="Click to view full real-time city weather forecast"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <Sun className="w-4 h-4 text-amber-300 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-[11px] text-white">
              {liveWeather ? `${liveWeather.current.temperature}°C` : '27°C'}
            </span>
            <span className="text-[10px] text-teal-300 font-medium">
              {liveWeather?.location.name || 'Mumbai'}
            </span>
          </div>

          {/* Severe Weather Alert Badge in Top Bar */}
          {liveWeather?.severeAlert?.isSevere && (
            <>
              <div className="h-3 w-px bg-amber-400/50 shrink-0" />
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 font-bold text-[10px] shrink-0">
                <AlertTriangle className="w-3 h-3 text-amber-300 shrink-0" />
                <span>Severe Weather Alert</span>
              </span>
            </>
          )}

          <div className="h-3 w-px bg-teal-700/60 dark:bg-slate-700 shrink-0" />

          {/* Detailed Humidity Level */}
          <div className="flex items-center gap-1 text-[11px] shrink-0">
            <Droplets className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
            <span className="text-teal-200">
              {liveWeather ? `${liveWeather.current.humidity}%` : '74%'}
            </span>
            <span className="text-[10px] text-teal-300/80 hidden sm:inline">
              ({liveWeather?.current.humidityDescription || 'High Coastal'})
            </span>
          </div>

          <div className="h-3 w-px bg-teal-700/60 dark:bg-slate-700 shrink-0" />

          {/* Detailed Wind Speed */}
          <div className="flex items-center gap-1 text-[11px] shrink-0">
            <Wind className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
            <span className="text-teal-200">
              {liveWeather ? `${liveWeather.current.windSpeed} km/h` : '14 km/h'}
            </span>
            <span className="text-[10px] text-teal-300 font-semibold">
              {liveWeather?.current.windDirection || 'WSW'}
            </span>
          </div>

          <div className="h-3 w-px bg-teal-700/60 dark:bg-slate-700 shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-teal-300">AQI</span>
            <strong className="text-emerald-300 font-bold text-[11px]">
              {liveWeather ? liveWeather.airQuality.aqi : 54}
            </strong>
          </div>

          <span className="text-[11px] text-teal-200 font-medium flex items-center gap-0.5 shrink-0 ml-auto pl-1">
            <span className="hidden xs:inline text-[10px]">Forecast</span>
            <ChevronRight className="w-3 h-3 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="px-4 py-3 -mt-3 flex-1 flex flex-col space-y-3.5">
        {/* Global Search Bar */}
        <GlobalSearchBar
          onNavigate={onNavigate}
          onOpenHelpDeskModal={() => setShowHelpDeskModal(true)}
          onOpenWeatherModal={() => setShowWeatherModal(true)}
        />

        {/* Live Civic Bulletin Marquee (Dismissible) */}
        {!dismissAdvisory && (
          <div className="p-2.5 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 border border-teal-200/90 dark:border-teal-800/60 rounded-2xl flex items-center justify-between gap-2 shadow-2xs text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping flex-shrink-0" />
              <p className="text-[11px] text-teal-950 dark:text-teal-200 font-medium truncate">
                <strong className="font-bold text-teal-900 dark:text-teal-100">TMC & Central Railway Alert:</strong> Night block on Thane-Kalyan slow line for girder launch 23:30 to 04:30.
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onNavigate('train-info')}
                className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-white dark:bg-slate-800 hover:bg-teal-100/60 dark:hover:bg-slate-700 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-700 transition-colors"
              >
                View
              </button>
              <button
                onClick={() => setDismissAdvisory(true)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title="Dismiss Notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Direct In-Chat AI Civic Concierge Banner */}
        {onOpenAIChat && (
          <div
            onClick={onOpenAIChat}
            className="p-3 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white rounded-2xl shadow-sm border border-teal-700/50 cursor-pointer hover:shadow-md transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20 shrink-0 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5 text-teal-200" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white tracking-wide">UrbanConnect AI Concierge</h4>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                    Direct Resolution
                  </span>
                </div>
                <p className="text-[11px] text-teal-100/80 truncate">
                  Resolve queries, lodge potholes, or book parking right in chat
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAIChat();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-teal-950 font-bold text-xs shrink-0 flex items-center gap-1 shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-950" />
              <span>Ask AI</span>
            </button>
          </div>
        )}

        {/* Quick Action Shortcuts (Pills for top citizen tasks) */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            {t('home_quick_actions', 'Smart City Quick Actions')}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <button
              id="quick-action-map"
              onClick={() => onNavigate('map')}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {t('nav_map', 'Civic Map')}
              </span>
            </button>

            <button
              id="quick-action-parking"
              onClick={() => onNavigate('parking')}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <Car className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {t('nav_parking', 'Parking')}
              </span>
            </button>

            <button
              id="quick-action-journey"
              onClick={() => onNavigate('journey-planner')}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <Navigation className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {t('nav_journey', 'Trip Plan')}
              </span>
            </button>

            <button
              id="quick-action-complaint"
              onClick={() => onNavigate('complaints')}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {t('nav_complaints', 'Grievance')}
              </span>
            </button>

            <button
              id="quick-action-analytics"
              onClick={() => onNavigate('analytics')}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {t('nav_analytics', 'Analytics')}
              </span>
            </button>

            <button
              id="quick-action-blood"
              onClick={() => onNavigate('blood-donation')}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {t('nav_blood', 'Blood Aid')}
              </span>
            </button>
          </div>
        </div>

        {/* Real-time Mumbai / Thane Weather Forecast & Monsoon Watch */}
        <div id="home-weather-section" className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('home_weather_forecast', 'Live Weather & Monsoon Watch')}
            </span>
            <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Mumbai / Thane Met
            </span>
          </div>
          <WeatherForecastWidget
            onWeatherUpdate={setLiveWeather}
            defaultLocationId="mumbai-city"
          />
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
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
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
                className={`p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-150 cursor-pointer flex flex-col justify-between group active:scale-[0.99]`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl ${card.iconBg} dark:bg-slate-700/70 ${card.iconColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    {card.badge}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                      {card.title}
                    </h4>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
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
          className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between gap-3 mt-auto cursor-pointer hover:bg-teal-100/70 dark:hover:bg-teal-950/60 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-950 dark:text-teal-200">TMC & BMC Citizen Helpline: Dial 1916 / 112</div>
              <div className="text-[10px] text-teal-700 dark:text-teal-400">24/7 Maharashtra Disaster & Municipal Dispatch Directory</div>
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
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  {liveWeather?.location.name || 'Mumbai'} Weather & AQI
                </h3>
              </div>
              <button
                onClick={() => setShowWeatherModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Severe Weather Alert Warning in Modal */}
            {liveWeather?.severeAlert?.isSevere && (
              <div className="p-3 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-950 dark:text-amber-100">
                    Severe Weather Alert: {liveWeather.severeAlert.headline}
                  </div>
                  <div className="text-[11px] text-amber-800 dark:text-amber-300">
                    {liveWeather.severeAlert.reasons.join(' • ')}
                  </div>
                </div>
              </div>
            )}

            {/* Weather Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Temperature</div>
                <div className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {liveWeather ? `${liveWeather.current.temperature}°C` : '27°C'}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                  {liveWeather
                    ? `High ${liveWeather.todayMax}° • Low ${liveWeather.todayMin}°`
                    : 'High 32° • Low 25°'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Air Quality Index</div>
                <div className="text-lg font-black text-emerald-800 dark:text-emerald-400 mt-0.5">
                  {liveWeather ? `${liveWeather.airQuality.aqi} AQI` : '41 AQI'}
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold mt-1">
                  {liveWeather
                    ? `${liveWeather.airQuality.category} • ${liveWeather.location.name}`
                    : 'Good • Mumbai'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center justify-between">
                  <span>Relative Humidity</span>
                  <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400">
                    {liveWeather?.current.humidityDescription || 'High Coastal'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>{liveWeather ? `${liveWeather.current.humidity}%` : '82%'}</span>
                  <span className="text-[11px] font-normal text-slate-500 ml-1">
                    (Dew pt: {liveWeather?.current.dewPoint ?? 23}°C)
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {liveWeather?.current.humidityComfort || 'Coastal humid breeze'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center justify-between">
                  <span>Wind & Sea Breeze</span>
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400">
                    {liveWeather?.current.windScale || 'Beaufort 2'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>
                    {liveWeather
                      ? `${liveWeather.current.windSpeed} km/h ${liveWeather.current.windDirection}`
                      : '8 km/h SSW'}
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                    (Gusts {liveWeather?.current.windGusts ?? 25} km/h)
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {liveWeather?.current.windDescription || 'Gentle coastal breeze'}
                </div>
              </div>
            </div>

            {/* Particulate Matter Readings */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                MPCB Sensor Feed ({liveWeather?.location.name || 'Thane Naupada & Dadar'})
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>PM2.5 (Fine particulate)</span>
                <strong className="text-slate-900 dark:text-slate-100">
                  {liveWeather?.airQuality.pm25 ?? 22.4} µg/m³
                </strong>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>PM10 (Dust & vehicle emissions)</span>
                <strong className="text-slate-900 dark:text-slate-100">
                  {liveWeather?.airQuality.pm10 ?? 48.6} µg/m³
                </strong>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>Maharashtra Pollution Control Board</span>
                <strong className="text-emerald-700 dark:text-emerald-400">Within CPCB Limits</strong>
              </div>
            </div>

            <button
              onClick={() => setShowWeatherModal(false)}
              className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 dark:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Municipal Helplines & Emergency Directory Modal */}
      {showHelpDeskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Thane & Mumbai Emergency Directory
                </h3>
              </div>
              <button
                onClick={() => setShowHelpDeskModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {callingState ? (
              <div className="p-6 text-center space-y-2 bg-teal-50 dark:bg-teal-950/50 rounded-2xl border border-teal-200 dark:border-teal-800">
                <span className="w-3 h-3 rounded-full bg-teal-600 animate-ping inline-block" />
                <p className="text-xs font-bold text-teal-950 dark:text-teal-200">{callingState}</p>
                <p className="text-[10px] text-teal-700 dark:text-teal-400">Simulating municipal dispatch patch...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {[
                  {
                    name: 'BMC Disaster Control & Helpline',
                    desc: 'Monsoon high tide, waterlogging, civic emergencies',
                    number: '1916',
                    badge: '24/7 BMC',
                    color: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800',
                  },
                  {
                    name: 'TMC Thane Citizen Grievance Cell',
                    desc: 'Potholes, solid waste, streetlights, drainage',
                    number: '1800-222-108',
                    badge: 'TMC Tollfree',
                    color: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800',
                  },
                  {
                    name: 'Maharashtra Unified Emergency',
                    desc: 'Police, highway patrol & life safety',
                    number: '112',
                    badge: 'Emergency',
                    color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
                  },
                  {
                    name: '108 Ambulance & Medical Emergency',
                    desc: 'Free Maharashtra emergency medical service (MEMS)',
                    number: '108',
                    badge: 'Hospital',
                    color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
                  },
                  {
                    name: 'Mumbai & Thane Fire Control',
                    desc: 'Fire fighting, gas leaks & disaster rescue',
                    number: '101',
                    badge: 'Fire Ops',
                    color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
                  },
                  {
                    name: 'Central Railway RPF Security Helpline',
                    desc: 'Suburban train safety, ladies coach & assistance',
                    number: '139',
                    badge: 'Railways',
                    color: 'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800',
                  },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs flex items-center justify-between gap-2 hover:border-teal-500 dark:hover:border-teal-400 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${item.color}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.desc}</p>
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
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
}

