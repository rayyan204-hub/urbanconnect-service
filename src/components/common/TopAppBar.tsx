import { useState, useEffect, ReactNode } from 'react';
import { ScreenId, UserProfile, NotificationItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications, subscribeToCollection, COLLECTIONS } from '../../services/dbService';
import { NotificationsModal } from './NotificationsModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  ArrowLeft,
  Bell,
  Home,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  Sun,
  Moon,
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
  const [notifications, setNotifications] = useState<NotificationItem[]>(getNotifications(currentUser?.uid));
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const unsub = subscribeToCollection(COLLECTIONS.NOTIFICATIONS, () => {
      setNotifications(getNotifications(currentUser?.uid));
    });
    return unsub;
  }, [currentUser?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header
        id="top-app-bar"
        className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/90 px-4 py-2.5 transition-colors shadow-2xs"
      >
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back or Brand Icon + Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {showBack ? (
              <button
                id="btn-app-bar-back"
                onClick={onBack || (() => onNavigate('home'))}
                aria-label="Navigate back"
                className="p-1.5 -ml-1 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                title="Back to previous screen"
              >
                <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-200" />
              </button>
            ) : (
              currentScreen === 'home' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 flex items-center justify-center text-white shadow-2xs shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate leading-tight tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-teal-800 dark:text-teal-400 font-medium truncate leading-none mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {rightAction ? (
              rightAction
            ) : (
              <>
                {/* Header Language Switcher (hidden on mobile, available in prototype bar & home) */}
                <div className="hidden md:flex">
                  <LanguageSwitcher variant="pill" />
                </div>

                {/* Header Theme Quick Toggle */}
                <button
                  id="btn-top-app-bar-theme-toggle"
                  onClick={toggleTheme}
                  aria-label={`Toggle theme (currently ${isDark ? 'dark' : 'light'})`}
                  className="hidden sm:flex p-1.5 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                {/* Admin HQ shortcut if user is admin */}
                {currentUser?.role === 'admin' && currentScreen !== 'admin' && (
                  <button
                    id="btn-nav-admin-shortcut"
                    onClick={() => onNavigate('admin')}
                    className="p-1.5 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 rounded-xl transition-colors flex items-center gap-1"
                    title="Open Admin HQ"
                    aria-label="Admin Operations"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                )}

                {/* Home Shortcut button if inside sub-screens */}
                {currentScreen !== 'home' && currentScreen !== 'splash' && (
                  <button
                    id="btn-nav-home-shortcut"
                    onClick={() => onNavigate('home')}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Return to Home Dashboard"
                    aria-label="Home"
                  >
                    <Home className="w-4 h-4" />
                  </button>
                )}

                {/* Notifications Bell with unread counter */}
                <button
                  id="btn-notifications-top"
                  onClick={() => setShowNotifications(true)}
                  aria-label="Civic Notifications"
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
                  title="Civic Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Current User Chip */}
                {currentUser ? (
                  <button
                    id="btn-user-chip-header"
                    onClick={() => onNavigate('profile')}
                    className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 border border-slate-200/80 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-700 rounded-full transition-all text-left"
                    title={`Logged in as ${currentUser.name} (${currentUser.role})`}
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-white dark:ring-slate-700"
                    />
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 max-w-[80px] truncate hidden sm:inline">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    {currentUser.role === 'admin' && (
                      <span className="text-[9px] font-extrabold uppercase bg-teal-700 text-white px-1 rounded-sm hidden sm:inline">
                        Admin
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    id="btn-header-login"
                    onClick={() => onNavigate('login')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-teal-700 hover:bg-teal-600 text-white rounded-full text-xs font-bold transition-all shadow-2xs"
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

      {/* Dynamic Notifications Modal */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNavigate={onNavigate}
        userId={currentUser?.uid}
      />
    </>
  );
}

