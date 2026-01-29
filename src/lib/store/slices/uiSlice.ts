/**
 * UI slice - manages global UI state
 */

import { StateCreator } from 'zustand';
import type { ModalType, ActiveModule, Notification } from '../types';

export interface UISlice {
  // State
  sidebarCollapsed: boolean;
  activeModule: ActiveModule;
  activeModal: ModalType;
  modalData: Record<string, unknown> | null;
  notifications: Notification[];
  commandPaletteOpen: boolean;
  theme: 'dark' | 'light';

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActiveModule: (module: ActiveModule) => void;
  openModal: (modal: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createUISlice: StateCreator<
  UISlice,
  [['zustand/immer', never]],
  [],
  UISlice
> = (set) => ({
  // Initial state
  sidebarCollapsed: false,
  activeModule: 'dashboard',
  activeModal: null,
  modalData: null,
  notifications: [],
  commandPaletteOpen: false,
  theme: 'dark',

  // Actions
  setSidebarCollapsed: (collapsed) =>
    set((state) => {
      state.sidebarCollapsed = collapsed;
    }),

  toggleSidebar: () =>
    set((state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    }),

  setActiveModule: (module) =>
    set((state) => {
      state.activeModule = module;
    }),

  openModal: (modal, data) =>
    set((state) => {
      state.activeModal = modal;
      state.modalData = data ?? null;
    }),

  closeModal: () =>
    set((state) => {
      state.activeModal = null;
      state.modalData = null;
    }),

  addNotification: (notification) => {
    const id = generateId();
    set((state) => {
      state.notifications.push({
        ...notification,
        id,
        createdAt: Date.now(),
      });
      // Keep only last 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(-10);
      }
    });

    // Auto-remove after duration
    if (notification.duration !== 0) {
      const duration = notification.duration ?? 5000;
      setTimeout(() => {
        set((state) => {
          state.notifications = state.notifications.filter((n) => n.id !== id);
        });
      }, duration);
    }

    return id;
  },

  removeNotification: (id) =>
    set((state) => {
      state.notifications = state.notifications.filter((n) => n.id !== id);
    }),

  clearNotifications: () =>
    set((state) => {
      state.notifications = [];
    }),

  setCommandPaletteOpen: (open) =>
    set((state) => {
      state.commandPaletteOpen = open;
    }),

  toggleCommandPalette: () =>
    set((state) => {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    }),

  setTheme: (theme) =>
    set((state) => {
      state.theme = theme;
    }),
});
