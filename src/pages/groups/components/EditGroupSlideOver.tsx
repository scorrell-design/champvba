import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SlideOver } from '../../../components/ui/SlideOver'
import { Input } from '../../../components/ui/Input'
import { DatePicker } from '../../../components/forms/DatePicker'
import { Select } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'
import { useToast } from '../../../components/feedback/Toast'
import { useUpdateGroup } from '../../../hooks/useQueries'
import { useAuditStore } from '../../../stores/audit-store'
import { US_STATES } from '../../../utils/constants'
import type { Group } from '../../../types/group'

const stateOptions = US_STATES.map((s) => ({ value: s, label: s }))

const Section = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium text-gray-700"
      >
        {title}
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && <div className="mt-4 grid grid-cols-2 gap-4">{children}</div>}
    </div>
  )
}

interface EditGroupSlideOverProps {
  open: boolean
  onClose: () => void
  group: Group
}

export const EditGroupSlideOver = ({ open, onClose, group }: EditGroupSlideOverProps) => {
  const [form, setForm] = useState<Record<string, unknown>>({})
  const updateGroup = useUpdateGroup()
  const { addToast } = useToast()
  const logFieldChange = useAuditStore((s) => s.logFieldChange)

  useEffect(() => {
    if (open) {
      setForm({
        ...group,
        'address.street': group.address.street,
        'address.street2': group.address.street2 ?? '',
        'address.city': group.address.city,
        'address.state': group.address.state,
        'address.zip': group.address.zip,
        'contact.phone1': group.contact.phone1,
        'contact.email1': group.contact.email1,
      })
    }
  }, [group, open])

  const val = (key: string) => String(form[key] ?? '')

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    const payload: Partial<Group> = {
      status: val('status') as Group['status'],
      agentType: val('agentType'),
      address: {
        street: val('address.street'),
        street2: val('address.street2'),
        city: val('address.city'),
        state: val('address.state'),
        zip: val('address.zip'),
      },
      contact: { phone1: val('contact.phone1'), email1: val('contact.email1') },
      primaryContactName: val('primaryContactName'),
      primaryContactEmail: val('primaryContactEmail'),
      invoiceTemplate: val('invoiceTemplate'),
      ppoNetwork: val('ppoNetwork'),
      pbm: val('pbm'),
      taxIdType: val('taxIdType'),
      aciDivisionCode: val('aciDivisionCode'),
      section125PostTax: val('section125PostTax'),
      dpc: val('dpc'),
      internalProcess: val('internalProcess'),
      enroller: val('enroller'),
      carrier: val('carrier'),
      wellnessVendor: val('wellnessVendor'),
      wltGroupNumber: val('wltGroupNumber'),
      tpaGroupCode: val('tpaGroupCode'),
      anticipatedDate: val('anticipatedDate'),
      planStartDate: val('planStartDate'),
      planEndDate: val('planEndDate'),
      openEnrollmentStartDate: val('openEnrollmentStartDate'),
      openEnrollmentEndDate: val('openEnrollmentEndDate'),
    }
    updateGroup.mutate(
      { id: group.id, data: payload },
      {
        onSuccess: () => {
          const trackFields: [string, string, string | undefined][] = [
            ['Status', 'status', group.status],
          ]
          for (const [label, key, oldVal] of trackFields) {
            const newVal = val(key)
            if (newVal !== (oldVal ?? '')) {
              logFieldChange({
                entityType: 'Group',
                entityId: group.id,
                entityName: group.legalName,
                fieldChanged: label,
                oldValue: oldVal ?? '',
                newValue: newVal,
              })
            }
          }
          addToast('success', 'Group updated successfully')
          onClose()
        },
        onError: () => addToast('error', 'Failed to update group'),
      },
    )
  }

  return (
    <SlideOver open={open} onClose={onClose} title="Edit Group" wide>
      <div className="space-y-0">
        <Section title="Setup" defaultOpen>
          <Select label="Status" value={val('status')} onChange={(e) => set('status', e.target.value)} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'Pending Setup', label: 'Pending Setup' }]} />
          <Select label="Agent Type" value={val('agentType')} onChange={(e) => set('agentType', e.target.value)} options={[{ value: 'Independent', label: 'Independent' }, { value: 'Captive', label: 'Captive' }]} />
        </Section>

        <Section title="Identity (View Only)" defaultOpen>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Legal Name</label>
            <span className="text-sm text-gray-900">{group.legalName || '—'}</span>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">DBA</label>
            <span className="text-sm text-gray-900">{group.dba || '—'}</span>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">FEIN</label>
            <span className="text-sm text-gray-900">{group.fein || '—'}</span>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">CBS Group ID</label>
            <span className="text-sm text-gray-900">{group.cbsGroupId || '—'}</span>
          </div>
        </Section>

        <Section title="Addresses">
          <Input label="Street" value={val('address.street')} onChange={(e) => set('address.street', e.target.value)} />
          <Input label="Street 2" value={val('address.street2')} onChange={(e) => set('address.street2', e.target.value)} />
          <Input label="City" value={val('address.city')} onChange={(e) => set('address.city', e.target.value)} />
          <Select label="State" value={val('address.state')} onChange={(e) => set('address.state', e.target.value)} options={stateOptions} />
          <Input label="ZIP" value={val('address.zip')} onChange={(e) => set('address.zip', e.target.value)} />
        </Section>

        <Section title="Contact">
          <Input label="Phone" value={val('contact.phone1')} onChange={(e) => set('contact.phone1', e.target.value)} />
          <Input label="Email" value={val('contact.email1')} onChange={(e) => set('contact.email1', e.target.value)} />
          <Input label="Primary Contact Name" value={val('primaryContactName')} onChange={(e) => set('primaryContactName', e.target.value)} />
          <Input label="Primary Contact Email" value={val('primaryContactEmail')} onChange={(e) => set('primaryContactEmail', e.target.value)} />
        </Section>

        <Section title="Billing">
          <Input label="Invoice Template" value={val('invoiceTemplate')} onChange={(e) => set('invoiceTemplate', e.target.value)} />
        </Section>

        <Section title="Attributes">
          <Input label="PPO Network" value={val('ppoNetwork')} onChange={(e) => set('ppoNetwork', e.target.value)} />
          <Input label="PBM" value={val('pbm')} onChange={(e) => set('pbm', e.target.value)} />
          <Input label="Tax ID Type" value={val('taxIdType')} onChange={(e) => set('taxIdType', e.target.value)} />
          <Input label="ACI Division Code" value={val('aciDivisionCode')} onChange={(e) => set('aciDivisionCode', e.target.value)} />
        </Section>

        <Section title="Settings">
          <Input label="Section 125/Post-Tax" value={val('section125PostTax')} onChange={(e) => set('section125PostTax', e.target.value)} />
          <Input label="DPC" value={val('dpc')} onChange={(e) => set('dpc', e.target.value)} />
          <Input label="Internal Process" value={val('internalProcess')} onChange={(e) => set('internalProcess', e.target.value)} />
          <Input label="Enroller" value={val('enroller')} onChange={(e) => set('enroller', e.target.value)} />
          <Input label="Carrier" value={val('carrier')} onChange={(e) => set('carrier', e.target.value)} />
          <Input label="Wellness Vendor" value={val('wellnessVendor')} onChange={(e) => set('wellnessVendor', e.target.value)} />
        </Section>

        <Section title="Plan Year">
          <DatePicker label="Anticipated Date" value={val('anticipatedDate')} onChange={(v) => set('anticipatedDate', v)} />
          <DatePicker label="Start Date" value={val('planStartDate')} onChange={(v) => set('planStartDate', v)} />
          <DatePicker label="End Date" value={val('planEndDate')} onChange={(v) => set('planEndDate', v)} />
        </Section>

        <Section title="Open Enrollment">
          <DatePicker label="OE Start Date" value={val('openEnrollmentStartDate')} onChange={(v) => set('openEnrollmentStartDate', v)} />
          <DatePicker label="OE End Date" value={val('openEnrollmentEndDate')} onChange={(v) => set('openEnrollmentEndDate', v)} />
        </Section>
      </div>

      <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
        <Button onClick={handleSave} isLoading={updateGroup.isPending}>
          Save Changes
        </Button>
      </div>
    </SlideOver>
  )
}
