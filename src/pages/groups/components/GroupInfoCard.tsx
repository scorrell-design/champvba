import { Lock } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Badge, type BadgeVariant } from '../../../components/ui/Badge'
import { formatFEIN, formatPhone, formatDate } from '../../../utils/formatters'
import type { Group } from '../../../types/group'
import type { GroupStatus } from '../../../utils/constants'

const groupStatusVariant: Record<GroupStatus, BadgeVariant> = {
  Active: 'success',
  Inactive: 'gray',
  'Pending Setup': 'warning',
}

const Field = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <div>
    <dt className="text-xs font-medium uppercase text-gray-400">{label}</dt>
    <dd className="mt-0.5 text-sm text-gray-800">{value || '—'}</dd>
  </div>
)

const ReadOnlyField = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <div>
    <dt className="text-xs font-medium uppercase text-gray-400">{label}</dt>
    <dd className="mt-0.5 flex items-center gap-1.5">
      <Lock className="h-3 w-3 text-gray-400" />
      <span className="rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-600">{value || '—'}</span>
    </dd>
  </div>
)

interface GroupInfoCardProps {
  group: Group
}

export const GroupInfoCard = ({ group }: GroupInfoCardProps) => {
  const address = [
    group.address.street,
    group.address.street2,
    `${group.address.city}, ${group.address.state} ${group.address.zip}`,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="text-section-title mb-4 text-gray-900">Identity</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <ReadOnlyField label="Group ID" value={group.id} />
          <ReadOnlyField label="FEIN" value={formatFEIN(group.fein)} />
          <ReadOnlyField label="Legal Name" value={group.legalName} />
          <ReadOnlyField label="DBA" value={group.dba} />
        </dl>

        <h3 className="text-section-title mb-4 mt-6 text-gray-900">Group Info</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Created Date" value={formatDate(group.createdDate)} />
          <Field label="Company Name" value={group.legalName} />
          <div className="col-span-2">
            <Field label="Address" value={address} />
          </div>
          <Field label="Phone" value={formatPhone(group.contact.phone1)} />
          <div className="col-span-2">
            <Field
              label="Primary Contact"
              value={`${group.primaryContactName} · ${group.primaryContactEmail}`}
            />
          </div>
          <Field label="Invoice Template" value={group.invoiceTemplate} />
        </dl>
      </Card>

      <Card>
        <h3 className="text-section-title mb-4 text-gray-900">Setup &amp; Attributes</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-xs font-medium uppercase text-gray-400">Status</dt>
            <dd className="mt-0.5">
              <Badge variant={groupStatusVariant[group.status]} dot>
                {group.status}
              </Badge>
            </dd>
          </div>
          <Field label="Agent Type" value={group.agentType} />
          <Field label="Wellness Vendor" value={group.wellnessVendor} />
          <Field label="Tax ID" value={group.taxIdType} />
          <Field label="ACI Division Code" value={group.aciDivisionCode} />
          <Field label="PPO Network" value={group.ppoNetwork} />
          <Field label="PBM" value={group.pbm} />
          <div>
            <dt className="text-xs font-medium uppercase text-gray-400">First Stop Health</dt>
            <dd className="mt-0.5">
              <Badge variant={group.firstStopHealth ? 'success' : 'gray'}>
                {group.firstStopHealth ? 'Enabled' : 'Disabled'}
              </Badge>
            </dd>
          </div>
          <Field label="Section 125/Post-Tax" value={group.section125PostTax} />
          <Field label="DPC" value={group.dpc} />
          <Field label="Internal Process" value={group.internalProcess} />
          <Field label="Enroller" value={group.enroller} />
          <Field label="Carrier" value={group.carrier} />
        </dl>
      </Card>
    </div>
  )
}
