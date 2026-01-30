/**
 * Claud.io Zustand Store
 *
 * Unified store combining all feature slices with Immer for immutable updates
 */

import { create, StateCreator } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { ClaudeSlice, createClaudeSlice } from './slices/claudeSlice';
import { TerminalSlice, createTerminalSlice } from './slices/terminalSlice';
import { UISlice, createUISlice } from './slices/uiSlice';
import { ProjectsSlice, createProjectsSlice } from './slices/projectsSlice';
import { AgentsSlice, createAgentsSlice } from './slices/agentsSlice';
import { ContentSlice, createContentSlice } from './slices/contentSlice';
import { SyncSlice, createSyncSlice } from './slices/syncSlice';
import { WizardSlice, createWizardSlice } from './slices/wizardSlice';

// Re-export types
export * from './types';
export type { ClaudeSlice } from './slices/claudeSlice';
export type { TerminalSlice } from './slices/terminalSlice';
export type { UISlice } from './slices/uiSlice';
export type { ProjectsSlice } from './slices/projectsSlice';
export type { AgentsSlice } from './slices/agentsSlice';
export type { ContentSlice } from './slices/contentSlice';
export type { SyncSlice, DiscoveredProject, AgentDefinition, RepoStatus, GitSyncResult } from './slices/syncSlice';
export type { WizardSlice, WizardStep, WizardFormData, AgentModel, AgentMode } from './slices/wizardSlice';
export { availableTools } from './slices/wizardSlice';

/**
 * Combined app state type
 */
export type AppState =
  & ClaudeSlice
  & TerminalSlice
  & UISlice
  & ProjectsSlice
  & AgentsSlice
  & ContentSlice
  & SyncSlice
  & WizardSlice;

/**
 * Slice creator type for use in slice files
 */
export type AppSliceCreator<T> = StateCreator<
  AppState,
  [['zustand/immer', never], ['zustand/devtools', never], ['zustand/subscribeWithSelector', never]],
  [],
  T
>;

/**
 * Main application store
 */
