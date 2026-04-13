import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus, Search, Ban, RotateCcw, AlertTriangle } from 'lucide-react'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge, type BadgeVariant } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { SlideOver } from '../../../components/ui/SlideOver'
import { Modal } from '../../../components/ui/Modal'
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog'
import { useToast } from '../../../components/feedback/Toast'
import { useAuditStore } from '../../../stores/audit-store'
import { formatCurrency } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'
import { PRODUCTS } from '../../../data/products'
import { ProductCommissionDetail } from './ProductCommissionDetail'
import type { Product } from '../../../types/product'
import type { ProductStatus } from '../../../utils/constants'

const statusVariant: Record<ProductStatus, BadgeVariant> = {
  Active: 'success',
  'Future Active': 'info',
  Inactive: 'gray',
  Pending: 'warning',
}

type FilterOption = 'All' | 'Active' | 'Inactive'
const FILTERS: FilterOption[] = ['All', 'Active', 'Inactive']
const STATUS_OPTS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-500" />
    {label}
  </label>
)

const AddProductModal = ({ open, onClose, onAdd, existingIds }: {
  open: boolean; onClose: () => void; onAdd: (products: Product[]) => void; existingIds: Set<string>
}) => {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return PRODUCTS
    const q = search.toLowerCase()
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.adminLabel ?? '').toLowerCase().includes(q) ||
        p.productId.includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }, [search])

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAdd = () => {
    const toAdd = PRODUCTS.filter((p) => selectedIds.has(p.id))
    onAdd(toAdd)
    setSelectedIds(new Set())
    setSearch('')
  }

  const handleClose = () => {
    setSelectedIds(new Set())
    setSearch('')
    onClose()
  }

  const newSelectionCount = [...selectedIds].filter((id) => !existingIds.has(id)).length

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add a Product"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={newSelectionCount === 0}>
            Add Selected ({newSelectionCount})
          </Button>
        </>
      }
    >
      <div className="space-y-4">
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

        <div className="max-h-[400px] overflow-y-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-3 py-2 w-8"></th>
                <th className="px-3 py-2">Product Name</th>
                <th className="px-3 py-2">Admin Label</th>
                <th className="px-3 py-2">Product ID</th>
                <th className="px-3 py-2">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const alreadyAdded = existingIds.has(p.id)
                const isChecked = alreadyAdded || selectedIds.has(p.id)

                return (
                  <tr
                    key={p.id}
                    className={cn(
                      'transition-colors',
                      alreadyAdded ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-50 cursor-pointer',
                    )}
                    onClick={() => { if (!alreadyAdded) toggleProduct(p.id) }}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={alreadyAdded}
                        onChange={() => { if (!alreadyAdded) toggleProduct(p.id) }}
                        className="h-4 w-4 rounded border-gray-300 text-primary-500 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn('font-medium', alreadyAdded ? 'text-gray-400' : 'text-primary-600')}>
                        {p.name}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {p.adminLabel ?? p.name}
                    </td>
                    <td className="px-3 py-2 text-gray-500 font-mono text-xs">{p.productId}</td>
                    <td className="px-3 py-2 text-gray-500">{p.category}</td>
                  </tr>
                )
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-400">No products match your search</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}

