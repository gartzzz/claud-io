'use client';

/**
 * useKeyboardShortcuts hook - handles global keyboard shortcuts
 */

import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import type { ActiveModule } from '../store/types';

const MODULE_SHORTCUTS: Record<string, ActiveModule> = {
  '1': 'dashboard',
  '2': 'terminal',
  '3': 'projects',
  '4': 'agents',
  '5': 'content',
};

export function useKeyboardShortcuts() {
  const {
    toggleCommandPalette,
    toggleSidebar,
    setActiveModule,
    activeModule,
  } = useAppStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? event.metaKey : event.ctrlKey;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    // Command Palette: Cmd/Ctrl + K
    if (modifier && event.key === 'k') {
      event.preventDefault();
      toggleCommandPalette();
      return;
    }

    // Toggle Sidebar: Cmd/Ctrl + B
    if (modifier && event.key === 'b') {
      event.preventDefault();
      toggleSidebar();
      return;
    }

    // Module shortcuts: Cmd/Ctrl + 1-5
    if (modifier && MODULE_SHORTCUTS[event.key]) {
      event.preventDefault();
      setActiveModule(MODULE_SHORTCUTS[event.key]);
      return;
    }

    // Terminal focus: Cmd/Ctrl + `
    if (modifier && event.key === '`') {
      event.preventDefault();
      const store = useAppStore.getState();
      store.setTerminalPanelOpen(!store.isTerminalPanelOpen);
      return;
    }

    // Escape: Close modals/command palette
    if (event.key === 'Escape') {
      const store = useAppStore.getState();
      if (store.commandPaletteOpen) {
        store.setCommandPaletteOpen(false);
        return;
      }
      if (store.activeModal) {
        store.closeModal();
        return;
      }
    }
  }, [toggleCommandPalette, toggleSidebar, setActiveModule]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
