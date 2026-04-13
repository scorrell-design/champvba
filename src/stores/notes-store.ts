import { create } from 'zustand'
import type { Note } from '../types/common'

interface NotesState {
  added: Record<string, Note[]>
  edited: Record<string, Note>
  archived: Record<string, boolean>
  addNote: (entityId: string, note: Note) => void
  editNote: (entityId: string, noteId: string, newText: string, editedBy: string) => void
  archiveNote: (entityId: string, noteId: string, archivedBy: string) => void
  getNotesForEntity: (entityId: string, originalNotes: Note[]) => Note[]
}

export const useNotesStore = create<NotesState>((set, get) => ({
  added: {},
  edited: {},
  archived: {},

  addNote: (entityId, note) =>
    set((s) => ({
      added: {
        ...s.added,
        [entityId]: [note, ...(s.added[entityId] ?? [])],
      },
    })),

  editNote: (entityId, noteId, newText, editedBy) =>
    set((s) => {
      const editedNote = get().edited[noteId]
      const addedNotes = s.added[entityId] ?? []
      const existingNote = editedNote ?? addedNotes.find((n) => n.id === noteId)

      if (existingNote) {
        const now = new Date().toISOString()
        const prevEdit = { text: existingNote.text, editedAt: now, editedBy }
        const updated: Note = {
          ...existingNote,
          text: newText,
          lastEditedAt: now,
          lastEditedBy: editedBy,
          editHistory: [...(existingNote.editHistory ?? []), prevEdit],
        }
        return {
          edited: { ...s.edited, [noteId]: updated },
          added: {
            ...s.added,
            [entityId]: addedNotes.map((n) => (n.id === noteId ? updated : n)),
          },
        }
      }

      return {
        edited: {
          ...s.edited,
          [noteId]: {
            id: noteId,
            text: newText,
            author: '',
            createdAt: '',
            isAdmin: false,
            type: 'User Note' as const,
            lastEditedAt: new Date().toISOString(),
            lastEditedBy: editedBy,
            editHistory: [{ text: '', editedAt: new Date().toISOString(), editedBy }],
          },
        },
      }
    }),

  archiveNote: (_entityId, noteId, archivedBy) =>
    set((s) => ({
      archived: { ...s.archived, [noteId]: true },
      edited: {
        ...s.edited,
        [noteId]: {
          ...(s.edited[noteId] ?? { id: noteId, text: '', author: '', createdAt: '', isAdmin: false, type: 'User Note' as const }),
          archivedAt: new Date().toISOString(),
          archivedBy,
        },
      },
    })),

  getNotesForEntity: (entityId, originalNotes) => {
    const state = get()
    const addedNotes = state.added[entityId] ?? []
    return [...addedNotes, ...originalNotes]
  },
}))
