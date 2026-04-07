import { useState, useMemo } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select'
import { Textarea } from '../../../components/ui/Textarea'
import { DatePicker } from '../../../components/forms/DatePicker'
import { InlineWarning } from '../../../components/feedback/InlineWarning'
import { StatusBadge } from '../../../components/ui/Badge'
import { useTerminateMember, queryKeys } from '../../../hooks/useQueries'
import { useQueryClient } from '@tanstack/react-query'
import { useAuditStore } from '../../../stores/audit-store'
import { useToast } from '../../../components/feedback/Toast'
import { INACTIVE_REASONS } from '../../../utils/constants'
import { formatDate } from '../../../utils/formatters'
import type { Member } from '../../../types/member'

interface TerminateMemberModalProps {
  open: boolean
  onClose: () => void
  member: Member
}

const REASON_OPTIONS = INACTIVE_REASONS.map((r) => ({ value: r, label: r }))

function endOfMonth(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return last.toISOString().split('T')[0]
}

export const TerminateMemberModal = ({ open, onClose, member }: TerminateMemberModalProps) => {
  const mutation = useTerminateMember()
  const addToast = useToast((s) => s.addToast)
  const queryClient = useQueryClient()
  const addAuditEntry = useAuditStore((s) => s.addEntry)

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    () => new Set(member.products.map((p) => p.productId)),
  )
  const [inactiveDate, setInactiveDate] = useState('')
  const [inactiveReason, setInactiveReason] = useState('')
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<'form' | 'confirm'>('form')

  const allSelected = selectedProducts.size === member.products.length
  const toggleAll = () => {
    if (allSelected) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(member.products.map((p) => p.productId)))
    }
  }

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const canProceed = selectedProducts.size > 0 && inactiveDate && inactiveReason

  const selectedNames = useMemo(
    () => member.products.filter((p) => selectedProducts.has(p.productId)).map((p) => p.name),
    [member.products, selectedProducts],
  )

  const handleConfirm = () => {
    mutation.mutate(
      {
        id: member.id,
        data: {
          productIds: Array.from(selectedProducts),
          inactiveDate,
          inactiveReason,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: (terminatedMember) => {
          queryClient.setQueryData(queryKeys.member(member.id), terminatedMember)
          addAuditEntry({
            entityType: 'Member',
            entityId: member.id,
            entityName: `${member.firstName} ${member.lastName}`,
            fieldChanged: 'Status',
            oldValue: member.status,
            newValue: 'Terminated',
            changedBy: 'Stephanie C.',
            actionType: 'Member Terminated',
            systemsAffected: ['CBS', 'VBA', 'Kintone'],
          })
          addToast('success', `${member.firstName} ${member.lastName} terminated`)
          onClose()
        },
        onError: () => addToast('error', 'Termination failed'),
      },
    )
  }

  const handleClose = () => {
    setStep('form')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Terminate Member" size="lg">
      {step === 'form' ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">
              {member.firstName} {member.lastName}
            </span>
            <StatusBadge status={member.status} />
          </div>

          {/* Product selection */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Products</span>
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="space-y-2 rounded-lg border border-gray-200 p-3">
              {member.products.map((p) => (
                <label key={p.productId} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(p.productId)}
                    onChange={() => toggleProduct(p.productId)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
                  />
                  <span className="text-sm text-gray-700">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Inactive Date */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <DatePicker
                label="Inactive Date"
                value={inactiveDate}
                onChange={setInactiveDate}
                required
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setInactiveDate(endOfMonth(new Date().toISOString()))}
            >
              End of Month
            </Button>
          </div>

          {/* Reason */}
          <Select
            label="Inactive Reason"
            options={REASON_OPTIONS}
            value={inactiveReason}
            onChange={(e) => setInactiveReason(e.target.value)}
            placeholder="Select a reason…"
            required
          />

          {/* Notes */}
          <Textarea
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this termination…"
          />

          {/* VBA warning */}
          {member.vbaEligible && (
            <InlineWarning message="VBA termination rules may be stricter. Backdating beyond the prior month is disallowed." />
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="danger" disabled={!canProceed} onClick={() => setStep('confirm')}>
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm font-medium text-danger-600">
            You are about to terminate this member. This action cannot be undone.
          </p>

          <div className="rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="text-sm">
              <span className="text-gray-500">Member:</span>{' '}
              <span className="font-medium">{member.firstName} {member.lastName}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Inactive Date:</span>{' '}
              <span className="font-medium">{formatDate(inactiveDate)}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Reason:</span>{' '}
              <span className="font-medium">{inactiveReason}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Products ({selectedNames.length}):</span>
              <ul className="mt-1 list-inside list-disc text-gray-700">
                {selectedNames.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setStep('form')}>
              Back
            </Button>
            <Button variant="danger" onClick={handleConfirm} isLoading={mutation.isPending}>
              Terminate
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
