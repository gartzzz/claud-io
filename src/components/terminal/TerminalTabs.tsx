'use client';

/**
 * TerminalTabs - Tab bar for multiple terminal sessions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

interface TerminalTabsProps {
  onNewTab?: () => void;
}

export function TerminalTabs({ onNewTab }: TerminalTabsProps) {
  const sessions = useAppStore((state) => state.sessions);
  const activeSessionId = useAppStore((state) => state.activeSessionId);
  const setActiveSession = useAppStore((state) => state.setActiveSession);
  const killSession = useAppStore((state) => state.killSession);

  const handleNewTab = () => {
    onNewTab?.();
  };

  const handleCloseTab = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    killSession(sessionId);
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-amber-wire/20 bg-void-deep/50">
      {/* Session tabs */}
      <AnimatePresence mode="popLayout">
        {sessions.map((session) => (
          <motion.button
            key={session.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={() => setActiveSession(session.id)}
            className={`
              group flex items-center gap-2 px-3 py-1.5 rounded-md
              font-mono text-xs transition-colors
              ${
                session.id === activeSessionId
                  ? 'bg-amber-electric/10 text-amber-electric border border-amber-wire/30'
                  : 'text-smoke-mid hover:text-smoke-bright hover:bg-void-lighter/50'
              }
            `}
          >
            <span className="truncate max-w-[100px]">
              {session.title}
            </span>

            {/* Close button */}
            <button
              onClick={(e) => handleCloseTab(e, session.id)}
              className={`
                w-4 h-4 flex items-center justify-center rounded-sm
                opacity-0 group-hover:opacity-100 transition-opacity
                hover:bg-void-lighter text-smoke-dim hover:text-smoke-bright
              `}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 2l6 6M8 2l-6 6" />
              </svg>
            </button>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* New tab button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNewTab}
        className="
          w-6 h-6 flex items-center justify-center rounded-md
          text-smoke-dim hover:text-amber-electric hover:bg-amber-electric/10
          transition-colors
        "
        title="New terminal (Cmd+T)"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 2v8M2 6h8" />
        </svg>
      </motion.button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Session count */}
      <span className="font-mono text-xs text-smoke-dim">
        {sessions.length} session{sessions.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

export default TerminalTabs;