export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get, store) => ({
        ...createClaudeSlice(set as any, get as any, store as any),
        ...createTerminalSlice(set as any, get as any, store as any),
        ...createUISlice(set as any, get as any, store as any),
        ...createProjectsSlice(set as any, get as any, store as any),
        ...createAgentsSlice(set as any, get as any, store as any),
        ...createContentSlice(set as any, get as any, store as any),
        ...createSyncSlice(set as any, get as any, store as any),
        ...createWizardSlice(set as any, get as any, store as any),
      }))
    ),
    {
      name: 'claud-io-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================================================
// Claude State Selectors
// ============================================================================

export const useClaudeState = () =>
  useAppStore((state) => state.claudeState);

export const useCurrentState = () =>
  useAppStore((state) => state.claudeState?.state ?? 'idle');

export const useIsConnected = () =>
  useAppStore((state) => state.isConnected);

export const useCurrentEvent = () =>
  useAppStore((state) => state.claudeState?.event ?? null);

export const useCurrentToolName = () =>
  useAppStore((state) => state.claudeState?.toolName ?? null);

export const useLastError = () =>
  useAppStore((state) => state.lastError);

export const useMessages = () =>
  useAppStore((state) => state.messages);

export const useEventCount = () =>
  useAppStore((state) => state.eventCount);

// ============================================================================
// Terminal Selectors
// ============================================================================

export const useTerminalSessions = () =>
  useAppStore((state) => state.sessions);

export const useActiveSessionId = () =>
  useAppStore((state) => state.activeSessionId);

export const useActiveSession = () =>
  useAppStore((state) =>
    state.sessions.find((s) => s.id === state.activeSessionId) ?? null
  );

export const useIsTerminalOpen = () =>
  useAppStore((state) => state.isTerminalPanelOpen);

export const useTerminalPanelHeight = () =>
  useAppStore((state) => state.terminalPanelHeight);

// ============================================================================
// UI Selectors
// ============================================================================

export const useSidebarCollapsed = () =>
  useAppStore((state) => state.sidebarCollapsed);

export const useActiveModule = () =>
  useAppStore((state) => state.activeModule);

export const useActiveModal = () =>
  useAppStore((state) => state.activeModal);

export const useModalData = () =>
  useAppStore((state) => state.modalData);

export const useNotifications = () =>
  useAppStore((state) => state.notifications);

export const useCommandPaletteOpen = () =>
  useAppStore((state) => state.commandPaletteOpen);

export const useTheme = () =>
  useAppStore((state) => state.theme);

// ============================================================================
// Projects Selectors
// ============================================================================

export const useProjects = () =>
  useAppStore((state) => state.projects);

export const useActiveProjectId = () =>
  useAppStore((state) => state.activeProjectId);

export const useActiveProject = () =>
  useAppStore((state) =>
    state.projects.find((p) => p.id === state.activeProjectId) ?? null
  );

export const useFileTree = () =>
  useAppStore((state) => state.fileTree);

export const useGitStatus = () =>
  useAppStore((state) => state.gitStatus);

export const useOpenFiles = () =>
  useAppStore((state) => state.openFiles);

export const useActiveFilePath = () =>
  useAppStore((state) => state.activeFilePath);

// ============================================================================
// Agents Selectors
// ============================================================================

export const useAgents = () =>
  useAppStore((state) => state.agents);

export const useActiveAgentId = () =>
  useAppStore((state) => state.activeAgentId);

export const useActiveAgent = () =>
  useAppStore((state) =>
    state.agents.find((a) => a.id === state.activeAgentId) ?? null
  );

export const useTasks = () =>
  useAppStore((state) => state.tasks);

export const useTaskQueue = () =>
  useAppStore((state) => state.taskQueue);

export const useAgentTasks = (agentId: string) =>
  useAppStore((state) =>
    state.tasks.filter((t) => t.agentId === agentId)
  );

export const usePendingTasks = () =>
  useAppStore((state) =>
    state.tasks.filter((t) => t.status === 'pending' || t.status === 'assigned')
  );

export const useRunningTasks = () =>
  useAppStore((state) =>
    state.tasks.filter((t) => t.status === 'running')
  );

// ============================================================================
// Content Selectors
// ============================================================================

export const useCarousels = () =>
  useAppStore((state) => state.carousels);

export const useActiveCarouselId = () =>
  useAppStore((state) => state.activeCarouselId);

export const useActiveCarousel = () =>
  useAppStore((state) =>
    state.carousels.find((c) => c.id === state.activeCarouselId) ?? null
  );

export const useCopyResults = () =>
  useAppStore((state) => state.copyResults);

export const useIsGenerating = () =>
  useAppStore((state) => state.isGenerating);

export const useGenerationProgress = () =>
  useAppStore((state) => state.generationProgress);

// ============================================================================
// Action hooks (for components that need multiple actions)
// ============================================================================

export const useClaudeActions = () => {
  const store = useAppStore();
  return {
    setClaudeState: store.setClaudeState,
    setConnected: store.setConnected,
    setError: store.setError,
    addMessage: store.addMessage,
    incrementEventCount: store.incrementEventCount,
    resetClaude: store.resetClaude,
  };
};

export const useTerminalActions = () => {
  const store = useAppStore();
  return {
    createSession: store.createSession,
    killSession: store.killSession,
    setActiveSession: store.setActiveSession,
    writeInput: store.writeInput,
    resize: store.resize,
    setTerminalPanelOpen: store.setTerminalPanelOpen,
    setTerminalPanelHeight: store.setTerminalPanelHeight,
    loadSessions: store.loadSessions,
    updateSession: store.updateSession,
    removeSession: store.removeSession,
  };
};

export const useUIActions = () => {
  const store = useAppStore();
  return {
    setSidebarCollapsed: store.setSidebarCollapsed,
    toggleSidebar: store.toggleSidebar,
    setActiveModule: store.setActiveModule,
    openModal: store.openModal,
    closeModal: store.closeModal,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    setCommandPaletteOpen: store.setCommandPaletteOpen,
    toggleCommandPalette: store.toggleCommandPalette,
    setTheme: store.setTheme,
  };
};

export const useProjectsActions = () => {
  const store = useAppStore();
  return {
    loadProjects: store.loadProjects,
    addProject: store.addProject,
    removeProject: store.removeProject,
    updateProject: store.updateProject,
    setActiveProject: store.setActiveProject,
    refreshFileTree: store.refreshFileTree,
    openFile: store.openFile,
    closeFile: store.closeFile,
    setActiveFile: store.setActiveFile,
    refreshGitStatus: store.refreshGitStatus,
  };
};

export const useAgentsActions = () => {
  const store = useAppStore();
  return {
    loadAgents: store.loadAgents,
    createAgent: store.createAgent,
    updateAgent: store.updateAgent,
    deleteAgent: store.deleteAgent,
    startAgent: store.startAgent,
    stopAgent: store.stopAgent,
    pauseAgent: store.pauseAgent,
    setActiveAgent: store.setActiveAgent,
    loadTasks: store.loadTasks,
    createTask: store.createTask,
    cancelTask: store.cancelTask,
    updateTask: store.updateTask,
    getAgentLogs: store.getAgentLogs,
    updateAgentStatus: store.updateAgentStatus,
    updateTaskStatus: store.updateTaskStatus,
  };
};

export const useContentActions = () => {
  const store = useAppStore();
  return {
    loadCarousels: store.loadCarousels,
    createCarousel: store.createCarousel,
    updateCarousel: store.updateCarousel,
    deleteCarousel: store.deleteCarousel,
    setActiveCarousel: store.setActiveCarousel,
    addSlide: store.addSlide,
    updateSlide: store.updateSlide,
    removeSlide: store.removeSlide,
    reorderSlides: store.reorderSlides,
    duplicateSlide: store.duplicateSlide,
    generateCopy: store.generateCopy,
    generateCarouselContent: store.generateCarouselContent,
    exportCarousel: store.exportCarousel,
    loadCopyResults: store.loadCopyResults,
    deleteCopyResult: store.deleteCopyResult,
  };
};

// ============================================================================
// Sync Selectors
// ============================================================================

export const useDiscoveredProjects = () =>
  useAppStore((state) => state.discoveredProjects);

export const useAgentDefinitions = () =>
  useAppStore((state) => state.agentDefinitions);

export const useIsWatchingProjects = () =>
  useAppStore((state) => state.isWatchingProjects);

export const useIsSyncingAgents = () =>
  useAppStore((state) => state.isSyncingAgents);

export const useAgentsRepoStatus = () =>
  useAppStore((state) => state.agentsRepoStatus);

export const useProjectsPath = () =>
  useAppStore((state) => state.projectsPath);

export const useAgentsPath = () =>
  useAppStore((state) => state.agentsPath);

export const useLastProjectsSync = () =>
  useAppStore((state) => state.lastProjectsSync);

export const useLastAgentsSync = () =>
  useAppStore((state) => state.lastAgentsSync);

export const useSyncActions = () => {
  const store = useAppStore();
  return {
    discoverProjects: store.discoverProjects,
    startProjectWatch: store.startProjectWatch,
    stopProjectWatch: store.stopProjectWatch,
    parseAgents: store.parseAgents,
    pullAgentsRepo: store.pullAgentsRepo,
    getAgentDefinition: store.getAgentDefinition,
    getProjectsPath: store.getProjectsPath,
    getAgentsPath: store.getAgentsPath,
    getAgentsRepoStatus: store.getAgentsRepoStatus,
    setupSyncEventListeners: store.setupSyncEventListeners,
  };
};

// ============================================================================
// Wizard Selectors
// ============================================================================

export const useWizardOpen = () =>
  useAppStore((state) => state.wizardOpen);

export const useWizardStep = () =>
  useAppStore((state) => state.wizardStep);

export const useWizardFormData = () =>
  useAppStore((state) => state.wizardFormData);

export const useIsOptimizing = () =>
  useAppStore((state) => state.isOptimizing);

export const useOptimizedPrompt = () =>
  useAppStore((state) => state.optimizedPrompt);

export const useIsCreatingAgent = () =>
  useAppStore((state) => state.isCreating);

export const useWizardError = () =>
  useAppStore((state) => state.wizardError);

export const useWizardActions = () => {
  const store = useAppStore();
  return {
    openWizard: store.openWizard,
    closeWizard: store.closeWizard,
    resetWizard: store.resetWizard,
    nextStep: store.nextStep,
    prevStep: store.prevStep,
    goToStep: store.goToStep,
    updateFormData: store.updateFormData,
    importTemplate: store.importTemplate,
    optimizePrompt: store.optimizePrompt,
    acceptOptimizedPrompt: store.acceptOptimizedPrompt,
    rejectOptimizedPrompt: store.rejectOptimizedPrompt,
    createAgentFromWizard: store.createAgentFromWizard,
  };
};
