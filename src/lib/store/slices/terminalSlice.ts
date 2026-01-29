/**
 * Terminal slice - manages PTY terminal sessions
 */

import { StateCreator } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { TerminalSession } from '@/types/terminal';

export interface TerminalSlice {
  // State
  sessions: TerminalSession[];
  activeSessionId: string | null;
  isTerminalPanelOpen: boolean;
  terminalPanelHeight: number;

  // Actions
  createSession: (shell?: string, cols?: number, rows?: number) => Promise<TerminalSession>;
  killSession: (id: string) => Promise<void>;
  setActiveSession: (id: string) => void;
  writeInput: (sessionId: string, data: Uint8Array | string) => Promise<void>;
  resize: (sessionId: string, cols: number, rows: number) => Promise<void>;
  setTerminalPanelOpen: (open: boolean) => void;
  setTerminalPanelHeight: (height: number) => void;
  loadSessions: () => Promise<void>;
  updateSession: (id: string, updates: Partial<TerminalSession>) => void;
  removeSession: (id: string) => void;
}

interface SessionInfo {
  id: string;
  title: string;
  created_at: number;
  is_active: boolean;
}

export const createTerminalSlice: StateCreator<
  TerminalSlice,
  [['zustand/immer', never]],
  [],
  TerminalSlice
> = (set, get) => ({
  // Initial state
  sessions: [],
  activeSessionId: null,
  isTerminalPanelOpen: true,
  terminalPanelHeight: 300,

  // Actions
  createSession: async (shell?: string, cols: number = 80, rows: number = 24) => {
    try {
      const info = await invoke<SessionInfo>('terminal_create_session', {
        cols,
        rows,
        command: shell,
      });

      const session: TerminalSession = {
        id: info.id,
        title: info.title,
        createdAt: info.created_at,
        isActive: info.is_active,
        shell: shell || process.env.SHELL || '/bin/zsh',
        cwd: process.env.HOME || '/',
      };

      set((state) => {
        state.sessions.push(session);
        state.activeSessionId = session.id;
      });

      return session;
    } catch (error) {
      console.error('Failed to create terminal session:', error);
      throw error;
    }
  },

  killSession: async (id: string) => {
    try {
      await invoke('terminal_kill_session', { sessionId: id });

      set((state) => {
        state.sessions = state.sessions.filter((s) => s.id !== id);
        if (state.activeSessionId === id) {
          state.activeSessionId = state.sessions[0]?.id ?? null;
        }
      });
    } catch (error) {
      console.error('Failed to kill terminal session:', error);
      throw error;
    }
  },

  setActiveSession: (id: string) => {
    set((state) => {
      state.activeSessionId = id;
      // Update isActive flag
      state.sessions.forEach((s) => {
        s.isActive = s.id === id;
      });
    });

    // Notify backend
    invoke('terminal_set_active', { sessionId: id }).catch(console.error);
  },

  writeInput: async (sessionId: string, data: Uint8Array | string) => {
    try {
      const bytes = typeof data === 'string'
        ? Array.from(new TextEncoder().encode(data))
        : Array.from(data);

      await invoke('terminal_write_input', {
        sessionId,
        data: bytes,
      });
    } catch (error) {
      console.error('Failed to write terminal input:', error);
      throw error;
    }
  },

  resize: async (sessionId: string, cols: number, rows: number) => {
    try {
      await invoke('terminal_resize', { sessionId, cols, rows });
    } catch (error) {
      console.error('Failed to resize terminal:', error);
      throw error;
    }
  },

  setTerminalPanelOpen: (open: boolean) => {
    set((state) => {
      state.isTerminalPanelOpen = open;
    });
  },

  setTerminalPanelHeight: (height: number) => {
    set((state) => {
      state.terminalPanelHeight = Math.max(100, Math.min(600, height));
    });
  },

  loadSessions: async () => {
    try {
      const sessions = await invoke<SessionInfo[]>('terminal_list_sessions');
      const activeId = await invoke<string | null>('terminal_get_active');

      set((state) => {
        state.sessions = sessions.map((info) => ({
          id: info.id,
          title: info.title,
          createdAt: info.created_at,
          isActive: info.is_active,
          shell: '/bin/zsh',
          cwd: '/',
        }));
        state.activeSessionId = activeId;
      });
    } catch (error) {
      console.error('Failed to load terminal sessions:', error);
    }
  },

  updateSession: (id: string, updates: Partial<TerminalSession>) => {
    set((state) => {
      const session = state.sessions.find((s) => s.id === id);
      if (session) {
        Object.assign(session, updates);
      }
    });
  },

  removeSession: (id: string) => {
    set((state) => {
      state.sessions = state.sessions.filter((s) => s.id !== id);
      if (state.activeSessionId === id) {
        state.activeSessionId = state.sessions[0]?.id ?? null;
      }
    });
  },
});
