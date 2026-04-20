import { create } from 'zustand'

interface MemberSelectionStore {
  selectedIds: string[]
  toggleSelection: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  setSelection: (ids: string[]) => void
}

export const useMemberSelectionStore = create<MemberSelectionStore>((set) => ({
  selectedIds: [],
  toggleSelection: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((x) => x !== id)
        : [...state.selectedIds, id],
    })),
  selectAll: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  setSelection: (ids) => set({ selectedIds: ids }),
}))
