import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Check, X, Pencil, Plus, Search } from 'lucide-react'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge, type BadgeVariant } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { SlideOver } from '../../../components/ui/SlideOver'
import { Modal } from '../../../components/ui/Modal'
import { useToast } from '../../../components/feedback/Toast'
import { formatCurrency } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'
import { PRODUCTS } from '../../../data/products'
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
                      {p.productId === '35435' && (
                        <span className="ml-1 text-xs font-semibold text-amber-600">(FOR WLT USE ONLY)</span>
                      )}
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

const EditProductSlideOver = ({ open, onClose, product, onSave }: {
  open: boolean; onClose: () => void; product: Product | null; onSave: (p: Product) => void
}) => {
  const [fee, setFee] = useState(product?.monthlyFee ?? 0)
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'Active')
  const [commissionable, setCommissionable] = useState(product?.commissionable ?? true)
  const [websiteDisplay, setWebsiteDisplay] = useState(product?.websiteDisplay ?? true)
  const [websiteOrder, setWebsiteOrder] = useState(product?.websiteOrder ?? 0)

  if (!product) return null

  const handleSave = () => {
    onSave({ ...product, monthlyFee: fee, status, commissionable, websiteDisplay, websiteOrder })
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Edit Product">
      <div className="space-y-4">
        <Input label="Product" value={product.name} disabled />
        <Input label="Monthly Fee" type="number" step="0.01" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
        <Select label="Status" options={STATUS_OPTS} value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} />
        <Checkbox label="Commissionable" checked={commissionable} onChange={setCommissionable} />
        <Checkbox label="Website Display" checked={websiteDisplay} onChange={setWebsiteDisplay} />
        <Input label="Website Order" type="number" value={websiteOrder} onChange={(e) => setWebsiteOrder(Number(e.target.value))} />
        <Button onClick={handleSave} className="w-full">Save Changes</Button>
      </div>
    </SlideOver>
  )
}

interface GroupProductsTabProps {
  products: Product[]
}

export const GroupProductsTab = ({ products: initialProducts }: GroupProductsTabProps) => {
  const { addToast } = useToast()
  const [products, setProducts] = useState(initialProducts)
  const [filter, setFilter] = useState<FilterOption>('All')
  const [addOpen, setAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

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
        getValue<boolean>() ? <Check className="h-4 w-4 text-success-500" /> : <X className="h-4 w-4 text-gray-300" />,
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setEditProduct(row.original) }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation() }}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            Commissions
          </button>
        </div>
      ),
    },
  ], [])

  const handleAdd = (newProducts: Product[]) => {
    setProducts((prev) => [...prev, ...newProducts])
    addToast('success', `${newProducts.length} product${newProducts.length > 1 ? 's' : ''} added`)
    setAddOpen(false)
  }

  const handleEdit = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    addToast('success', 'Product updated')
    setEditProduct(null)
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
      <EditProductSlideOver key={editProduct?.id} open={!!editProduct} onClose={() => setEditProduct(null)} product={editProduct} onSave={handleEdit} />
    </div>
  )
}