const EditProductSlideOver = ({ open, onClose, product, onSave, onCascade, memberCount }: {
  open: boolean; onClose: () => void; product: Product | null; onSave: (p: Product) => void; onCascade?: (p: Product) => void; memberCount?: number
}) => {
  const [fee, setFee] = useState(product?.monthlyFee ?? 0)
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'Active')
  const [websiteDisplay, setWebsiteDisplay] = useState(product?.websiteDisplay ?? true)
  const [websiteOrder, setWebsiteOrder] = useState(product?.websiteOrder ?? 0)
  const [cascadeConfirm, setCascadeConfirm] = useState(false)

  if (!product) return null

  const priceChanged = fee !== product.monthlyFee

  const handleSave = () => {
    const updated = { ...product, monthlyFee: fee, status, websiteDisplay, websiteOrder }
    if (priceChanged && onCascade && memberCount && memberCount > 0) {
      setCascadeConfirm(true)
    } else {
      onSave(updated)
    }
  }

  const handleCascadeConfirm = () => {
    const updated = { ...product, monthlyFee: fee, status, websiteDisplay, websiteOrder }
    onSave(updated)
    onCascade?.(updated)
    setCascadeConfirm(false)
  }

  return (
    <>
      <SlideOver open={open} onClose={onClose} title="Edit Product">
        <div className="space-y-4">
          <Input label="Product" value={product.name} disabled />
          <Input label="Monthly Fee" type="number" step="0.01" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
          <Select label="Status" options={STATUS_OPTS} value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} />
          <Checkbox label="Website Display" checked={websiteDisplay} onChange={setWebsiteDisplay} />
          <Input label="Website Order" type="number" value={websiteOrder} onChange={(e) => setWebsiteOrder(Number(e.target.value))} />
          {priceChanged && memberCount && memberCount > 0 ? (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">
                Price change detected. Saving will cascade the new pricing to all {memberCount} members enrolled in this product.
              </p>
            </div>
          ) : null}
          <Button onClick={handleSave} className="w-full">Save Changes</Button>
        </div>
      </SlideOver>
      <ConfirmDialog
        open={cascadeConfirm}
        onClose={() => setCascadeConfirm(false)}
        onConfirm={handleCascadeConfirm}
        title="Cascade Pricing Update"
        message={`This will update the price of "${product.name}" from ${formatCurrency(product.monthlyFee)} to ${formatCurrency(fee)} for all ${memberCount} members enrolled in this group. Member-level overrides will not be affected. Continue?`}
        confirmLabel="Update All Members"
      />
    </>
  )
}

interface GroupProductsTabProps {
  products: Product[]
  groupId: string
  memberCount: number
}

