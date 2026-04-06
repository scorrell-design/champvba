import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { useAuditLog } from '../../hooks/useQueries'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { SystemBadge } from '../../components/ui/Badge'
import { DataTable } from '../../components/ui/DataTable'
import { Card } from '../../components/ui/Card'
import { formatDateTime } from '../../utils/formatters'
import type { AuditEntry } from '../../types/audit'
import type { AuditFilters } from '../../services/api'

const entityTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'Member', label: 'Member' },
  { value: 'Group', label: 'Group' },
]

const userOptions = [
  { value: '', label: 'All Users' },
  { value: 'Stephanie C.', label: 'Stephanie C.' },
  { value: 'Tori M.', label: 'Tori M.' },
  { value: 'Kacy L.', label: 'Kacy L.' },
  { value: 'Lillie R.', label: 'Lillie R.' },
  { value: 'System Import', label: 'System Import' },
]

const systemOptions = [
  { value: '', label: 'All Systems' },
  { value: 'CBS', label: 'CBS' },
  { value: 'VBA', label: 'VBA' },
  { value: 'Kintone', label: 'Kintone' },
  { value: 'Admin123', label: 'Admin123' },
  { value: 'Local', label: 'Local' },
]

const entityBadgeVariant = { Member: 'info', Group: 'purple' } as const

const columns: ColumnDef<AuditEntry, unknown>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{formatDateTime(getValue<string>())}</span>
    ),
  },
  {
    accessorKey: 'entityType',
    header: 'Entity Type',
    cell: ({ getValue }) => {
      const type = getValue<'Member' | 'Group'>()
      return <Badge variant={entityBadgeVariant[type]}>{type}</Badge>
    },
  },
  {
    id: 'entityName',
    header: 'Entity Name',
    cell: ({ row }) => {
      const { entityType, entityId, entityName } = row.original
      const href = entityType === 'Member' ? `/members/${entityId}` : `/groups/${entityId}`
      return (
        <Link to={href} className="text-primary-500 hover:underline">
          {entityName}
        </Link>
      )
    },
  },
  { accessorKey: 'fieldChanged', header: 'Field Changed' },
  {
    accessorKey: 'oldValue',
    header: 'Old Value',
    cell: ({ getValue }) => (
      <span className="max-w-[140px] truncate text-gray-500">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'newValue',
    header: 'New Value',
    cell: ({ getValue }) => (
      <span className="max-w-[140px] truncate font-medium text-primary-600">{getValue<string>()}</span>
    ),
  },
  { accessorKey: 'changedBy', header: 'Changed By' },
  {
    id: 'systems',
    header: 'Systems',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.systemsAffected.map((s) => (
          <SystemBadge key={s} system={s} />
        ))}
      </div>
    ),
  },
]

function AuditFiltersBar({
  filters,
  onChange,
}: {
  filters: AuditFilters
  onChange: (next: AuditFilters) => void
}) {
  const set = (key: keyof AuditFilters, value: string) =>
    onChange({ ...filters, [key]: value || undefined })

  return (
    <Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          label="From"
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => set('dateFrom', e.target.value)}
        />
        <Input
          label="To"
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => set('dateTo', e.target.value)}
        />
        <Select
          label="Entity Type"
          options={entityTypeOptions}
          value={filters.entityType ?? ''}
          onChange={(e) => set('entityType', e.target.value)}
        />
        <Select
          label="User"
          options={userOptions}
          value={filters.changedBy ?? ''}
          onChange={(e) => set('changedBy', e.target.value)}
        />
        <Select
          label="System"
          options={systemOptions}
          value={filters.system ?? ''}
          onChange={(e) => set('system', e.target.value)}
        />
      </div>
    </Card>
  )
}

function downloadCsv(entries: AuditEntry[]) {
  const header = 'Timestamp,Entity Type,Entity Name,Field Changed,Old Value,New Value,Changed By,Systems'
  const rows = entries.map((e) =>
    [
      e.timestamp,
      e.entityType,
      `"${e.entityName}"`,
      e.fieldChanged,
      `"${e.oldValue}"`,
      `"${e.newValue}"`,
      e.changedBy,
      e.systemsAffected.join('; '),
    ].join(','),
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function AuditLogPage() {
  const [filters, setFilters] = useState<AuditFilters>({})
  const { data: entries, isLoading } = useAuditLog(filters)

  const handleExport = useCallback(() => {
    if (entries?.length) downloadCsv(entries)
  }, [entries])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Track all changes across the portal"
        actions={
          <Button variant="secondary" onClick={handleExport} disabled={!entries?.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <AuditFiltersBar filters={filters} onChange={setFilters} />

      <DataTable
        columns={columns}
        data={entries ?? []}
        isLoading={isLoading}
        emptyIcon={FileText}
        emptyMessage="No audit entries match your filters"
      />
    </div>
  )
}
