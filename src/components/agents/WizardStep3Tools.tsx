'use client';

/**
 * WizardStep3Tools - Third step of agent creation wizard
 *
 * Features:
 * - Tool selection checkboxes
 * - Working hours configuration
 * - Auto-assign toggle
 */

import { useWizardFormData, useWizardActions, availableTools } from '@/lib/store';

export function WizardStep3Tools() {
  const formData = useWizardFormData();
  const { updateFormData } = useWizardActions();

  const toggleTool = (toolId: string) => {
    const newTools = formData.tools.includes(toolId)
      ? formData.tools.filter((t) => t !== toolId)
      : [...formData.tools, toolId];
    updateFormData({ tools: newTools });
  };

  const selectAllTools = () => {
    updateFormData({ tools: availableTools.map((t) => t.id) });
  };

  const clearAllTools = () => {
    updateFormData({ tools: [] });
  };

  return (
    <div className="space-y-6">
      {/* Tools Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-mono text-sm text-smoke-mid">
            Available Tools
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllTools}
              className="font-mono text-xs text-smoke-dim hover:text-smoke-bright transition-colors"
            >
              Select All
            </button>
            <span className="text-smoke-dim">|</span>
            <button
              onClick={clearAllTools}
              className="font-mono text-xs text-smoke-dim hover:text-smoke-bright transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={`
                p-3 rounded-lg border text-left transition-all flex items-start gap-3
                ${formData.tools.includes(tool.id)
                  ? 'border-amber-electric bg-amber-electric/10'
                  : 'border-amber-wire/20 hover:border-amber-wire/40 bg-void-lighter/30'
                }
              `}
            >
              <div className={`
                w-5 h-5 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors
                ${formData.tools.includes(tool.id)
                  ? 'border-amber-electric bg-amber-electric'
                  : 'border-smoke-dim'
                }
              `}>
                {formData.tools.includes(tool.id) && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6l3 3 5-6" className="text-void-deepest" />
                  </svg>
                )}
              </div>
              <div>
                <span className={`font-mono text-sm ${
                  formData.tools.includes(tool.id) ? 'text-amber-electric' : 'text-smoke-bright'
                }`}>
                  {tool.name}
                </span>
                <p className="font-mono text-xs text-smoke-dim mt-0.5">{tool.description}</p>
              </div>
            </button>
          ))}
        </div>

        {formData.tools.length === 0 && (
          <p className="font-mono text-xs text-state-warning mt-2">
            ⚠ At least one tool is required
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-amber-wire/10" />

      {/* Auto-assign Toggle */}
      <div>
        <button
          onClick={() => updateFormData({ autoAssign: !formData.autoAssign })}
          className="w-full p-4 rounded-lg border border-amber-wire/20 bg-void-lighter/30
                     hover:border-amber-wire/40 transition-all flex items-center justify-between"
        >
          <div className="text-left">
            <span className="font-mono text-sm text-smoke-bright block">Auto-Assign Tasks</span>
            <span className="font-mono text-xs text-smoke-dim">
              Automatically assign matching tasks from the queue
            </span>
          </div>
          <div className={`
            w-12 h-6 rounded-full relative transition-colors
            ${formData.autoAssign ? 'bg-amber-electric' : 'bg-void-lighter'}
          `}>
            <div className={`
              w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
              ${formData.autoAssign ? 'left-6' : 'left-0.5'}
            `} />
          </div>
        </button>
      </div>

      {/* Working Hours */}
      <div>
        <button
          onClick={() => updateFormData({
            workingHours: {
              ...formData.workingHours,
              enabled: !formData.workingHours.enabled,
            },
          })}
          className="w-full p-4 rounded-lg border border-amber-wire/20 bg-void-lighter/30
                     hover:border-amber-wire/40 transition-all flex items-center justify-between"
        >
          <div className="text-left">
            <span className="font-mono text-sm text-smoke-bright block">Working Hours</span>
            <span className="font-mono text-xs text-smoke-dim">
              Restrict agent activity to specific hours
            </span>
          </div>
          <div className={`
            w-12 h-6 rounded-full relative transition-colors
            ${formData.workingHours.enabled ? 'bg-amber-electric' : 'bg-void-lighter'}
          `}>
            <div className={`
              w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all
              ${formData.workingHours.enabled ? 'left-6' : 'left-0.5'}
            `} />
          </div>
        </button>

        {formData.workingHours.enabled && (
          <div className="mt-3 p-4 rounded-lg bg-void-lighter/20 border border-amber-wire/10">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="font-mono text-xs text-smoke-dim block mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.workingHours.start}
                  onChange={(e) => updateFormData({
                    workingHours: {
                      ...formData.workingHours,
                      start: e.target.value,
                    },
                  })}
                  className="w-full px-3 py-2 rounded bg-void-lighter/50 border border-amber-wire/20
                             font-mono text-sm text-smoke-bright
                             focus:outline-none focus:border-amber-electric/50"
                />
              </div>
              <span className="font-mono text-smoke-dim mt-5">to</span>
              <div className="flex-1">
                <label className="font-mono text-xs text-smoke-dim block mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.workingHours.end}
                  onChange={(e) => updateFormData({
                    workingHours: {
                      ...formData.workingHours,
                      end: e.target.value,
                    },
                  })}
                  className="w-full px-3 py-2 rounded bg-void-lighter/50 border border-amber-wire/20
                             font-mono text-sm text-smoke-bright
                             focus:outline-none focus:border-amber-electric/50"
                />
              </div>
            </div>
            <p className="font-mono text-xs text-smoke-dim mt-2">
              Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WizardStep3Tools;
