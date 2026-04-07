import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { useAuditLog } from '../../../hooks/useQueries'
import { useAuditStore } from '../../../stores/audit-store'
import { formatDateTime } from '../../../utils/formatters'
import type { AuditEntry } from '../../../types/audit'

const columns: ColumnDef<AuditEntry, unknown>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Date/Time',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-xs">{formatDateTime(getValue<string>())}</span>
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
      const variant = action === 'Note Added' ? 'info' : action === 'Status Changed' ? 'warning' : 'gray'
      return <Badge variant={variant}>{action}</Badge>
    },
  },
  { accessorKey: 'fieldChanged', header: 'Field' },
  {
    accessorKey: 'oldValue',
    header: 'Old Value',
    cell: ({ getValue }) => (
      <span className="text-gray-500">{getValue<string>() || '—'}</span>
    ),
  },
  {
    accessorKey: 'newValue',
    header: 'New Value',
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>() || '—'}</span>
    ),
  },
]

interface GroupHistoryTabProps {
  groupId: string
}

export const GroupHistoryTab = ({ groupId }: GroupHistoryTabProps) => {
  const { data: entries = [], isLoading } = useAuditLog({ entityType: 'Group' })
  const localEntries = useAuditStore((s) => s.getEntriesForEntity(groupId, 'Group'))

  const merged = useMemo(() => {
    const serverFiltered = entries.filter((e) => e.entityId === groupId)
    const all = [...localEntries, ...serverFiltered]
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [entries, localEntries, groupId])

  return (
    <DataTable
      columns={columns}
      data={merged}
      isLoading={isLoading}
      emptyMessage="No history entries"
    />
  )
}
