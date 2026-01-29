/**
 * Shared store types for Claud.io
 */

import type { ClaudeState } from '@/components/ClaudeCore';

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
 * Terminal message structure for event stream
 */
export interface TerminalMessage {
  timestamp: Date;
  type: 'system' | 'event' | 'tool' | 'error';
  content: string;
}

/**
 * UI Modal types
 */
export type ModalType =
  | 'command-palette'
  | 'new-project'
  | 'new-agent'
  | 'new-task'
  | 'settings'
  | 'export-carousel'
  | null;

/**
 * Active module/route
 */
export type ActiveModule =
  | 'dashboard'
  | 'terminal'
  | 'projects'
  | 'agents'
  | 'content';

/**
 * Notification type
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  createdAt: number;
}
