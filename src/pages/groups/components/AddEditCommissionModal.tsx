import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Textarea } from '../../../components/ui/Textarea'
import { DatePicker } from '../../../components/forms/DatePicker'
import { useToast } from '../../../components/feedback/Toast'
import { useCommissionStore } from '../../../stores/commission-store'
import { logAuditEntry } from '../../../utils/audit'
import { serializeDate, formatDisplayDate } from '../../../utils/dates'
import { formatCurrency } from '../../../utils/formatters'
import type { Commission } from '../../../types/commission'
import type { Group } from '../../../types/group'

interface KnownAgent {
  agentId: string
  agentName: string
  agentType: Commission['agentType']
}

interface AddEditCommissionModalProps {
  group: Group
  existing?: Commission
  presetProductId?: string
  onClose: () => void
}

const AGENT_TYPE_OPTIONS = [
  { value: 'agent', label: 'Agent' },
  { value: 'broker', label: 'Broker' },
  { value: 'enroller', label: 'Enroller' },
  { value: 'internal', label: 'Internal' },
]

const BENEFIT_TIER_OPTIONS = [
  { value: '', label: 'All tiers' },
  { value: 'Employee Only', label: 'Employee Only' },
  { value: 'EE+Spouse', label: 'EE+Spouse' },
  { value: 'EE+Child', label: 'EE+Child' },
  { value: 'Family', label: 'Family' },
]

