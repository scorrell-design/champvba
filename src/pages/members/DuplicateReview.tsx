import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  GitMerge,
  UserX,
  Flag,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog'
import { useMember } from '../../hooks/useQueries'
import { useDuplicateStore } from '../../stores/duplicate-store'
import { useAuditStore } from '../../stores/audit-store'
import { CURRENT_USER } from '../../constants/user'
import { useToast } from '../../components/feedback/Toast'
import { formatDate, formatSSN, formatPhone } from '../../utils/formatters'
import { cn } from '../../utils/cn'
import type { Member } from '../../types/member'
import type { MemberProduct } from '../../types/product'
import type { MergeFieldDecision } from '../../types/duplicate'

// ── Helpers ──────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  high: 'border-t-danger-500',
  medium: 'border-t-warning-500',
  low: 'border-t-gray-400',
}

const TIER_BG: Record<string, string> = {
  high: 'bg-danger-50',
  medium: 'bg-warning-50',
  low: 'bg-gray-50',
}

const TIER_BADGE: Record<string, 'danger' | 'warning' | 'gray'> = {
  high: 'danger',
  medium: 'warning',
  low: 'gray',
}

const STATUS_BADGE_MAP: Record<string, 'info' | 'warning' | 'success' | 'gray' | 'danger' | 'purple'> = {
  new: 'info',
  in_review: 'warning',
  resolved: 'success',
  dismissed: 'gray',
  needs_second_review: 'purple',
  partially_resolved: 'teal' as 'info',
}

const SOURCE_LABELS: Record<string, string> = {
  file_import: 'File Import',
  background_scan: 'Background Scan',
  manual_flag: 'Manual Flag',
  on_demand_scan: 'On-Demand Scan',
}

const STATUS_PRIORITY: Record<string, number> = {
  Active: 4,
  'Future Active': 3,
  'On Hold': 2,
  Inactive: 1,
  Terminated: 0,
  Merged: -1,
}

function fullName(m: Member): string {
  return [m.firstName, m.middleInitial ? `${m.middleInitial}.` : '', m.lastName]
    .filter(Boolean)
    .join(' ')
}

function fullAddress(m: Member): string {
  const a = m.address
  return `${a.street}, ${a.city}, ${a.state} ${a.zip}`
}

interface ComparisonField {
  label: string
  valueA: string
  valueB: string
  match: boolean
}

function buildComparisonFields(a: Member, b: Member): ComparisonField[] {
  const fields: ComparisonField[] = [
    { label: 'Member ID', valueA: a.memberId, valueB: b.memberId, match: a.memberId === b.memberId },
    { label: 'Name', valueA: fullName(a), valueB: fullName(b), match: fullName(a) === fullName(b) },
    { label: 'SSN', valueA: formatSSN(a.ssn), valueB: formatSSN(b.ssn), match: a.ssn === b.ssn },
    { label: 'Date of Birth', valueA: formatDate(a.dob), valueB: formatDate(b.dob), match: a.dob === b.dob },
    { label: 'Email', valueA: a.email, valueB: b.email, match: a.email === b.email },
    { label: 'Phone', valueA: formatPhone(a.phone), valueB: formatPhone(b.phone), match: a.phone === b.phone },
    { label: 'Address', valueA: fullAddress(a), valueB: fullAddress(b), match: fullAddress(a) === fullAddress(b) },
    { label: 'Group', valueA: a.groupName, valueB: b.groupName, match: a.groupName === b.groupName },
    { label: 'Status', valueA: a.status, valueB: b.status, match: a.status === b.status },
    { label: 'Created Date', valueA: formatDate(a.createdDate), valueB: formatDate(b.createdDate), match: a.createdDate === b.createdDate },
    { label: 'Agent', valueA: a.agentId, valueB: b.agentId, match: a.agentId === b.agentId },
  ]
  return fields
}

interface MergeableField {
  key: string
  label: string
  valueA: string
  valueB: string
  rawA: string
  rawB: string
  recommended: 'A' | 'B'
}

