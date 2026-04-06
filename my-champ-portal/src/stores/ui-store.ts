import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  activeFilters: Record<string, string[]>
  setFilter: (key: string, values: string[]) => void
  clearFilters: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  activeFilters: {},
  setFilter: (key, values) =>
    set((s) => ({ activeFilters: { ...s.activeFilters, [key]: values } })),
  clearFilters: () => set({ activeFilters: {} }),
}))
