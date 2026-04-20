import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Building2 } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { DataTable } from '../../components/ui/DataTable'
import { SearchBar } from '../../components/ui/SearchBar'
import { useGroups } from '../../hooks/useQueries'
import { useCommissionStore } from '../../stores/commission-store'
import { formatCurrency } from '../../utils/formatters'
import type { ColumnDef } from '@tanstack/react-table'

interface CommissionRow {
  id: string
  groupName: string
  groupId: string
  productName: string
  productId: string
  payoutType: string
  payoutAmount: number
  entity: string
  agentType: string
}

const columns: ColumnDef<CommissionRow, unknown>[] = [
  { accessorKey: 'groupName', header: 'Group', cell: (info) => {
    const row = info.row.original
    return <Link to={`/groups/${row.groupId}`} className="font-medium text-primary-600 hover:underline">{info.getValue() as string}</Link>
  }},
  { accessorKey: 'productName', header: 'Product' },
  { accessorKey: 'productId', header: 'Product ID', cell: (info) => <span className="text-gray-500">{info.getValue() as string}</span> },
  { accessorKey: 'entity', header: 'Agent/Broker' },
  { accessorKey: 'agentType', header: 'Type', cell: (info) => <Badge variant="gray">{info.getValue() as string}</Badge> },
  { accessorKey: 'payoutType', header: 'Payout', cell: (info) => <Badge variant="gray">{info.getValue() as string}</Badge> },
  {
    accessorKey: 'payoutAmount',
    header: 'Amount',
    cell: (info) => {
      const row = info.row.original
      return row.payoutType === 'percentage' ? `${info.getValue()}%` : formatCurrency(info.getValue() as number)
    },
  },
]

export function CommissionsPage() {
  const [search, setSearch] = useState('')
  const { data: groups = [] } = useGroups()
  const allCommissions = useCommissionStore((s) => s.commissions)

  const rows: CommissionRow[] = useMemo(() => {
    return allCommissions.map((c) => {
      const group = groups.find((g) => g.id === c.groupId)
      const product = group?.products.find((p) => p.productId === c.productId)
      return {
        id: c.id,
        groupName: group?.legalName ?? c.groupId,
        groupId: c.groupId,
        productName: product?.name ?? c.productId,
        productId: c.productId,
        payoutType: c.payoutType,
        payoutAmount: c.amount,
        entity: c.agentName,
        agentType: c.agentType,
      }
    })
  }, [allCommissions, groups])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        r.groupName.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.entity.toLowerCase().includes(q),
    )
  }, [rows, search])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commission Management"
        description="View all commissions across groups. To add or edit commissions, navigate to the group's Commissions tab."
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by group, product, or agent..." />
          <p className="text-sm text-gray-500">{allCommissions.length} total commissions</p>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No commission records found" emptyIcon={DollarSign} />
      </div>

      {groups.length > 0 && (
        <Card>
          <h3 className="text-section-title text-gray-900">Configure by Group</h3>
          <p className="mt-1 text-sm text-gray-500">Select a group to manage its commissions</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <Link key={g.id} to={`/groups/${g.id}`} className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-800">{g.legalName}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
