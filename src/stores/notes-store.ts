import { create } from 'zustand'
import type { Note } from '../types/common'

interface NotesState {
  added: Record<string, Note[]>
  addNote: (entityId: string, note: Note) => void
  getNotesForEntity: (entityId: string, originalNotes: Note[]) => Note[]
}

export const useNotesStore = create<NotesState>((set, get) => ({
  added: {},
  addNote: (entityId, note) =>
    set((s) => ({
      added: {
        ...s.added,
        [entityId]: [note, ...(s.added[entityId] ?? [])],
      },
    })),
  getNotesForEntity: (entityId, originalNotes) => {
    const addedNotes = get().added[entityId] ?? []
    return [...addedNotes, ...originalNotes]
  },
}))
