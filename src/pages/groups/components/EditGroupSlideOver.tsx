import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SlideOver } from '../../../components/ui/SlideOver'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'
import { InlineWarning } from '../../../components/feedback/InlineWarning'
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
  const [feinWarning, setFeinWarning] = useState(false)
  const [nameWarning, setNameWarning] = useState(false)
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
      setFeinWarning(false)
      setNameWarning(false)
    }
  }, [group, open])

  const val = (key: string) => String(form[key] ?? '')

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'fein' && value !== group.fein) setFeinWarning(true)
    if (key === 'legalName' && value !== group.legalName) setNameWarning(true)
  }

  const handleSave = () => {
    const payload: Partial<Group> = {
      status: val('status') as Group['status'],
      agentType: val('agentType'),
      legalName: val('legalName'),
      dba: val('dba'),
      fein: val('fein'),
      cbsGroupId: val('cbsGroupId'),
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
      tmHwCode: val('tmHwCode'),
    }
    updateGroup.mutate(
      { id: group.id, data: payload },
      {
        onSuccess: () => {
          const trackFields: [string, string, string | undefined][] = [
            ['Legal Name', 'legalName', group.legalName],
            ['DBA', 'dba', group.dba],
            ['FEIN', 'fein', group.fein],
            ['Status', 'status', group.status],
            ['CBS Group ID', 'cbsGroupId', group.cbsGroupId],
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

        <Section title="Identity" defaultOpen>
          <Input label="Legal Name" value={val('legalName')} onChange={(e) => set('legalName', e.target.value)} />
          <Input label="DBA" value={val('dba')} onChange={(e) => set('dba', e.target.value)} />
          <Input label="FEIN" value={val('fein')} onChange={(e) => set('fein', e.target.value)} />
          <Input label="CBS Group ID" value={val('cbsGroupId')} onChange={(e) => set('cbsGroupId', e.target.value)} />
          {feinWarning && (
            <div className="col-span-2">
              <InlineWarning
                message="Changing the FEIN will trigger a CBS notification and may require ACH/banking re-validation."
                onConfirm={() => setFeinWarning(false)}
                confirmLabel="Yes, proceed"
                onDismiss={() => { set('fein', group.fein); setFeinWarning(false) }}
                dismissLabel="Revert"
              />
            </div>
          )}
          {nameWarning && (
            <div className="col-span-2">
              <InlineWarning
                message="CBS will be notified of this name change. A W-9 may be requested for validation."
                onDismiss={() => setNameWarning(false)}
                dismissLabel="Understood"
              />
            </div>
          )}
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

        <Section title="Tracking">
          <Input label="WLT Group Number" value={val('wltGroupNumber')} onChange={(e) => set('wltGroupNumber', e.target.value)} />
          <Input label="TPA Group Code" value={val('tpaGroupCode')} onChange={(e) => set('tpaGroupCode', e.target.value)} />
          <Input label="TM/HW Code" value={val('tmHwCode')} onChange={(e) => set('tmHwCode', e.target.value)} />
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
