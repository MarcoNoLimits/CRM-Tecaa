import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      activeDrawer: null,
      drawerEntityId: null,
    });
  });

  it('toggles sidebar state', () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it('sets command palette state', () => {
    expect(useUIStore.getState().commandPaletteOpen).toBe(false);
    useUIStore.getState().setCommandPaletteOpen(true);
    expect(useUIStore.getState().commandPaletteOpen).toBe(true);
    useUIStore.getState().setCommandPaletteOpen(false);
    expect(useUIStore.getState().commandPaletteOpen).toBe(false);
  });

  it('opens and closes drawers with optional entityId', () => {
    expect(useUIStore.getState().activeDrawer).toBeNull();
    expect(useUIStore.getState().drawerEntityId).toBeNull();

    useUIStore.getState().openDrawer('contact', 'contact-123');
    expect(useUIStore.getState().activeDrawer).toBe('contact');
    expect(useUIStore.getState().drawerEntityId).toBe('contact-123');

    useUIStore.getState().closeDrawer();
    expect(useUIStore.getState().activeDrawer).toBeNull();
    expect(useUIStore.getState().drawerEntityId).toBeNull();
  });
});
