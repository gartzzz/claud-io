'use client';

/**
 * AgentCreationWizard - 4-step modal wizard for creating agents
 *
 * Steps:
 * 1. Basic Info - Name, Description, Model, Mode
 * 2. System Prompt - Prompt editor with AI optimization
 * 3. Tools & Capabilities - Tool selection and settings
 * 4. Review & Create - Summary and confirmation
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  useWizardOpen,
  useWizardStep,
  useWizardFormData,
  useWizardActions,
  useIsCreatingAgent,
  useWizardError,
} from '@/lib/store';
import { WizardStep1BasicInfo } from './WizardStep1BasicInfo';
import { WizardStep2SystemPrompt } from './WizardStep2SystemPrompt';
import { WizardStep3Tools } from './WizardStep3Tools';
import { WizardStep4Review } from './WizardStep4Review';

const steps = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'System Prompt' },
  { id: 3, label: 'Tools' },
  { id: 4, label: 'Review' },
];

export function AgentCreationWizard() {
  const isOpen = useWizardOpen();
  const currentStep = useWizardStep();
  const formData = useWizardFormData();
  const isCreating = useIsCreatingAgent();
  const error = useWizardError();
  const { closeWizard, nextStep, prevStep, goToStep, createAgentFromWizard } = useWizardActions();

  if (!isOpen) return null;

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.systemPrompt.trim().length > 0;
      case 3:
        return formData.tools.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 4) {
      createAgentFromWizard();
    } else {
      nextStep();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-void-deepest/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWizard}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl bg-void-deep border border-amber-wire/30 rounded-xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-amber-wire/20">
                <h2 className="font-mono text-lg text-smoke-bright">
                  <span className="text-smoke-dim">//</span> Create New Agent
                </h2>
                <button
                  onClick={closeWizard}
                  className="p-2 rounded-lg text-smoke-dim hover:text-smoke-bright hover:bg-void-lighter/50 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between px-6 py-3 bg-void-mid/50 border-b border-amber-wire/10">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => step.id < currentStep && goToStep(step.id as 1 | 2 | 3 | 4)}
                    disabled={step.id > currentStep}
                    className={`
                      flex items-center gap-2 transition-colors
                      ${step.id === currentStep ? 'text-amber-electric' : ''}
                      ${step.id < currentStep ? 'text-smoke-mid cursor-pointer hover:text-smoke-bright' : ''}
                      ${step.id > currentStep ? 'text-smoke-dim cursor-not-allowed' : ''}
                    `}
                  >
                    <span
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs
                        ${step.id === currentStep ? 'bg-amber-electric text-void-deepest' : ''}
                        ${step.id < currentStep ? 'bg-state-success/20 text-state-success' : ''}
                        ${step.id > currentStep ? 'bg-void-lighter text-smoke-dim' : ''}
                      `}
                    >
                      {step.id < currentStep ? '✓' : step.id}
                    </span>
                    <span className="font-mono text-xs hidden sm:inline">{step.label}</span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="px-6 py-4 min-h-[400px] max-h-[60vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentStep === 1 && <WizardStep1BasicInfo />}
                    {currentStep === 2 && <WizardStep2SystemPrompt />}
                    {currentStep === 3 && <WizardStep3Tools />}
                    {currentStep === 4 && <WizardStep4Review />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Error */}
              {error && (
                <div className="px-6 py-2 bg-state-error/10 border-t border-state-error/20">
                  <p className="font-mono text-sm text-state-error">{error}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-amber-wire/20 bg-void-mid/30">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`
                    px-4 py-2 rounded-lg font-mono text-sm transition-colors
                    ${currentStep === 1
                      ? 'text-smoke-dim cursor-not-allowed'
                      : 'text-smoke-mid hover:text-smoke-bright hover:bg-void-lighter/50'
                    }
                  `}
                >
                  ← Back
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-smoke-dim">
                    Step {currentStep} of 4
                  </span>
                </div>

                <button
                  onClick={handleNext}
                  disabled={!canGoNext() || isCreating}
                  className={`
                    px-4 py-2 rounded-lg font-mono text-sm transition-colors
                    ${canGoNext() && !isCreating
                      ? 'bg-amber-electric text-void-deepest hover:bg-amber-bright'
                      : 'bg-void-lighter text-smoke-dim cursor-not-allowed'
                    }
                  `}
                >
                  {isCreating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" className="opacity-75" />
                      </svg>
                      Creating...
                    </span>
                  ) : currentStep === 4 ? (
                    'Create Agent'
                  ) : (
                    'Next →'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AgentCreationWizard;
