/**
 * Wizard slice - manages Agent Creation Wizard state
 */

import { StateCreator } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

// ============================================================================
// Types
// ============================================================================

export type WizardStep = 1 | 2 | 3 | 4;

export type AgentModel = 'sonnet' | 'opus' | 'haiku';
export type AgentMode = 'normal' | 'autonomous' | 'supervised';

export interface WizardFormData {
  name: string;
  description: string;
  model: AgentModel;
  mode: AgentMode;
  systemPrompt: string;
  tools: string[];
  autoAssign: boolean;
  workingHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface WizardSlice {
  // State
  wizardOpen: boolean;
  wizardStep: WizardStep;
  wizardFormData: WizardFormData;
  isOptimizing: boolean;
  optimizedPrompt: string | null;
  isCreating: boolean;
  wizardError: string | null;

  // Actions
  openWizard: () => void;
  closeWizard: () => void;
  resetWizard: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: WizardStep) => void;
  updateFormData: (data: Partial<WizardFormData>) => void;
  importTemplate: (templateId: string) => Promise<void>;
  optimizePrompt: () => Promise<void>;
  acceptOptimizedPrompt: () => void;
  rejectOptimizedPrompt: () => void;
  createAgentFromWizard: () => Promise<void>;
}

// ============================================================================
// Default Values
// ============================================================================

const defaultFormData: WizardFormData = {
  name: '',
  description: '',
  model: 'sonnet',
  mode: 'normal',
  systemPrompt: '',
  tools: ['Read', 'Edit', 'Write', 'Bash', 'Glob', 'Grep'],
  autoAssign: true,
  workingHours: {
    enabled: false,
    start: '09:00',
    end: '17:00',
  },
};

// Available tools for agents
export const availableTools = [
  { id: 'Read', name: 'Read', description: 'Read files from the filesystem' },
  { id: 'Edit', name: 'Edit', description: 'Edit existing files' },
  { id: 'Write', name: 'Write', description: 'Create new files' },
  { id: 'Bash', name: 'Bash', description: 'Execute shell commands' },
  { id: 'Glob', name: 'Glob', description: 'Find files by pattern' },
  { id: 'Grep', name: 'Grep', description: 'Search file contents' },
  { id: 'WebFetch', name: 'WebFetch', description: 'Fetch web content' },
  { id: 'WebSearch', name: 'WebSearch', description: 'Search the web' },
  { id: 'Task', name: 'Task', description: 'Spawn sub-agents for complex tasks' },
];

// ============================================================================
// Slice Implementation
// ============================================================================

export const createWizardSlice: StateCreator<
  WizardSlice,
  [['zustand/immer', never]],
  [],
  WizardSlice
