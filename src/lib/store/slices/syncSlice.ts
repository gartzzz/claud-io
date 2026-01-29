/**
 * Sync slice - manages folder synchronization state
 *
 * Handles auto-sync of PROYECTOS folder and manual sync of MR-AGENTS repo.
 */

import { StateCreator } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

// ============================================================================
// Types
// ============================================================================

export type ProjectType = 'node' | 'rust' | 'python' | 'go' | 'unknown';

export interface DiscoveredProject {
  id: string;
  path: string;
  name: string;
  projectType: ProjectType;
  hasGit: boolean;
  lastModified: number;
  discoveredAt: number;
}

export interface AgentDefinition {
  id: string;
  filename: string;
  name: string;
  description: string;
  model: string;
  mode: string;
  systemPrompt: string;
  parsedAt: number;
  repoCommit: string | null;
}

export interface RepoStatus {
  branch: string;
  commit: string;
  hasChanges: boolean;
  ahead: number;
  behind: number;
}

export interface GitSyncResult {
  success: boolean;
  message: string;
  previousCommit: string | null;
  currentCommit: string | null;
  filesChanged: number;
}

// ============================================================================
// Slice Interface
// ============================================================================

export interface SyncSlice {
  // State
  discoveredProjects: DiscoveredProject[];
  agentDefinitions: AgentDefinition[];
  isWatchingProjects: boolean;
  isSyncingAgents: boolean;
  agentsRepoStatus: RepoStatus | null;
  projectsPath: string;
  agentsPath: string;
  lastProjectsSync: number | null;
  lastAgentsSync: number | null;

  // Actions
  discoverProjects: () => Promise<void>;
  startProjectWatch: () => Promise<void>;
  stopProjectWatch: () => Promise<void>;

  parseAgents: () => Promise<void>;
  pullAgentsRepo: () => Promise<GitSyncResult>;
  getAgentDefinition: (id: string) => Promise<AgentDefinition | null>;

  getProjectsPath: () => Promise<string>;
  getAgentsPath: () => Promise<string>;
  getAgentsRepoStatus: () => Promise<void>;

  // Event setup
  setupSyncEventListeners: () => Promise<UnlistenFn>;
}

// ============================================================================
// Slice Implementation
// ============================================================================

export const createSyncSlice: StateCreator<
  SyncSlice,
  [['zustand/immer', never]],
  [],
  SyncSlice
> = (set, get) => ({
  // Initial state
  discoveredProjects: [],
  agentDefinitions: [],
  isWatchingProjects: false,
  isSyncingAgents: false,
  agentsRepoStatus: null,
  projectsPath: '/Users/mikel/Desktop/PROYECTOS',
  agentsPath: '/Users/mikel/Claude/MR-AGENTS',
  lastProjectsSync: null,
  lastAgentsSync: null,

  // Actions
  discoverProjects: async () => {
    try {
      const projects = await invoke<DiscoveredProject[]>('sync_discover_projects');
      set((state) => {
        state.discoveredProjects = projects;
        state.lastProjectsSync = Date.now();
      });
    } catch (error) {
      console.error('Failed to discover projects:', error);
    }
  },

  startProjectWatch: async () => {
    try {
      await invoke('sync_start_project_watch');
      set((state) => {
        state.isWatchingProjects = true;
      });
      // Initial discovery
      await get().discoverProjects();
    } catch (error) {
      console.error('Failed to start project watch:', error);
    }
  },

  stopProjectWatch: async () => {
    try {
      await invoke('sync_stop_project_watch');
      set((state) => {
        state.isWatchingProjects = false;
      });
    } catch (error) {
      console.error('Failed to stop project watch:', error);
    }
  },

  parseAgents: async () => {
    set((state) => {
      state.isSyncingAgents = true;
    });

    try {
      const agents = await invoke<AgentDefinition[]>('sync_parse_agents');
      set((state) => {
        state.agentDefinitions = agents;
        state.lastAgentsSync = Date.now();
        state.isSyncingAgents = false;
      });
    } catch (error) {
      console.error('Failed to parse agents:', error);
      set((state) => {
        state.isSyncingAgents = false;
      });
    }
  },

  pullAgentsRepo: async () => {
    set((state) => {
      state.isSyncingAgents = true;
    });

    try {
      const result = await invoke<GitSyncResult>('sync_pull_agents_repo');

      // Refresh agents after pull
      if (result.success) {
        await get().parseAgents();
        await get().getAgentsRepoStatus();
      }

      set((state) => {
        state.isSyncingAgents = false;
      });

      return result;
    } catch (error) {
      console.error('Failed to pull agents repo:', error);
      set((state) => {
        state.isSyncingAgents = false;
      });
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        previousCommit: null,
        currentCommit: null,
        filesChanged: 0,
      };
    }
  },

  getAgentDefinition: async (id: string) => {
    try {
      const agent = await invoke<AgentDefinition>('sync_get_agent_definition', { agentId: id });
      return agent;
    } catch (error) {
      console.error('Failed to get agent definition:', error);
      return null;
    }
  },

  getProjectsPath: async () => {
    try {
      const path = await invoke<string>('sync_get_projects_path');
      set((state) => {
        state.projectsPath = path;
      });
      return path;
    } catch (error) {
      console.error('Failed to get projects path:', error);
      return get().projectsPath;
    }
  },

  getAgentsPath: async () => {
    try {
      const path = await invoke<string>('sync_get_agents_path');
      set((state) => {
        state.agentsPath = path;
      });
      return path;
    } catch (error) {
      console.error('Failed to get agents path:', error);
      return get().agentsPath;
    }
  },

  getAgentsRepoStatus: async () => {
    try {
      const status = await invoke<RepoStatus>('sync_get_agents_repo_status');
      set((state) => {
        state.agentsRepoStatus = status;
      });
    } catch (error) {
      console.error('Failed to get agents repo status:', error);
    }
  },

  setupSyncEventListeners: async () => {
    // Listen for project changes
    const unlisten = await listen('sync:projects-changed', () => {
      console.log('[Sync] Projects changed, refreshing...');
      get().discoverProjects();
    });

    return unlisten;
  },
});
