import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  language: 'en' | 'hi' | 'mr';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  language: 'en',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLanguage: (language) => set({ language }),
}));
