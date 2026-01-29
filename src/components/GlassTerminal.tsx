'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalMessage } from '@/lib/store';

interface GlassTerminalProps {
  messages?: TerminalMessage[];
  className?: string;
}

export function GlassTerminal({ messages = [], className = '' }: GlassTerminalProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getMessageColor = (type: TerminalMessage['type']) => {
    switch (type) {
      case 'system':
        return 'text-smoke-mid';
      case 'event':
        return 'text-amber-electric';
      case 'tool':
        return 'text-amber-bright';
      case 'error':
        return 'text-state-error';
      default:
        return 'text-smoke-mid';
    }
  };

  const getMessagePrefix = (type: TerminalMessage['type']) => {
    switch (type) {
      case 'system':
        return '[SYS]';
      case 'event':
        return '[EVT]';
      case 'tool':
        return '[TLS]';
      case 'error':
        return '[ERR]';
      default:
        return '[LOG]';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-wire/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-void-lighter" />
          <div className="w-3 h-3 rounded-full bg-void-lighter" />
          <div className="w-3 h-3 rounded-full bg-amber-electric/30" />
          <span className="ml-2 font-mono text-xs uppercase tracking-wider text-smoke-mid">
            // event stream
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="no-drag font-mono text-xs uppercase tracking-wider text-smoke-dim hover:text-amber-electric transition-colors duration-150"
        >
          {isExpanded ? '[ minimize ]' : '[ expand ]'}
        </button>
      </div>

      {/* Terminal Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 overflow-hidden"
          >
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed"
              style={{ maxHeight: '300px' }}
            >
              {messages.length === 0 ? (
                <div className="text-smoke-muted">
                  <span className="text-smoke-dim">// </span>
                  Waiting for Claude Code connection...
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-1"
                  >
                    <span className="text-smoke-muted">{formatTimestamp(msg.timestamp)}</span>
                    <span className={`ml-2 ${getMessageColor(msg.type)}`}>
                      {getMessagePrefix(msg.type)}
                    </span>
                    <span className="ml-2 text-smoke-mid">{msg.content}</span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
