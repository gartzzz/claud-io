import { create } from 'zustand';
import { ClaudeState } from '@/components/ClaudeCore';

/**
 * State structure from the ~/.claude/claud-io-state.json file
 */
export interface ClaudeStateData {
  state: ClaudeState;
  event: string;
  sessionId: string;
  toolName: string | null;
  timestamp: string;
}

/**
 * Terminal message structure
 */
export interface TerminalMessage {
  timestamp: Date;
  type: 'system' | 'event' | 'tool' | 'error';
  content: string;
}

/**
 * Store state interface
 */
interface ClaudeStateStore {
  // Current Claude state
  stateData: ClaudeStateData | null;

  // Connection status
  isConnected: boolean;

  // Last error if any
  lastError: string | null;

  // Terminal messages
  messages: TerminalMessage[];

  // Event counter
  eventCount: number;

  // Actions
  setStateData: (data: ClaudeStateData) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  addMessage: (message: TerminalMessage) => void;
  incrementEventCount: () => void;
  reset: () => void;
}

/**
 * Default state data
 */
const defaultStateData: ClaudeStateData = {
  state: 'idle',
  event: 'unknown',
  sessionId: 'unknown',
  toolName: null,
  timestamp: new Date().toISOString(),
};

/**
 * Zustand store for Claude state management
 * This store is synchronized with the Tauri backend
 */
export const useClaudeStateStore = create<ClaudeStateStore>((set) => ({
  stateData: null,
  isConnected: false,
  lastError: null,
  messages: [],
  eventCount: 0,

  setStateData: (data) =>
    set({
      stateData: data,
      isConnected: true,
      lastError: null,
    }),

  setConnected: (connected) =>
    set({ isConnected: connected }),

  setError: (error) =>
    set({ lastError: error, isConnected: false }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  incrementEventCount: () =>
    set((state) => ({
      eventCount: state.eventCount + 1,
    })),

  reset: () =>
    set({
      stateData: null,
      isConnected: false,
      lastError: null,
      messages: [],
      eventCount: 0,
    }),
}));

/**
 * Selector hooks for convenient access to specific state parts
 */
export const useCurrentState = () =>
  useClaudeStateStore((state) => state.stateData?.state ?? 'idle');

export const useIsConnected = () =>
  useClaudeStateStore((state) => state.isConnected);

export const useCurrentEvent = () =>
  useClaudeStateStore((state) => state.stateData?.event ?? null);

export const useCurrentToolName = () =>
  useClaudeStateStore((state) => state.stateData?.toolName ?? null);

export const useLastError = () =>
  useClaudeStateStore((state) => state.lastError);

export const useMessages = () =>
  useClaudeStateStore((state) => state.messages);

export const useEventCount = () =>
  useClaudeStateStore((state) => state.eventCount);
