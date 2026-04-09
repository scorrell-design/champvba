export type DuplicateMatchTier = 'high' | 'medium' | 'low'
export type DuplicateSource = 'file_import' | 'background_scan' | 'manual_flag' | 'on_demand_scan'
export type DuplicateStatus = 'new' | 'in_review' | 'resolved' | 'dismissed' | 'needs_second_review' | 'partially_resolved'
export type DuplicateResolution = 'merged' | 'not_duplicate' | 'one_inactivated'

export interface DuplicateQueueItem {
  id: string
  memberAId: string
  memberBId: string
  confidenceScore: number
  matchReasons: string[]
  matchTier: DuplicateMatchTier
  source: DuplicateSource
  sourceDetail?: string
  status: DuplicateStatus
  assignedTo?: string
  resolution?: DuplicateResolution
  resolutionReason?: string
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface MergeFieldDecision {
  field: string
  keptValue: string
  discardedValue: string
  source: 'A' | 'B'
}

export interface MergeEvent {
  id: string
  survivingMemberId: string
  mergedMemberId: string
  confidenceScore: number
  fieldDecisions: MergeFieldDecision[]
  productsTransferred: string[]
  dependentsTransferred: string[]
  notesTransferred: number
  historyEntriesTransferred: number
  performedBy: string
  performedAt: string
  source: 'manual' | 'auto_resolve'
}
