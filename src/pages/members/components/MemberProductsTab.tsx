import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Check, X, Pencil } from 'lucide-react'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/Badge'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Modal } from '../../../components/ui/Modal'
import { DatePicker } from '../../../components/forms/DatePicker'
import { formatCurrency, formatDate } from '../../../utils/formatters'
import { INACTIVE_REASONS } from '../../../utils/constants'
import { ProductCommissionDetail } from '../../groups/components/ProductCommissionDetail'
import type { MemberProduct } from '../../../types/product'

interface MemberProductsTabProps {
  products: MemberProduct[]
  groupId: string
}

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Future Active', label: 'Future Active' },
  { value: 'Inactive', label: 'Inactive' },
]

const REASON_OPTIONS = INACTIVE_REASONS.map((r) => ({ value: r, label: r }))

const columns: ColumnDef<MemberProduct, unknown>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.original.status
      if (s === 'Future Active') return <Badge variant="info" dot>Future Active</Badge>
      return <StatusBadge status={s as 'Active' | 'Inactive'} />
    },
  },
  { accessorKey: 'name', header: 'Label' },
  {
    accessorKey: 'adminLabel',
    header: 'Admin Label',
    cell: ({ row }) => row.original.adminLabel || '—',
  },
  { accessorKey: 'productId', header: 'Product ID' },
  { accessorKey: 'category', header: 'Category' },
  {
    accessorKey: 'fee',
    header: 'Fee',
    cell: ({ row }) => `${formatCurrency(row.original.fee)}/mo`,
  },
  { accessorKey: 'benefitTier', header: 'Benefit Tier' },
  {
    accessorKey: 'cbsMemberNumber',
    header: 'CBS Member #',
    cell: ({ row }) => row.original.cbsMemberNumber || '—',
  },
  {
    accessorKey: 'anticipatedDate',
    header: 'Anticipated Date',
    cell: ({ row }) => (row.original.anticipatedDate ? formatDate(row.original.anticipatedDate) : '—'),
  },
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
]

export const MemberProductsTab = ({ products, groupId }: MemberProductsTabProps) => {
  const [editProduct, setEditProduct] = useState<MemberProduct | null>(null)
  const [commissionProduct, setCommissionProduct] = useState<MemberProduct | null>(null)
  const [editForm, setEditForm] = useState({
    anticipatedDate: '',
    fee: '',
    status: 'Active' as string,
    inactiveDate: '',
    inactiveReason: '',
  })

  const openEdit = (product: MemberProduct) => {
    setEditProduct(product)
    setEditForm({
      anticipatedDate: product.anticipatedDate ?? '',
      fee: String(product.fee),
      status: product.status,
      inactiveDate: product.inactiveDate ?? '',
      inactiveReason: product.inactiveReason ?? '',
    })
  }

  const editColumns: ColumnDef<MemberProduct, unknown>[] = [
    ...columns,
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(row.original)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <button
            onClick={() => setCommissionProduct(row.original)}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            Commissions
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable columns={editColumns} data={products} emptyMessage="No products assigned" />

      <Modal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        title={`Edit Product — ${editProduct?.name ?? ''}`}
        size="md"
      >
        {editProduct && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              <span className="text-gray-500">Product ID:</span>{' '}
              <span className="font-medium">{editProduct.productId}</span>
              {editProduct.cbsMemberNumber && (
                <>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-gray-500">CBS #:</span>{' '}
                  <span className="font-medium">{editProduct.cbsMemberNumber}</span>
                </>
              )}
            </div>

            <DatePicker
              label="Anticipated Date"
              value={editForm.anticipatedDate}
              onChange={(v) => setEditForm((f) => ({ ...f, anticipatedDate: v }))}
            />
            <Input
              label="Fee Amount"
              type="number"
              step="0.01"
              value={editForm.fee}
              onChange={(e) => setEditForm((f) => ({ ...f, fee: e.target.value }))}
              placeholder="0.00"
            />
            <Select
              label="Status"
              value={editForm.status}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
              options={STATUS_OPTIONS}
            />

            {editForm.status === 'Inactive' && (
              <>
                <DatePicker
                  label="Inactive Date"
                  value={editForm.inactiveDate}
                  onChange={(v) => setEditForm((f) => ({ ...f, inactiveDate: v }))}
                  required
                />
                <Select
                  label="Inactive Reason"
                  value={editForm.inactiveReason}
                  onChange={(e) => setEditForm((f) => ({ ...f, inactiveReason: e.target.value }))}
                  options={REASON_OPTIONS}
                  placeholder="Select reason…"
                  required
                />
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setEditProduct(null)}>Cancel</Button>
              <Button onClick={() => setEditProduct(null)}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {commissionProduct && (
        <ProductCommissionDetail
          open={!!commissionProduct}
          onClose={() => setCommissionProduct(null)}
          productName={commissionProduct.name}
          productId={commissionProduct.productId}
          groupId={groupId}
        />
      )}
    </>
  )
}
