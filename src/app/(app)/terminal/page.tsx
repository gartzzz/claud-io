'use client';

/**
 * Terminal Page - Full terminal view
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TerminalContainer } from '@/components/terminal';
import { useAppStore } from '@/lib/store';

export default function TerminalPage() {
  const setTerminalPanelOpen = useAppStore((state) => state.setTerminalPanelOpen);

  // Ensure terminal is open when viewing this page
  useEffect(() => {
    setTerminalPanelOpen(true);
  }, [setTerminalPanelOpen]);

  return (
    <div className="h-full flex flex-col p-6">
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-mono text-lg text-smoke-bright">
          <span className="text-smoke-dim">// </span>Terminal Sessions
        </h1>
        <p className="font-mono text-sm text-smoke-dim mt-1">
          Manage your terminal sessions and interact with Claude Code
        </p>
      </motion.div>

      <motion.div
        className="flex-1 glass rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Terminal takes full height in this view */}
        <div className="h-full">
          <TerminalContainer
            showHeader={true}
            collapsible={false}
            className="h-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
