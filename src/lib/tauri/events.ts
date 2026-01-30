/**
 * Tauri event listeners for Claud.io
 *
 * Centralized event handling for all Tauri backend events
 */

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useAppStore } from '../store';
import type { ClaudeStateData } from '../store/types';

// Event payload types
interface TerminalOutputPayload {
  session_id: string;
  data: number[];
}

interface TerminalExitPayload {
  session_id: string;
  code: number;
}

interface AgentStatusPayload {
  agent_id: string;
  status: 'idle' | 'thinking' | 'working' | 'paused' | 'error' | 'sleeping';
  task_id?: string;
  message?: string;
}

interface TaskProgressPayload {
  task_id: string;
  progress: number;
  message: string;
}

interface TaskCompletedPayload {
  task_id: string;
  success: boolean;
  output?: string;
  error?: string;
}

// Listener references for cleanup
let unlisteners: UnlistenFn[] = [];

// Terminal output callbacks - mapped by session ID
const terminalOutputCallbacks = new Map<string, (data: Uint8Array) => void>();

/**
 * Register a callback for terminal output events
 */
export function onTerminalOutput(
  sessionId: string,
  callback: (data: Uint8Array) => void
): () => void {
  terminalOutputCallbacks.set(sessionId, callback);
  return () => {
    terminalOutputCallbacks.delete(sessionId);
  };
}

/**
 * Initialize all Tauri event listeners
 */
export async function initTauriListeners(): Promise<void> {
  // Clean up existing listeners
  await cleanupTauriListeners();

  const store = useAppStore.getState();

  // Claude state changed
  const unlistenClaudeState = await listen<ClaudeStateData>(
    'claude-state-changed',
    (event) => {
      const data = event.payload;
      const currentState = store.claudeState;

      // Update store
      store.setClaudeState(data);

      // Add message for state changes
      if (!currentState || currentState.state !== data.state) {
        store.addMessage({
          type: 'system',
          content: `State changed to ${data.state}`,
        });
      }

      // Add message for event changes
      if (!currentState || currentState.event !== data.event) {
        store.addMessage({
          type: 'event',
          content: data.event,
        });
        store.incrementEventCount();
      }

      // Add message for tool changes
      if (data.toolName && (!currentState || currentState.toolName !== data.toolName)) {
        store.addMessage({
          type: 'tool',
          content: `Using tool: ${data.toolName}`,
        });
      }
    }
  );
  unlisteners.push(unlistenClaudeState);

  // Terminal output
  const unlistenTerminalOutput = await listen<TerminalOutputPayload>(
    'terminal:output',
    (event) => {
      const { session_id, data } = event.payload;
      const callback = terminalOutputCallbacks.get(session_id);
      if (callback) {
        callback(new Uint8Array(data));
      }
    }
  );
  unlisteners.push(unlistenTerminalOutput);

  // Terminal exit
  const unlistenTerminalExit = await listen<TerminalExitPayload>(
    'terminal:exit',
    (event) => {
      const { session_id, code } = event.payload;
      store.removeSession(session_id);
      store.addNotification({
        type: code === 0 ? 'info' : 'warning',
        title: 'Terminal session ended',
        message: `Session exited with code ${code}`,
      });
    }
  );
  unlisteners.push(unlistenTerminalExit);

  // Agent status changed
  const unlistenAgentStatus = await listen<AgentStatusPayload>(
    'agent:status',
    (event) => {
      const { agent_id, status, task_id, message } = event.payload;
      store.updateAgentStatus(agent_id, status);

      if (message) {
        store.addNotification({
          type: 'info',
          title: 'Agent Update',
          message,
        });
      }
    }
  );
  unlisteners.push(unlistenAgentStatus);

  // Task progress
  const unlistenTaskProgress = await listen<TaskProgressPayload>(
    'task:progress',
    (event) => {
      const { task_id, progress, message } = event.payload;
      store.updateTask(task_id, {
        logs: [
          ...((store.tasks.find((t) => t.id === task_id)?.logs) || []),
          {
            timestamp: Date.now(),
            level: 'info',
            message: `[${progress}%] ${message}`,
          },
        ],
      });
    }
  );
  unlisteners.push(unlistenTaskProgress);

  // Task completed
  const unlistenTaskCompleted = await listen<TaskCompletedPayload>(
    'task:completed',
    (event) => {
      const { task_id, success, output, error } = event.payload;
      store.updateTask(task_id, {
        status: success ? 'completed' : 'failed',
        completedAt: Date.now(),
        result: {
          success,
          output,
          error,
        },
      });

      store.addNotification({
        type: success ? 'success' : 'error',
        title: success ? 'Task Completed' : 'Task Failed',
        message: success ? output : error,
      });
    }
  );
  unlisteners.push(unlistenTaskCompleted);

  // Project file changed
  const unlistenProjectChanged = await listen<{ project_id: string; path: string }>(
    'project:changed',
    (event) => {
      const { project_id } = event.payload;
      if (store.activeProjectId === project_id) {
        store.refreshFileTree(project_id);
        store.refreshGitStatus(project_id);
      }
    }
  );
  unlisteners.push(unlistenProjectChanged);

  console.log('[Tauri Events] Listeners initialized');
}

/**
 * Clean up all Tauri event listeners
 */
export async function cleanupTauriListeners(): Promise<void> {
  for (const unlisten of unlisteners) {
    await unlisten();
  }
  unlisteners = [];
  terminalOutputCallbacks.clear();
  console.log('[Tauri Events] Listeners cleaned up');
}

/**
 * Check if running in Tauri environment
 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}
