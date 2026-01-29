'use client';

import { ClaudeCore } from '@/components/ClaudeCore';
import { GlassTerminal } from '@/components/GlassTerminal';
import { StatusBar } from '@/components/StatusBar';
import { AmbientBackground } from '@/components/AmbientBackground';
import { useClaudeState } from '@/hooks/useClaudeState';
import {
  useCurrentState,
  useIsConnected,
  useCurrentEvent,
  useCurrentToolName,
  useMessages,
  useEventCount,
} from '@/lib/store';
import { motion } from 'framer-motion';

export default function Home() {
  // Initialize state synchronization (only works in Tauri)
  useClaudeState();

  // Get state from Zustand store
  const state = useCurrentState();
  const isConnected = useIsConnected();
  const event = useCurrentEvent();
  const toolName = useCurrentToolName();
  const messages = useMessages();
  const eventCount = useEventCount();

  return (
    <>
      {/* Ambient Background */}
      <AmbientBackground />

      {/* Main Layout Container */}
      <div className="relative flex flex-col h-screen" style={{ zIndex: 1 }}>
        {/* Header */}
        <motion.header
          className="flex items-center justify-between px-8 py-4 border-b border-amber-wire/30"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* App Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-electric to-amber-deep flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <div className="font-mono text-xs font-bold text-void-deepest">C</div>
              </motion.div>
              <h1 className="font-mono text-xl font-bold tracking-wider text-smoke-bright">
                CLAUD<span className="text-amber-electric">.IO</span>
              </h1>
            </div>
            <div className="h-4 w-px bg-amber-wire/30" />
            <p className="font-mono text-xs text-smoke-dim">
              // la casa de cristal del pensamiento
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`led ${isConnected ? 'animate-led-pulse' : 'led--off'}`} />
              <span className="font-mono text-xs uppercase tracking-wider text-smoke-mid">
                {isConnected ? 'connected' : 'offline'}
              </span>
            </div>

            <div className="h-4 w-px bg-amber-wire/30" />

            <div className="font-mono text-xs text-smoke-dim">
              v0.1.0
            </div>
          </div>
        </motion.header>

        {/* Main Content Area - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Visualization */}
          <motion.div
            className="flex-1 flex flex-col items-center justify-center p-8"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ClaudeCore Visualization */}
            <div className="relative">
              {/* Decorative corner accents around core */}
              <motion.div
                className="absolute -top-8 -left-8 w-16 h-16 border-l-2 border-t-2 border-amber-wire/20 rounded-tl-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
              <motion.div
                className="absolute -top-8 -right-8 w-16 h-16 border-r-2 border-t-2 border-amber-wire/20 rounded-tr-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              />
              <motion.div
                className="absolute -bottom-8 -left-8 w-16 h-16 border-l-2 border-b-2 border-amber-wire/20 rounded-bl-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              />
              <motion.div
                className="absolute -bottom-8 -right-8 w-16 h-16 border-r-2 border-b-2 border-amber-wire/20 rounded-br-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              />

              <ClaudeCore state={state} size="lg" />
            </div>

            {/* State Description */}
            <motion.div
              className="mt-12 text-center max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="font-mono text-sm text-smoke-mid leading-relaxed">
                {state === 'idle' && 'Waiting for Claude to start thinking...'}
                {state === 'thinking' && 'Claude is processing your request...'}
                {state === 'working' && 'Claude is actively working on tools and actions...'}
                {state === 'done' && 'Task completed successfully'}
              </p>

              {/* Current activity details */}
              {isConnected && (event || toolName) && (
                <motion.div
                  className="mt-6 p-4 glass rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="font-mono text-xs space-y-2">
                    {event && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-smoke-dim">event:</span>
                        <span className="text-smoke-bright text-right flex-1 truncate">
                          {event}
                        </span>
                      </div>
                    )}
                    {toolName && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-smoke-dim">tool:</span>
                        <span className="text-amber-electric text-right flex-1 truncate">
                          {toolName}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Right Panel - Terminal */}
          <motion.div
            className="w-[480px] border-l border-amber-wire/30 glass flex flex-col"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassTerminal messages={messages} />
          </motion.div>
        </div>

        {/* Status Bar */}
        <StatusBar
          state={state}
          isConnected={isConnected}
          eventCount={eventCount}
          currentEvent={event}
          toolName={toolName}
        />
      </div>
    </>
  );
}
