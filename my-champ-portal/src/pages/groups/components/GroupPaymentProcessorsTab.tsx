import { Check, X } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import type { PaymentProcessor } from '../../../types/group'

const SettingRow = ({ label, value }: { label: string; value: boolean }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm text-gray-600">{label}</span>
    {value ? (
      <Check className="h-4 w-4 text-success-500" />
    ) : (
      <X className="h-4 w-4 text-gray-300" />
    )}
  </div>
)

interface GroupPaymentProcessorsTabProps {
  processors: PaymentProcessor[]
}

export const GroupPaymentProcessorsTab = ({ processors }: GroupPaymentProcessorsTabProps) => {
  if (processors.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">No payment processors configured</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {processors.map((proc) => (
        <Card key={proc.id}>
          <div className="mb-4 flex items-center justify-between">
            <Badge variant={proc.status === 'Active' ? 'success' : 'gray'} dot>
              {proc.status}
            </Badge>
            <span className="text-xs text-gray-400">{proc.type}</span>
          </div>
          <div className="mb-4 space-y-1">
            <p className="text-sm font-medium text-gray-800">{proc.adminLabel}</p>
            <p className="text-xs text-gray-500">Display: {proc.displayLabel}</p>
            <p className="text-xs text-gray-500">Processor: {proc.processor}</p>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <SettingRow label="Allow Payments" value={proc.allowPayments} />
            <SettingRow label="Allow Refunds" value={proc.allowRefunds} />
            <SettingRow label="Display on Frontend" value={proc.displayOnFrontend} />
            <SettingRow label="Frontend Create Transaction" value={proc.frontendCreateTransaction} />
            <SettingRow label="Mark Transaction Complete" value={proc.markTransactionComplete} />
            <SettingRow label="Stick Processor to Member" value={proc.stickProcessorToMember} />
          </div>
        </Card>
      ))}
    </div>
  )
}
