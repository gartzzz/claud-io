'use client';

/**
 * WizardStep4Review - Fourth step of agent creation wizard
 *
 * Features:
 * - Summary of all settings
 * - Preview of agent card
 * - Final confirmation
 */

import { useWizardFormData, useWizardActions, type WizardStep } from '@/lib/store';

const modelLabels: Record<string, string> = {
  sonnet: 'Claude Sonnet',
  opus: 'Claude Opus',
  haiku: 'Claude Haiku',
};

const modeLabels: Record<string, string> = {
  normal: 'Normal',
  autonomous: 'Autonomous',
  supervised: 'Supervised',
};

export function WizardStep4Review() {
  const formData = useWizardFormData();
  const { goToStep } = useWizardActions();

  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  return (
    <div className="space-y-6">
      {/* Agent Preview Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-void-mid to-void-deep border border-amber-wire/30">
        <div className="flex items-start gap-4">
          {/* Agent Avatar */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-electric/30 to-purple-500/30 flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
            </svg>
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-lg text-smoke-bright truncate">
              {formData.name || 'Unnamed Agent'}
            </h3>
            <p className="font-mono text-sm text-smoke-dim mt-1 line-clamp-2">
              {formData.description || 'No description provided'}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`
                px-2 py-0.5 rounded font-mono text-xs
                ${formData.model === 'opus' ? 'bg-purple-500/20 text-purple-400' :
                  formData.model === 'haiku' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-cyan-500/20 text-cyan-400'
                }
              `}>
                {modelLabels[formData.model]}
              </span>
              <span className="px-2 py-0.5 rounded font-mono text-xs bg-amber-electric/20 text-amber-electric">
                {modeLabels[formData.mode]}
              </span>
              <span className="px-2 py-0.5 rounded font-mono text-xs bg-void-lighter text-smoke-mid">
                {formData.tools.length} tools
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="space-y-4">
        <h4 className="font-mono text-sm text-smoke-mid uppercase tracking-wider">
          Configuration Summary
        </h4>

        {/* Basic Info */}
        <SummarySection
          title="Basic Info"
          step={1}
          onEdit={goToStep}
        >
          <SummaryRow label="Name" value={formData.name || '(not set)'} />
          <SummaryRow label="Model" value={modelLabels[formData.model]} />
          <SummaryRow label="Mode" value={modeLabels[formData.mode]} />
        </SummarySection>

        {/* System Prompt */}
        <SummarySection
          title="System Prompt"
          step={2}
          onEdit={goToStep}
        >
          <div className="p-3 rounded bg-void-lighter/30 font-mono text-xs text-smoke-mid max-h-24 overflow-y-auto">
            {formData.systemPrompt ? (
              <pre className="whitespace-pre-wrap">{formData.systemPrompt.slice(0, 300)}
                {formData.systemPrompt.length > 300 && '...'}
              </pre>
            ) : (
              <span className="text-smoke-dim italic">(not set)</span>
            )}
          </div>
          <p className="font-mono text-xs text-smoke-dim mt-2">
            ~{estimateTokens(formData.systemPrompt).toLocaleString()} tokens
          </p>
        </SummarySection>

        {/* Tools & Capabilities */}
        <SummarySection
          title="Tools & Capabilities"
          step={3}
          onEdit={goToStep}
        >
          <div className="flex flex-wrap gap-1">
            {formData.tools.map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 rounded bg-void-lighter font-mono text-xs text-smoke-mid"
              >
                {tool}
              </span>
            ))}
          </div>
          <SummaryRow
            label="Auto-Assign"
            value={formData.autoAssign ? 'Enabled' : 'Disabled'}
          />
          {formData.workingHours.enabled && (
            <SummaryRow
              label="Working Hours"
              value={`${formData.workingHours.start} - ${formData.workingHours.end}`}
            />
          )}
        </SummarySection>
      </div>

      {/* Confirmation */}
      <div className="p-4 rounded-lg bg-state-success/10 border border-state-success/30">
        <p className="font-mono text-sm text-state-success flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8" cy="8" r="6" />
            <path d="M5 8l2 2 4-4" />
          </svg>
          Ready to create your agent
        </p>
        <p className="font-mono text-xs text-smoke-dim mt-2">
          Click &quot;Create Agent&quot; to add this agent to your workspace.
          You can modify settings later.
        </p>
      </div>
    </div>
  );
}

interface SummarySectionProps {
  title: string;
  step: WizardStep;
  onEdit: (step: WizardStep) => void;
  children: React.ReactNode;
}

function SummarySection({ title, step, onEdit, children }: SummarySectionProps) {
  return (
    <div className="p-4 rounded-lg bg-void-lighter/20 border border-amber-wire/10">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-mono text-sm text-smoke-bright">{title}</h5>
        <button
          onClick={() => onEdit(step)}
          className="font-mono text-xs text-amber-electric hover:text-amber-bright transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs text-smoke-dim">{label}</span>
      <span className="font-mono text-xs text-smoke-bright">{value}</span>
    </div>
  );
}

export default WizardStep4Review;