function buildMergeableFields(a: Member, b: Member): MergeableField[] {
  const fields: MergeableField[] = []
  const aDate = new Date(a.createdDate).getTime()
  const bDate = new Date(b.createdDate).getTime()
  const newer: 'A' | 'B' = bDate > aDate ? 'B' : 'A'

  if (fullName(a) !== fullName(b)) {
    const longer: 'A' | 'B' = fullName(a).length >= fullName(b).length ? 'A' : 'B'
    fields.push({ key: 'name', label: 'Name', valueA: fullName(a), valueB: fullName(b), rawA: fullName(a), rawB: fullName(b), recommended: longer })
  }
  if (a.email !== b.email) {
    fields.push({ key: 'email', label: 'Email', valueA: a.email, valueB: b.email, rawA: a.email, rawB: b.email, recommended: newer })
  }
  if (a.phone !== b.phone) {
    fields.push({ key: 'phone', label: 'Phone', valueA: formatPhone(a.phone), valueB: formatPhone(b.phone), rawA: a.phone, rawB: b.phone, recommended: newer })
  }
  if (fullAddress(a) !== fullAddress(b)) {
    fields.push({ key: 'address', label: 'Address', valueA: fullAddress(a), valueB: fullAddress(b), rawA: fullAddress(a), rawB: fullAddress(b), recommended: newer })
  }
  if (a.status !== b.status) {
    const priA = STATUS_PRIORITY[a.status] ?? 0
    const priB = STATUS_PRIORITY[b.status] ?? 0
    fields.push({ key: 'status', label: 'Status', valueA: a.status, valueB: b.status, rawA: a.status, rawB: b.status, recommended: priA >= priB ? 'A' : 'B' })
  }
  if (a.ssn !== b.ssn) {
    fields.push({ key: 'ssn', label: 'SSN', valueA: formatSSN(a.ssn), valueB: formatSSN(b.ssn), rawA: a.ssn, rawB: b.ssn, recommended: 'A' })
  }
  return fields
}

function computeRecommendation(a: Member, b: Member): { id: 'A' | 'B'; reason: string } {
  const aScore = a.products.length + a.notes.length + a.dependents.length
  const bScore = b.products.length + b.notes.length + b.dependents.length
  if (aScore > bScore) {
    return { id: 'A', reason: `Has more history (${a.products.length} products), notes (${a.notes.length}), and dependents (${a.dependents.length})` }
  }
  if (bScore > aScore) {
    return { id: 'B', reason: `Has more history (${b.products.length} products), notes (${b.notes.length}), and dependents (${b.dependents.length})` }
  }
  const aCreated = new Date(a.createdDate).getTime()
  const bCreated = new Date(b.createdDate).getTime()
  if (aCreated <= bCreated) {
    return { id: 'A', reason: 'Older record (created first)' }
  }
  return { id: 'B', reason: 'Older record (created first)' }
}

// ── Resolution Tabs ──────────────────────────────────────────────────

const RESOLUTION_TABS = [
  { id: 'merge', label: 'Merge Records' },
  { id: 'dismiss', label: 'Not a Duplicate' },
  { id: 'inactivate', label: 'Inactivate One' },
  { id: 'second_review', label: 'Second Review' },
]

const DISMISS_REASONS = [
  { value: 'different_people_same_ssn', label: 'Different people, same SSN' },
  { value: 'parent_dependent', label: 'Parent and dependent with shared information' },
  { value: 'similar_names', label: 'Different people with similar names' },
  { value: 'other', label: 'Other' },
]

const REVIEWER_OPTIONS = [
  { value: 'Tori M.', label: 'Tori M.' },
  { value: 'Kacy S.', label: 'Kacy S.' },
  { value: 'Lillie R.', label: 'Lillie R.' },
]

// ── Main Component ───────────────────────────────────────────────────

