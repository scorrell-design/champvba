import { Info } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../../utils/formatters'
import type { Product } from '../../../types/product'

interface GroupCommissionsTabProps {
  products: Product[]
}

interface MockCommission {
  agentId: string
  agentName: string
  type: 'flat' | 'percentage'
  amount: number
  effectiveDate: string
}

const MOCK_COMMISSIONS: Record<string, MockCommission[]> = {
  '37618': [
    { agentId: '640207', agentName: 'Steven Guilfoile', type: 'flat', amount: 5.00, effectiveDate: '2026-01-01' },
    { agentId: '955551', agentName: 'Ashley Crain', type: 'percentage', amount: 3.5, effectiveDate: '2026-01-01' },
    { agentId: '636851', agentName: 'Champion Health', type: 'flat', amount: 2.00, effectiveDate: '2026-01-01' },
  ],
  '37680': [
    { agentId: '640207', agentName: 'Steven Guilfoile', type: 'flat', amount: 3.00, effectiveDate: '2026-01-01' },
    { agentId: '636851', agentName: 'Champion Health', type: 'flat', amount: 1.50, effectiveDate: '2026-01-01' },
  ],
  '40624': [
    { agentId: '640207', agentName: 'Steven Guilfoile', type: 'flat', amount: 8.00, effectiveDate: '2026-01-01' },
    { agentId: '955551', agentName: 'Ashley Crain', type: 'percentage', amount: 5.0, effectiveDate: '2026-01-01' },
    { agentId: '636851', agentName: 'Champion Health', type: 'flat', amount: 4.00, effectiveDate: '2026-01-01' },
  ],
  '37700': [
    { agentId: '640207', agentName: 'Steven Guilfoile', type: 'flat', amount: 2.00, effectiveDate: '2026-01-01' },
    { agentId: '636851', agentName: 'Champion Health', type: 'flat', amount: 1.00, effectiveDate: '2026-01-01' },
  ],
  '37750': [
    { agentId: '640207', agentName: 'Steven Guilfoile', type: 'flat', amount: 6.00, effectiveDate: '2026-01-01' },
    { agentId: '955551', agentName: 'Ashley Crain', type: 'percentage', amount: 4.0, effectiveDate: '2026-01-01' },
  ],
}

export const GroupCommissionsTab = ({ products }: GroupCommissionsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <span className="text-sm text-blue-700">Commission editing will be available in a future release.</span>
      </div>

      {products.map((product) => {
        const commissions = MOCK_COMMISSIONS[product.productId] ?? []
        return (
          <Card key={product.productId}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{product.name}</h4>
                <p className="text-xs text-gray-500">Product ID: {product.productId}</p>
              </div>
              <Badge variant="info">{commissions.length} agent{commissions.length !== 1 ? 's' : ''}</Badge>
            </div>
            
            {commissions.length === 0 ? (
              <p className="text-sm text-gray-400">No commissions configured</p>
            ) : (
              <div className="space-y-3">
                {commissions.map((c) => (
                  <div key={`${product.productId}-${c.agentId}`} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.agentName}</p>
                      <p className="text-xs text-gray-500">Agent ID: {c.agentId}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="font-medium text-gray-700">{c.type === 'flat' ? 'Flat ($)' : 'Percentage (%)'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-medium text-gray-900">{c.type === 'flat' ? formatCurrency(c.amount) : `${c.amount}%`}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Effective</p>
                        <p className="font-medium text-gray-700">{formatDate(c.effectiveDate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
