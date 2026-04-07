import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge, SystemBadge } from '../../../components/ui/Badge'
import { useAuditLog } from '../../../hooks/useQueries'
import { useAuditStore } from '../../../stores/audit-store'
import { formatDateTime } from '../../../utils/formatters'
import type { AuditEntry } from '../../../types/audit'

const columns: ColumnDef<AuditEntry, unknown>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Date/Time',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-xs">{formatDateTime(row.original.timestamp)}</span>
    ),
  },
  {
    accessorKey: 'changedBy',
    header: 'User',
    cell: ({ getValue }) => (
      <span className="font-medium text-gray-900">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'actionType',
    header: 'Action',
    cell: ({ getValue }) => {
      const action = getValue<string>()
      const variant = action === 'Note Added' ? 'info'
        : action === 'Status Changed' || action === 'Member Terminated' ? 'warning'
        : action === 'Dependent Added' || action === 'Dependent Updated' ? 'teal'
        : 'gray'
      return <Badge variant={variant}>{action}</Badge>
    },
  },
  { accessorKey: 'fieldChanged', header: 'Field' },
  {
    accessorKey: 'oldValue',
    header: 'Old Value',
    cell: ({ row }) => (
      <span className="text-gray-500">{row.original.oldValue || '—'}</span>
    ),
  },
  {
    accessorKey: 'newValue',
    header: 'New Value',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.newValue || '—'}</span>
    ),
  },
  {
    accessorKey: 'systemsAffected',
    header: 'Systems',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.systemsAffected.map((sys) => (
          <SystemBadge key={sys} system={sys} />
        ))}
      </div>
    ),
  },
]

interface MemberHistoryTabProps {
  memberId: string
}

export const MemberHistoryTab = ({ memberId }: MemberHistoryTabProps) => {
  const { data: entries = [], isLoading } = useAuditLog()
  const localEntries = useAuditStore((s) => s.getEntriesForEntity(memberId, 'Member'))

  const merged = useMemo(() => {
    const serverFiltered = entries.filter(
      (e) => e.entityType === 'Member' && e.entityId === memberId,
    )
    const all = [...localEntries, ...serverFiltered]
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [entries, localEntries, memberId])

  return (
    <DataTable
      columns={columns}
      data={merged}
      isLoading={isLoading}
      emptyMessage="No history records"
    />
  )
}