export const DuplicateReview = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addToast = useToast((s) => s.addToast)
  const addAuditEntry = useAuditStore((s) => s.addEntry)

  const queueItems = useDuplicateStore((s) => s.queueItems)
  const updateQueueItem = useDuplicateStore((s) => s.updateQueueItem)
  const addMergeEvent = useDuplicateStore((s) => s.addMergeEvent)

  const queueItem = queueItems.find((q) => q.id === id)
  const { data: memberA, isLoading: loadingA } = useMember(queueItem?.memberAId ?? '')
  const { data: memberB, isLoading: loadingB } = useMember(queueItem?.memberBId ?? '')

  // Resolution state
  const [resolutionTab, setResolutionTab] = useState('merge')
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Merge state
  const [mergeStep, setMergeStep] = useState(1)
  const [survivingRecord, setSurvivingRecord] = useState<'A' | 'B' | null>(null)
  const [fieldChoices, setFieldChoices] = useState<Record<string, 'A' | 'B'>>({})

  // Dismiss state
  const [dismissReason, setDismissReason] = useState('')
  const [dismissOtherText, setDismissOtherText] = useState('')

  // Inactivate state
  const [inactivateTarget, setInactivateTarget] = useState<'A' | 'B' | null>(null)
  const [inactivateReason, setInactivateReason] = useState('')

  // Second review state
  const [reviewAssignee, setReviewAssignee] = useState('')
  const [reviewNote, setReviewNote] = useState('')

  const comparisonFields = useMemo(
    () => (memberA && memberB ? buildComparisonFields(memberA, memberB) : []),
    [memberA, memberB],
  )

  const mergeableFields = useMemo(
    () => (memberA && memberB ? buildMergeableFields(memberA, memberB) : []),
    [memberA, memberB],
  )

  const recommendation = useMemo(
    () => (memberA && memberB ? computeRecommendation(memberA, memberB) : null),
    [memberA, memberB],
  )

  // Initialize field choices from recommendations
  const initFieldChoices = () => {
    const choices: Record<string, 'A' | 'B'> = {}
    mergeableFields.forEach((f) => { choices[f.key] = f.recommended })
    setFieldChoices(choices)
  }

  // ── Handlers ─────────────────────────────────────────────────────

  const handleMerge = () => {
    if (!queueItem || !memberA || !memberB || !survivingRecord) return

    const surviving = survivingRecord === 'A' ? memberA : memberB
    const merged = survivingRecord === 'A' ? memberB : memberA

    const fieldDecisions: MergeFieldDecision[] = mergeableFields.map((f) => ({
      field: f.label,
      keptValue: fieldChoices[f.key] === 'A' ? f.rawA : f.rawB,
      discardedValue: fieldChoices[f.key] === 'A' ? f.rawB : f.rawA,
      source: fieldChoices[f.key],
    }))

    const mergedProducts = merged.products.filter(
      (mp) => !surviving.products.some((sp) => sp.productId === mp.productId),
    )

    addMergeEvent({
      id: `merge-${Date.now()}`,
      survivingMemberId: surviving.id,
      mergedMemberId: merged.id,
      confidenceScore: queueItem.confidenceScore,
      fieldDecisions,
      productsTransferred: mergedProducts.map((p) => p.productId),
      dependentsTransferred: merged.dependents.map((d) => d.id),
      notesTransferred: merged.notes.length,
      historyEntriesTransferred: 0,
      performedBy: CURRENT_USER,
      performedAt: new Date().toISOString(),
      source: 'manual',
    })

    updateQueueItem(queueItem.id, {
      status: 'resolved',
      resolution: 'merged',
      resolvedBy: CURRENT_USER,
      resolvedAt: new Date().toISOString(),
    })

    addAuditEntry({
      entityType: 'Member',
      entityId: surviving.id,
      entityName: fullName(surviving),
      fieldChanged: 'Merge',
      oldValue: `Merged with ${fullName(merged)} (${merged.memberId})`,
      newValue: `Surviving record: ${surviving.memberId}`,
      changedBy: CURRENT_USER,
      actionType: 'Field Updated',
    })

    addToast('success', `Records merged successfully. ${fullName(surviving)} is the surviving record.`)
    navigate('/members/duplicates')
  }

  const handleDismiss = () => {
    if (!queueItem) return
    const reason = dismissReason === 'other' ? dismissOtherText : DISMISS_REASONS.find((r) => r.value === dismissReason)?.label ?? ''
    updateQueueItem(queueItem.id, {
      status: 'dismissed',
      resolution: 'not_duplicate',
      resolutionReason: reason,
      resolvedBy: CURRENT_USER,
      resolvedAt: new Date().toISOString(),
    })
    addToast('success', 'Duplicate dismissed from queue.')
    navigate('/members/duplicates')
  }

  const handleInactivate = () => {
    if (!queueItem || !inactivateTarget || !memberA || !memberB) return
    const target = inactivateTarget === 'A' ? memberA : memberB
    updateQueueItem(queueItem.id, {
      status: 'partially_resolved',
      resolution: 'one_inactivated',
      resolutionReason: `Inactivated ${fullName(target)} (${target.memberId}): ${inactivateReason}`,
      resolvedBy: CURRENT_USER,
      resolvedAt: new Date().toISOString(),
    })
    addAuditEntry({
      entityType: 'Member',
      entityId: target.id,
      entityName: fullName(target),
      fieldChanged: 'Status',
      oldValue: target.status,
      newValue: 'Inactive',
      changedBy: CURRENT_USER,
      actionType: 'Status Changed',
    })
    addToast('success', `${fullName(target)} marked as inactive.`)
    navigate('/members/duplicates')
  }

  const handleSecondReview = () => {
    if (!queueItem || !reviewAssignee) return
    updateQueueItem(queueItem.id, {
      status: 'needs_second_review',
      assignedTo: reviewAssignee,
    })
    addToast('info', `Sent to ${reviewAssignee} for second review.`)
    navigate('/members/duplicates')
  }

  const handleAssignToMe = () => {
    if (!queueItem) return
    updateQueueItem(queueItem.id, {
      status: 'in_review',
      assignedTo: CURRENT_USER,
    })
    addToast('info', 'Assigned to you.')
  }

  // ── Loading / Error states ───────────────────────────────────────

  if (!queueItem) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <XCircle className="h-12 w-12 text-gray-300" />
        <p className="mt-3 text-lg font-medium text-gray-600">Queue item not found</p>
        <Link to="/members/duplicates" className="mt-2 text-sm text-primary-500 hover:underline">
          Back to Duplicate Queue
        </Link>
      </div>
    )
  }

  if (loadingA || loadingB) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
      </div>
    )
  }

  if (!memberA || !memberB) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-12 w-12 text-warning-400" />
        <p className="mt-3 text-lg font-medium text-gray-600">Could not load member records</p>
        <Link to="/members/duplicates" className="mt-2 text-sm text-primary-500 hover:underline">
          Back to Duplicate Queue
        </Link>
      </div>
    )
  }

  const isResolved = ['resolved', 'dismissed', 'partially_resolved'].includes(queueItem.status)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/members/duplicates"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Duplicate Queue
      </Link>

      {/* ── Header Banner ─────────────────────────────────────────── */}
      <Card className={cn('border-t-4', TIER_COLORS[queueItem.matchTier])}>
        <div className={cn('rounded-t-xl px-6 py-4', TIER_BG[queueItem.matchTier])}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-lg font-semibold text-gray-900">
                Reviewing Potential Duplicate — Confidence: {queueItem.confidenceScore}
                <Badge variant={TIER_BADGE[queueItem.matchTier]} className="ml-2 capitalize">
                  {queueItem.matchTier}
                </Badge>
              </h1>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Match Reason:</span>{' '}
                {queueItem.matchReasons.join(', ')}
              </p>
              <p className="text-sm text-gray-500">
                Found: {formatDate(queueItem.createdAt)} via {SOURCE_LABELS[queueItem.source] ?? queueItem.source}
                {queueItem.sourceDetail && ` (${queueItem.sourceDetail})`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={STATUS_BADGE_MAP[queueItem.status] ?? 'gray'} dot className="capitalize">
                {queueItem.status.replace(/_/g, ' ')}
              </Badge>
              {queueItem.assignedTo && (
                <span className="text-sm text-gray-500">
                  Assigned to: <span className="font-medium text-gray-700">{queueItem.assignedTo}</span>
                </span>
              )}
              {!isResolved && (
                <Button size="sm" variant="secondary" onClick={handleAssignToMe}>
                  Assign to Me
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Side-by-Side Comparison ───────────────────────────────── */}
      <Card padding={false}>
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Field-by-Field Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left font-medium text-gray-500 w-[180px]">Field</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">
                  <Link to={`/members/${memberA.id}`} className="inline-flex items-center gap-1 text-primary-600 hover:underline">
                    Record A — {memberA.memberId} <ExternalLink className="h-3 w-3" />
                  </Link>
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">
                  <Link to={`/members/${memberB.id}`} className="inline-flex items-center gap-1 text-primary-600 hover:underline">
                    Record B — {memberB.memberId} <ExternalLink className="h-3 w-3" />
                  </Link>
                </th>
                <th className="px-6 py-3 text-center font-medium text-gray-500 w-[80px]">Match</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((f) => (
                <tr key={f.label} className={cn('border-b border-gray-50', !f.match && 'bg-warning-50/40')}>
                  <td className="px-6 py-2.5 font-medium text-gray-700">{f.label}</td>
                  <td className={cn('px-6 py-2.5 text-gray-900', !f.match && 'font-medium')}>{f.valueA}</td>
                  <td className={cn('px-6 py-2.5 text-gray-900', !f.match && 'font-medium')}>{f.valueB}</td>
                  <td className="px-6 py-2.5 text-center">
                    {f.match ? (
                      <CheckCircle className="mx-auto h-4 w-4 text-success-500" />
                    ) : (
                      <AlertTriangle className="mx-auto h-4 w-4 text-warning-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Extended comparison: products, dependents, history, notes */}
        <div className="grid grid-cols-2 gap-px border-t border-gray-200 bg-gray-100">
          <SummaryBlock label="Products" memberA={memberA} memberB={memberB} type="products" />
          <SummaryBlock label="Dependents" memberA={memberA} memberB={memberB} type="dependents" />
          <SummaryBlock label="History" memberA={memberA} memberB={memberB} type="history" />
          <SummaryBlock label="Notes" memberA={memberA} memberB={memberB} type="notes" />
        </div>
      </Card>

      {/* ── Resolution Actions ────────────────────────────────────── */}
      {!isResolved && (
        <Card padding={false}>
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Resolution Actions</h2>
          </div>
          <div className="px-6 pt-2">
            <Tabs
              tabs={RESOLUTION_TABS}
              activeTab={resolutionTab}
              onChange={setResolutionTab}
            />
          </div>
          <div className="px-6 py-5">
            {resolutionTab === 'merge' && (
              <MergePanel
                memberA={memberA}
                memberB={memberB}
                step={mergeStep}
                setStep={setMergeStep}
                survivingRecord={survivingRecord}
                setSurvivingRecord={setSurvivingRecord}
                fieldChoices={fieldChoices}
                setFieldChoices={setFieldChoices}
                mergeableFields={mergeableFields}
                recommendation={recommendation}
                initFieldChoices={initFieldChoices}
                onConfirm={() => setConfirmOpen(true)}
              />
            )}
            {resolutionTab === 'dismiss' && (
              <DismissPanel
                dismissReason={dismissReason}
                setDismissReason={setDismissReason}
                dismissOtherText={dismissOtherText}
                setDismissOtherText={setDismissOtherText}
                onDismiss={handleDismiss}
              />
            )}
            {resolutionTab === 'inactivate' && (
              <InactivatePanel
                memberA={memberA}
                memberB={memberB}
                target={inactivateTarget}
                setTarget={setInactivateTarget}
                reason={inactivateReason}
                setReason={setInactivateReason}
                onSubmit={handleInactivate}
              />
            )}
            {resolutionTab === 'second_review' && (
              <SecondReviewPanel
                assignee={reviewAssignee}
                setAssignee={setReviewAssignee}
                note={reviewNote}
                setNote={setReviewNote}
                onSubmit={handleSecondReview}
              />
            )}
          </div>
        </Card>
      )}

      {isResolved && (
        <Card>
          <div className="flex items-center gap-3 text-success-700">
            <CheckCircle className="h-5 w-5" />
            <p className="font-medium">
              This duplicate pair has been resolved
              {queueItem.resolvedBy && <> by {queueItem.resolvedBy}</>}
              {queueItem.resolvedAt && <> on {formatDate(queueItem.resolvedAt)}</>}.
              {queueItem.resolution && <> Resolution: <span className="capitalize">{queueItem.resolution.replace(/_/g, ' ')}</span>.</>}
            </p>
          </div>
          {queueItem.resolutionReason && (
            <p className="mt-2 text-sm text-gray-600">Reason: {queueItem.resolutionReason}</p>
          )}
        </Card>
      )}

      {/* Merge confirmation dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          handleMerge()
        }}
        title="Confirm Merge"
        message={`This will merge ${survivingRecord === 'A' ? fullName(memberB) : fullName(memberA)} into ${survivingRecord === 'A' ? fullName(memberA) : fullName(memberB)}. The merged record will be marked as inactive. This action cannot be fully reversed.`}
        confirmLabel="Confirm Merge"
        confirmVariant="danger"
      />
    </div>
  )
}

// ── Summary Block ────────────────────────────────────────────────────

function SummaryBlock({
  label,
  memberA,
  memberB,
  type,
}: {
  label: string
  memberA: Member
  memberB: Member
  type: 'products' | 'dependents' | 'history' | 'notes'
}) {
  const getInfo = (m: Member): { count: number; detail: string } => {
    switch (type) {
      case 'products':
        return {
          count: m.products.length,
          detail: m.products.map((p) => p.name).join(', ') || 'None',
        }
      case 'dependents':
        return {
          count: m.dependents.length,
          detail: m.dependents.map((d) => `${d.firstName} ${d.lastName}`).join(', ') || 'None',
        }
      case 'history':
        return {
          count: m.notes.filter((n) => n.type === 'History Note').length,
          detail: m.notes.length > 0
            ? `Last activity: ${formatDate(m.notes[m.notes.length - 1].createdAt)}`
            : 'No history',
        }
      case 'notes':
        return {
          count: m.notes.length,
          detail: m.notes.length > 0 ? `${m.notes.length} note${m.notes.length !== 1 ? 's' : ''}` : 'None',
        }
    }
  }

  const infoA = getInfo(memberA)
  const infoB = getInfo(memberB)

  return (
    <div className="bg-white px-6 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Record A: {infoA.count}</p>
          <p className="text-xs text-gray-500 truncate">{infoA.detail}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Record B: {infoB.count}</p>
          <p className="text-xs text-gray-500 truncate">{infoB.detail}</p>
        </div>
      </div>
    </div>
  )
}

// ── Merge Panel ──────────────────────────────────────────────────────

function MergePanel({
  memberA,
  memberB,
  step,
  setStep,
  survivingRecord,
  setSurvivingRecord,
  fieldChoices,
  setFieldChoices,
  mergeableFields,
  recommendation,
  initFieldChoices,
  onConfirm,
}: {
  memberA: Member
  memberB: Member
  step: number
  setStep: (s: number) => void
  survivingRecord: 'A' | 'B' | null
  setSurvivingRecord: (r: 'A' | 'B') => void
  fieldChoices: Record<string, 'A' | 'B'>
  setFieldChoices: (c: Record<string, 'A' | 'B'>) => void
  mergeableFields: MergeableField[]
  recommendation: { id: 'A' | 'B'; reason: string } | null
  initFieldChoices: () => void
  onConfirm: () => void
}) {
  const totalSteps = 4
  const surviving = survivingRecord === 'A' ? memberA : survivingRecord === 'B' ? memberB : null
  const merged = survivingRecord === 'A' ? memberB : survivingRecord === 'B' ? memberA : null

  const uniqueProductsFromMerged = merged
    ? merged.products.filter((mp) => !surviving?.products.some((sp) => sp.productId === mp.productId))
    : []
  const conflictProducts = merged
    ? merged.products.filter((mp) => surviving?.products.some((sp) => sp.productId === mp.productId))
    : []

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                s < step
                  ? 'bg-success-500 text-white'
                  : s === step
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-500',
              )}
            >
              {s < step ? <CheckCircle className="h-4 w-4" /> : s}
            </div>
            {s < totalSteps && (
              <div className={cn('h-0.5 w-8', s < step ? 'bg-success-500' : 'bg-gray-200')} />
            )}
          </div>
        ))}
        <span className="ml-3 text-sm text-gray-500">
          Step {step} of {totalSteps}:{' '}
          {step === 1 && 'Select Surviving Record'}
          {step === 2 && 'Resolve Field Conflicts'}
          {step === 3 && 'Product Consolidation'}
          {step === 4 && 'Confirmation'}
        </span>
      </div>

      {/* Step 1: Select Surviving Record */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Choose which record will survive the merge. The other record will be marked as merged.
          </p>

          {recommendation && (
            <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
              <span className="font-medium">Recommended: Record {recommendation.id}</span> — {recommendation.reason}
            </div>
          )}

          <label className={cn(
            'flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-colors',
            survivingRecord === 'A' ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200 hover:border-gray-300',
          )}>
            <input
              type="radio"
              name="surviving"
              checked={survivingRecord === 'A'}
              onChange={() => setSurvivingRecord('A')}
              className="mt-0.5"
            />
            <div>
              <p className="font-medium text-gray-900">Record A — {memberA.memberId}</p>
              <p className="text-sm text-gray-600">{fullName(memberA)} · {memberA.groupName}</p>
              <p className="text-xs text-gray-500 mt-1">
                {memberA.products.length} products · {memberA.dependents.length} dependents · {memberA.notes.length} notes · Created {formatDate(memberA.createdDate)}
              </p>
            </div>
          </label>

          <label className={cn(
            'flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-colors',
            survivingRecord === 'B' ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200 hover:border-gray-300',
          )}>
            <input
              type="radio"
              name="surviving"
              checked={survivingRecord === 'B'}
              onChange={() => setSurvivingRecord('B')}
              className="mt-0.5"
            />
            <div>
              <p className="font-medium text-gray-900">Record B — {memberB.memberId}</p>
              <p className="text-sm text-gray-600">{fullName(memberB)} · {memberB.groupName}</p>
              <p className="text-xs text-gray-500 mt-1">
                {memberB.products.length} products · {memberB.dependents.length} dependents · {memberB.notes.length} notes · Created {formatDate(memberB.createdDate)}
              </p>
            </div>
          </label>

          <div className="flex justify-end pt-2">
            <Button
              disabled={!survivingRecord}
              onClick={() => {
                initFieldChoices()
                setStep(2)
              }}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Field Conflict Resolution */}
      {step === 2 && (
        <div className="space-y-4">
          {mergeableFields.length === 0 ? (
            <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
              <CheckCircle className="mr-2 inline h-4 w-4" />
              All fields match — no conflicts to resolve.
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                The following fields differ between records. Select which value to keep for the surviving record.
              </p>
              <div className="space-y-3">
                {mergeableFields.map((f) => (
                  <div key={f.key} className="rounded-lg border border-gray-200 p-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">{f.label}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                        fieldChoices[f.key] === 'A'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300',
                      )}>
                        <input
                          type="radio"
                          name={`field-${f.key}`}
                          checked={fieldChoices[f.key] === 'A'}
                          onChange={() => setFieldChoices({ ...fieldChoices, [f.key]: 'A' })}
                        />
                        <span className="truncate">A: {f.valueA}</span>
                        {f.recommended === 'A' && (
                          <Badge variant="info" className="ml-auto shrink-0 text-[10px]">Rec.</Badge>
                        )}
                      </label>
                      <label className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                        fieldChoices[f.key] === 'B'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300',
                      )}>
                        <input
                          type="radio"
                          name={`field-${f.key}`}
                          checked={fieldChoices[f.key] === 'B'}
                          onChange={() => setFieldChoices({ ...fieldChoices, [f.key]: 'B' })}
                        />
                        <span className="truncate">B: {f.valueB}</span>
                        {f.recommended === 'B' && (
                          <Badge variant="info" className="ml-auto shrink-0 text-[10px]">Rec.</Badge>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(3)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Product Consolidation */}
      {step === 3 && surviving && merged && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Products from the merged record that don't exist on the surviving record will be transferred automatically.
          </p>

          {surviving.products.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Surviving Record Products ({surviving.products.length})
              </p>
              <div className="space-y-1">
                {surviving.products.map((p) => (
                  <ProductRow key={p.id} product={p} badge="Kept" badgeVariant="success" />
                ))}
              </div>
            </div>
          )}

          {uniqueProductsFromMerged.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Will Be Transferred ({uniqueProductsFromMerged.length})
              </p>
              <div className="space-y-1">
                {uniqueProductsFromMerged.map((p) => (
                  <ProductRow key={p.id} product={p} badge="Transfer" badgeVariant="info" />
                ))}
              </div>
            </div>
          )}

          {conflictProducts.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Duplicate Products — Skipped ({conflictProducts.length})
              </p>
              <div className="space-y-1">
                {conflictProducts.map((p) => (
                  <ProductRow key={p.id} product={p} badge="Skipped" badgeVariant="warning" />
                ))}
              </div>
            </div>
          )}

          {surviving.products.length === 0 && uniqueProductsFromMerged.length === 0 && conflictProducts.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
              No products on either record.
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep(2)}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(4)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && surviving && merged && (
        <div className="space-y-4">
          <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning-500" />
              <div className="text-sm text-warning-700">
                <p className="font-medium">This action cannot be fully reversed.</p>
                <p className="mt-1">
                  Please review the merge summary carefully before confirming.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-primary-500" />
              <span className="font-medium text-gray-900">Merge Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Surviving Record</p>
                <p className="font-medium text-gray-900">{fullName(surviving)} ({surviving.memberId})</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Merged (Inactivated)</p>
                <p className="font-medium text-gray-900">{fullName(merged)} ({merged.memberId})</p>
              </div>
            </div>

            {mergeableFields.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Field Decisions</p>
                <ul className="space-y-1">
                  {mergeableFields.map((f) => (
                    <li key={f.key} className="text-gray-700">
                      <span className="font-medium">{f.label}:</span>{' '}
                      {fieldChoices[f.key] === 'A' ? f.valueA : f.valueB}
                      <span className="text-gray-400"> (from Record {fieldChoices[f.key]})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Products to Transfer</p>
                <p className="font-medium">{merged.products.filter((mp) => !surviving.products.some((sp) => sp.productId === mp.productId)).length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dependents to Transfer</p>
                <p className="font-medium">{merged.dependents.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Notes to Transfer</p>
                <p className="font-medium">{merged.notes.length}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep(3)}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              <GitMerge className="h-4 w-4" /> Confirm Merge
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Product Row ──────────────────────────────────────────────────────

function ProductRow({
  product,
  badge,
  badgeVariant,
}: {
  product: MemberProduct
  badge: string
  badgeVariant: 'success' | 'info' | 'warning'
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
      <div>
        <span className="font-medium text-gray-900">{product.name}</span>
        <span className="ml-2 text-gray-500">#{product.productId}</span>
      </div>
      <Badge variant={badgeVariant}>{badge}</Badge>
    </div>
  )
}

// ── Dismiss Panel ────────────────────────────────────────────────────

function DismissPanel({
  dismissReason,
  setDismissReason,
  dismissOtherText,
  setDismissOtherText,
  onDismiss,
}: {
  dismissReason: string
  setDismissReason: (r: string) => void
  dismissOtherText: string
  setDismissOtherText: (t: string) => void
  onDismiss: () => void
}) {
  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-start gap-2 text-sm text-gray-600">
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <p>Dismiss this pair from the queue. These records are not duplicates.</p>
      </div>

      <Select
        label="Reason"
        options={DISMISS_REASONS}
        placeholder="Select a reason..."
        value={dismissReason}
        onChange={(e) => setDismissReason(e.target.value)}
      />

      {dismissReason === 'other' && (
        <Input
          label="Please specify"
          value={dismissOtherText}
          onChange={(e) => setDismissOtherText(e.target.value)}
          placeholder="Enter reason..."
        />
      )}

      <div className="pt-2">
        <Button
          variant="secondary"
          disabled={!dismissReason || (dismissReason === 'other' && !dismissOtherText.trim())}
          onClick={onDismiss}
        >
          <XCircle className="h-4 w-4" /> Dismiss from Queue
        </Button>
      </div>
    </div>
  )
}

// ── Inactivate Panel ─────────────────────────────────────────────────

function InactivatePanel({
  memberA,
  memberB,
  target,
  setTarget,
  reason,
  setReason,
  onSubmit,
}: {
  memberA: Member
  memberB: Member
  target: 'A' | 'B' | null
  setTarget: (t: 'A' | 'B') => void
  reason: string
  setReason: (r: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-start gap-2 text-sm text-gray-600">
        <UserX className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <p>Mark one record as inactive without fully merging. Use when records are related but shouldn't be combined.</p>
      </div>

      <p className="text-sm font-medium text-gray-700">Which record should be inactivated?</p>

      <label className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 text-sm transition-colors',
        target === 'A' ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200 hover:border-gray-300',
      )}>
        <input type="radio" name="inactivate" checked={target === 'A'} onChange={() => setTarget('A')} />
        <div>
          <span className="font-medium text-gray-900">Record A — {memberA.memberId}</span>
          <span className="text-gray-500 ml-2">{fullName(memberA)}</span>
        </div>
      </label>

      <label className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 text-sm transition-colors',
        target === 'B' ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200 hover:border-gray-300',
      )}>
        <input type="radio" name="inactivate" checked={target === 'B'} onChange={() => setTarget('B')} />
        <div>
          <span className="font-medium text-gray-900">Record B — {memberB.memberId}</span>
          <span className="text-gray-500 ml-2">{fullName(memberB)}</span>
        </div>
      </label>

      <Input
        label="Reason for inactivation"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter reason..."
      />

      <div className="pt-2">
        <Button
          variant="danger"
          disabled={!target || !reason.trim()}
          onClick={onSubmit}
        >
          <UserX className="h-4 w-4" /> Mark as Inactive
        </Button>
      </div>
    </div>
  )
}

// ── Second Review Panel ──────────────────────────────────────────────

function SecondReviewPanel({
  assignee,
  setAssignee,
  note,
  setNote,
  onSubmit,
}: {
  assignee: string
  setAssignee: (a: string) => void
  note: string
  setNote: (n: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-start gap-2 text-sm text-gray-600">
        <Flag className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <p>Flag this pair for a second review by another team member.</p>
      </div>

      <Select
        label="Assign to"
        options={REVIEWER_OPTIONS}
        placeholder="Select reviewer..."
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
      />

      <Input
        label="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add context for the reviewer..."
      />

      <div className="pt-2">
        <Button
          disabled={!assignee}
          onClick={onSubmit}
        >
          <Flag className="h-4 w-4" /> Send for Review
        </Button>
      </div>
    </div>
  )
}
