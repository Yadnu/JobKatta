import { describe, expect, it, beforeEach } from 'vitest';
import { useUiStore } from './uiStore';

// Reset the store before each test so state doesn't bleed between tests
beforeEach(() => {
  useUiStore.setState({ sidebarOpen: false, language: 'en' });
});

describe('uiStore', () => {
  it('initialises with sidebarOpen: false and language: "en"', () => {
    const { sidebarOpen, language } = useUiStore.getState();
    expect(sidebarOpen).toBe(false);
    expect(language).toBe('en');
  });

  it('toggleSidebar flips sidebarOpen from false to true', () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(true);
  });

  it('toggleSidebar flips sidebarOpen back to false on second call', () => {
    useUiStore.getState().toggleSidebar();
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });

  it('setSidebarOpen sets sidebarOpen to the given value', () => {
    useUiStore.getState().setSidebarOpen(true);
    expect(useUiStore.getState().sidebarOpen).toBe(true);
    useUiStore.getState().setSidebarOpen(false);
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });

  it('setLanguage updates the language', () => {
    useUiStore.getState().setLanguage('hi');
    expect(useUiStore.getState().language).toBe('hi');
  });

  it('setLanguage accepts all supported languages', () => {
    (['en', 'hi', 'mr'] as const).forEach((lang) => {
      useUiStore.getState().setLanguage(lang);
      expect(useUiStore.getState().language).toBe(lang);
    });
  });
});
