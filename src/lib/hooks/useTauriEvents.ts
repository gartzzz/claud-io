'use client';

/**
 * useTauriEvents hook - initializes Tauri event listeners
 *
 * This hook should be called once at the app root level to set up
 * all Tauri event listeners for the application.
 */

import { useEffect, useRef } from 'react';
import { initTauriListeners, cleanupTauriListeners, isTauri } from '../tauri/events';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../store';

export function useTauriEvents() {
  const initialized = useRef(false);
  const { setClaudeState, setConnected, setError, addMessage } = useAppStore();

  useEffect(() => {
    if (initialized.current) return;
    if (!isTauri()) {
      console.log('[Tauri Events] Not in Tauri environment, skipping initialization');
      return;
    }

    initialized.current = true;

    const init = async () => {
      try {
        // Initialize event listeners
        await initTauriListeners();

        // Get initial Claude state
        try {
          const state = await invoke('get_claude_state');
          if (state) {
            setClaudeState(state as any);
            addMessage({
              type: 'system',
              content: 'Connected to Claude state',
            });
          }
        } catch (error) {
          console.warn('Could not get initial Claude state:', error);
          addMessage({
            type: 'system',
            content: 'Waiting for Claude Code session...',
          });
        }

        setConnected(true);

      } catch (error) {
        console.error('Failed to initialize Tauri listeners:', error);
        setError(String(error));
      }
    };

    init();

    return () => {
      cleanupTauriListeners();
      initialized.current = false;
    };
  }, [setClaudeState, setConnected, setError, addMessage]);
}

export default useTauriEvents;
