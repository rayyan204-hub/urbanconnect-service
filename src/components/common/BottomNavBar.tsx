import { ScreenId, UserProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Home,
  Grid,
  MapPin,
  AlertCircle,
  Users,
  Compass,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface BottomNavBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenAIChat?: () => void;
  isAIChatOpen?: boolean;
}

export function BottomNavBar({
  currentScreen,
  onNavigate,
  onOpenAIChat,
  isAIChatOpen = false,
}: BottomNavBarProps) {
  const { t } = useLanguage();

  const isHome = currentScreen === 'home';
  const isServices = [
    'services',
    'journey-planner',
    'bus-info',
    'train-info',
    'parking',
    'analytics',
  ].includes(currentScreen);
  const isMap = currentScreen === 'map';
  const isIssues = currentScreen === 'complaints';
  const isCommunity = [
    'community',
    'blood-donation',
    'volunteer-events',
    'lost-found',
    'profile',
  ].includes(currentScreen);

  const navItems = [
    {
      id: 'home' as ScreenId,
      label: t('nav_home', 'Home'),
      icon: Home,
      isActive: isHome,
      onClick: () => onNavigate('home'),
    },
    {
      id: 'services' as ScreenId,
      label: t('nav_services', 'Services'),
      icon: Grid,
      isActive: isServices,
      onClick: () => onNavigate('services'),
    },
    {
      id: 'map' as ScreenId,
      label: t('nav_map', 'City Map'),
      icon: MapPin,
      isActive: isMap,
      onClick: () => onNavigate('map'),
    },
    {
      id: 'complaints' as ScreenId,
      label: t('nav_complaints', 'Report'),
      icon: AlertCircle,
      isActive: isIssues,
      onClick: () => onNavigate('complaints'),
    },
    {
      id: 'community' as ScreenId,
      label: t('nav_community', 'Community'),
      icon: Users,
      isActive: isCommunity,
      onClick: () => onNavigate('community'),
    },
  ];

  return (
    <nav
      id="apple-bottom-nav"
      aria-label="Application Bottom Navigation"
      className="sticky bottom-0 z-30 bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xl border-t border-[#E5E5EA] dark:border-[#2C2C2E] px-3 pt-1.5 pb-2 transition-colors shrink-0"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center py-1 px-2.5 group focus:outline-none flex-1 transition-transform active:scale-95"
            >
              <div
                className={`w-6 h-6 flex items-center justify-center transition-colors ${
                  item.isActive
                    ? 'text-[#007AFF] dark:text-[#0A84FF]'
                    : 'text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-[#F5F5F7]'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                  item.isActive
                    ? 'font-semibold text-[#007AFF] dark:text-[#0A84FF]'
                    : 'font-normal text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-[#F5F5F7]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
