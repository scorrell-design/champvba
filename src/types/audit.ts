export type AuditActionType =
  | 'Created'
  | 'Field Updated'
  | 'Note Added'
  | 'Note Edited'
  | 'Note Archived'
  | 'Product Added'
  | 'Product Updated'
  | 'Product Removed'
  | 'Product Terminated'
  | 'Member Terminated'
  | 'Member Reactivated'
  | 'Group Reassignment'
  | 'Dependent Added'
  | 'Dependent Updated'
  | 'Dependent Removed'
  | 'Status Changed'
  | 'Tag Added'
  | 'Tag Removed'
  | 'Batch Update Applied'
  | 'Merged'
  | 'Commission Added'
  | 'Commission Updated'
  | 'Commission Deleted'
  | 'Commissions Copied'
  | 'Group Created'
  | 'Member Created'

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
  noteText?: string
  details?: string
  batchId?: string
}
