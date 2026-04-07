import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge, SystemBadge } from '../../../components/ui/Badge'
import { useAuditLog } from '../../../hooks/useQueries'
import { useAuditStore } from '../../../stores/audit-store'
import { formatDateTime } from '../../../utils/formatters'
import type { AuditEntry } from '../../../types/audit'

function safeString(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function safeFormatDateTime(value: unknown): string {
  if (!value) return '—'
  try {
    return formatDateTime(typeof value === 'string' ? value : new Date(value as number).toISOString())
  } catch {
    return String(value)
  }
}

const columns: ColumnDef<AuditEntry, unknown>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Date/Time',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-xs">{safeFormatDateTime(row.original.timestamp)}</span>
    ),
  },
  {
    accessorKey: 'changedBy',
    header: 'User',
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">{safeString(row.original.changedBy)}</span>
    ),
  },
  {
    accessorKey: 'actionType',
    header: 'Action',
    cell: ({ row }) => {
      const action = safeString(row.original.actionType)
      const variant = action === 'Note Added' ? 'info'
        : action === 'Status Changed' ? 'warning'
        : action === 'Group Created' ? 'success'
        : 'gray'
      return <Badge variant={variant}>{action}</Badge>
    },
  },
  {
    accessorKey: 'fieldChanged',
    header: 'Field',
    cell: ({ row }) => <span>{safeString(row.original.fieldChanged)}</span>,
  },
  {
    accessorKey: 'oldValue',
    header: 'Old Value',
    cell: ({ row }) => (
      <span className="text-gray-500">{safeString(row.original.oldValue) || '—'}</span>
    ),
  },
  {
    accessorKey: 'newValue',
    header: 'New Value',
    cell: ({ row }) => (
      <span className="font-medium">{safeString(row.original.newValue) || '—'}</span>
    ),
  },
  {
    accessorKey: 'systemsAffected',
    header: 'Systems',
    cell: ({ row }) => {
      const systems = row.original.systemsAffected
      if (!Array.isArray(systems)) return <span className="text-gray-400">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {systems.map((sys) => (
            <SystemBadge key={sys} system={sys} />
          ))}
        </div>
      )
    },
  },
]

interface GroupHistoryTabProps {
  groupId: string
}

export const GroupHistoryTab = ({ groupId }: GroupHistoryTabProps) => {
  const { data: entries = [], isLoading } = useAuditLog({ entityType: 'Group' })
  const storeEntries = useAuditStore((s) => s.entries)

  const localEntries = useMemo(
    () => storeEntries.filter((e) => e.entityId === groupId && e.entityType === 'Group'),
    [storeEntries, groupId],
  )

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
