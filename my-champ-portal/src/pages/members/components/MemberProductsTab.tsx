import { useState, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Check, X, Pencil, Plus } from 'lucide-react'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select'
import { Input } from '../../../components/ui/Input'
import { DatePicker } from '../../../components/forms/DatePicker'
import { SlideOver } from '../../../components/ui/SlideOver'
import { formatCurrency, formatDate } from '../../../utils/formatters'
import { useGroup } from '../../../hooks/useQueries'
import { useAuditStore } from '../../../stores/audit-store'
import { useToast } from '../../../components/feedback/Toast'
import type { MemberProduct } from '../../../types/product'

interface MemberProductsTabProps {
  products: MemberProduct[]
  memberId?: string
  memberName?: string
  groupId?: string
  onProductAdded?: (product: MemberProduct) => void
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
      </div>
    ),
  },
]

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
]

const CATEGORY_MAP: Record<string, string> = {
  '37618': 'Employer Fee',
  '37680': 'Section 125',
  '40624': 'Claims Funding',
  '37700': 'HSA',
  '37750': 'First Stop Health',
}

export const MemberProductsTab = ({ products, memberId, memberName, groupId, onProductAdded }: MemberProductsTabProps) => {
  const [slideOpen, setSlideOpen] = useState(false)
  const { data: group } = useGroup(groupId ?? '')
  const addAuditEntry = useAuditStore((s) => s.addEntry)
  const addToast = useToast((s) => s.addToast)

  const [selectedProductId, setSelectedProductId] = useState('')
  const [anticipatedDate, setAnticipatedDate] = useState(new Date().toISOString().split('T')[0])
  const [fee, setFee] = useState('')
  const [status, setStatus] = useState('Active')

  const availableProducts = useMemo(() => {
    if (!group) return []
    const assignedIds = new Set(products.map(p => p.productId))
    return group.products.filter(p => !assignedIds.has(p.productId))
  }, [group, products])

  const productOptions = useMemo(() => 
    availableProducts.map(p => ({ value: p.productId, label: `${p.name} — ${formatCurrency(p.monthlyFee)}/mo` })),
    [availableProducts]
  )

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId)
    const product = availableProducts.find(p => p.productId === productId)
    if (product) setFee(String(product.monthlyFee))
  }

  const handleAddProduct = () => {
    const product = availableProducts.find(p => p.productId === selectedProductId)
    if (!product || !onProductAdded) return

    const newProduct: MemberProduct = {
      id: `mp-new-${Date.now().toString(36)}`,
      productId: product.productId,
      name: product.name,
      category: CATEGORY_MAP[product.productId] ?? 'Other',
      fee: parseFloat(fee) || product.monthlyFee,
      period: 'Monthly',
      benefitTier: 'Employee Only',
      status: status as 'Active' | 'Inactive' | 'Pending',
      createdDate: new Date().toISOString().split('T')[0],
      activeDate: anticipatedDate,
      inactiveDate: null,
      paidThrough: null,
      paidStatus: false,
      paymentsCount: 0,
    }

    onProductAdded(newProduct)

    if (memberId && memberName) {
      addAuditEntry({
        entityType: 'Member',
        entityId: memberId,
        entityName: memberName,
        fieldChanged: `Product: ${product.name}`,
        oldValue: '—',
        newValue: `${product.name} (${product.productId}) — ${formatCurrency(parseFloat(fee) || product.monthlyFee)}/mo — Anticipated: ${anticipatedDate}`,
        changedBy: 'Tori M.',
        actionType: 'Product Added',
        systemsAffected: ['CBS'],
      })
    }

    addToast('success', `${product.name} added to member`)
    setSlideOpen(false)
    setSelectedProductId('')
    setFee('')
    setStatus('Active')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Products ({products.length})</h4>
        {groupId && onProductAdded && availableProducts.length > 0 && (
          <Button size="sm" onClick={() => setSlideOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </Button>
        )}
      </div>

      <DataTable columns={columns} data={products} emptyMessage="No products assigned" />

      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title={`Add Product to ${memberName ?? 'Member'}`}>
        <div className="space-y-5">
          <Select
            label="Product"
            options={productOptions}
            value={selectedProductId}
            onChange={(e) => handleProductSelect(e.target.value)}
            placeholder="Select a product…"
            required
          />
          <DatePicker
            label="Anticipated Date"
            value={anticipatedDate}
            onChange={setAnticipatedDate}
            required
          />
          <Input
            label="Monthly Fee ($)"
            type="number"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setSlideOpen(false)}>Cancel</Button>
            <Button onClick={handleAddProduct} disabled={!selectedProductId}>Add Product</Button>
          </div>
        </div>
      </SlideOver>
    </div>
  )
}
