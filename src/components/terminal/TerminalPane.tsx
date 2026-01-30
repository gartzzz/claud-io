'use client';

/**
 * TerminalPane - xterm.js terminal connected to PTY backend
 *
 * This component renders a terminal that communicates with the Rust PTY backend.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import '@xterm/xterm/css/xterm.css';
import { useTerminal } from '@/lib/hooks/useTerminal';

interface TerminalPaneProps {
  sessionId?: string;
  title?: string;
  className?: string;
  onReady?: () => void;
}

export function TerminalPane({
  sessionId,
  title = 'Terminal',
  className = '',
  onReady,
}: TerminalPaneProps) {
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { terminalRef, fit, focus } = useTerminal({
    sessionId,
    onReady: () => {
      setIsReady(true);
      onReady?.();
    },
  });

  // Focus terminal on click
  const handleClick = () => {
    focus();
  };

  // Fit on container resize
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      fit();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [fit]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative flex flex-col h-full ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
    >
      {/* Terminal container */}
      <div
        ref={terminalRef}
        className="flex-1 terminal-pane"
        style={{
          padding: '8px 12px',
          minHeight: 0,
        }}
      />

      {/* Loading overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-void-deep/80">
          <div className="flex items-center gap-3">
            <div className="led animate-led-pulse" />
            <span className="font-mono text-sm text-smoke-mid">Initializing...</span>
          </div>
        </div>
      )}

      <style jsx global>{`
        .terminal-pane .xterm {
          padding: 0;
          height: 100%;
        }

        .terminal-pane .xterm-viewport {
          background: transparent !important;
        }

        .terminal-pane .xterm-screen {
          background: transparent !important;
        }

        .terminal-pane .xterm-rows {
          text-shadow: 0 0 8px rgba(245, 166, 35, 0.2);
        }

        .terminal-pane .xterm-cursor-layer .xterm-cursor {
          box-shadow: 0 0 8px rgba(245, 166, 35, 0.5);
        }

        .terminal-pane .xterm-viewport::-webkit-scrollbar {
          width: 6px;
        }

        .terminal-pane .xterm-viewport::-webkit-scrollbar-track {
          background: transparent;
        }

        .terminal-pane .xterm-viewport::-webkit-scrollbar-thumb {
          background: var(--void-lighter);
          border-radius: 3px;
        }

        .terminal-pane .xterm-viewport::-webkit-scrollbar-thumb:hover {
          background: var(--smoke-dim);
        }

        .terminal-pane .xterm-selection {
          background: rgba(245, 166, 35, 0.15) !important;
        }
      `}</style>
    </motion.div>
  );
}

export default TerminalPane;