export const GroupProductsTab = ({ products: initialProducts, groupId, memberCount }: GroupProductsTabProps) => {
  const { addToast } = useToast()
  const addAuditEntry = useAuditStore((s) => s.addEntry)
  const [products, setProducts] = useState(initialProducts)
  const [filter, setFilter] = useState<FilterOption>('All')
  const [addOpen, setAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [commissionProduct, setCommissionProduct] = useState<Product | null>(null)
  const [inactivateProduct, setInactivateProduct] = useState<Product | null>(null)
  const [reactivateProduct, setReactivateProduct] = useState<Product | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'All') return products
    return products.filter((p) => p.status === filter)
  }, [products, filter])

  const columns: ColumnDef<Product, unknown>[] = useMemo(() => [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue<ProductStatus>()
        return <Badge variant={statusVariant[s]} dot>{s}</Badge>
      },
    },
    {
      accessorKey: 'name',
      header: 'Label',
      cell: ({ row }) => (
        <span className={row.original.status === 'Inactive' ? 'text-gray-400' : ''}>
          {row.original.name}
        </span>
      ),
    },
    { accessorKey: 'productId', header: 'Product ID' },
    { accessorKey: 'category', header: 'Category' },
    {
      accessorKey: 'monthlyFee',
      header: 'Monthly Fee',
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const isInactive = row.original.status === 'Inactive'
        return (
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setEditProduct(row.original) }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {isInactive ? (
              <button onClick={(e) => { e.stopPropagation(); setReactivateProduct(row.original) }} className="rounded p-1.5 text-gray-400 hover:bg-success-50 hover:text-success-600" title="Reactivate">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); setInactivateProduct(row.original) }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-danger-500" title="Inactivate">
                <Ban className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setCommissionProduct(row.original) }}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              Commissions
            </button>
          </div>
        )
      },
    },
  ], [])

  const handleAdd = (newProducts: Product[]) => {
    setProducts((prev) => [...prev, ...newProducts])
    newProducts.forEach((p) => {
      addAuditEntry({
        entityType: 'Group',
        entityId: groupId,
        entityName: '',
        fieldChanged: 'Product',
        oldValue: '',
        newValue: `Added: ${p.name}`,
        changedBy: 'Stephanie C.',
        actionType: 'Product Added',
      })
    })
    addToast('success', `${newProducts.length} product${newProducts.length > 1 ? 's' : ''} added`)
    setAddOpen(false)
  }

  const handleEdit = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    addAuditEntry({
      entityType: 'Group',
      entityId: groupId,
      entityName: '',
      fieldChanged: 'Product',
      oldValue: editProduct ? `${editProduct.name}: ${formatCurrency(editProduct.monthlyFee)}` : '',
      newValue: `${updated.name}: ${formatCurrency(updated.monthlyFee)}`,
      changedBy: 'Stephanie C.',
      actionType: 'Product Updated',
    })
    addToast('success', 'Product updated')
    setEditProduct(null)
  }

  const handleCascade = (updated: Product) => {
    addAuditEntry({
      entityType: 'Group',
      entityId: groupId,
      entityName: '',
      fieldChanged: 'Product Pricing Cascade',
      oldValue: editProduct ? formatCurrency(editProduct.monthlyFee) : '',
      newValue: `${updated.name} pricing cascaded to all ${memberCount} members: ${formatCurrency(updated.monthlyFee)}`,
      changedBy: 'Stephanie C.',
      actionType: 'Product Updated',
    })
    addToast('success', `Pricing for "${updated.name}" cascaded to all ${memberCount} group members`)
  }

  const handleInactivate = () => {
    if (!inactivateProduct) return
    setProducts((prev) => prev.map((p) => p.id === inactivateProduct.id ? { ...p, status: 'Inactive' as const } : p))
    addAuditEntry({
      entityType: 'Group',
      entityId: groupId,
      entityName: '',
      fieldChanged: 'Product Status',
      oldValue: `${inactivateProduct.name}: Active`,
      newValue: `${inactivateProduct.name}: Inactive — cascaded to ${memberCount} member${memberCount !== 1 ? 's' : ''}`,
      changedBy: 'Stephanie C.',
      actionType: 'Product Updated',
    })
    addToast('success', `"${inactivateProduct.name}" set to Inactive for this group and all ${memberCount} members`)
    setInactivateProduct(null)
  }

  const handleReactivate = () => {
    if (!reactivateProduct) return
    setProducts((prev) => prev.map((p) => p.id === reactivateProduct.id ? { ...p, status: 'Active' as const } : p))
    addAuditEntry({
      entityType: 'Group',
      entityId: groupId,
      entityName: '',
      fieldChanged: 'Product Status',
      oldValue: `${reactivateProduct.name}: Inactive`,
      newValue: `${reactivateProduct.name}: Active — cascaded to ${memberCount} member${memberCount !== 1 ? 's' : ''}`,
      changedBy: 'Stephanie C.',
      actionType: 'Product Updated',
    })
    addToast('success', `"${reactivateProduct.name}" reactivated for this group and all ${memberCount} members`)
    setReactivateProduct(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {FILTERS.map((opt) => (
            <button key={opt} onClick={() => setFilter(opt)} className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              filter === opt ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}>
              {opt}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No products found" />

      <AddProductModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} existingIds={new Set(products.map((p) => p.id))} />
      <EditProductSlideOver
        key={editProduct?.id}
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
        onSave={handleEdit}
        onCascade={handleCascade}
        memberCount={memberCount}
      />
      <ConfirmDialog
        open={!!inactivateProduct}
        onClose={() => setInactivateProduct(null)}
        onConfirm={handleInactivate}
        title="Inactivate Product"
        message={`This will set "${inactivateProduct?.name}" to Inactive for this group and cascade to all ${memberCount} enrolled member${memberCount !== 1 ? 's' : ''}. Each member's instance of this product will also be set to Inactive. Continue?`}
        confirmLabel="Inactivate Product"
        confirmVariant="danger"
      />
      <ConfirmDialog
        open={!!reactivateProduct}
        onClose={() => setReactivateProduct(null)}
        onConfirm={handleReactivate}
        title="Reactivate Product"
        message={`This will restore "${reactivateProduct?.name}" to Active for this group and cascade to all ${memberCount} member${memberCount !== 1 ? 's' : ''}. Each member's instance of this product will also be set to Active. Continue?`}
        confirmLabel="Reactivate Product"
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
    </div>
  )
}
