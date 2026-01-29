'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { motion } from 'framer-motion';
import '@xterm/xterm/css/xterm.css';
import { GlassTerminalProps, CLAUD_IO_TERMINAL_THEME } from './GlassTerminal.types';

/**
 * GlassTerminal - A terminal component with glass morphism styling
 *
 * Features:
 * - Glass morphism background with amber borders
 * - Amber text on void background
 * - WebGL-accelerated rendering
 * - Auto-resize support
 * - Subtle glow effects on text
 * - Corner accents matching design system
 */
export function GlassTerminal({
  title = 'TERMINAL',
  className = '',
  elevated = false,
  cornerAccents = true,
  onTerminalReady,
  initialContent,
}: GlassTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal with Claud.io theme
    const terminal = new Terminal({
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
      cursorInactiveStyle: 'outline',
      theme: CLAUD_IO_TERMINAL_THEME,
      allowProposedApi: true,
      convertEol: true,
      scrollback: 10000,
      tabStopWidth: 4,
    });

    // Initialize fit addon
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Open terminal
    terminal.open(terminalRef.current);

    // Try to load WebGL addon for better performance
    try {
      const webglAddon = new WebglAddon();
      webglAddon.onContextLoss(() => {
        webglAddon.dispose();
      });
      terminal.loadAddon(webglAddon);
    } catch (e) {
      // WebGL not available, continue without it
      console.warn('WebGL addon failed to load:', e);
    }

    // Fit terminal to container
    fitAddon.fit();

    // Store refs
    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;
    setIsReady(true);

    // Write initial content if provided
    if (initialContent) {
      terminal.writeln(initialContent);
    }

    // Notify parent component
    if (onTerminalReady) {
      onTerminalReady(terminal);
    }

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, [onTerminalReady, initialContent]);

  // Re-fit when container size changes
  useEffect(() => {
    if (!isReady || !fitAddonRef.current) return;

    const observer = new ResizeObserver(() => {
      fitAddonRef.current?.fit();
    });

    if (terminalRef.current) {
      observer.observe(terminalRef.current);
    }

    return () => observer.disconnect();
  }, [isReady]);

  return (
    <motion.div
      className={`relative rounded-xl overflow-hidden ${elevated ? 'glass-elevated' : 'glass'} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Corner accents */}
      {cornerAccents && (
        <>
          <div className="corner-accent corner-accent--tl" />
          <div className="corner-accent corner-accent--tr" />
          <div className="corner-accent corner-accent--bl" />
          <div className="corner-accent corner-accent--br" />
        </>
      )}

      {/* Header */}
      <div className="px-4 py-3 border-b border-amber-wire bg-void-deep/50">
        <div className="flex items-center justify-between">
          <div className="font-mono text-sm uppercase tracking-wider text-amber-electric">
            <span className="text-smoke-dim">// </span>
            {title}
          </div>

          {/* LED indicator */}
          <div className="flex items-center gap-2">
            <div className={`led ${isReady ? 'animate-led-pulse' : 'led--off'}`} />
            <span className="font-mono text-xs uppercase text-smoke-dim">
              {isReady ? 'ready' : 'loading'}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal container with glow effect */}
      <div className="relative">
        {/* Subtle amber glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(245, 166, 35, 0.05) 0%, transparent 70%)',
          }}
        />

        {/* Terminal */}
        <div
          ref={terminalRef}
          className="terminal-container"
          style={{
            minHeight: '300px',
            padding: '12px',
          }}
        />
      </div>

      {/* Custom styles for xterm */}
      <style jsx global>{`
        .terminal-container .xterm {
          padding: 0;
        }

        .terminal-container .xterm-viewport {
          background: transparent !important;
        }

        .terminal-container .xterm-screen {
          background: transparent !important;
        }

        /* Subtle text glow effect */
        .terminal-container .xterm-rows {
          text-shadow: 0 0 8px rgba(245, 166, 35, 0.3);
        }

        /* Cursor glow */
        .terminal-container .xterm-cursor-layer .xterm-cursor {
          box-shadow: 0 0 8px rgba(245, 166, 35, 0.6);
        }

        /* Scrollbar styling */
        .terminal-container .xterm-viewport::-webkit-scrollbar {
          width: 8px;
        }

        .terminal-container .xterm-viewport::-webkit-scrollbar-track {
          background: var(--void-deep);
        }

        .terminal-container .xterm-viewport::-webkit-scrollbar-thumb {
          background: var(--void-lighter);
          border-radius: 4px;
        }

        .terminal-container .xterm-viewport::-webkit-scrollbar-thumb:hover {
          background: var(--smoke-muted);
        }

        /* Selection styling */
        .terminal-container .xterm-selection {
          background: var(--amber-subtle) !important;
        }
      `}</style>
    </motion.div>
  );
}

/**
 * Example usage:
 *
 * ```tsx
 * <GlassTerminal
 *   title="OUTPUT"
 *   elevated
 *   onTerminalReady={(term) => {
 *     term.writeln('Welcome to Claud.io terminal');
 *     term.writeln('');
 *     term.write('$ ');
 *   }}
 * />
 * ```
 */
