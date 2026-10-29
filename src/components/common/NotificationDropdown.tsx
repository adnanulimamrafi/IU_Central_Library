import React, { useState, useRef, useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Check, Clock, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dates';

export const NotificationDropdown: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useLibrary();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-charcoal-600 hover:text-forest-700 dark:text-sage-300 dark:hover:text-ivory-100 bg-sage-100/70 hover:bg-sage-200/80 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 transition-colors"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-charcoal-900 shadow-xl border border-sage-200 dark:border-charcoal-700 py-3 z-50">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-sage-100 dark:border-charcoal-800">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-charcoal-900 dark:text-ivory-100">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-forest-600 hover:text-forest-800 dark:text-sage-300 dark:hover:text-ivory-100 flex items-center gap-1 font-medium transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-sage-50 dark:divide-charcoal-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-charcoal-400 dark:text-sage-400">
                No notifications to display
              </div>
            ) : (
              notifications.map((notif) => {
                let icon = <Info className="w-4 h-4 text-forest-600 mt-0.5 flex-shrink-0" />;
                if (notif.type === 'reminder') {
                  icon = <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />;
                } else if (notif.type === 'warning') {
                  icon = <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />;
                } else if (notif.type === 'success') {
                  icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />;
                }

                return (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                      notif.read
                        ? 'opacity-70 hover:bg-sage-50/50 dark:hover:bg-charcoal-800/40'
                        : 'bg-sage-50/70 dark:bg-charcoal-800/70 hover:bg-sage-100/60'
                    }`}
                  >
                    {icon}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-charcoal-900 dark:text-ivory-100 truncate">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-charcoal-400 dark:text-sage-400 whitespace-nowrap">
                          {formatDisplayDate(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-600 dark:text-sage-300 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.actionUrl && (
                        <Link
                          to={notif.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="inline-block mt-1 text-[11px] font-medium text-forest-700 dark:text-amber-400 hover:underline"
                        >
                          View Details &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
