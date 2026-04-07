import { type ColumnDef } from '@tanstack/react-table'
import { Check, X, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatCurrency, formatDate } from '../../../utils/formatters'
import type { MemberProduct } from '../../../types/product'

interface MemberProductsTabProps {
  products: MemberProduct[]
}

const columns: ColumnDef<MemberProduct, unknown>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status as 'Active' | 'Inactive'} />,
  },
  { accessorKey: 'name', header: 'Label' },
  { accessorKey: 'productId', header: 'Product ID' },
  {
    accessorKey: 'fee',
    header: 'Fee',
    cell: ({ row }) => `${formatCurrency(row.original.fee)}/mo`,
  },
  { accessorKey: 'benefitTier', header: 'Benefit Tier' },
  {
    accessorKey: 'activeDate',
    header: 'Active Date',
    cell: ({ row }) => (row.original.activeDate ? formatDate(row.original.activeDate) : '—'),
  },
  {
    accessorKey: 'paidThrough',
    header: 'Paid Through',
    cell: ({ row }) => (row.original.paidThrough ? formatDate(row.original.paidThrough) : '—'),
  },
  {
    accessorKey: 'paidStatus',
    header: 'Paid',
    cell: ({ row }) =>
      row.original.paidStatus ? (
        <Check className="h-4 w-4 text-success-500" />
      ) : (
        <X className="h-4 w-4 text-danger-500" />
      ),
  },
  {
    id: 'actions',
    header: '',
    enableSorting: false,
    cell: () => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-danger-500 hover:text-danger-600">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
  },
]

export const MemberProductsTab = ({ products }: MemberProductsTabProps) => {
  return <DataTable columns={columns} data={products} emptyMessage="No products assigned" />
}
