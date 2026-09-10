import { ScreenId } from '../../types';
import { Home, MessageSquare, Layers, User } from 'lucide-react';

interface BottomNavBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export function BottomNavBar({ currentScreen, onNavigate }: BottomNavBarProps) {
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
  ].includes(currentScreen);
  const isProfileActive = currentScreen === 'profile';

  return (
    <nav
      id="material3-bottom-nav"
      aria-label="App Bottom Navigation"
      className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 shadow-lg shadow-slate-900/5 transition-all"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Home Tab */}
        <button
          id="nav-tab-home"
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center justify-center py-1 px-3 group focus:outline-none"
        >
          <div
            className={`w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isHomeActive
                ? 'bg-teal-100 text-teal-800 font-semibold'
                : 'text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-100'
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span
            className={`text-[11px] mt-1 font-medium transition-colors ${
              isHomeActive ? 'text-teal-900 font-bold' : 'text-slate-500'
            }`}
          >
            Home
          </span>
        </button>

        {/* Community Tab */}
        <button
          id="nav-tab-community"
          onClick={() => onNavigate('community')}
          className="flex flex-col items-center justify-center py-1 px-3 group focus:outline-none"
        >
          <div
            className={`w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isCommunityActive
                ? 'bg-teal-100 text-teal-800 font-semibold'
                : 'text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </div>
          <span
            className={`text-[11px] mt-1 font-medium transition-colors ${
              isCommunityActive ? 'text-teal-900 font-bold' : 'text-slate-500'
            }`}
          >
            Community
          </span>
        </button>

        {/* Services Tab */}
        <button
          id="nav-tab-services"
          onClick={() => onNavigate('services')}
          className="flex flex-col items-center justify-center py-1 px-3 group focus:outline-none"
        >
          <div
            className={`w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isServicesActive
                ? 'bg-teal-100 text-teal-800 font-semibold'
                : 'text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-100'
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <span
            className={`text-[11px] mt-1 font-medium transition-colors ${
              isServicesActive ? 'text-teal-900 font-bold' : 'text-slate-500'
            }`}
          >
            Services
          </span>
        </button>

        {/* Profile Tab */}
        <button
          id="nav-tab-profile"
          onClick={() => onNavigate('profile')}
          className="flex flex-col items-center justify-center py-1 px-3 group focus:outline-none"
        >
          <div
            className={`w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isProfileActive
                ? 'bg-teal-100 text-teal-800 font-semibold'
                : 'text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-100'
            }`}
          >
            <User className="w-5 h-5" />
          </div>
          <span
            className={`text-[11px] mt-1 font-medium transition-colors ${
              isProfileActive ? 'text-teal-900 font-bold' : 'text-slate-500'
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
}
