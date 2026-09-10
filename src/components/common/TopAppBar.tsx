import { useState, ReactNode } from 'react';
import { ScreenId, UserProfile } from '../../types';
import {
  ArrowLeft,
  Bell,
  Home,
  ShieldCheck,
  User,
  X,
  CheckCircle2,
  AlertTriangle,
  LogIn,
} from 'lucide-react';

interface TopAppBarProps {
  currentScreen: ScreenId;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onNavigate: (screen: ScreenId) => void;
  showBack?: boolean;
  rightAction?: ReactNode;
  currentUser?: UserProfile | null;
}

export function TopAppBar({
  currentScreen,
  title,
  subtitle,
  onBack,
  onNavigate,
  showBack = false,
  rightAction,
  currentUser,
}: TopAppBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header
        id="top-app-bar"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 transition-all shadow-2xs"
      >
        <div className="flex items-center justify-between gap-2.5">
          {/* Left: Back or Brand Icon + Title */}
          <div className="flex items-center gap-2 min-w-0">
            {showBack ? (
              <button
                id="btn-app-bar-back"
                onClick={onBack || (() => onNavigate('home'))}
                aria-label="Navigate back"
                className="p-1.5 -ml-1 text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
                title="Back to previous screen"
              >
                <ArrowLeft className="w-5 h-5 text-slate-800" />
              </button>
            ) : (
              currentScreen === 'home' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 flex items-center justify-center text-white shadow-2xs flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )
            )}

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate leading-tight tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-teal-800 font-medium truncate leading-none mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions (Home shortcut, Notifications, User profile chip) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {rightAction ? (
              rightAction
            ) : (
              <>
                {/* Home Shortcut button if inside sub-screens */}
                {currentScreen !== 'home' && currentScreen !== 'splash' && (
                  <button
                    id="btn-nav-home-shortcut"
                    onClick={() => onNavigate('home')}
                    className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Return to Home Dashboard"
                    aria-label="Home"
                  >
                    <Home className="w-4 h-4" />
                  </button>
                )}

                {/* Notifications Bell */}
                <button
                  id="btn-notifications-top"
                  onClick={() => setShowNotifications(true)}
                  aria-label="Civic Notifications"
                  className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors relative"
                  title="Civic Alerts"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                </button>

                {/* Current User Chip */}
                {currentUser ? (
                  <button
                    id="btn-user-chip-header"
                    onClick={() => onNavigate('profile')}
                    className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 bg-slate-100 hover:bg-teal-50 border border-slate-200/80 hover:border-teal-200 rounded-full transition-all text-left"
                    title={`Logged in as ${currentUser.name}`}
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-white"
                    />
                    <span className="text-[11px] font-bold text-slate-800 max-w-[80px] truncate hidden sm:inline">
                      {currentUser.name.split(' ')[0]}
                    </span>
                  </button>
                ) : (
                  <button
                    id="btn-header-login"
                    onClick={() => onNavigate('login')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-teal-700 text-white hover:bg-teal-800 rounded-full text-xs font-bold transition-all shadow-2xs"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Login</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Notifications Drawer / Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Civic Live Alerts (Ward 14)
                </h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900 block">Air Quality: Good (AQI 42)</span>
                  <span className="text-[11px] text-emerald-700">Safe for outdoor recreation and transit commuting.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block">Metro Line 2 Maintenance</span>
                  <span className="text-[11px] text-amber-700">Scheduled signal upgrades tonight from 11:30 PM.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Town Hall Meeting</span>
                  <span className="text-[11px] text-slate-600">Smart Mobility public review Thursday 6:00 PM.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowNotifications(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
