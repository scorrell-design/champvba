import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Check, X } from 'lucide-react'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge, type BadgeVariant } from '../../../components/ui/Badge'
import { formatCurrency } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'
import type { Product } from '../../../types/product'
import type { ProductStatus } from '../../../utils/constants'

const productStatusVariant: Record<ProductStatus, BadgeVariant> = {
  Active: 'success',
  Inactive: 'gray',
  Pending: 'warning',
}

type FilterOption = 'All' | 'Active' | 'Inactive'

const columns: ColumnDef<Product, unknown>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<ProductStatus>()
      return (
        <Badge variant={productStatusVariant[status]} dot>
          {status}
        </Badge>
      )
    },
  },
  { accessorKey: 'name', header: 'Label' },
  { accessorKey: 'productId', header: 'Product ID' },
  { accessorKey: 'category', header: 'Category' },
  {
    accessorKey: 'monthlyFee',
    header: 'Monthly Fee',
    cell: ({ getValue }) => formatCurrency(getValue<number>()),
  },
  {
    accessorKey: 'commissionable',
    header: 'Commissionable',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Check className="h-4 w-4 text-success-500" />
      ) : (
        <X className="h-4 w-4 text-gray-300" />
      ),
  },
]

const FILTER_OPTIONS: FilterOption[] = ['All', 'Active', 'Inactive']

interface GroupProductsTabProps {
  products: Product[]
}

export const GroupProductsTab = ({ products }: GroupProductsTabProps) => {
  const [filter, setFilter] = useState<FilterOption>('All')

  const filtered = useMemo(() => {
    if (filter === 'All') return products
    return products.filter((p) => p.status === filter)
  }, [products, filter])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              filter === opt
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      <DataTable columns={columns} data={filtered} emptyMessage="No products found" />
    </div>
  )
}
