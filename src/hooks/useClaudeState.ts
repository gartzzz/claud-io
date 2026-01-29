'use client';

import { useEffect, useRef } from 'react';
import { useClaudeStateStore, ClaudeStateData } from '@/lib/store';

// Check if running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

/**
 * Custom hook to synchronize Claude state from Tauri backend
 *
 * This hook:
 * 1. Checks if running in Tauri environment
 * 2. Sets up event listener for state changes from backend
 * 3. Polls for initial state on mount
 * 4. Updates the Zustand store with state changes
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   useClaudeState();
 *   const state = useCurrentState();
 *   // ... use state
 * }
 * ```
 */
export function useClaudeState() {
  const { setStateData, setError, setConnected, reset, addMessage, incrementEventCount } = useClaudeStateStore();
  const unlistenRef = useRef<(() => void) | null>(null);
  const prevStateRef = useRef<ClaudeStateData | null>(null);

  useEffect(() => {
    // Only run in Tauri environment
    if (!isTauri) {
      reset();
      return;
    }

    let isActive = true;

    const initializeState = async () => {
      try {
        // Dynamically import Tauri APIs
        const { invoke } = await import('@tauri-apps/api/core');
        const { listen } = await import('@tauri-apps/api/event');

        // Check if state file exists
        const exists = await invoke<boolean>('check_state_file_exists');

        if (!exists) {
          setConnected(false);
          addMessage({
            timestamp: new Date(),
            type: 'system',
            content: 'Waiting for Claude Code connection...',
          });
          console.info('[ClaudeState] State file does not exist yet');
          return;
        }

        // Try to get initial state
        try {
          const initialState = await invoke<ClaudeStateData>('get_claude_state');
          if (isActive) {
            setStateData(initialState);
            addMessage({
              timestamp: new Date(),
              type: 'system',
              content: 'Connected to Claude Code',
            });
            prevStateRef.current = initialState;
            console.info('[ClaudeState] Initial state loaded:', initialState);
          }
        } catch (err) {
          console.warn('[ClaudeState] Could not load initial state:', err);
          setConnected(false);
          addMessage({
            timestamp: new Date(),
            type: 'error',
            content: 'Could not load initial state',
          });
        }

        // Listen for state changes from backend
        const unlisten = await listen<ClaudeStateData>(
          'claude-state-changed',
          (event) => {
            if (isActive) {
              const newState = event.payload;
              const prevState = prevStateRef.current;

              console.info('[ClaudeState] State updated:', newState);
              setStateData(newState);

              // Track state changes
              if (prevState && prevState.state !== newState.state) {
                addMessage({
                  timestamp: new Date(),
                  type: 'event',
                  content: `State changed: ${newState.state}`,
                });
              }

              // Track event changes
              if (prevState && prevState.event !== newState.event) {
                incrementEventCount();
                addMessage({
                  timestamp: new Date(),
                  type: 'event',
                  content: newState.event,
                });
              }

              // Track tool changes
              if (prevState && prevState.toolName !== newState.toolName && newState.toolName) {
                addMessage({
                  timestamp: new Date(),
                  type: 'tool',
                  content: `Using tool: ${newState.toolName}`,
                });
              }

              prevStateRef.current = newState;
            }
          }
        );

        unlistenRef.current = unlisten;
      } catch (err) {
        console.error('[ClaudeState] Failed to initialize:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    initializeState();

    // Cleanup
    return () => {
      isActive = false;
      if (unlistenRef.current) {
        unlistenRef.current();
        unlistenRef.current = null;
      }
    };
  }, [setStateData, setError, setConnected, reset, addMessage, incrementEventCount]);
}

/**
 * Hook to get the state file path for debugging
 */
export function useStateFilePath() {
  const { stateData } = useClaudeStateStore();

  useEffect(() => {
    if (!isTauri) return;

    const getPath = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const path = await invoke<string>('get_state_file_path');
        console.info('[ClaudeState] Watching file:', path);
      } catch (err) {
        console.error('[ClaudeState] Failed to get state file path:', err);
      }
    };

    getPath();
  }, []);

  return stateData;
}
