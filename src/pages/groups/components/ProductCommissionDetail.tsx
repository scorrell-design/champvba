import { Modal } from '../../../components/ui/Modal'
import { Badge } from '../../../components/ui/Badge'
import { formatCurrency } from '../../../utils/formatters'
import { formatDisplayDate } from '../../../utils/dates'
import { useCommissionStore } from '../../../stores/commission-store'

interface ProductCommissionDetailProps {
  open: boolean
  onClose: () => void
  productName: string
  productId: string
  groupId: string
}

const AGENT_TYPE_VARIANTS: Record<string, 'gray' | 'info' | 'success' | 'warning'> = {
  agent: 'info',
  broker: 'success',
  enroller: 'warning',
  internal: 'gray',
}

export const ProductCommissionDetail = ({
  open,
  onClose,
  productName,
  productId,
  groupId,
}: ProductCommissionDetailProps) => {
  const commissions = useCommissionStore((s) => s.getCommissionsForProduct(groupId, productId))

  return (
    <Modal open={open} onClose={onClose} title={`Commissions — ${productName}`} size="lg">
      {commissions.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No commissions configured for this product.
        </p>
      ) : (
        <div className="space-y-3">
          {commissions.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{c.agentName}</span>
                  <Badge variant={AGENT_TYPE_VARIANTS[c.agentType] ?? 'gray'}>
                    {c.agentType}
                  </Badge>
                  <span className="text-xs text-gray-400">({c.agentId})</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {c.payoutType === 'flat'
                    ? `${formatCurrency(c.amount)}/mo`
                    : `${c.amount}%`}
                  {' · '}
                  Effective {formatDisplayDate(c.effectiveDate)}
                  {c.endDate && ` – ${formatDisplayDate(c.endDate)}`}
                  {c.filters?.benefitTier && ` · ${c.filters.benefitTier}`}
                  {c.filters?.paymentPeriod && ` · ${c.filters.paymentPeriod}`}
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {c.payoutType === 'flat' ? formatCurrency(c.amount) : `${c.amount}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
