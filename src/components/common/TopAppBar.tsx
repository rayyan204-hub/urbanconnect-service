import { useState, useEffect, ReactNode } from 'react';
import { ScreenId, UserProfile, NotificationItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications, subscribeToCollection, COLLECTIONS } from '../../services/dbService';
import { NotificationsModal } from './NotificationsModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  ChevronLeft,
  Bell,
  Home,
  ShieldCheck,
  ShieldAlert,
  Sun,
  Moon,
  User,
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
        className="sticky top-0 z-30 bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xl border-b border-[#E5E5EA] dark:border-[#2C2C2E] px-4 py-3 transition-colors"
      >
        <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto w-full">
          {/* Left: Back button or Clean Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {showBack && (
              <button
                id="btn-app-bar-back"
                onClick={onBack || (() => onNavigate('home'))}
                aria-label="Back"
                className="p-1 -ml-1 text-[#007AFF] hover:opacity-75 rounded-lg transition-opacity flex items-center gap-0.5 shrink-0"
                title="Back"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[14px] font-normal hidden sm:inline">Back</span>
              </button>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-[17px] font-semibold text-[#1D1D1F] dark:text-white truncate leading-snug tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] truncate leading-none mt-0.5 font-normal">
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
                {/* Language Switcher */}
                <div className="hidden sm:flex">
                  <LanguageSwitcher variant="pill" />
                </div>

                {/* Notifications Button */}
                <button
                  id="btn-top-app-bar-notifications"
                  onClick={() => setShowNotifications(true)}
                  aria-label="Civic Notifications"
                  className="p-2 text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] rounded-full transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B30] rounded-full ring-2 ring-white dark:ring-[#1C1C1E]" />
                  )}
                </button>

                {/* Home shortcut if deep in a screen */}
                {currentScreen !== 'home' && (
                  <button
                    onClick={() => onNavigate('home')}
                    className="p-2 text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] rounded-full transition-colors"
                    title="Return to Home"
                  >
                    <Home className="w-4 h-4" />
                  </button>
                )}

                {/* User avatar / profile shortcut */}
                {currentUser ? (
                  <button
                    onClick={() => onNavigate('profile')}
                    className="w-7 h-7 rounded-full overflow-hidden border border-[#E5E5EA] dark:border-[#3A3A3C] hover:opacity-85 transition-opacity ml-1"
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
                    className="text-xs font-semibold text-[#007AFF] px-2.5 py-1 rounded-lg hover:bg-[#007AFF]/10 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      {showNotifications && (
        <NotificationsModal
          isOpen={showNotifications}
          userId={currentUser?.uid}
          onClose={() => setShowNotifications(false)}
          onNavigate={onNavigate}
        />
      )}
    </>
  );
}
