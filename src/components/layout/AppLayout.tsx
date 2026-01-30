'use client';

/**
 * AppLayout - Main application layout
 *
 * Provides the overall structure with sidebar, header, main content,
 * and collapsible terminal panel.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TerminalContainer } from '../terminal/TerminalContainer';
import { AmbientBackground } from '../AmbientBackground';
import { NotificationToasts } from './NotificationToasts';
import { CommandPalette } from './CommandPalette';
import { AgentCreationWizard } from '../agents';
import { useTauriEvents } from '@/lib/hooks/useTauriEvents';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useAppStore } from '@/lib/store';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Initialize Tauri events
  useTauriEvents();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  const isTerminalPanelOpen = useAppStore((state) => state.isTerminalPanelOpen);

  return (
    <div className="flex h-screen bg-void-deepest overflow-hidden">
      {/* Ambient Background */}
      <AmbientBackground />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Terminal Panel */}
        <TerminalContainer
          showHeader={true}
          collapsible={true}
        />
      </div>

      {/* Notification Toasts */}
      <NotificationToasts />

      {/* Command Palette */}
      <CommandPalette />

      {/* Agent Creation Wizard */}
      <AgentCreationWizard />
    </div>
  );
}

export default AppLayout;
