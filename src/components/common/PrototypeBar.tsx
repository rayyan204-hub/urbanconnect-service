import { useState } from 'react';
import { ScreenId, UserProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Smartphone,
  Monitor,
  ChevronDown,
  RotateCcw,
  User,
  LogIn,
  Layers,
  ChevronUp,
  Moon,
  Sun,
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
  { id: 'splash', label: '1. Splash Screen' },
  { id: 'login', label: '2. Login Screen' },
  { id: 'register', label: '3. Register Screen' },
  { id: 'home', label: '4. Home Dashboard' },
  { id: 'community', label: '5. Community Feed' },
  { id: 'lost-found', label: '6. Lost & Found' },
  { id: 'blood-donation', label: '7. Blood Donation' },
  { id: 'volunteer-events', label: '8. Volunteer Events' },
  { id: 'bus-info', label: '9. Bus Transit' },
  { id: 'train-info', label: '10. Train Departures' },
  { id: 'complaints', label: '11. Complaint Tracking' },
  { id: 'map', label: '12. Unified Civic Map (Leaflet)' },
  { id: 'parking', label: '13. Smart Parking Desk' },
  { id: 'journey-planner', label: '14. Multi-Modal Transit Planner' },
  { id: 'analytics', label: '15. Civic Analytics & Ward Scores' },
  { id: 'profile', label: '16. User Profile & Points' },
  { id: 'admin', label: '17. Municipal Admin HQ' },
  { id: 'services', label: 'Directory: Services Hub' },
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
  const { theme, isDark, toggleTheme } = useTheme();

  if (isCollapsed) {
    return (
      <div className="fixed top-2 right-2 z-50 flex items-center gap-2">
        <button
          id="btn-prototype-theme-collapsed"
          onClick={toggleTheme}
          className="bg-slate-900/90 hover:bg-slate-900 text-teal-300 p-2 rounded-full border border-teal-500/40 shadow-lg backdrop-blur-md transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-teal-300" />}
        </button>
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-slate-900/90 hover:bg-slate-900 text-teal-300 px-3 py-1.5 rounded-full border border-teal-500/40 shadow-lg text-xs font-bold flex items-center gap-1.5 backdrop-blur-md"
          title="Expand Prototype Navigation Controls"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Screen Controls</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <aside
      id="prototype-control-bar"
      aria-label="Prototype Navigation Controls"
      className="bg-slate-950 text-slate-100 border-b border-slate-800/80 px-3 py-2 flex items-center justify-between gap-2.5 text-xs z-40 relative shadow-xs overflow-x-auto no-scrollbar flex-nowrap shrink-0"
    >
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 bg-teal-500/20 text-teal-300 font-bold px-2.5 py-1 rounded-lg border border-teal-500/30">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>UrbanConnect</span>
        </div>

        {/* Current User Pill */}
        {currentUser ? (
          <div
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-lg cursor-pointer text-slate-300 transition-colors"
            title="Active User Profile"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="font-semibold text-[11px] text-teal-200 truncate max-w-[100px] hidden sm:inline">
              {currentUser.name}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-1 bg-teal-700/80 hover:bg-teal-700 text-white font-semibold px-2 py-1 rounded-lg text-[11px]"
          >
            <LogIn className="w-3 h-3" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Screen Selector Dropdown */}
        <div className="relative flex items-center">
          <label htmlFor="screen-selector" className="sr-only">
            Switch Screen
          </label>
          <select
            id="screen-selector"
            value={currentScreen}
            onChange={(e) => onNavigate(e.target.value as ScreenId)}
            className="bg-slate-900 text-teal-300 font-bold py-1.5 pl-3 pr-8 rounded-xl border border-slate-700 hover:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-400 appearance-none cursor-pointer text-xs"
          >
            {SCREENS.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher variant="pill" />

        {/* Theme Toggle Button */}
        <button
          id="btn-prototype-toggle-theme"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-teal-500 transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          aria-label={`Toggle theme (currently ${theme})`}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-medium">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline font-medium">Dark</span>
            </>
          )}
        </button>

        {/* Viewport Frame Toggle */}
        <button
          id="btn-toggle-device-frame"
          onClick={onToggleDeviceFrame}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
          title={isDeviceFrame ? 'Switch to Fluid Desktop/Tablet View' : 'Switch to Android Mobile Frame'}
        >
          {isDeviceFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Fluid View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Phone Frame</span>
            </>
          )}
        </button>

        {/* Collapse Controls Button */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
          title="Minimize Control Bar"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
