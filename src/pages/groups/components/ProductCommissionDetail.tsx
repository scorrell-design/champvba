import { Modal } from '../../../components/ui/Modal'
import { Card } from '../../../components/ui/Card'
import { formatCurrency } from '../../../utils/formatters'
import { getCommission } from '../../../data/commissions'

interface ProductCommissionDetailProps {
  open: boolean
  onClose: () => void
  productName: string
  productId: string
  groupId: string
}

export const ProductCommissionDetail = ({ open, onClose, productName, productId, groupId }: ProductCommissionDetailProps) => {
  const commission = getCommission(groupId, productId)

  return (
    <Modal open={open} onClose={onClose} title={`Commissions — ${productName}`} size="lg">
      {!commission ? (
        <p className="py-8 text-center text-sm text-gray-400">No commission configured for this product.</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Group/Broker Tree Payouts</h4>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-gray-500">Group/Broker</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {commission.brokerPayouts.map((payout, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 text-sm text-gray-800">
                        {payout.brokerName}{' '}
                        <span className="text-gray-400">({payout.brokerId})</span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">{payout.payoutType}</td>
                      <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-800">
                        {payout.payoutType === 'dollar' ? formatCurrency(payout.amount) : `${payout.amount}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Dynamic Payouts</h4>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-gray-500">Pay To</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {commission.dynamicPayouts.map((payout, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 text-sm text-gray-800">{payout.payTo}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">{payout.payoutType}</td>
                      <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-800">
                        {payout.payoutType === 'dollar' ? formatCurrency(payout.amount) : `${payout.amount}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Commission Filters</h4>
            <Card>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-400">Price Type</dt>
                  <dd className="mt-1 text-sm text-gray-800">{commission.filters.priceType}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-400">Benefit</dt>
                  <dd className="mt-1 text-sm text-gray-800">{commission.filters.benefit}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-400">Payment Period</dt>
                  <dd className="mt-1 text-sm text-gray-800">{commission.filters.paymentPeriod}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs font-medium uppercase text-gray-400">Price Record</dt>
                  <dd className="mt-1 text-sm text-gray-800">{commission.filters.priceRecord}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      )}
    </Modal>
  )
}
