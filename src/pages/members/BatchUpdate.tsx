import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
import { useMemberStore } from '../../stores/member-store'
import { useMemberSelectionStore } from '../../stores/member-selection-store'
import { useToast } from '../../components/feedback/Toast'
import { logAuditEntry } from '../../utils/audit'
import { serializeDate } from '../../utils/dates'
import { INACTIVE_REASONS } from '../../utils/constants'
import type { Member } from '../../types/member'
import type { ColumnDef } from '@tanstack/react-table'

const REASON_OPTIONS = INACTIVE_REASONS.map((r) => ({ value: r, label: r }))
const DATE_ACTION_OPTIONS = [
  { value: 'add', label: 'Add' },
  { value: 'change', label: 'Change' },
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
  const location = useLocation()
  const addToast = useToast((s) => s.addToast)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const routeState = location.state as { memberIds?: string[]; returnPath?: string } | undefined
  const storeSelection = useMemberSelectionStore((state) => state.selectedIds)
  const clearSelection = useMemberSelectionStore((state) => state.clearSelection)
  const allMembers = useMemberStore((state) => state.members)
  const updateMember = useMemberStore((state) => state.updateMember)

  const selectedIds = routeState?.memberIds ?? storeSelection

  const selectedMembers = useMemo(
    () => allMembers.filter((m) => selectedIds.includes(m.id)),
    [allMembers, selectedIds],
  )

  const memberCount = selectedMembers.length
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

  const [activeDate, setActiveDate] = useState('')
  const [activeDateAction, setActiveDateAction] = useState('add')
  const [productCreatedDate, setProductCreatedDate] = useState('')
  const [nextBillingDate, setNextBillingDate] = useState('')
  const [feeAmount, setFeeAmount] = useState('')
  const [feeBenefit, setFeeBenefit] = useState('')
  const [feePeriod, setFeePeriod] = useState('Monthly')
  const [paidStatus, setPaidStatus] = useState(false)
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

    const updatedMemberIds: string[] = []

    for (const member of selectedMembers) {
      const updates: Partial<Member> = {}
      const changes: string[] = []

      if (activeDate) {
        updates.activeDate = serializeDate(activeDate)
        changes.push(`Active Date: ${serializeDate(activeDate)}`)
      }
      if (inactiveDate) {
        updates.inactiveDate = serializeDate(inactiveDate)
        changes.push(`Inactive Date: ${serializeDate(inactiveDate)}`)
      }
      if (inactiveReason) {
        updates.inactiveReason = inactiveReason
        changes.push(`Inactive Reason: ${inactiveReason}`)
      }
      if (holdAction === 'set' && holdReason) {
        updates.holdReason = holdReason as Member['holdReason']
        updates.status = 'On Hold'
        changes.push(`Hold: ${holdReason}`)
      }
      if (holdAction === 'delete') {
        updates.holdReason = undefined
        if (member.status === 'On Hold') updates.status = 'Active'
        changes.push('Hold removed')
      }

      if (Object.keys(updates).length > 0) {
        updateMember(member.id, updates)
        updatedMemberIds.push(member.id)

        logAuditEntry({
          entityType: 'Member',
          entityId: member.id,
          entityName: `${member.firstName} ${member.lastName}`,
          action: 'Batch Update Applied',
          details: `Batch update: ${changes.join(', ')}`,
        })
      }
    }

    clearSelection()
    addToast('success', `Batch update applied to ${selectedMembers.length} members`)

    const returnPath = routeState?.returnPath || '/members'
    navigate(returnPath, {
      state: { filterByIds: updatedMemberIds.length > 0 ? updatedMemberIds : selectedIds },
    })
  }

  if (memberCount === 0) {
    return (
      <div>
        <PageHeader title="Batch Update" backLink="/members" />
        <Card>
          <div className="py-12 text-center">
            <p className="text-gray-500">No members selected. Go back to the Member List and select members to update.</p>
            <Button className="mt-4" onClick={() => navigate('/members')}>Go to Member List</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Batch Update"
        backLink="/members"
        description={`Updating ${memberCount} member${memberCount !== 1 ? 's' : ''} with ${totalProducts} product${totalProducts !== 1 ? 's' : ''}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <AccordionSection title="Dates" open={openSections.has('dates')} onToggle={() => toggleSection('dates')}>
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

          <AccordionSection title="Product & Fees" open={openSections.has('fees')} onToggle={() => toggleSection('fees')}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Product Fee" type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} placeholder="0.00" />
              <Select label="Benefit Tier" options={BENEFIT_OPTIONS} value={feeBenefit} onChange={(e) => setFeeBenefit(e.target.value)} placeholder="Select…" />
              <Select label="Period" options={PERIOD_OPTIONS} value={feePeriod} onChange={(e) => setFeePeriod(e.target.value)} />
            </div>
          </AccordionSection>

          <AccordionSection title="Payment" open={openSections.has('payment')} onToggle={() => toggleSection('payment')}>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={paidStatus} onChange={(e) => setPaidStatus(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200" />
                <span className="text-sm text-gray-700">Set Product Paid</span>
              </label>
            </div>
          </AccordionSection>

          <AccordionSection title="Hold" open={openSections.has('hold')} onToggle={() => toggleSection('hold')}>
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

          <AccordionSection title="Inactive" open={openSections.has('inactive')} onToggle={() => toggleSection('inactive')}>
            <div className="grid grid-cols-2 gap-4">
              <DatePicker label="Inactive Date" value={inactiveDate} onChange={setInactiveDate} />
              <Select label="Inactive Reason" options={REASON_OPTIONS} value={inactiveReason} onChange={(e) => setInactiveReason(e.target.value)} placeholder="Select reason…" />
            </div>
          </AccordionSection>

          <AccordionSection title="Tracking" open={openSections.has('tracking')} onToggle={() => toggleSection('tracking')}>
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

          <AccordionSection title="Notes" open={openSections.has('notes')} onToggle={() => toggleSection('notes')}>
            <div className="space-y-4">
              <Select label="Note Type" options={NOTE_TYPE_OPTIONS} value={noteType} onChange={(e) => setNoteType(e.target.value)} />
              <Textarea label="Note" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Enter a note to add to all selected members…" />
            </div>
          </AccordionSection>

          <AccordionSection title="Events" open={openSections.has('events')} onToggle={() => toggleSection('events')}>
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

        <div>
          <Card padding={false}>
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Selected Members ({memberCount})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <DataTable columns={previewColumns} data={selectedMembers} />
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => navigate(routeState?.returnPath || '/members')}>
          Cancel
        </Button>
        <Button onClick={() => setConfirmOpen(true)}>Apply Updates</Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleApply}
        title="Confirm Update"
        message={`Mass Update operations are permanent and cannot be reversed.\n\nYou have selected ${memberCount} Member(s) and ${totalProducts} Product(s) to be updated.`}
        confirmLabel="Update"
        confirmVariant="danger"
      />
    </div>
  )
}

const AccordionSection = ({
  title,
  open,
  onToggle,
  children,
}: {
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
