import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Package, Building2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { cn } from '../../utils/cn'
import { PRODUCTS } from '../../data/products'
import { formatCurrency } from '../../utils/formatters'

const MOCK_IMPORTED_GROUPS = [
  { groupId: 'g-1', groupName: 'Apex Manufacturing LLC', memberCount: 34 },
  { groupId: 'g-2', groupName: 'Redwood Financial Services', memberCount: 28 },
  { groupId: 'g-3', groupName: 'Coastal Logistics Group', memberCount: 29 },
]

export function AssignProducts() {
  const [groupSelections, setGroupSelections] = useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {}
    MOCK_IMPORTED_GROUPS.forEach((g) => {
      initial[g.groupId] = new Set(PRODUCTS.slice(0, 3).map((p) => p.id))
    })
    return initial
  })
  const [effectiveDate, setEffectiveDate] = useState('')
  const [success, setSuccess] = useState(false)

  function toggleProduct(groupId: string, productId: string) {
    setGroupSelections((prev) => {
      const current = new Set(prev[groupId] ?? [])
      if (current.has(productId)) current.delete(productId)
      else current.add(productId)
      return { ...prev, [groupId]: current }
    })
  }

  const totalAssignments = MOCK_IMPORTED_GROUPS.reduce((sum, g) => {
    const selected = groupSelections[g.groupId]?.size ?? 0
    return sum + selected * g.memberCount
  }, 0)

  const totalMembers = MOCK_IMPORTED_GROUPS.reduce((sum, g) => sum + g.memberCount, 0)

  if (success) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="text-center">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
              <CheckCircle className="h-8 w-8 text-success-500" />
            </div>
            <div>
              <h2 className="text-page-title text-gray-900">Products assigned successfully</h2>
              <p className="mt-2 text-sm text-gray-500">
                {totalMembers} members across {MOCK_IMPORTED_GROUPS.length} groups now have their products assigned.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Link to="/members">
                <Button>View Members</Button>
              </Link>
              <Link to="/" className="text-sm font-medium text-primary-500 hover:underline">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-page-title text-gray-900">Assign Products to Imported Members</h1>
        <p className="mt-1 text-sm text-gray-500">
          {totalMembers} members were imported across {MOCK_IMPORTED_GROUPS.length} groups.
          Select products for each group below.
        </p>
      </div>

      {MOCK_IMPORTED_GROUPS.map((group) => {
        const selected = groupSelections[group.groupId] ?? new Set()
        return (
          <Card key={group.groupId}>
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-5 w-5 text-primary-500" />
              <div>
                <h3 className="text-section-title text-gray-900">{group.groupName}</h3>
                <p className="text-xs text-gray-500">
                  Group ID: {group.groupId} — {group.memberCount} members
                </p>
              </div>
            </div>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
              {PRODUCTS.map((product) => (
                <label
                  key={product.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 transition-colors',
                    selected.has(product.id)
                      ? 'border-primary-300 bg-primary-50/50'
                      : 'border-gray-200 hover:bg-gray-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleProduct(group.groupId, product.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
                  />
                  <Package className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-800 block truncate">{product.name}</span>
                    <span className="text-xs text-gray-500">{product.category} — ID: {product.productId}</span>
                  </div>
                  <span className="text-sm text-gray-500">{formatCurrency(product.monthlyFee)}/mo</span>
                </label>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              {selected.size} product{selected.size !== 1 ? 's' : ''} selected for {group.memberCount} members
            </div>
          </Card>
        )
      })}

      <Card>
        <Input
          label="Effective Date"
          type="date"
          required
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
        />

        {totalAssignments > 0 && effectiveDate && (
          <p className="mt-3 text-sm text-gray-600">
            This will create {totalAssignments.toLocaleString()} product assignments across{' '}
            {totalMembers} members in {MOCK_IMPORTED_GROUPS.length} groups
            with effective date{' '}
            <span className="font-medium text-gray-800">{effectiveDate}</span>.
          </p>
        )}
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => setSuccess(true)}
          disabled={totalAssignments === 0 || !effectiveDate}
        >
          Assign Products
        </Button>
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline">
          Skip — I'll assign later
        </Link>
      </div>
    </div>
  )
}
