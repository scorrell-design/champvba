import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../../components/ui/DataTable'
import { SystemBadge } from '../../../components/ui/Badge'
import { useAuditLog } from '../../../hooks/useQueries'
import { formatDateTime } from '../../../utils/formatters'
import type { AuditEntry } from '../../../types/audit'

interface MemberHistoryTabProps {
  memberId: string
}

const columns: ColumnDef<AuditEntry, unknown>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-xs">{formatDateTime(row.original.timestamp)}</span>
    ),
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
  { accessorKey: 'changedBy', header: 'Changed By' },
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

export const MemberHistoryTab = ({ memberId }: MemberHistoryTabProps) => {
  const { data: entries = [], isLoading } = useAuditLog()

  const filtered = entries.filter(
    (e) => e.entityType === 'Member' && e.entityId === memberId,
  )

  return (
    <DataTable
      columns={columns}
      data={filtered}
      isLoading={isLoading}
      emptyMessage="No history records"
    />
  )
}
