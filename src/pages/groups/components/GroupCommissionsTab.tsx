import { Card } from '../../../components/ui/Card'
import { formatCurrency } from '../../../utils/formatters'
import type { Product } from '../../../types/product'

interface GroupCommissionsTabProps {
  products: Product[]
}

export const GroupCommissionsTab = ({ products }: GroupCommissionsTabProps) => {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-400">No commissions configured.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <Card key={product.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{product.name}</p>
              <p className="text-xs text-gray-500">
                {product.productId} · {formatCurrency(product.monthlyFee)}/mo
              </p>
            </div>
            <span className="text-xs text-gray-400">View only</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
