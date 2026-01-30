/**
 * Re-export the new modular store
 *
 * This file exists for backward compatibility.
 * The actual store implementation is now in src/lib/store/index.ts
 */

export * from './store/index';

// Legacy export for backward compatibility
export { useAppStore as useClaudeStateStore } from './store/index';
