import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Check, X, Pencil, Plus } from 'lucide-react'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge, type BadgeVariant } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { SlideOver } from '../../../components/ui/SlideOver'
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

const AddProductSlideOver = ({ open, onClose, onAdd, existingIds }: {
  open: boolean; onClose: () => void; onAdd: (p: Product) => void; existingIds: Set<string>
}) => {
  const [selectedId, setSelectedId] = useState('')
  const [fee, setFee] = useState(0)
  const [effectiveDate, setEffectiveDate] = useState('')
  const [commissionable, setCommissionable] = useState(true)

  const available = PRODUCTS.filter((p) => !existingIds.has(p.id))
  const selected = PRODUCTS.find((p) => p.id === selectedId)

  const handleSelect = (id: string) => {
    setSelectedId(id)
    const p = PRODUCTS.find((x) => x.id === id)
    if (p) setFee(p.monthlyFee)
  }

  const handleSave = () => {
    if (!selected) return
    onAdd({ ...selected, monthlyFee: fee, commissionable, status: 'Active' })
    setSelectedId('')
    setFee(0)
    setEffectiveDate('')
    setCommissionable(true)
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Add Product">
      <div className="space-y-4">
        <Select label="Product" required options={available.map((p) => ({ value: p.id, label: p.name }))} placeholder="Select a product" value={selectedId} onChange={(e) => handleSelect(e.target.value)} />
        <Input label="Monthly Fee" type="number" step="0.01" value={fee || ''} onChange={(e) => setFee(Number(e.target.value))} />
        <Input label="Anticipated Date" type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
        <Checkbox label="Commissionable" checked={commissionable} onChange={setCommissionable} />
        <Button onClick={handleSave} disabled={!selectedId} className="w-full">Add Product</Button>
      </div>
    </SlideOver>
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
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setEditProduct(row.original) }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ], [])

  const handleAdd = (product: Product) => {
    setProducts((prev) => [...prev, product])
    addToast('success', 'Product added')
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

      <AddProductSlideOver open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} existingIds={new Set(products.map((p) => p.id))} />
      <EditProductSlideOver key={editProduct?.id} open={!!editProduct} onClose={() => setEditProduct(null)} product={editProduct} onSave={handleEdit} />
    </div>
  )
}
