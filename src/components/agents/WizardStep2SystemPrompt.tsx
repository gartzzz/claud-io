'use client';

/**
 * WizardStep2SystemPrompt - Second step of agent creation wizard
 *
 * Features:
 * - Large textarea for system prompt
 * - Character count with model context limits
 * - Import from template dropdown
 * - AI-powered prompt optimization
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useWizardFormData,
  useWizardActions,
  useIsOptimizing,
  useOptimizedPrompt,
  useAgentDefinitions,
} from '@/lib/store';

// Approximate token counts for context windows
const modelContextLimits: Record<string, number> = {
  sonnet: 200000,
  opus: 200000,
  haiku: 200000,
};

// Rough estimate: 1 token ≈ 4 characters
const estimateTokens = (text: string) => Math.ceil(text.length / 4);

export function WizardStep2SystemPrompt() {
  const [showImport, setShowImport] = useState(false);
  const formData = useWizardFormData();
  const { updateFormData, importTemplate, optimizePrompt, acceptOptimizedPrompt, rejectOptimizedPrompt } = useWizardActions();
  const isOptimizing = useIsOptimizing();
  const optimizedPrompt = useOptimizedPrompt();
  const agentDefinitions = useAgentDefinitions();

  const tokenCount = estimateTokens(formData.systemPrompt);
  const contextLimit = modelContextLimits[formData.model] || 200000;
  const percentUsed = (tokenCount / contextLimit) * 100;

  const handleImport = async (templateId: string) => {
    await importTemplate(templateId);
    setShowImport(false);
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <label className="font-mono text-sm text-smoke-mid">
          System Prompt <span className="text-state-error">*</span>
        </label>
        <div className="flex items-center gap-2">
          {/* Import from template */}
          <div className="relative">
            <button
              onClick={() => setShowImport(!showImport)}
              className="px-3 py-1.5 rounded-lg font-mono text-xs text-smoke-mid hover:text-smoke-bright
                         bg-void-lighter/50 hover:bg-void-lighter border border-amber-wire/20
                         transition-colors flex items-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2v8M2 6h8" />
              </svg>
              Import Template
            </button>

            <AnimatePresence>
              {showImport && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-64 max-h-48 overflow-y-auto
                             bg-void-mid border border-amber-wire/30 rounded-lg shadow-xl z-10"
                >
                  {agentDefinitions.length === 0 ? (
                    <div className="px-3 py-4 text-center">
                      <p className="font-mono text-xs text-smoke-dim">No templates available</p>
                      <p className="font-mono text-xs text-smoke-dim mt-1">Sync agents first</p>
                    </div>
                  ) : (
                    agentDefinitions.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => handleImport(agent.id)}
                        className="w-full px-3 py-2 text-left hover:bg-void-lighter/50 transition-colors"
                      >
                        <span className="font-mono text-xs text-smoke-bright block truncate">
                          {agent.name}
                        </span>
                        <span className="font-mono text-xs text-smoke-dim block truncate">
                          {agent.description || 'No description'}
                        </span>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Optimize with AI */}
          <button
            onClick={optimizePrompt}
            disabled={isOptimizing || !formData.systemPrompt.trim()}
            className={`
              px-3 py-1.5 rounded-lg font-mono text-xs transition-colors flex items-center gap-2
              ${isOptimizing || !formData.systemPrompt.trim()
                ? 'text-smoke-dim bg-void-lighter/30 cursor-not-allowed'
                : 'text-amber-electric bg-amber-electric/10 hover:bg-amber-electric/20 border border-amber-electric/30'
              }
            `}
          >
            {isOptimizing ? (
              <>
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" className="opacity-75" />
                </svg>
                Optimizing...
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.5 1.5M8 8l1.5 1.5M9.5 2.5L8 4M4 8l-1.5 1.5" />
                </svg>
                Optimize with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optimized prompt diff */}
      <AnimatePresence>
        {optimizedPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-lg bg-state-success/10 border border-state-success/30">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm text-state-success">AI Optimized Version</span>
                <div className="flex gap-2">
                  <button
                    onClick={rejectOptimizedPrompt}
                    className="px-3 py-1 rounded font-mono text-xs text-smoke-mid hover:text-state-error transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={acceptOptimizedPrompt}
                    className="px-3 py-1 rounded font-mono text-xs bg-state-success text-void-deepest hover:bg-state-success/80 transition-colors"
                  >
                    Accept
                  </button>
                </div>
              </div>
              <pre className="font-mono text-xs text-smoke-mid whitespace-pre-wrap max-h-40 overflow-y-auto">
                {optimizedPrompt}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main textarea */}
      <div className="relative">
        <textarea
          value={formData.systemPrompt}
          onChange={(e) => updateFormData({ systemPrompt: e.target.value })}
          placeholder={`You are a helpful AI assistant specialized in...

Define your agent's:
- Role and expertise
- Communication style
- Behavioral guidelines
- Constraints and limitations`}
          rows={12}
          className="w-full px-4 py-3 rounded-lg bg-void-lighter/50 border border-amber-wire/20
                     font-mono text-sm text-smoke-bright placeholder:text-smoke-dim
                     focus:outline-none focus:border-amber-electric/50 focus:ring-1 focus:ring-amber-electric/20
                     transition-colors resize-none"
        />

        {/* Character/token count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-3">
          <span className={`font-mono text-xs ${
            percentUsed > 80 ? 'text-state-warning' :
            percentUsed > 95 ? 'text-state-error' : 'text-smoke-dim'
          }`}>
            ~{tokenCount.toLocaleString()} tokens
          </span>
          <div className="w-20 h-1 bg-void-lighter rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                percentUsed > 80 ? 'bg-state-warning' :
                percentUsed > 95 ? 'bg-state-error' : 'bg-amber-electric'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="p-3 rounded-lg bg-void-lighter/30 border border-amber-wire/10">
        <p className="font-mono text-xs text-smoke-dim">
          <span className="text-amber-electric">Tip:</span> Be specific about your agent&apos;s expertise,
          define clear boundaries, and include example scenarios for better results.
        </p>
      </div>
    </div>
  );
}

export default WizardStep2SystemPrompt;
