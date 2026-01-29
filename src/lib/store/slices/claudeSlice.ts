/**
 * Claude state slice - manages Claude Code state synchronization
 */

import { StateCreator } from 'zustand';
import type { ClaudeStateData, TerminalMessage } from '../types';

export interface ClaudeSlice {
  // State
  claudeState: ClaudeStateData | null;
  isConnected: boolean;
  lastError: string | null;
  messages: TerminalMessage[];
  eventCount: number;

  // Actions
  setClaudeState: (data: ClaudeStateData) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  addMessage: (message: Omit<TerminalMessage, 'timestamp'>) => void;
  incrementEventCount: () => void;
  resetClaude: () => void;
}

export const createClaudeSlice: StateCreator<
  ClaudeSlice,
  [['zustand/immer', never]],
  [],
  ClaudeSlice
> = (set) => ({
  // Initial state
  claudeState: null,
  isConnected: false,
  lastError: null,
  messages: [],
  eventCount: 0,

  // Actions
  setClaudeState: (data) =>
    set((state) => {
      state.claudeState = data;
      state.isConnected = true;
      state.lastError = null;
    }),

  setConnected: (connected) =>
    set((state) => {
      state.isConnected = connected;
    }),

  setError: (error) =>
    set((state) => {
      state.lastError = error;
      if (error) {
        state.isConnected = false;
      }
    }),

  addMessage: (message) =>
    set((state) => {
      const newMessage: TerminalMessage = {
        ...message,
        timestamp: new Date(),
      };
      state.messages.push(newMessage);
      // Keep only last 500 messages
      if (state.messages.length > 500) {
        state.messages = state.messages.slice(-500);
      }
    }),

  incrementEventCount: () =>
    set((state) => {
      state.eventCount += 1;
    }),

  resetClaude: () =>
    set((state) => {
      state.claudeState = null;
      state.isConnected = false;
      state.lastError = null;
      state.messages = [];
      state.eventCount = 0;
    }),
});
