import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { formatCurrency } from '../../../utils/formatters'
import type { Product } from '../../../types/product'

interface GroupCommissionsTabProps {
  products: Product[]
}

export const GroupCommissionsTab = ({ products }: GroupCommissionsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Button variant="secondary" size="sm">
          View All Commissions
        </Button>
        <Button variant="secondary" size="sm">
          Copy Commissions
        </Button>
      </div>

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
              <Button variant="ghost" size="sm">
                Add Commission
              </Button>
            </div>
          </Card>
        ))}
        {products.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">No products configured</p>
        )}
      </div>
    </div>
  )
}
