import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Download, Zap, ScanSearch, AlertTriangle } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { StatCard } from '../../components/ui/Card'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Select } from '../../components/ui/Select'
import { Modal } from '../../components/ui/Modal'
import { useDuplicateQueue, useMembers } from '../../hooks/useQueries'
import { useDuplicateStore } from '../../stores/duplicate-store'
import { formatDate } from '../../utils/formatters'
import type { DuplicateQueueItem, DuplicateStatus, DuplicateSource } from '../../types/duplicate'
import type { Member } from '../../types/member'

// ── Filter options ───────────────────────────────────────────────────

const CONFIDENCE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'high', label: 'High (90-100)' },
  { value: 'medium', label: 'Medium (60-89)' },
  { value: 'low', label: 'Low (40-59)' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'needs_second_review', label: 'Needs Second Review' },
  { value: 'partially_resolved', label: 'Partially Resolved' },
]

const SOURCE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'file_import', label: 'File Import' },
  { value: 'background_scan', label: 'Background Scan' },
  { value: 'manual_flag', label: 'Manual Flag' },
  { value: 'on_demand_scan', label: 'On-Demand Scan' },
]

const SORT_OPTIONS = [
  { value: 'confidence', label: 'Confidence (high to low)' },
  { value: 'date', label: 'Date Found (newest first)' },
  { value: 'name', label: 'Name (A-Z)' },
]

// ── Status badge mapping ─────────────────────────────────────────────

const STATUS_VARIANT: Record<DuplicateStatus, BadgeVariant> = {
  new: 'info',
  in_review: 'warning',
  resolved: 'success',
  dismissed: 'gray',
  needs_second_review: 'purple',
  partially_resolved: 'warning',
}

const STATUS_LABEL: Record<DuplicateStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
  needs_second_review: 'Needs Second Review',
  partially_resolved: 'Partially Resolved',
}

const SOURCE_LABEL: Record<DuplicateSource, string> = {
  file_import: 'File Import',
  background_scan: 'Background Scan',
  manual_flag: 'Manual Flag',
  on_demand_scan: 'On-Demand Scan',
}

// ── Helpers ──────────────────────────────────────────────────────────

function isUnresolved(status: DuplicateStatus): boolean {
  return !['resolved', 'dismissed'].includes(status)
}

function formatFoundDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(iso)
}

function confidenceColor(score: number): string {
  if (score >= 90) return 'bg-danger-500'
  if (score >= 60) return 'bg-warning-500'
  return 'bg-gray-400'
}

function memberDisplayName(member: Member | undefined): string {
  if (!member) return 'Unknown'
  return `${member.firstName} ${member.lastName}`
}

