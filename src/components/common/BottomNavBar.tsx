import { ScreenId } from '../../types';
import { Home, MessageSquare, Layers, User, Bot, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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
  // Determine which bottom tab is active
  const isHomeActive = currentScreen === 'home';
  const isCommunityActive = currentScreen === 'community';
  const isServicesActive = [
    'services',
    'lost-found',
    'blood-donation',
    'volunteer-events',
    'bus-info',
    'train-info',
    'complaints',
    'map',
    'parking',
    'journey-planner',
    'analytics',
  ].includes(currentScreen);
  const isProfileActive = currentScreen === 'profile';

  return (
    <nav
      id="material3-bottom-nav"
      aria-label="App Bottom Navigation"
      className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 px-2 py-1 shadow-lg shadow-slate-900/5 dark:shadow-black/20 transition-colors shrink-0"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Home Tab */}
        <button
          id="nav-tab-home"
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center justify-center py-1 px-2 group focus:outline-none flex-1"
        >
          <div
            className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              isHomeActive
                ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-semibold'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
          </div>
          <span
            className={`text-[10px] mt-0.5 font-medium transition-colors ${
              isHomeActive ? 'text-teal-900 dark:text-teal-300 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('nav_home', 'Home')}
          </span>
        </button>

        {/* Community Tab */}
        <button
          id="nav-tab-community"
          onClick={() => onNavigate('community')}
          className="flex flex-col items-center justify-center py-1 px-2 group focus:outline-none flex-1"
        >
          <div
            className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              isCommunityActive
                ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-semibold'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
          </div>
          <span
            className={`text-[10px] mt-0.5 font-medium transition-colors ${
              isCommunityActive ? 'text-teal-900 dark:text-teal-300 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('nav_community', 'Community')}
          </span>
        </button>

        {/* AI Concierge Tab (Center Action) */}
        {onOpenAIChat && (
          <button
            id="nav-tab-ai-concierge"
            onClick={onOpenAIChat}
            className="flex flex-col items-center justify-center py-0.5 px-2 group focus:outline-none flex-1"
            title="UrbanConnect AI Civic Concierge"
          >
            <div
              className={`w-12 h-8 rounded-2xl flex items-center justify-center transition-all duration-200 relative ${
                isAIChatOpen
                  ? 'bg-gradient-to-tr from-teal-700 to-emerald-600 text-white shadow-md shadow-teal-900/30 ring-2 ring-teal-500/40'
                  : 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-sm hover:scale-105'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-1 ring-white dark:ring-slate-900 animate-pulse" />
            </div>
            <span
              className={`text-[10px] mt-0.5 font-bold transition-colors ${
                isAIChatOpen ? 'text-teal-700 dark:text-teal-300' : 'text-teal-800 dark:text-teal-400'
              }`}
            >
              AI Assist
            </span>
          </button>
        )}

        {/* Services Tab */}
        <button
          id="nav-tab-services"
          onClick={() => onNavigate('services')}
          className="flex flex-col items-center justify-center py-1 px-2 group focus:outline-none flex-1"
        >
          <div
            className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              isServicesActive
                ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-semibold'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
          </div>
          <span
            className={`text-[10px] mt-0.5 font-medium transition-colors ${
              isServicesActive ? 'text-teal-900 dark:text-teal-300 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('nav_services', 'Services')}
          </span>
        </button>

        {/* Profile Tab */}
        <button
          id="nav-tab-profile"
          onClick={() => onNavigate('profile')}
          className="flex flex-col items-center justify-center py-1 px-2 group focus:outline-none flex-1"
        >
          <div
            className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              isProfileActive
                ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-semibold'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
          </div>
          <span
            className={`text-[10px] mt-0.5 font-medium transition-colors ${
              isProfileActive ? 'text-teal-900 dark:text-teal-300 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('nav_profile', 'Profile')}
          </span>
        </button>
      </div>
    </nav>
  );
}
