'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClaudeState } from './ClaudeCore';

interface StatusBarProps {
  state: ClaudeState;
  isConnected: boolean;
  eventCount: number;
  currentEvent?: string | null;
  toolName?: string | null;
}

export function StatusBar({
  state,
  isConnected,
  eventCount,
  currentEvent,
  toolName,
}: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const stateIcons: Record<ClaudeState, string> = {
    idle: '◇',
    thinking: '◈',
    working: '◆',
    done: '✓',
  };

  const stateColors: Record<ClaudeState, string> = {
    idle: 'text-smoke-dim',
    thinking: 'text-amber-electric',
    working: 'text-amber-bright',
    done: 'text-state-success',
  };

  return (
    <motion.div
      className="glass border-t border-amber-wire/30 px-6 py-2 flex items-center justify-between"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left: Connection and State */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={`led ${isConnected ? 'animate-led-pulse' : 'led--off'}`} />
          <span className="font-mono text-xs uppercase tracking-wider text-smoke-mid">
            {isConnected ? 'live' : 'offline'}
          </span>
        </div>

        <div className="w-px h-4 bg-amber-wire/30" />

        <div className="flex items-center gap-2">
          <span className={`font-mono text-sm ${stateColors[state]}`}>
            {stateIcons[state]}
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-smoke-mid">
            {state}
          </span>
        </div>
      </div>

      {/* Center: Current Activity */}
      <div className="flex-1 flex items-center justify-center gap-4 max-w-2xl mx-4">
        {currentEvent && (
          <>
            <span className="font-mono text-xs text-smoke-dim">event:</span>
            <span className="font-mono text-xs text-smoke-mid truncate">{currentEvent}</span>
            {toolName && (
              <>
                <span className="font-mono text-xs text-smoke-dim">/</span>
                <span className="font-mono text-xs text-amber-electric truncate">{toolName}</span>
              </>
            )}
          </>
        )}
      </div>

      {/* Right: Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-smoke-dim">events:</span>
          <span className="font-mono text-xs text-amber-electric">{eventCount}</span>
        </div>

        <div className="w-px h-4 bg-amber-wire/30" />

        <div className="font-mono text-xs text-smoke-dim tabular-nums">
          {currentTime}
        </div>
      </div>
    </motion.div>
  );
}
