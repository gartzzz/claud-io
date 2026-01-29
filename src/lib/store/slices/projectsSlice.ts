/**
 * Projects slice - manages code and content projects
 */

import { StateCreator } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Project, ProjectFile, GitStatus, ProjectSettings, ProjectType } from '@/types/project';

export interface ProjectsSlice {
  // State
  projects: Project[];
  activeProjectId: string | null;
  fileTree: ProjectFile | null;
  gitStatus: GitStatus | null;
  isLoading: boolean;
  openFiles: string[];
  activeFilePath: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  addProject: (path: string, type?: ProjectType) => Promise<Project>;
  removeProject: (id: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  setActiveProject: (id: string | null) => void;
  refreshFileTree: (projectId?: string) => Promise<void>;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  refreshGitStatus: (projectId?: string) => Promise<void>;
}

export const createProjectsSlice: StateCreator<
  ProjectsSlice,
  [['zustand/immer', never]],
  [],
  ProjectsSlice
> = (set, get) => ({
  // Initial state
  projects: [],
  activeProjectId: null,
  fileTree: null,
  gitStatus: null,
  isLoading: false,
  openFiles: [],
  activeFilePath: null,

  // Actions
  loadProjects: async () => {
    set((state) => {
      state.isLoading = true;
    });

    try {
      const projects = await invoke<Project[]>('project_list');
      set((state) => {
        state.projects = projects;
        state.isLoading = false;
      });
    } catch (error) {
      console.error('Failed to load projects:', error);
      set((state) => {
        state.isLoading = false;
      });
    }
  },

  addProject: async (path: string, type: ProjectType = 'code') => {
    try {
      const project = await invoke<Project>('project_add', { path, projectType: type });
      set((state) => {
        state.projects.push(project);
      });
      return project;
    } catch (error) {
      console.error('Failed to add project:', error);
      throw error;
    }
  },

  removeProject: async (id: string) => {
    try {
      await invoke('project_remove', { projectId: id });
      set((state) => {
        state.projects = state.projects.filter((p) => p.id !== id);
        if (state.activeProjectId === id) {
          state.activeProjectId = null;
          state.fileTree = null;
          state.gitStatus = null;
        }
      });
    } catch (error) {
      console.error('Failed to remove project:', error);
      throw error;
    }
  },

  updateProject: (id: string, updates: Partial<Project>) => {
    set((state) => {
      const project = state.projects.find((p) => p.id === id);
      if (project) {
        Object.assign(project, updates);
      }
    });
  },

  setActiveProject: (id: string | null) => {
    set((state) => {
      state.activeProjectId = id;
      if (!id) {
        state.fileTree = null;
        state.gitStatus = null;
      }
    });

    // Load file tree and git status for the project
    if (id) {
      get().refreshFileTree(id);
      get().refreshGitStatus(id);
    }
  },

  refreshFileTree: async (projectId?: string) => {
    const id = projectId ?? get().activeProjectId;
    if (!id) return;

    try {
      const fileTree = await invoke<ProjectFile>('project_get_file_tree', { projectId: id });
      set((state) => {
        state.fileTree = fileTree;
      });
    } catch (error) {
      console.error('Failed to refresh file tree:', error);
    }
  },

  openFile: (path: string) => {
    set((state) => {
      if (!state.openFiles.includes(path)) {
        state.openFiles.push(path);
      }
      state.activeFilePath = path;
    });
  },

  closeFile: (path: string) => {
    set((state) => {
      state.openFiles = state.openFiles.filter((f) => f !== path);
      if (state.activeFilePath === path) {
        state.activeFilePath = state.openFiles[state.openFiles.length - 1] ?? null;
      }
    });
  },

  setActiveFile: (path: string | null) => {
    set((state) => {
      state.activeFilePath = path;
    });
  },

  refreshGitStatus: async (projectId?: string) => {
    const id = projectId ?? get().activeProjectId;
    if (!id) return;

    try {
      const gitStatus = await invoke<GitStatus | null>('project_git_status', { projectId: id });
      set((state) => {
        state.gitStatus = gitStatus;
      });
    } catch (error) {
      console.error('Failed to refresh git status:', error);
    }
  },
});
