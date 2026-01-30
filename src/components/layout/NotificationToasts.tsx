'use client';

/**
 * NotificationToasts - Toast notification container
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

export function NotificationToasts() {
  const notifications = useAppStore((state) => state.notifications);
  const removeNotification = useAppStore((state) => state.removeNotification);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`
              relative flex items-start gap-3 px-4 py-3 rounded-lg
              glass border backdrop-blur-sm max-w-sm
              ${notification.type === 'error' ? 'border-state-error/30' : ''}
              ${notification.type === 'success' ? 'border-state-success/30' : ''}
              ${notification.type === 'warning' ? 'border-amber-electric/30' : ''}
              ${notification.type === 'info' ? 'border-amber-wire/30' : ''}
            `}
          >
            {/* Icon */}
            <div className={`
              w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5
              ${notification.type === 'error' ? 'bg-state-error/20 text-state-error' : ''}
              ${notification.type === 'success' ? 'bg-state-success/20 text-state-success' : ''}
              ${notification.type === 'warning' ? 'bg-amber-electric/20 text-amber-electric' : ''}
              ${notification.type === 'info' ? 'bg-smoke-dim/20 text-smoke-mid' : ''}
            `}>
              {notification.type === 'error' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l6 6M9 3l-6 6" />
                </svg>
              )}
              {notification.type === 'success' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 6l3 3 5-6" />
                </svg>
              )}
              {notification.type === 'warning' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 3v4M6 9v0" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 5v4M6 3v0" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-smoke-bright">
                {notification.title}
              </p>
              {notification.message && (
                <p className="font-mono text-xs text-smoke-dim mt-1 truncate">
                  {notification.message}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-smoke-dim hover:text-smoke-bright transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default NotificationToasts;
