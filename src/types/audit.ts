import type { SystemBadge } from '../utils/constants'

export interface AuditEntry {
  id: string
  timestamp: string
  entityType: 'Member' | 'Group'
  entityId: string
  entityName: string
  fieldChanged: string
  oldValue: string
  newValue: string
  changedBy: string
  systemsAffected: SystemBadge[]
  batchId?: string
}
