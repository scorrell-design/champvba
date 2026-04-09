import { create } from 'zustand'
import type { DuplicateQueueItem, MergeEvent } from '../types/duplicate'

interface DuplicateState {
  queueItems: DuplicateQueueItem[]
  mergeEvents: MergeEvent[]
  setQueueItems: (items: DuplicateQueueItem[]) => void
  updateQueueItem: (id: string, updates: Partial<DuplicateQueueItem>) => void
  addMergeEvent: (event: MergeEvent) => void
  getUnresolvedCount: () => number
  getHighConfidenceUnresolvedCount: () => number
  getNewTodayCount: () => number
}

export const useDuplicateStore = create<DuplicateState>((set, get) => ({
  queueItems: [],
  mergeEvents: [],

  setQueueItems: (items) => set({ queueItems: items }),

  updateQueueItem: (id, updates) =>
    set((s) => ({
      queueItems: s.queueItems.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item,
      ),
    })),

  addMergeEvent: (event) =>
    set((s) => ({ mergeEvents: [event, ...s.mergeEvents] })),

  getUnresolvedCount: () =>
    get().queueItems.filter((i) => !['resolved', 'dismissed'].includes(i.status)).length,

  getHighConfidenceUnresolvedCount: () =>
    get().queueItems.filter(
      (i) => i.matchTier === 'high' && !['resolved', 'dismissed'].includes(i.status),
    ).length,

  getNewTodayCount: () => {
    const today = new Date().toISOString().slice(0, 10)
    return get().queueItems.filter(
      (i) => i.status === 'new' && i.createdAt.startsWith(today),
    ).length
  },
}))
