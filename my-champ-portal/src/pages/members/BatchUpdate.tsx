import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { DatePicker } from '../../components/forms/DatePicker'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/Badge'
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog'
import { useMembers } from '../../hooks/useQueries'
import { useToast } from '../../components/feedback/Toast'
import { INACTIVE_REASONS } from '../../utils/constants'
import type { Member } from '../../types/member'
import type { ColumnDef } from '@tanstack/react-table'

const REASON_OPTIONS = INACTIVE_REASONS.map((r) => ({ value: r, label: r }))
const DATE_ACTION_OPTIONS = [
  { value: 'add', label: 'Add' },
  { value: 'change', label: 'Change' },
  { value: 'delete', label: 'Delete' },
]
const HOLD_REASON_OPTIONS = [{ value: 'Negatively Impacted', label: 'Negatively Impacted' }]
const NOTE_TYPE_OPTIONS = [
  { value: 'History Note', label: 'History Note' },
  { value: 'Admin Only', label: 'Admin Only' },
]
const BENEFIT_OPTIONS = [
  { value: 'Employee Only', label: 'Employee Only' },
  { value: 'Employee + Spouse', label: 'Employee + Spouse' },
  { value: 'Employee + Family', label: 'Employee + Family' },
]
const PERIOD_OPTIONS = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Annual', label: 'Annual' },
]

const PREVIEW_IDS = ['m-1', 'm-2', 'm-3', 'm-4', 'm-5']

const previewColumns: ColumnDef<Member, unknown>[] = [
  {
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    id: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.firstName} {row.original.lastName}</span>
    ),
  },
  { accessorKey: 'memberId', header: 'Member ID' },
  { accessorKey: 'groupName', header: 'Group' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
]

