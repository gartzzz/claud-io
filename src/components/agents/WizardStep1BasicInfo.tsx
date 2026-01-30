'use client';

/**
 * WizardStep1BasicInfo - First step of agent creation wizard
 *
 * Collects: Name, Description, Model, Mode
 */

import { useWizardFormData, useWizardActions, type AgentModel, type AgentMode } from '@/lib/store';

const models: { id: AgentModel; name: string; description: string }[] = [
  { id: 'sonnet', name: 'Claude Sonnet', description: 'Best balance of speed and capability' },
  { id: 'opus', name: 'Claude Opus', description: 'Most capable, slower and more expensive' },
  { id: 'haiku', name: 'Claude Haiku', description: 'Fastest and most affordable' },
];

const modes: { id: AgentMode; name: string; description: string }[] = [
  { id: 'normal', name: 'Normal', description: 'Requires approval for all actions' },
  { id: 'autonomous', name: 'Autonomous', description: 'Works independently on assigned tasks' },
  { id: 'supervised', name: 'Supervised', description: 'Requires approval for destructive actions only' },
];

export function WizardStep1BasicInfo() {
  const formData = useWizardFormData();
  const { updateFormData } = useWizardActions();

  return (
    <div className="space-y-6">
      {/* Name */}
      <div>
        <label className="block font-mono text-sm text-smoke-mid mb-2">
          Agent Name <span className="text-state-error">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="e.g., Code Reviewer, Content Writer"
          className="w-full px-4 py-3 rounded-lg bg-void-lighter/50 border border-amber-wire/20
                     font-mono text-smoke-bright placeholder:text-smoke-dim
                     focus:outline-none focus:border-amber-electric/50 focus:ring-1 focus:ring-amber-electric/20
                     transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-mono text-sm text-smoke-mid mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="What does this agent do? (optional)"
          rows={2}
          className="w-full px-4 py-3 rounded-lg bg-void-lighter/50 border border-amber-wire/20
                     font-mono text-sm text-smoke-bright placeholder:text-smoke-dim
                     focus:outline-none focus:border-amber-electric/50 focus:ring-1 focus:ring-amber-electric/20
                     transition-colors resize-none"
        />
      </div>

      {/* Model Selection */}
      <div>
        <label className="block font-mono text-sm text-smoke-mid mb-2">
          Model
        </label>
        <div className="grid grid-cols-3 gap-3">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => updateFormData({ model: model.id })}
              className={`
                p-3 rounded-lg border text-left transition-all
                ${formData.model === model.id
                  ? 'border-amber-electric bg-amber-electric/10'
                  : 'border-amber-wire/20 hover:border-amber-wire/40 bg-void-lighter/30'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    model.id === 'sonnet' ? 'bg-cyan-400' :
                    model.id === 'opus' ? 'bg-purple-400' : 'bg-emerald-400'
                  }`}
                />
                <span className={`font-mono text-sm ${
                  formData.model === model.id ? 'text-amber-electric' : 'text-smoke-bright'
                }`}>
                  {model.name}
                </span>
              </div>
              <p className="font-mono text-xs text-smoke-dim">{model.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selection */}
      <div>
        <label className="block font-mono text-sm text-smoke-mid mb-2">
          Operating Mode
        </label>
        <div className="space-y-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => updateFormData({ mode: mode.id })}
              className={`
                w-full p-3 rounded-lg border text-left transition-all flex items-start gap-3
                ${formData.mode === mode.id
                  ? 'border-amber-electric bg-amber-electric/10'
                  : 'border-amber-wire/20 hover:border-amber-wire/40 bg-void-lighter/30'
                }
              `}
            >
              <div className={`
                w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center
                ${formData.mode === mode.id ? 'border-amber-electric' : 'border-smoke-dim'}
              `}>
                {formData.mode === mode.id && (
                  <div className="w-2 h-2 rounded-full bg-amber-electric" />
                )}
              </div>
              <div>
                <span className={`font-mono text-sm ${
                  formData.mode === mode.id ? 'text-amber-electric' : 'text-smoke-bright'
                }`}>
                  {mode.name}
                </span>
                <p className="font-mono text-xs text-smoke-dim mt-0.5">{mode.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WizardStep1BasicInfo;
