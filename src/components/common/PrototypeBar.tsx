import { useState } from 'react';
import { ScreenId, UserProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Smartphone,
  Monitor,
  ChevronDown,
  Layers,
  Moon,
  Sun,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface PrototypeBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

const SCREENS: { id: ScreenId; label: string }[] = [
  { id: 'splash', label: 'Splash Screen' },
  { id: 'login', label: 'Login' },
  { id: 'register', label: 'Register' },
  { id: 'home', label: 'Home Dashboard' },
  { id: 'services', label: 'City Services' },
  { id: 'journey-planner', label: 'Trip Planner' },
  { id: 'bus-info', label: 'Bus Transit' },
  { id: 'train-info', label: 'Train & Rail Connect' },
  { id: 'map', label: 'City Map (GIS)' },
  { id: 'parking', label: 'Smart Parking' },
  { id: 'complaints', label: 'Grievance Tracking' },
  { id: 'blood-donation', label: 'Blood Donors' },
  { id: 'community', label: 'Community Hub' },
  { id: 'volunteer-events', label: 'Volunteer Initiatives' },
  { id: 'lost-found', label: 'Lost & Found' },
  { id: 'analytics', label: 'Civic Analytics' },
  { id: 'profile', label: 'Profile & Settings' },
  { id: 'admin', label: 'Municipal Admin HQ' },
];

export function PrototypeBar({
  currentScreen,
  onNavigate,
  isDeviceFrame,
  onToggleDeviceFrame,
  currentUser,
  onLogout,
}: PrototypeBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  if (isCollapsed) {
    return (
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        <button
          id="btn-prototype-theme-collapsed"
          onClick={toggleTheme}
          className="bg-white/90 dark:bg-[#1C1C1E]/90 text-[#1D1D1F] dark:text-[#F5F5F7] p-2 rounded-full border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm backdrop-blur-md transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-white/90 dark:bg-[#1C1C1E]/90 text-[#1D1D1F] dark:text-[#F5F5F7] px-3 py-1.5 rounded-full border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm text-xs font-medium flex items-center gap-1.5 backdrop-blur-md hover:bg-white transition-colors"
          title="Show Navigation Bar"
        >
          <Layers className="w-3.5 h-3.5 text-[#007AFF]" />
          <span>Navigation</span>
          <ChevronDown className="w-3 h-3 text-[#86868B]" />
        </button>
      </div>
    );
  }

  return (
    <aside
      id="prototype-control-bar"
      aria-label="Application Top Bar"
      className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md text-[#1D1D1F] dark:text-[#F5F5F7] border-b border-[#E5E5EA] dark:border-[#2C2C2E] px-4 py-2 flex items-center justify-between gap-3 text-xs z-40 relative shrink-0 transition-colors"
    >
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 rounded-lg bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            UC
          </div>
          <span className="text-[13px] font-semibold text-[#1D1D1F] dark:text-white">
            UrbanConnect
          </span>
        </button>

        <span className="text-[#E5E5EA] dark:text-[#2C2C2E] hidden sm:inline">|</span>

        {currentUser && (
          <button
            onClick={() => onNavigate('profile')}
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="font-medium text-[12px] truncate max-w-[120px]">
              {currentUser.name}
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Screen Selector */}
        <div className="relative flex items-center">
          <label htmlFor="screen-selector" className="sr-only">
            Switch Screen
          </label>
          <select
            id="screen-selector"
            value={currentScreen}
            onChange={(e) => onNavigate(e.target.value as ScreenId)}
            className="bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] py-1.5 pl-3 pr-7 rounded-lg border border-transparent hover:border-[#E5E5EA] dark:hover:border-[#3A3A3C] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 appearance-none cursor-pointer text-xs font-medium transition-all"
          >
            {SCREENS.map((s) => (
              <option key={s.id} value={s.id} className="bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7]">
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-2 pointer-events-none" />
        </div>

        {/* Viewport Frame Toggle */}
        <button
          onClick={onToggleDeviceFrame}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors ${
            isDeviceFrame
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
          }`}
          title={isDeviceFrame ? 'Switch to Full Width View' : 'Switch to iPhone View'}
        >
          {isDeviceFrame ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isDeviceFrame ? 'Device' : 'Full'}</span>
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher variant="pill" />

        {/* Theme Toggle */}
        <button
          id="btn-prototype-toggle-theme"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Minimize Button */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white p-1 rounded transition-colors"
          title="Minimize bar"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
