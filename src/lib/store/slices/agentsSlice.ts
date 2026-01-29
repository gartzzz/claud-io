/**
 * Agents slice - manages autonomous agents and task queue
 */

import { StateCreator } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Agent, Task, AgentConfig, AgentType, TaskLog, TaskStatus, TaskPriority } from '@/types/agent';

export interface AgentsSlice {
  // State
  agents: Agent[];
  tasks: Task[];
  activeAgentId: string | null;
  isInitialized: boolean;
  taskQueue: {
    pending: number;
    running: number;
    completed: number;
    failed: number;
  };

  // Actions
  loadAgents: () => Promise<void>;
  createAgent: (config: Partial<AgentConfig> & { name: string; type: AgentType }) => Promise<Agent>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  startAgent: (id: string) => Promise<void>;
  stopAgent: (id: string) => Promise<void>;
  pauseAgent: (id: string) => Promise<void>;
  setActiveAgent: (id: string | null) => void;

  // Task actions
  loadTasks: (agentId?: string) => Promise<void>;
  createTask: (task: {
    title: string;
    description: string;
    agentId?: string;
    projectId?: string;
    priority?: TaskPriority;
    scheduledFor?: number;
    deadline?: number;
  }) => Promise<Task>;
  cancelTask: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  getAgentLogs: (id: string, limit?: number) => Promise<TaskLog[]>;

  // Internal
  updateAgentStatus: (id: string, status: Agent['status']) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateQueueCounts: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const createAgentsSlice: StateCreator<
  AgentsSlice,
  [['zustand/immer', never]],
  [],
  AgentsSlice
> = (set, get) => ({
  // Initial state
  agents: [],
  tasks: [],
  activeAgentId: null,
  isInitialized: false,
  taskQueue: {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
  },

  // Actions
  loadAgents: async () => {
    try {
      const agents = await invoke<Agent[]>('agent_list');
      set((state) => {
        state.agents = agents;
        state.isInitialized = true;
      });
    } catch (error) {
      console.error('Failed to load agents:', error);
      // Initialize with empty array if backend not ready
      set((state) => {
        state.agents = [];
        state.isInitialized = true;
      });
    }
  },

  createAgent: async (config) => {
    try {
      const agent = await invoke<Agent>('agent_create', { config });
      set((state) => {
        state.agents.push(agent);
      });
      return agent;
    } catch (error) {
      console.error('Failed to create agent:', error);
      // Create locally if backend not ready
      const agent: Agent = {
        id: generateId(),
        name: config.name,
        type: config.type,
        description: config.systemPrompt || `${config.type} agent`,
        status: 'idle',
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        config: {
          model: config.model || 'claude-sonnet-4-20250514',
          systemPrompt: config.systemPrompt || '',
          tools: config.tools || [],
          maxConcurrentTasks: config.maxConcurrentTasks || 1,
          autoAssign: config.autoAssign ?? true,
          ...config,
        },
        stats: {
          tasksCompleted: 0,
          tasksFailed: 0,
          totalTokensUsed: 0,
          averageTaskDuration: 0,
          userSatisfaction: 0,
        },
      };
      set((state) => {
        state.agents.push(agent);
      });
      return agent;
    }
  },

  updateAgent: async (id: string, updates: Partial<Agent>) => {
    try {
      await invoke('agent_update', { agentId: id, updates });
    } catch (error) {
      console.error('Failed to update agent:', error);
    }
    set((state) => {
      const agent = state.agents.find((a) => a.id === id);
      if (agent) {
        Object.assign(agent, updates);
      }
    });
  },

  deleteAgent: async (id: string) => {
    try {
      await invoke('agent_delete', { agentId: id });
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
    set((state) => {
      state.agents = state.agents.filter((a) => a.id !== id);
      if (state.activeAgentId === id) {
        state.activeAgentId = null;
      }
    });
  },

  startAgent: async (id: string) => {
    try {
      await invoke('agent_start', { agentId: id });
      get().updateAgentStatus(id, 'idle');
    } catch (error) {
      console.error('Failed to start agent:', error);
      get().updateAgentStatus(id, 'idle');
    }
  },

  stopAgent: async (id: string) => {
    try {
      await invoke('agent_stop', { agentId: id });
      get().updateAgentStatus(id, 'idle');
    } catch (error) {
      console.error('Failed to stop agent:', error);
      get().updateAgentStatus(id, 'idle');
    }
  },

  pauseAgent: async (id: string) => {
    try {
      await invoke('agent_pause', { agentId: id });
      get().updateAgentStatus(id, 'paused');
    } catch (error) {
      console.error('Failed to pause agent:', error);
      get().updateAgentStatus(id, 'paused');
    }
  },

  setActiveAgent: (id: string | null) => {
    set((state) => {
      state.activeAgentId = id;
    });
  },

  loadTasks: async (agentId?: string) => {
    try {
      const tasks = await invoke<Task[]>('task_list', { agentId });
      set((state) => {
        state.tasks = tasks;
      });
      get().updateQueueCounts();
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  },

  createTask: async (taskInput) => {
    const task: Task = {
      id: generateId(),
      agentId: taskInput.agentId ?? null,
      projectId: taskInput.projectId,
      title: taskInput.title,
      description: taskInput.description,
      status: 'pending',
      priority: taskInput.priority || 'normal',
      createdAt: Date.now(),
      scheduledFor: taskInput.scheduledFor,
      deadline: taskInput.deadline,
      logs: [],
    };

    try {
      const createdTask = await invoke<Task>('task_create', { task });
      set((state) => {
        state.tasks.push(createdTask);
      });
      get().updateQueueCounts();
      return createdTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      // Create locally if backend not ready
      set((state) => {
        state.tasks.push(task);
      });
      get().updateQueueCounts();
      return task;
    }
  },

  cancelTask: async (id: string) => {
    try {
      await invoke('task_cancel', { taskId: id });
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
    get().updateTaskStatus(id, 'cancelled');
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      if (task) {
        Object.assign(task, updates);
      }
    });
    get().updateQueueCounts();
  },

  getAgentLogs: async (id: string, limit: number = 100) => {
    try {
      const logs = await invoke<TaskLog[]>('agent_get_logs', { agentId: id, limit });
      return logs;
    } catch (error) {
      console.error('Failed to get agent logs:', error);
      return [];
    }
  },

  updateAgentStatus: (id: string, status: Agent['status']) => {
    set((state) => {
      const agent = state.agents.find((a) => a.id === id);
      if (agent) {
        agent.status = status;
        agent.lastActiveAt = Date.now();
      }
    });
  },

  updateTaskStatus: (id: string, status: TaskStatus) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      if (task) {
        task.status = status;
        if (status === 'running') {
          task.startedAt = Date.now();
        } else if (status === 'completed' || status === 'failed' || status === 'cancelled') {
          task.completedAt = Date.now();
        }
      }
    });
    get().updateQueueCounts();
  },

  updateQueueCounts: () => {
    set((state) => {
      const tasks = state.tasks;
      state.taskQueue = {
        pending: tasks.filter((t) => t.status === 'pending' || t.status === 'assigned').length,
        running: tasks.filter((t) => t.status === 'running').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
        failed: tasks.filter((t) => t.status === 'failed' || t.status === 'cancelled').length,
      };
    });
  },
});
