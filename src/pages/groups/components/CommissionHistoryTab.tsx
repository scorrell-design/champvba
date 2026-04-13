import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge, type BadgeVariant } from '../../../components/ui/Badge'
import { useAuditStore } from '../../../stores/audit-store'
import { formatDate } from '../../../utils/formatters'

interface CommissionHistoryTabProps {
  groupId: string
  groupName: string
}

interface CommissionHistoryEntry {
  id: string
  timestamp: string
  fieldChanged: string
  oldValue: string
  newValue: string
  changedBy: string
  actionType: string
  source: string
}

export const CommissionHistoryTab = ({ groupId }: CommissionHistoryTabProps) => {
  const entries = useAuditStore((s) => s.getEntriesForEntity(groupId, 'Group'))

  const commissionEntries: CommissionHistoryEntry[] = useMemo(() => {
    return entries
      .filter((e) =>
        e.fieldChanged === 'Commission' ||
        e.fieldChanged === 'Commission (Bulk Copy)' ||
        e.fieldChanged === 'Commission Copy' ||
        (e.fieldChanged === 'Product' && e.newValue.includes('Commission')) ||
        (e.fieldChanged === 'Product Cascade' && e.newValue.includes('/'))
      )
      .map((e) => {
        let source = 'Manual edit'
        if (e.fieldChanged === 'Commission (Bulk Copy)' || e.fieldChanged === 'Commission Copy') {
          source = e.newValue.includes('Copied from') ? e.newValue.match(/Copied from (.+?):/)?.[1] || 'Parent group' : 'Bulk copy'
        }
        return {
          id: e.id,
          timestamp: e.timestamp,
          fieldChanged: e.fieldChanged,
          oldValue: e.oldValue,
          newValue: e.newValue,
          changedBy: e.changedBy,
          actionType: e.actionType ?? 'Product Updated',
          source,
        }
      })
  }, [entries])

  const columns: ColumnDef<CommissionHistoryEntry, unknown>[] = useMemo(() => [
    {
      accessorKey: 'timestamp',
      header: 'Date',
      cell: ({ getValue }) => {
        const ts = getValue<string>()
        return (
          <div>
            <p className="text-sm text-gray-800">{formatDate(ts)}</p>
            <p className="text-[10px] text-gray-400">{new Date(ts).toLocaleTimeString()}</p>
          </div>
        )
      },
    },
    {
      accessorKey: 'fieldChanged',
      header: 'Change',
      cell: ({ row }) => {
        const field = row.original.fieldChanged
        const variant: BadgeVariant = field.includes('Bulk') || field.includes('Copy') ? 'purple' : field.includes('Cascade') ? 'info' : 'gray'
        return <Badge variant={variant}>{field}</Badge>
      },
    },
    {
      accessorKey: 'oldValue',
      header: 'Previous',
      cell: ({ getValue }) => {
        const v = getValue<string>()
        return v ? <span className="text-gray-500">{v}</span> : <span className="text-gray-300">—</span>
      },
    },
    {
      accessorKey: 'newValue',
      header: 'New Value',
      cell: ({ getValue }) => <span className="font-medium text-gray-800">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ getValue }) => {
        const src = getValue<string>()
        return (
          <Badge variant={src === 'Manual edit' ? 'gray' : 'purple'}>
            {src}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'changedBy',
      header: 'Changed By',
      cell: ({ getValue }) => <span className="text-sm text-gray-600">{getValue<string>()}</span>,
    },
  ], [])

  if (commissionEntries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-400">No commission changes recorded yet.</p>
        <p className="mt-1 text-xs text-gray-300">Commission changes made to products on this group will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Commission Change Log</h3>
        <span className="text-xs text-gray-400">{commissionEntries.length} entries</span>
      </div>
      <DataTable columns={columns} data={commissionEntries} emptyMessage="No commission history" />
    </div>
  )
}
