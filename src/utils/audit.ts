import { useAuditStore } from '../stores/audit-store'
import { CURRENT_USER } from '../constants/user'
import type { AuditActionType } from '../types/audit'

export function logAuditEntry(params: {
  entityType: 'Member' | 'Group'
  entityId: string
  entityName: string
  action: AuditActionType
  fieldChanged?: string
  oldValue?: string
  newValue?: string
  noteText?: string
  details?: string
}) {
  useAuditStore.getState().addEntry({
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    actionType: params.action,
    fieldChanged: params.fieldChanged ?? '',
    oldValue: params.oldValue ?? '',
    newValue: params.newValue ?? '',
    noteText: params.noteText,
    details: params.details,
    changedBy: CURRENT_USER,
  })
}

export function logFieldChanges<T extends Record<string, unknown>>(
  entityType: 'Member' | 'Group',
  entityId: string,
  entityName: string,
  oldObj: T,
  newObj: T,
  fieldLabels: Partial<Record<keyof T, string>> = {},
) {
  const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
  for (const key of keys) {
    const oldVal = oldObj[key]
    const newVal = newObj[key]
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      logAuditEntry({
        entityType,
        entityId,
        entityName,
        action: 'Field Updated',
        fieldChanged: (fieldLabels[key as keyof T] as string) || String(key),
        oldValue: formatAuditValue(oldVal),
        newValue: formatAuditValue(newVal),
      })
    }
  }
}

function formatAuditValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return `[${v.length} items]`
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}