> = (set, get) => ({
  // Initial state
  wizardOpen: false,
  wizardStep: 1,
  wizardFormData: { ...defaultFormData },
  isOptimizing: false,
  optimizedPrompt: null,
  isCreating: false,
  wizardError: null,

  // Actions
  openWizard: () => {
    set((state) => {
      state.wizardOpen = true;
      state.wizardStep = 1;
      state.wizardFormData = { ...defaultFormData };
      state.wizardError = null;
      state.optimizedPrompt = null;
    });
  },

  closeWizard: () => {
    set((state) => {
      state.wizardOpen = false;
    });
  },

  resetWizard: () => {
    set((state) => {
      state.wizardStep = 1;
      state.wizardFormData = { ...defaultFormData };
      state.wizardError = null;
      state.optimizedPrompt = null;
      state.isOptimizing = false;
      state.isCreating = false;
    });
  },

  nextStep: () => {
    set((state) => {
      if (state.wizardStep < 4) {
        state.wizardStep = (state.wizardStep + 1) as WizardStep;
      }
    });
  },

  prevStep: () => {
    set((state) => {
      if (state.wizardStep > 1) {
        state.wizardStep = (state.wizardStep - 1) as WizardStep;
      }
    });
  },

  goToStep: (step: WizardStep) => {
    set((state) => {
      state.wizardStep = step;
    });
  },

  updateFormData: (data: Partial<WizardFormData>) => {
    set((state) => {
      state.wizardFormData = { ...state.wizardFormData, ...data };
    });
  },

  importTemplate: async (templateId: string) => {
    try {
      // Get agent definition from sync module
      const agent = await invoke<{
        name: string;
        description: string;
        model: string;
        mode: string;
        systemPrompt: string;
      }>('sync_get_agent_definition', { agentId: templateId });

      set((state) => {
        state.wizardFormData.name = agent.name + ' (Copy)';
        state.wizardFormData.description = agent.description;
        state.wizardFormData.model = (agent.model as AgentModel) || 'sonnet';
        state.wizardFormData.mode = (agent.mode as AgentMode) || 'normal';
        state.wizardFormData.systemPrompt = agent.systemPrompt;
      });
    } catch (error) {
      console.error('Failed to import template:', error);
      set((state) => {
        state.wizardError = 'Failed to import template';
      });
    }
  },

  optimizePrompt: async () => {
    const { systemPrompt, name, description } = get().wizardFormData;

    if (!systemPrompt.trim()) {
      set((state) => {
        state.wizardError = 'Please enter a system prompt first';
      });
      return;
    }

    set((state) => {
      state.isOptimizing = true;
      state.wizardError = null;
    });

    try {
      // In a real implementation, this would call Claude API
      // For now, we'll simulate optimization with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulated optimized prompt
      const optimized = `# ${name || 'Agent'} System Prompt

## Role
${description || 'You are a helpful AI assistant.'}

## Core Behavior
${systemPrompt}

## Guidelines
- Always be helpful and professional
- Ask clarifying questions when requirements are unclear
- Provide clear explanations for your decisions
- Handle errors gracefully and suggest alternatives

## Constraints
- Stay within the scope of your assigned tasks
- Request human approval for destructive operations
- Respect rate limits and resource constraints`;

      set((state) => {
        state.optimizedPrompt = optimized;
        state.isOptimizing = false;
      });
    } catch (error) {
      console.error('Failed to optimize prompt:', error);
      set((state) => {
        state.isOptimizing = false;
        state.wizardError = 'Failed to optimize prompt';
      });
    }
  },

  acceptOptimizedPrompt: () => {
    const optimized = get().optimizedPrompt;
    if (optimized) {
      set((state) => {
        state.wizardFormData.systemPrompt = optimized;
        state.optimizedPrompt = null;
      });
    }
  },

  rejectOptimizedPrompt: () => {
    set((state) => {
      state.optimizedPrompt = null;
    });
  },

  createAgentFromWizard: async () => {
    const formData = get().wizardFormData;

    // Validate
    if (!formData.name.trim()) {
      set((state) => {
        state.wizardError = 'Please enter an agent name';
      });
      return;
    }

    if (!formData.systemPrompt.trim()) {
      set((state) => {
        state.wizardError = 'Please enter a system prompt';
      });
      return;
    }

    set((state) => {
      state.isCreating = true;
      state.wizardError = null;
    });

    try {
      // Create the agent using the agents slice action
      await invoke('agent_create', {
        config: {
          name: formData.name,
          type: 'custom',
          description: formData.description,
          model: `claude-${formData.model}-4-20250514`,
          systemPrompt: formData.systemPrompt,
          tools: formData.tools,
          autoAssign: formData.autoAssign,
          maxConcurrentTasks: 1,
          workingHours: formData.workingHours.enabled
            ? {
                start: formData.workingHours.start,
                end: formData.workingHours.end,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }
            : undefined,
        },
      });

      // Close wizard on success
      set((state) => {
        state.isCreating = false;
        state.wizardOpen = false;
      });

      // Reset for next use
      get().resetWizard();
    } catch (error) {
      console.error('Failed to create agent:', error);
      set((state) => {
        state.isCreating = false;
        state.wizardError = error instanceof Error ? error.message : 'Failed to create agent';
      });
    }
  },
});
