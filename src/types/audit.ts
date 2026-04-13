export type AuditActionType = 'Field Updated' | 'Group Created' | 'Member Created' | 'Note Added' | 'Note Edited' | 'Note Archived' | 'Member Terminated' | 'Member Reactivated' | 'Dependent Added' | 'Dependent Updated' | 'Dependent Removed' | 'Product Added' | 'Product Removed' | 'Product Updated' | 'Status Changed' | 'Group Reassignment'

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
  actionType: AuditActionType
  batchId?: string
}