function exportQueueCsv(items: DuplicateQueueItem[], memberMap: Map<string, Member>) {
  const headers = ['ID', 'Confidence', 'Member A', 'Member B', 'Match Reasons', 'Source', 'Status', 'Assigned To', 'Found']
  const rows = items.map((item) => [
    item.id,
    item.confidenceScore,
    memberDisplayName(memberMap.get(item.memberAId)),
    memberDisplayName(memberMap.get(item.memberBId)),
    item.matchReasons.join('; '),
    SOURCE_LABEL[item.source],
    STATUS_LABEL[item.status],
    item.assignedTo ?? '',
    item.createdAt,
  ])

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `duplicate-queue-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ────────────────────────────────────────────────────────

export const DuplicateQueue = () => {
  const navigate = useNavigate()

  // Data
  const { data: queueData = [], isLoading: queueLoading } = useDuplicateQueue()
  const { data: members = [], isLoading: membersLoading } = useMembers()
  const { queueItems, setQueueItems, updateQueueItem } = useDuplicateStore()

  // Sync queue data into the store on mount / when data changes
  useEffect(() => {
    if (queueData.length > 0 && queueItems.length === 0) {
      setQueueItems(queueData)
    }
  }, [queueData, queueItems.length, setQueueItems])

  const items = queueItems.length > 0 ? queueItems : queueData

  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members],
  )

  // Filters
  const [confidenceFilter, setConfidenceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sortBy, setSortBy] = useState('confidence')

  // Modals
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanComplete, setScanComplete] = useState(false)
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [autoResolveModalOpen, setAutoResolveModalOpen] = useState(false)
  const [autoResolveRunning, setAutoResolveRunning] = useState(false)
  const [autoResolveProgress, setAutoResolveProgress] = useState(0)
  const [autoResolveComplete, setAutoResolveComplete] = useState(false)
  const [showSampleMerges, setShowSampleMerges] = useState(false)

  // ── Stats ────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const newToday = items.filter((i) => i.status === 'new' && i.createdAt.startsWith(today)).length
    const pending = items.filter((i) => isUnresolved(i.status)).length
    const highUnresolved = items.filter((i) => i.matchTier === 'high' && isUnresolved(i.status)).length
    const resolved = items.filter((i) => ['resolved', 'dismissed'].includes(i.status)).length
    return { newToday, pending, highUnresolved, resolved }
  }, [items])

  // ── Filter + sort ────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...items]

    if (confidenceFilter) {
      result = result.filter((i) => i.matchTier === confidenceFilter)
    }
    if (statusFilter) {
      result = result.filter((i) => i.status === statusFilter)
    }
    if (sourceFilter) {
      result = result.filter((i) => i.source === sourceFilter)
    }

    result.sort((a, b) => {
      if (sortBy === 'confidence') return b.confidenceScore - a.confidenceScore
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'name') {
        const nameA = memberDisplayName(memberMap.get(a.memberAId))
        const nameB = memberDisplayName(memberMap.get(b.memberAId))
        return nameA.localeCompare(nameB)
      }
      return 0
    })

    return result
  }, [items, confidenceFilter, statusFilter, sourceFilter, sortBy, memberMap])

  // ── Auto-resolve candidates ──────────────────────────────────────

  const autoResolveCandidates = useMemo(
    () => items.filter((i) => i.confidenceScore === 100 && isUnresolved(i.status)),
    [items],
  )

  // ── Scan simulation ──────────────────────────────────────────────

  const startScan = useCallback(() => {
    setScanModalOpen(true)
    setScanProgress(0)
    setScanComplete(false)

    let progress = 0
    scanTimerRef.current = setInterval(() => {
      progress += Math.random() * 8 + 2
      if (progress >= 100) {
        progress = 100
        if (scanTimerRef.current) clearInterval(scanTimerRef.current)
        setScanProgress(100)
        setTimeout(() => setScanComplete(true), 300)
      } else {
        setScanProgress(Math.round(progress))
      }
    }, 100)
  }, [])

  const closeScanModal = useCallback(() => {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current)
    setScanModalOpen(false)
    setScanProgress(0)
    setScanComplete(false)
  }, [])

  // ── Auto-resolve simulation ──────────────────────────────────────

  const runAutoResolve = useCallback(() => {
    setAutoResolveRunning(true)
    setAutoResolveProgress(0)
    setAutoResolveComplete(false)

    let progress = 0
    const timer = setInterval(() => {
      progress += Math.random() * 6 + 3
      if (progress >= 100) {
        progress = 100
        clearInterval(timer)
        setAutoResolveProgress(100)

        for (const item of autoResolveCandidates) {
          updateQueueItem(item.id, {
            status: 'resolved',
            resolution: 'merged',
            resolvedBy: 'System (Auto-Resolve)',
            resolvedAt: new Date().toISOString(),
          })
        }

        setTimeout(() => setAutoResolveComplete(true), 300)
      } else {
        setAutoResolveProgress(Math.round(progress))
      }
    }, 100)
  }, [autoResolveCandidates, updateQueueItem])

  const closeAutoResolveModal = useCallback(() => {
    setAutoResolveModalOpen(false)
    setAutoResolveRunning(false)
    setAutoResolveProgress(0)
    setAutoResolveComplete(false)
    setShowSampleMerges(false)
  }, [])

  // ── Table columns ────────────────────────────────────────────────

  const columns: ColumnDef<DuplicateQueueItem, unknown>[] = useMemo(
    () => [
      {
        id: 'confidence',
        header: 'Confidence',
        size: 110,
        accessorFn: (row) => row.confidenceScore,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${confidenceColor(row.original.confidenceScore)}`} />
            <span className="font-medium text-gray-900">{row.original.confidenceScore}</span>
          </div>
        ),
      },
      {
        id: 'memberA',
        header: 'Member A',
        cell: ({ row }) => {
          const member = memberMap.get(row.original.memberAId)
          return (
            <div>
              <Link
                to={`/members/${row.original.memberAId}`}
                className="font-medium text-primary-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {memberDisplayName(member)}
              </Link>
              <div className="text-xs text-gray-400">{member?.memberId ?? row.original.memberAId}</div>
            </div>
          )
        },
      },
      {
        id: 'memberB',
        header: 'Member B',
        cell: ({ row }) => {
          const member = memberMap.get(row.original.memberBId)
          return (
            <div>
              <Link
                to={`/members/${row.original.memberBId}`}
                className="font-medium text-primary-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {memberDisplayName(member)}
              </Link>
              <div className="text-xs text-gray-400">{member?.memberId ?? row.original.memberBId}</div>
            </div>
          )
        },
      },
      {
        id: 'matchReasons',
        header: 'Match Reason',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.matchReasons.map((reason) => (
              <Badge key={reason} variant="gray" className="whitespace-nowrap">
                {reason}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: 'group',
        header: 'Group(s)',
        cell: ({ row }) => {
          const a = memberMap.get(row.original.memberAId)
          const b = memberMap.get(row.original.memberBId)
          const groups = new Set<string>()
          if (a?.groupName) groups.add(a.groupName)
          if (b?.groupName) groups.add(b.groupName)
          if (groups.size === 0) return <span className="text-gray-400">—</span>
          return (
            <div className="text-xs leading-relaxed">
              {[...groups].map((g) => (
                <div key={g}>{g}</div>
              ))}
            </div>
          )
        },
      },
      {
        id: 'found',
        header: 'Found',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{formatFoundDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status]} dot>
            {STATUS_LABEL[row.original.status]}
          </Badge>
        ),
      },
      {
        id: 'assignedTo',
        header: 'Assigned To',
        size: 120,
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">{row.original.assignedTo ?? '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 90,
        enableSorting: false,
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/members/duplicates/${row.original.id}`)}
            >
              Review
            </Button>
          </div>
        ),
      },
    ],
    [memberMap, navigate],
  )

  const isLoading = queueLoading || membersLoading

  return (
    <div>
      <PageHeader
        title="Duplicate Review Queue"
        description={
          <span>
            {stats.pending} pending review · {stats.highUnresolved} high confidence · {stats.resolved} resolved
          </span>
        }
        actions={
          <>
            <Button variant="secondary" onClick={startScan}>
              <ScanSearch className="h-4 w-4" />
              Run Full Scan
            </Button>
            <Button variant="secondary" onClick={() => exportQueueCsv(filtered, memberMap)}>
              <Download className="h-4 w-4" />
              Export Queue
            </Button>
            <Button
              onClick={() => setAutoResolveModalOpen(true)}
              disabled={autoResolveCandidates.length === 0}
            >
              <Zap className="h-4 w-4" />
              Auto-Resolve High Confidence
            </Button>
          </>
        }
      />

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New Today" value={stats.newToday} />
        <StatCard label="Pending Review" value={stats.pending} />
        <StatCard label="High Confidence" value={stats.highUnresolved} />
        <StatCard label="Resolved" value={stats.resolved} />
      </div>

      {/* Filter Controls */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Confidence"
          value={confidenceFilter}
          onChange={(e) => setConfidenceFilter(e.target.value)}
          options={CONFIDENCE_OPTIONS}
        />
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Source"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          options={SOURCE_OPTIONS}
        />
        <Select
          label="Sort By"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          options={SORT_OPTIONS}
        />
      </div>

      <p className="mb-2 text-sm text-gray-500">{filtered.length} items found</p>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No duplicate pairs match your filters"
        emptyIcon={AlertTriangle}
        onRowClick={(row) => navigate(`/members/duplicates/${row.id}`)}
      />

      {/* ── Run Full Scan Modal ─────────────────────────────────────── */}
      <Modal
        open={scanModalOpen}
        onClose={closeScanModal}
        title="Running Full Duplicate Scan"
        footer={
          scanComplete ? (
            <Button onClick={closeScanModal}>Close</Button>
          ) : undefined
        }
      >
        {scanComplete ? (
          <div className="text-center py-4">
            <div className="mb-2 text-lg font-semibold text-success-700">Scan complete</div>
            <p className="text-sm text-gray-600">
              {items.filter((i) => isUnresolved(i.status)).length} potential duplicate clusters found.
            </p>
          </div>
        ) : (
          <div className="py-4">
            <p className="mb-3 text-sm text-gray-600">
              Scanning member database for potential duplicates…
            </p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-150 ease-linear"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-gray-400">{scanProgress}%</p>
          </div>
        )}
      </Modal>

      {/* ── Auto-Resolve Modal ──────────────────────────────────────── */}
      <Modal
        open={autoResolveModalOpen}
        onClose={closeAutoResolveModal}
        title="Auto-Resolve High Confidence Duplicates"
        size="lg"
        footer={
          autoResolveComplete ? (
            <Button onClick={closeAutoResolveModal}>Close</Button>
          ) : autoResolveRunning ? undefined : (
            <>
              <Button variant="secondary" onClick={closeAutoResolveModal}>Cancel</Button>
              <Button onClick={runAutoResolve}>Run Auto-Resolve</Button>
            </>
          )
        }
      >
        {autoResolveComplete ? (
          <div className="text-center py-4">
            <div className="mb-2 text-lg font-semibold text-success-700">Auto-Resolve Complete</div>
            <p className="text-sm text-gray-600">
              {autoResolveCandidates.length} duplicate pair{autoResolveCandidates.length !== 1 ? 's' : ''} resolved automatically.
            </p>
          </div>
        ) : autoResolveRunning ? (
          <div className="py-4">
            <p className="mb-3 text-sm text-gray-600">
              Processing {autoResolveCandidates.length} duplicate pair{autoResolveCandidates.length !== 1 ? 's' : ''}…
            </p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-150 ease-linear"
                style={{ width: `${autoResolveProgress}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-gray-400">{autoResolveProgress}%</p>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-gray-700">
              Auto-resolve will process <strong>{autoResolveCandidates.length}</strong> duplicate
              pair{autoResolveCandidates.length !== 1 ? 's' : ''} with confidence score 100.
            </p>

            <button
              type="button"
              onClick={() => setShowSampleMerges((v) => !v)}
              className="mb-4 text-sm font-medium text-primary-600 hover:text-primary-700 underline"
            >
              {showSampleMerges ? 'Hide' : 'Preview'} Sample Merges
            </button>

            {showSampleMerges && (
              <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                      <th className="px-3 py-2">Member A</th>
                      <th className="px-3 py-2">Member B</th>
                      <th className="px-3 py-2">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autoResolveCandidates.slice(0, 10).map((item) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="px-3 py-2">{memberDisplayName(memberMap.get(item.memberAId))}</td>
                        <td className="px-3 py-2">{memberDisplayName(memberMap.get(item.memberBId))}</td>
                        <td className="px-3 py-2 font-medium">{item.confidenceScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
