/**
 * Project types for Claud.io
 */

export type ProjectType = 'code' | 'content' | 'mixed';

export interface Project {
  id: string;
  name: string;
  path: string;
  type: ProjectType;
  description?: string;
  gitRemote?: string;
  lastOpened: number;
  createdAt: number;
  tags: string[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  defaultBranch?: string;
  autoCommit?: boolean;
  watchPatterns?: string[];
  ignorePatterns?: string[];
}

export interface ProjectFile {
  path: string;
  name: string;
  isDirectory: boolean;
  size?: number;
  modifiedAt?: number;
  children?: ProjectFile[];
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  modified: string[];
  untracked: string[];
}

export interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  fileTree: ProjectFile | null;
  gitStatus: GitStatus | null;
  isLoading: boolean;
}

export interface ProjectActions {
  loadProjects: () => Promise<void>;
  addProject: (path: string) => Promise<Project>;
  removeProject: (id: string) => Promise<void>;
  setActiveProject: (id: string) => void;
  refreshFileTree: () => Promise<void>;
  openFile: (path: string) => Promise<string>;
  saveFile: (path: string, content: string) => Promise<void>;
  getGitStatus: () => Promise<GitStatus>;
}
