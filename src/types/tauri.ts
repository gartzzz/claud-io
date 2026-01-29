/**
 * Type definitions for Tauri commands and events
 */

import type { ClaudeStateData } from '@/lib/store';

/**
 * Tauri command types
 */
export interface TauriCommands {
  // Claude state commands
  get_claude_state: () => Promise<ClaudeStateData>;
  check_state_file_exists: () => Promise<boolean>;
  get_state_file_path: () => Promise<string>;

  // Terminal commands (existing)
  terminal_create_session: (shell?: string) => Promise<string>;
  terminal_write_input: (sessionId: string, data: string) => Promise<void>;
  terminal_resize: (sessionId: string, cols: number, rows: number) => Promise<void>;
  terminal_kill_session: (sessionId: string) => Promise<void>;
  terminal_list_sessions: () => Promise<string[]>;
  terminal_set_active: (sessionId: string) => Promise<void>;
  terminal_get_active: () => Promise<string | null>;
}

/**
 * Tauri event types
 */
export interface TauriEvents {
  'claude-state-changed': ClaudeStateData;
  'terminal-output': {
    session_id: string;
    data: string;
  };
  'terminal-exit': {
    session_id: string;
    code: number;
  };
}

/**
 * Global Tauri type augmentation
 */
declare global {
  interface Window {
    __TAURI__?: {
      invoke<K extends keyof TauriCommands>(
        cmd: K,
        args?: Parameters<TauriCommands[K]>[0]
      ): ReturnType<TauriCommands[K]>;
    };
  }
}
