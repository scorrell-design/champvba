import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Package } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { cn } from '../../utils/cn'

const mockProducts = [
  { id: 'champ-employer-fee', name: 'Champion Employer Fee', price: '$44.00/mo' },
  { id: 'champ-125-plan', name: 'Champ 125 Plan', price: '$70.00/mo' },
  { id: 'champ-claims-funding', name: 'CHAMP Claims Funding', price: '$120.00/mo' },
]

export function AssignProducts() {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(mockProducts.map((p) => p.id)),
  )
  const [effectiveDate, setEffectiveDate] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedCount = selected.size

  function toggleProduct(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Card className="text-center">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
              <CheckCircle className="h-8 w-8 text-success-500" />
            </div>
            <div>
              <h2 className="text-page-title text-gray-900">Products assigned successfully</h2>
              <p className="mt-2 text-sm text-gray-500">
                91 members now have {selectedCount} active products.
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
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-page-title text-gray-900">Assign Products to New Members</h1>
        <p className="mt-1 text-sm text-gray-500">
          91 members were just imported. Assign products with a single effective date.
        </p>
      </div>

      <Card>
        <h3 className="text-section-title text-gray-900">Group Products</h3>
        <div className="mt-4 space-y-2">
          {mockProducts.map((product) => (
            <label
              key={product.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                selected.has(product.id)
                  ? 'border-primary-300 bg-primary-50/50'
                  : 'border-gray-200 hover:bg-gray-50',
              )}
            >
              <input
                type="checkbox"
                checked={selected.has(product.id)}
                onChange={() => toggleProduct(product.id)}
                className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
              />
              <Package className="h-4 w-4 text-gray-400" />
              <span className="flex-1 text-sm font-medium text-gray-800">{product.name}</span>
              <span className="text-sm text-gray-500">{product.price}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <Input
          label="Anticipated Date"
          type="date"
          required
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
        />

        {selectedCount > 0 && effectiveDate && (
          <p className="mt-3 text-sm text-gray-600">
            This will assign {selectedCount} product{selectedCount !== 1 ? 's' : ''} to 91 members
            with effective date{' '}
            <span className="font-medium text-gray-800">{effectiveDate}</span>.
          </p>
        )}
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => setSuccess(true)}
          disabled={selectedCount === 0 || !effectiveDate}
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
