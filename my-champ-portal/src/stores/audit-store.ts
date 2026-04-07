import { create } from 'zustand'
import type { AuditEntry, AuditActionType } from '../types/audit'

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
      systemsAffected: ['CBS', 'Kintone'],
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
      systemsAffected: ['Local'],
    })
  },

  getEntriesForEntity: (entityId, entityType) =>
    get().entries.filter((e) => e.entityId === entityId && e.entityType === entityType),
}))
