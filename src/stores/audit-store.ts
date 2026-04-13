import { create } from 'zustand'
import type { AuditEntry } from '../types/audit'

interface AuditState {
  entries: AuditEntry[]
  addEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void
  logFieldChange: (params: {
    entityType: 'Member' | 'Group'
    entityId: string
    entityName: string
    fieldChanged: string
    oldValue: string
    newValue: string
    changedBy?: string
  }) => void
  logNote: (params: {
    entityType: 'Member' | 'Group'
    entityId: string
    entityName: string
    noteText: string
    changedBy?: string
  }) => void
  logNoteEdit: (params: {
    entityType: 'Member' | 'Group'
    entityId: string
    entityName: string
    noteId: string
    oldText: string
    newText: string
    changedBy?: string
  }) => void
  logNoteArchive: (params: {
    entityType: 'Member' | 'Group'
    entityId: string
    entityName: string
    noteId: string
    notePreview: string
    changedBy?: string
  }) => void
  getEntriesForEntity: (entityId: string, entityType: 'Member' | 'Group') => AuditEntry[]
}

const CURRENT_USER = 'Stephanie C.'

export const useAuditStore = create<AuditState>((set, get) => ({
  entries: [],

  addEntry: (entry) =>
    set((s) => ({
      entries: [
        {
          ...entry,
          id: `local-audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
        },
        ...s.entries,
      ],
    })),

  logFieldChange: ({ entityType, entityId, entityName, fieldChanged, oldValue, newValue, changedBy }) => {
    get().addEntry({
      entityType,
      entityId,
      entityName,
      fieldChanged,
      oldValue,
      newValue,
      changedBy: changedBy ?? CURRENT_USER,
      actionType: fieldChanged === 'Status' ? 'Status Changed' : 'Field Updated',
    })
  },

  logNote: ({ entityType, entityId, entityName, noteText, changedBy }) => {
    const preview = noteText.length > 100 ? noteText.slice(0, 100) + '...' : noteText
    get().addEntry({
      entityType,
      entityId,
      entityName,
      fieldChanged: 'Note',
      oldValue: '',
      newValue: `Note added: ${preview}`,
      changedBy: changedBy ?? CURRENT_USER,
      actionType: 'Note Added',
    })
  },

  logNoteEdit: ({ entityType, entityId, entityName, noteId: _noteId, oldText, newText, changedBy }) => {
    const oldPreview = oldText.length > 60 ? oldText.slice(0, 60) + '...' : oldText
    const newPreview = newText.length > 60 ? newText.slice(0, 60) + '...' : newText
    get().addEntry({
      entityType,
      entityId,
      entityName,
      fieldChanged: 'Note',
      oldValue: oldPreview,
      newValue: `Edited: ${newPreview}`,
      changedBy: changedBy ?? CURRENT_USER,
      actionType: 'Note Edited',
    })
  },

  logNoteArchive: ({ entityType, entityId, entityName, noteId: _noteId, notePreview, changedBy }) => {
    const preview = notePreview.length > 80 ? notePreview.slice(0, 80) + '...' : notePreview
    get().addEntry({
      entityType,
      entityId,
      entityName,
      fieldChanged: 'Note',
      oldValue: preview,
      newValue: 'Note archived',
      changedBy: changedBy ?? CURRENT_USER,
      actionType: 'Note Archived',
    })
  },

  getEntriesForEntity: (entityId, entityType) =>
    get().entries.filter((e) => e.entityId === entityId && e.entityType === entityType),
}))
