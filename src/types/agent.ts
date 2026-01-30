/**
 * Agent types for Claud.io
 */

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'paused' | 'error' | 'sleeping';

export type AgentType = 'copywriting' | 'design' | 'code-review' | 'code-generation' | 'research' | 'general';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  status: AgentStatus;
  createdAt: number;
  lastActiveAt: number;
  config: AgentConfig;
  stats: AgentStats;
}

export interface AgentConfig {
  model: string;
  systemPrompt: string;
  tools: string[];
  maxConcurrentTasks: number;
  autoAssign: boolean;
  workingHours?: {
    start: string;  // "09:00"
    end: string;    // "17:00"
    timezone: string;
  };
  allowedProjects?: string[];
  tokenLimit?: number;
  dailyBudget?: number;
}

export interface AgentStats {
  tasksCompleted: number;
  tasksFailed: number;
  totalTokensUsed: number;
  averageTaskDuration: number;
  userSatisfaction: number;
}

export interface Task {
  id: string;
  agentId: string | null;
  projectId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: number;
  scheduledFor?: number;
  deadline?: number;
  startedAt?: number;
  completedAt?: number;
  result?: TaskResult;
  logs: TaskLog[];
  dependsOn?: string[];
  blockedBy?: string[];
}

export type TaskStatus = 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled' | 'waiting';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface TaskResult {
  success: boolean;
  output?: string;
  error?: string;
  artifacts?: Artifact[];
  tokensUsed?: number;
}

export interface Artifact {
  type: 'code' | 'text' | 'image' | 'file';
  path?: string;
  content?: string;
  name: string;
}

export interface TaskLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, unknown>;
}

export interface AgentState {
  agents: Agent[];
  tasks: Task[];
  activeAgentId: string | null;
  isInitialized: boolean;
  taskQueue: {
    pending: number;
    running: number;
    completed: number;
  };
}

export interface AgentActions {
  loadAgents: () => Promise<void>;
  createAgent: (config: Partial<AgentConfig> & { name: string; type: AgentType }) => Promise<Agent>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  startAgent: (id: string) => Promise<void>;
  stopAgent: (id: string) => Promise<void>;
  pauseAgent: (id: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'logs' | 'status'> & { status?: TaskStatus }) => Promise<Task>;
  cancelTask: (id: string) => Promise<void>;
  getAgentLogs: (id: string, limit?: number) => Promise<TaskLog[]>;
}

export interface AgentMemory {
  id: string;
  agentId: string;
  type: 'episodic' | 'semantic' | 'procedural';
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  createdAt: number;
  accessCount: number;
  lastAccessed?: number;
  importance: number;
}
