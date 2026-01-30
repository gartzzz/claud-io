/**
 * Terminal types for Claud.io
 */

export interface TerminalSession {
  id: string;
  title: string;
  createdAt: number;
  isActive: boolean;
  shell: string;
  cwd: string;
}

export interface TerminalOutput {
  sessionId: string;
  data: Uint8Array;
}

export interface TerminalExit {
  sessionId: string;
  code: number;
}

export interface TerminalState {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  outputBuffers: Map<string, Uint8Array[]>;
}

export interface TerminalActions {
  createSession: (shell?: string) => Promise<TerminalSession>;
  killSession: (id: string) => Promise<void>;
  setActiveSession: (id: string) => void;
  writeInput: (sessionId: string, data: Uint8Array) => Promise<void>;
  resize: (sessionId: string, cols: number, rows: number) => Promise<void>;
  appendOutput: (sessionId: string, data: Uint8Array) => void;
  clearOutputBuffer: (sessionId: string) => void;
}
