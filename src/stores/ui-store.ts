import { create } from 'zustand';

type DrawerType = 'contact' | 'company' | 'deal' | 'task' | 'activity' | null;

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Drawers — one open at a time, with optional entity ID for edit mode
  activeDrawer: DrawerType;
  drawerEntityId: string | null;
  openDrawer: (type: DrawerType, entityId?: string | null) => void;
  closeDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  activeDrawer: null,
  drawerEntityId: null,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  openDrawer: (type, entityId = null) =>
    set({ activeDrawer: type, drawerEntityId: entityId }),
  closeDrawer: () => set({ activeDrawer: null, drawerEntityId: null }),
}));