const PAYMENT_PERIOD_OPTIONS = [
  { value: '', label: 'All periods' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Annually', label: 'Annually' },
]

export const AddEditCommissionModal = ({
  group,
  existing,
  presetProductId,
  onClose,
}: AddEditCommissionModalProps) => {
  const addCommission = useCommissionStore((s) => s.addCommission)
  const updateCommission = useCommissionStore((s) => s.updateCommission)
  const allCommissions = useCommissionStore((s) => s.commissions)
  const { addToast } = useToast()
  const [filtersOpen, setFiltersOpen] = useState(!!existing?.filters?.benefitTier || !!existing?.filters?.paymentPeriod)

  const knownAgents = useMemo<KnownAgent[]>(() => {
    const map = new Map<string, KnownAgent>()
    for (const c of allCommissions) {
      if (!map.has(c.agentId)) {
        map.set(c.agentId, { agentId: c.agentId, agentName: c.agentName, agentType: c.agentType })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.agentName.localeCompare(b.agentName))
  }, [allCommissions])

  const NEW_AGENT_VALUE = '__new__'

  const [productId, setProductId] = useState(existing?.productId ?? presetProductId ?? '')
  const [selectedAgentKey, setSelectedAgentKey] = useState<string>(() => {
    if (existing) {
      const match = knownAgents.find((a) => a.agentId === existing.agentId)
      return match ? existing.agentId : NEW_AGENT_VALUE
    }
    return ''
  })
  const [agentName, setAgentName] = useState(existing?.agentName ?? '')
  const [agentId, setAgentId] = useState(existing?.agentId ?? '')
  const [agentType, setAgentType] = useState<Commission['agentType']>(existing?.agentType ?? 'agent')
  const [payoutType, setPayoutType] = useState<Commission['payoutType']>(existing?.payoutType ?? 'flat')
  const [amount, setAmount] = useState(existing?.amount?.toString() ?? '')
  const [effectiveDate, setEffectiveDate] = useState(existing?.effectiveDate ?? '')
  const [endDate, setEndDate] = useState(existing?.endDate ?? '')
  const [benefitTier, setBenefitTier] = useState(existing?.filters?.benefitTier ?? '')
  const [paymentPeriod, setPaymentPeriod] = useState(existing?.filters?.paymentPeriod ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const isEdit = !!existing
  const isNewAgent = selectedAgentKey === NEW_AGENT_VALUE

  const agentSelectOptions = useMemo(() => [
    ...knownAgents.map((a) => ({
      value: a.agentId,
      label: `${a.agentName} (${a.agentId})`,
    })),
    { value: NEW_AGENT_VALUE, label: '+ New Agent…' },
  ], [knownAgents])

  const handleAgentSelect = (value: string) => {
    setSelectedAgentKey(value)
    if (value === NEW_AGENT_VALUE) {
      setAgentName('')
      setAgentId('')
      setAgentType('agent')
    } else {
      const match = knownAgents.find((a) => a.agentId === value)
      if (match) {
        setAgentName(match.agentName)
        setAgentId(match.agentId)
        setAgentType(match.agentType)
      }
    }
  }

  const productOptions = group.products.map((p) => ({
    value: p.productId,
    label: `${p.name} (${p.productId})`,
  }))

  useEffect(() => {
    if (!productId && group.products.length === 1) {
      setProductId(group.products[0].productId)
    }
  }, [productId, group.products])

  const canSave =
    productId.trim() !== '' &&
    agentName.trim() !== '' &&
    agentId.trim() !== '' &&
    amount.trim() !== '' &&
    effectiveDate.trim() !== ''

  const getProductName = (pid: string) =>
    group.products.find((p) => p.productId === pid)?.name ?? pid

  const handleSave = () => {
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      addToast('error', 'Invalid amount.')
      return
    }

    const filters: NonNullable<Commission['filters']> = {}
    if (benefitTier) filters.benefitTier = benefitTier as NonNullable<Commission['filters']>['benefitTier']
    if (paymentPeriod) filters.paymentPeriod = paymentPeriod as NonNullable<Commission['filters']>['paymentPeriod']
    const hasFilters = Object.keys(filters).length > 0

    if (isEdit) {
      updateCommission(existing.id, {
        agentId,
        agentName,
        agentType,
        payoutType,
        amount: parsedAmount,
        effectiveDate: serializeDate(effectiveDate),
        endDate: endDate ? serializeDate(endDate) : undefined,
        filters: hasFilters ? filters : undefined,
        notes: notes.trim() || undefined,
      })

      logAuditEntry({
        entityType: 'Group',
        entityId: group.id,
        entityName: group.legalName,
        fieldChanged: 'Commission',
        oldValue: `${existing.agentName}: ${existing.payoutType === 'flat' ? formatCurrency(existing.amount) : existing.amount + '%'}`,
        newValue: `${agentName}: ${payoutType === 'flat' ? formatCurrency(parsedAmount) : parsedAmount + '%'}`,
        action: 'Commission Updated',
        details: `Commission for ${agentName} on ${getProductName(productId)} updated.`,
      })

      addToast('success', 'Commission updated.')
    } else {
      addCommission({
        groupId: group.id,
        productId,
        agentId,
        agentName,
        agentType,
        payoutType,
        amount: parsedAmount,
        effectiveDate: serializeDate(effectiveDate),
        endDate: endDate ? serializeDate(endDate) : undefined,
        filters: hasFilters ? filters : undefined,
        notes: notes.trim() || undefined,
      })

      logAuditEntry({
        entityType: 'Group',
        entityId: group.id,
        entityName: group.legalName,
        fieldChanged: 'Commission',
        oldValue: '',
        newValue: `${agentName}: ${payoutType === 'flat' ? formatCurrency(parsedAmount) : parsedAmount + '%'}`,
        action: 'Commission Added',
        details: `Commission added for ${agentName} on ${getProductName(productId)}: ${payoutType === 'flat' ? '$' + parsedAmount.toFixed(2) : parsedAmount + '%'} effective ${formatDisplayDate(effectiveDate)}.`,
      })

      addToast('success', 'Commission added.')
    }

    onClose()
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Commission' : 'Add Commission'} size="lg">
      <div className="space-y-4">
        <Select
          label="Product"
          options={productOptions}
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Select a product…"
          required
          disabled={isEdit || !!presetProductId}
        />

        <Select
          label="Agent"
          options={agentSelectOptions}
          value={selectedAgentKey}
          onChange={(e) => handleAgentSelect(e.target.value)}
          placeholder="Select an agent…"
          required
        />

        {isNewAgent && (
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Agent Name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g., Steven Guilfoile"
              required
            />
            <Input
              label="Agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="e.g., 640207"
              required
            />
            <Select
              label="Agent Type"
              options={AGENT_TYPE_OPTIONS}
              value={agentType}
              onChange={(e) => setAgentType(e.target.value as Commission['agentType'])}
            />
          </div>
        )}

        {!isNewAgent && selectedAgentKey && (
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name</span>
                <p className="font-medium text-gray-900">{agentName}</p>
              </div>
              <div>
                <span className="text-gray-500">ID</span>
                <p className="font-medium text-gray-900">{agentId}</p>
              </div>
              <div>
                <span className="text-gray-500">Type</span>
                <p className="font-medium capitalize text-gray-900">{agentType}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Payout Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payoutType"
                  checked={payoutType === 'flat'}
                  onChange={() => setPayoutType('flat')}
                  className="h-4 w-4 border-gray-300 text-primary-500 focus:ring-primary-200"
                />
                <span className="text-sm text-gray-700">Flat ($)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payoutType"
                  checked={payoutType === 'percentage'}
                  onChange={() => setPayoutType('percentage')}
                  className="h-4 w-4 border-gray-300 text-primary-500 focus:ring-primary-200"
                />
                <span className="text-sm text-gray-700">Percentage (%)</span>
              </label>
            </div>
          </div>
          <Input
            label={payoutType === 'flat' ? 'Amount ($)' : 'Amount (%)'}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={payoutType === 'flat' ? '0.00' : '0'}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            label="Effective Date"
            value={effectiveDate}
            onChange={setEffectiveDate}
            required
          />
          <DatePicker
            label="End Date (optional)"
            value={endDate}
            onChange={setEndDate}
          />
        </div>

        <div className="border-t border-gray-200 pt-3">
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            {filtersOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Commission Filters (optional)
          </button>
          {filtersOpen && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <Select
                label="Benefit Tier"
                options={BENEFIT_TIER_OPTIONS}
                value={benefitTier}
                onChange={(e) => setBenefitTier(e.target.value)}
              />
              <Select
                label="Payment Period"
                options={PAYMENT_PERIOD_OPTIONS}
                value={paymentPeriod}
                onChange={(e) => setPaymentPeriod(e.target.value)}
              />
            </div>
          )}
        </div>

        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this commission…"
        />

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {isEdit ? 'Save Changes' : 'Add Commission'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
