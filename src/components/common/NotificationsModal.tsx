import { useState, useEffect } from 'react';
import { ScreenId, NotificationItem } from '../../types';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  subscribeToCollection,
  COLLECTIONS,
} from '../../services/dbService';
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  Calendar,
  Info,
  ShieldCheck,
  ChevronRight,
  Trash2,
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
  userId?: string;
}

export function NotificationsModal({ isOpen, onClose, onNavigate, userId }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(getNotifications(userId));
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const unsub = subscribeToCollection(COLLECTIONS.NOTIFICATIONS, () => {
      setNotifications(getNotifications(userId));
    });
    return unsub;
  }, [userId]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    if (notif.actionScreen) {
      onClose();
      onNavigate(notif.actionScreen);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'complaint':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'notice':
        return <Info className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-xl">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Civic Notifications
              </h3>
              <span className="text-[10px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter chips & Actions */}
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead(userId)}
                className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark read</span>
              </button>
            )}
            <button
              onClick={() => clearNotifications()}
              className="text-[10px] text-slate-400 hover:text-rose-600 p-1"
              title="Clear all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-0.5 scrollbar-thin">
          {displayed.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-1">
              <Bell className="w-7 h-7 mx-auto opacity-30" />
              <p className="text-xs font-semibold">No notifications</p>
              <p className="text-[10px]">Updates about your complaints & events will appear here</p>
            </div>
          ) : (
            displayed.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  notif.read
                    ? 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800/80 opacity-80'
                    : 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/80 shadow-2xs'
                }`}
              >
                <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800 flex-shrink-0 shadow-2xs mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap flex-shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.actionScreen && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400">
                      <span>Tap to view {notif.actionScreen}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
        >
          Close
        </button>
      </div>
    </div>
  );
}
