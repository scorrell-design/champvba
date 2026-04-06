import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../../components/ui/DataTable'
import { SystemBadge } from '../../../components/ui/Badge'
import { useAuditLog } from '../../../hooks/useQueries'
import { formatDateTime } from '../../../utils/formatters'
import type { AuditEntry } from '../../../types/audit'
import type { SystemBadge as SystemBadgeType } from '../../../utils/constants'

const columns: ColumnDef<AuditEntry, unknown>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ getValue }) => formatDateTime(getValue<string>()),
  },
  { accessorKey: 'fieldChanged', header: 'Field Changed' },
  { accessorKey: 'oldValue', header: 'Old Value' },
  { accessorKey: 'newValue', header: 'New Value' },
  { accessorKey: 'changedBy', header: 'Changed By' },
  {
    accessorKey: 'systemsAffected',
    header: 'Systems',
    cell: ({ getValue }) => (
      <div className="flex gap-1">
        {getValue<SystemBadgeType[]>().map((s) => (
          <SystemBadge key={s} system={s} />
        ))}
      </div>
    ),
  },
]

interface GroupHistoryTabProps {
  groupId: string
}

export const GroupHistoryTab = ({ groupId }: GroupHistoryTabProps) => {
  const { data: entries = [], isLoading } = useAuditLog({ entityType: 'Group' })

  const filtered = useMemo(
    () => entries.filter((e) => e.entityId === groupId),
    [entries, groupId],
  )

  return (
    <DataTable
      columns={columns}
      data={filtered}
      isLoading={isLoading}
      emptyMessage="No history entries"
    />
  )
}
