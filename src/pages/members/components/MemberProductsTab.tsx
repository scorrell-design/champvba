import { useState, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Check, X, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/Badge'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Modal } from '../../../components/ui/Modal'
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog'
import { DatePicker } from '../../../components/forms/DatePicker'
import { useToast } from '../../../components/feedback/Toast'
import { formatCurrency, formatDate } from '../../../utils/formatters'
import { INACTIVE_REASONS } from '../../../utils/constants'
import { PRODUCTS } from '../../../data/products'
import { cn } from '../../../utils/cn'
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

export const MemberProductsTab = ({ products: initialProducts, groupId }: MemberProductsTabProps) => {
  const [products, setProducts] = useState(initialProducts)
  const [editProduct, setEditProduct] = useState<MemberProduct | null>(null)
  const [commissionProduct, setCommissionProduct] = useState<MemberProduct | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [removeProduct, setRemoveProduct] = useState<MemberProduct | null>(null)
  const { addToast } = useToast()

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

  const handleSaveEdit = () => {
    if (!editProduct) return
    const isOverride = Number(editForm.fee) !== editProduct.fee
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === editProduct.productId
          ? {
              ...p,
              fee: Number(editForm.fee),
              status: editForm.status as MemberProduct['status'],
              anticipatedDate: editForm.anticipatedDate || undefined,
              inactiveDate: editForm.inactiveDate || undefined,
              inactiveReason: editForm.inactiveReason || undefined,
              isOverride: isOverride || p.isOverride,
            }
          : p,
      ),
    )
    addToast('success', `Product "${editProduct.name}" updated${isOverride ? ' (member override)' : ''}`)
    setEditProduct(null)
  }

  const handleAddProducts = (newProducts: typeof PRODUCTS) => {
    const toAdd: MemberProduct[] = newProducts.map((p) => ({
      productId: p.productId,
      name: p.name,
      adminLabel: p.adminLabel,
      category: p.category,
      fee: p.monthlyFee,
      status: 'Active' as const,
      benefitTier: 'Standard',
      commissionable: p.commissionable,
      isOverride: true,
    }))
    setProducts((prev) => [...prev, ...toAdd])
    addToast('success', `${newProducts.length} product${newProducts.length > 1 ? 's' : ''} added (member override)`)
    setAddOpen(false)
  }

  const handleRemove = () => {
    if (!removeProduct) return
    setProducts((prev) => prev.filter((p) => p.productId !== removeProduct.productId))
    addToast('success', `${removeProduct.name} removed`)
    setRemoveProduct(null)
  }

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
    {
      accessorKey: 'name',
      header: 'Label',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.name}</span>
          {row.original.isOverride && (
            <Badge variant="purple">Override</Badge>
          )}
        </div>
      ),
    },
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(row.original)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <button onClick={() => setRemoveProduct(row.original)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-danger-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
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

  const existingProductIds = new Set(products.map((p) => p.productId))

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Products ({products.length})</h4>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>
      <DataTable columns={columns} data={products} emptyMessage="No products assigned" />

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
              {editProduct.isOverride && (
                <Badge variant="purple" className="ml-2">Member Override</Badge>
              )}
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              Editing this product at the member level creates a member-level override. This member's pricing will not be affected by future group-level pricing changes.
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
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      <AddMemberProductModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddProducts}
        existingProductIds={existingProductIds}
      />

      <ConfirmDialog
        open={!!removeProduct}
        onClose={() => setRemoveProduct(null)}
        onConfirm={handleRemove}
        title="Remove Product"
        message={`Are you sure you want to remove "${removeProduct?.name}" from this member?`}
        confirmLabel="Remove"
        confirmVariant="danger"
      />

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

function AddMemberProductModal({
  open,
  onClose,
  onAdd,
  existingProductIds,
}: {
  open: boolean
  onClose: () => void
  onAdd: (products: typeof PRODUCTS) => void
  existingProductIds: Set<string>
}) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return PRODUCTS
    const q = search.toLowerCase()
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.productId.includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }, [search])

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAdd = () => {
    const selected = PRODUCTS.filter((p) => selectedIds.has(p.id))
    onAdd(selected)
    setSelectedIds(new Set())
    setSearch('')
  }

  const handleClose = () => {
    setSelectedIds(new Set())
    setSearch('')
    onClose()
  }

  const newCount = [...selectedIds].filter((id) => !existingProductIds.has(PRODUCTS.find((p) => p.id === id)?.productId ?? '')).length

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Product to Member"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={newCount === 0}>
            Add Selected ({newCount})
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Adding products at the member level creates a member-level override.
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="max-h-[350px] overflow-y-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-3 py-2 w-8"></th>
                <th className="px-3 py-2">Product Name</th>
                <th className="px-3 py-2">Product ID</th>
                <th className="px-3 py-2">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const alreadyAdded = existingProductIds.has(p.productId)
                const isChecked = alreadyAdded || selectedIds.has(p.id)
                return (
                  <tr
                    key={p.id}
                    className={cn(
                      'transition-colors',
                      alreadyAdded ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-50 cursor-pointer',
                    )}
                    onClick={() => { if (!alreadyAdded) toggle(p.id) }}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={alreadyAdded}
                        onChange={() => { if (!alreadyAdded) toggle(p.id) }}
                        className="h-4 w-4 rounded border-gray-300 text-primary-500 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn('font-medium', alreadyAdded ? 'text-gray-400' : 'text-primary-600')}>
                        {p.name}
                      </span>
                      {alreadyAdded && <span className="ml-1 text-xs text-gray-400">(already assigned)</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">{p.productId}</td>
                    <td className="px-3 py-2 text-gray-500">{formatCurrency(p.monthlyFee)}/mo</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}