export const BatchUpdate = () => {
  const navigate = useNavigate()
  const addToast = useToast((s) => s.addToast)
  const { data: allMembers = [] } = useMembers()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const selectedMembers = useMemo(
    () => allMembers.filter((m) => PREVIEW_IDS.includes(m.id)),
    [allMembers],
  )

  const totalProducts = useMemo(
    () => selectedMembers.reduce((sum, m) => sum + m.products.length, 0),
    [selectedMembers],
  )

  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const toggleSection = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // Form state
  const [activeDate, setActiveDate] = useState('')
  const [activeDateAction, setActiveDateAction] = useState('add')
  const [productCreatedDate, setProductCreatedDate] = useState('')
  const [nextBillingDate, setNextBillingDate] = useState('')
  const [feeAmount, setFeeAmount] = useState('')
  const [feeBenefit, setFeeBenefit] = useState('')
  const [feePeriod, setFeePeriod] = useState('Monthly')
  const [paidStatus, setPaidStatus] = useState(false)
  const [processorOverride, setProcessorOverride] = useState('')
  const [holdAction, setHoldAction] = useState<'set' | 'delete'>('set')
  const [holdReason, setHoldReason] = useState('')
  const [inactiveDate, setInactiveDate] = useState('')
  const [inactiveReason, setInactiveReason] = useState('')
  const [sourceDetail, setSourceDetail] = useState('')
  const [optIn, setOptIn] = useState(false)
  const [doNotCall, setDoNotCall] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteType, setNoteType] = useState('History Note')
  const [triggerAutomations, setTriggerAutomations] = useState(true)
  const [triggerEmails, setTriggerEmails] = useState(true)

  const handleApply = () => {
    setConfirmOpen(false)
    addToast('success', `Batch update applied to ${selectedMembers.length} members`)
    navigate('/members')
  }

  return (
    <div>
      <PageHeader
        title="Batch Update"
        backLink="/members"
        description={`Updating ${selectedMembers.length} members with ${totalProducts} products`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Dates */}
          <AccordionSection
            id="dates"
            title="Dates"
            open={openSections.has('dates')}
            onToggle={() => toggleSection('dates')}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-end gap-3">
                <div className="flex-1">
                  <DatePicker label="Active Date" value={activeDate} onChange={setActiveDate} />
                </div>
                <Select options={DATE_ACTION_OPTIONS} value={activeDateAction} onChange={(e) => setActiveDateAction(e.target.value)} className="w-32" />
              </div>
              <DatePicker label="Product Created Date" value={productCreatedDate} onChange={setProductCreatedDate} />
              <DatePicker label="Next Billing Date" value={nextBillingDate} onChange={setNextBillingDate} />
            </div>
          </AccordionSection>

          {/* Product & Fees */}
          <AccordionSection
            id="fees"
            title="Product & Fees"
            open={openSections.has('fees')}
            onToggle={() => toggleSection('fees')}
          >
            <div className="grid grid-cols-2 gap-4">
              <Input label="Product Fee" type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} placeholder="0.00" />
              <Select label="Benefit Tier" options={BENEFIT_OPTIONS} value={feeBenefit} onChange={(e) => setFeeBenefit(e.target.value)} placeholder="Select…" />
              <Select label="Period" options={PERIOD_OPTIONS} value={feePeriod} onChange={(e) => setFeePeriod(e.target.value)} />
            </div>
          </AccordionSection>

          {/* Payment */}
          <AccordionSection
            id="payment"
            title="Payment"
            open={openSections.has('payment')}
            onToggle={() => toggleSection('payment')}
          >
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={paidStatus} onChange={(e) => setPaidStatus(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200" />
                <span className="text-sm text-gray-700">Set Product Paid</span>
              </label>
              <Input label="Processor Override" value={processorOverride} onChange={(e) => setProcessorOverride(e.target.value)} placeholder="Processor name…" />
            </div>
          </AccordionSection>

          {/* Hold */}
          <AccordionSection
            id="hold"
            title="Hold"
            open={openSections.has('hold')}
            onToggle={() => toggleSection('hold')}
          >
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="holdAction" checked={holdAction === 'set'} onChange={() => setHoldAction('set')} className="h-4 w-4 border-gray-300 text-primary-500 focus:ring-primary-200" />
                  <span className="text-sm text-gray-700">Set Hold</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="holdAction" checked={holdAction === 'delete'} onChange={() => setHoldAction('delete')} className="h-4 w-4 border-gray-300 text-primary-500 focus:ring-primary-200" />
                  <span className="text-sm text-gray-700">Delete Hold</span>
                </label>
              </div>
              {holdAction === 'set' && (
                <Select label="Hold Reason" options={HOLD_REASON_OPTIONS} value={holdReason} onChange={(e) => setHoldReason(e.target.value)} placeholder="Select reason…" />
              )}
            </div>
          </AccordionSection>

          {/* Inactive */}
          <AccordionSection
            id="inactive"
            title="Inactive"
            open={openSections.has('inactive')}
            onToggle={() => toggleSection('inactive')}
          >
            <div className="grid grid-cols-2 gap-4">
              <DatePicker label="Inactive Date" value={inactiveDate} onChange={setInactiveDate} />
              <Select label="Inactive Reason" options={REASON_OPTIONS} value={inactiveReason} onChange={(e) => setInactiveReason(e.target.value)} placeholder="Select reason…" />
            </div>
          </AccordionSection>

          {/* Tracking */}
          <AccordionSection
            id="tracking"
            title="Tracking"
            open={openSections.has('tracking')}
            onToggle={() => toggleSection('tracking')}
          >
            <div className="space-y-4">
              <Input label="Source Detail" value={sourceDetail} onChange={(e) => setSourceDetail(e.target.value)} />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200" />
                <span className="text-sm text-gray-700">Opt In</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={doNotCall} onChange={(e) => setDoNotCall(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200" />
                <span className="text-sm text-gray-700">Do Not Call</span>
              </label>
            </div>
          </AccordionSection>

          {/* Notes */}
          <AccordionSection
            id="notes"
            title="Notes"
            open={openSections.has('notes')}
            onToggle={() => toggleSection('notes')}
          >
            <div className="space-y-4">
              <Select label="Note Type" options={NOTE_TYPE_OPTIONS} value={noteType} onChange={(e) => setNoteType(e.target.value)} />
              <Textarea label="Note" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Enter a note to add to all selected members…" />
            </div>
          </AccordionSection>

          {/* Events */}
          <AccordionSection
            id="events"
            title="Events"
            open={openSections.has('events')}
            onToggle={() => toggleSection('events')}
          >
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={triggerAutomations} onChange={(e) => setTriggerAutomations(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200" />
                <span className="text-sm text-gray-700">Trigger Automations</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={triggerEmails} onChange={(e) => setTriggerEmails(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200" />
                <span className="text-sm text-gray-700">Trigger Emails</span>
              </label>
            </div>
          </AccordionSection>
        </div>

        {/* Right — Selected members preview */}
        <div>
          <Card padding={false}>
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Selected Members ({selectedMembers.length})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <DataTable columns={previewColumns} data={selectedMembers} />
            </div>
          </Card>
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => navigate('/members')}>
          Cancel
        </Button>
        <Button onClick={() => setConfirmOpen(true)}>Apply Updates</Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleApply}
        title="Confirm Update"
        message={`Mass Update operations are permanent and cannot be reversed.\n\nYou have selected ${selectedMembers.length} Member(s) and ${totalProducts} Product(s) to be updated.`}
        confirmLabel="Update"
        confirmVariant="danger"
      />
    </div>
  )
}

const AccordionSection = ({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) => (
  <Card padding={false}>
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between px-5 py-4 text-left"
    >
      <span className="text-sm font-semibold text-gray-700">{title}</span>
      {open ? (
        <ChevronDown className="h-4 w-4 text-gray-400" />
      ) : (
        <ChevronRight className="h-4 w-4 text-gray-400" />
      )}
    </button>
    {open && <div className="border-t border-gray-200 px-5 py-4">{children}</div>}
  </Card>
)
