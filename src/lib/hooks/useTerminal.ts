'use client';

/**
 * useTerminal hook - connects xterm.js to PTY backend via Tauri
 *
 * This hook manages the bidirectional communication between the xterm.js
 * terminal component and the Rust PTY backend.
 */

import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useAppStore } from '../store';
import { onTerminalOutput, isTauri } from '../tauri/events';
import { invoke } from '@tauri-apps/api/core';

interface UseTerminalOptions {
  /**
   * Session ID to connect to. If not provided, a new session will be created.
   */
  sessionId?: string;

  /**
   * Shell command to use for new sessions
   */
  shell?: string;

  /**
   * Callback when terminal is ready
   */
  onReady?: (terminal: Terminal) => void;

  /**
   * Callback when session exits
   */
  onExit?: (code: number) => void;
}

interface UseTerminalReturn {
  /**
   * Ref to attach to the terminal container div
   */
  terminalRef: React.RefObject<HTMLDivElement>;

  /**
   * The xterm.js Terminal instance
   */
  terminal: Terminal | null;

  /**
   * The FitAddon instance for resizing
   */
  fitAddon: FitAddon | null;

  /**
   * Current session ID
   */
  sessionId: string | null;

  /**
   * Whether the terminal is ready
   */
  isReady: boolean;

  /**
   * Write data to the terminal
   */
  write: (data: string) => void;

  /**
   * Fit terminal to container
   */
  fit: () => void;

  /**
   * Focus the terminal
   */
  focus: () => void;

  /**
   * Clear the terminal
   */
  clear: () => void;
}

export function useTerminal(options: UseTerminalOptions = {}): UseTerminalReturn {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionIdRef = useRef<string | null>(options.sessionId ?? null);
  const isReadyRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const {
    createSession,
    writeInput,
    resize,
    activeSessionId,
    setActiveSession,
  } = useAppStore();

  // Write to terminal display and PTY
  const write = useCallback((data: string) => {
    if (sessionIdRef.current && isTauri()) {
      writeInput(sessionIdRef.current, data).catch(console.error);
    }
  }, [writeInput]);

  // Fit terminal to container
  const fit = useCallback(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();

      // Send resize to PTY
      const terminal = terminalInstanceRef.current;
      if (terminal && sessionIdRef.current && isTauri()) {
        resize(sessionIdRef.current, terminal.cols, terminal.rows).catch(console.error);
      }
    }
  }, [resize]);

  // Focus terminal
  const focus = useCallback(() => {
    terminalInstanceRef.current?.focus();
  }, []);

  // Clear terminal
  const clear = useCallback(() => {
    terminalInstanceRef.current?.clear();
  }, []);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    // Import xterm theme
    const theme = {
      background: '#16161C',
      foreground: '#F5A623',
      cursor: '#F5A623',
      cursorAccent: '#16161C',
      selectionBackground: 'rgba(245, 166, 35, 0.15)',
      selectionForeground: '#F0EDE8',
      black: '#08080A',
      red: '#E57373',
      green: '#8BC34A',
      yellow: '#FFBA42',
      blue: '#B8B5AE',
      magenta: '#F5A623',
      cyan: '#F5A623',
      white: '#F0EDE8',
      brightBlack: '#282832',
      brightRed: '#E57373',
      brightGreen: '#8BC34A',
      brightYellow: '#FFBA42',
      brightBlue: '#B8B5AE',
      brightMagenta: '#F5A623',
      brightCyan: '#F5A623',
      brightWhite: '#F0EDE8',
    };

    // Create terminal instance
    const terminal = new Terminal({
      fontFamily: '"SF Mono", "Monaco", "Menlo", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
      cursorInactiveStyle: 'outline',
      theme,
      allowProposedApi: true,
      convertEol: true,
      scrollback: 10000,
      tabStopWidth: 4,
    });

    // Create fit addon
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Open terminal in container
    terminal.open(terminalRef.current);

    // Initial fit
    setTimeout(() => fitAddon.fit(), 0);

    // Store refs
    terminalInstanceRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Initialize session
    const initSession = async () => {
      if (!isTauri()) {
        // Not in Tauri - show demo mode
        terminal.writeln('\x1b[33m// CLAUD.IO TERMINAL\x1b[0m');
        terminal.writeln('\x1b[90m// Running in browser mode - PTY not available\x1b[0m');
        terminal.writeln('');
        isReadyRef.current = true;
        options.onReady?.(terminal);
        return;
      }

      try {
        // Create or use existing session
        let sid = sessionIdRef.current;

        if (!sid) {
          const session = await createSession(options.shell);
          sid = session.id;
          sessionIdRef.current = sid;
        }

        // Set as active session
        setActiveSession(sid);

        // Listen for output from this session
        const unsubscribe = onTerminalOutput(sid, (data) => {
          terminal.write(data);
        });

        cleanupRef.current = unsubscribe;

        // Handle user input
        terminal.onData((data) => {
          if (sessionIdRef.current) {
            writeInput(sessionIdRef.current, data).catch(console.error);
          }
        });

        // Handle resize
        terminal.onResize(({ cols, rows }) => {
          if (sessionIdRef.current) {
            invoke('terminal_resize', {
              sessionId: sessionIdRef.current,
              cols,
              rows,
            }).catch(console.error);
          }
        });

        // Initial resize
        fitAddon.fit();
        await invoke('terminal_resize', {
          sessionId: sid,
          cols: terminal.cols,
          rows: terminal.rows,
        });

        isReadyRef.current = true;
        options.onReady?.(terminal);

      } catch (error) {
        console.error('Failed to initialize terminal session:', error);
        terminal.writeln(`\x1b[31mError: Failed to initialize terminal\x1b[0m`);
        terminal.writeln(`\x1b[90m${String(error)}\x1b[0m`);
      }
    };

    initSession();

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    // Window resize handler
    const handleWindowResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleWindowResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      cleanupRef.current?.();
      terminal.dispose();
      terminalInstanceRef.current = null;
      fitAddonRef.current = null;
      isReadyRef.current = false;
    };
  }, []); // Empty deps - only run once

  // Update session ID ref when prop changes
  useEffect(() => {
    if (options.sessionId && options.sessionId !== sessionIdRef.current) {
      sessionIdRef.current = options.sessionId;
      // TODO: Switch session output listener
    }
  }, [options.sessionId]);

  return {
    terminalRef: terminalRef as React.RefObject<HTMLDivElement>,
    terminal: terminalInstanceRef.current,
    fitAddon: fitAddonRef.current,
    sessionId: sessionIdRef.current,
    isReady: isReadyRef.current,
    write,
    fit,
    focus,
    clear,
  };
}

export default useTerminal;
