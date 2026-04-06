import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { FileText } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Card } from '../../components/ui/Card'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatDate, formatFEIN, formatPhone } from '../../utils/formatters'
import { type RFC, RFCS } from '../../data/rfcs'

const statusVariant: Record<RFC['status'], BadgeVariant> = {
  New: 'info',
  'In Review': 'warning',
  'Ready to Build': 'success',
}

const columns: ColumnDef<RFC, unknown>[] = [
  {
    accessorKey: 'groupName',
    header: 'Group Name',
    cell: ({ getValue }) => (
      <span className="font-semibold text-gray-900">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'fein',
    header: 'FEIN',
    cell: ({ getValue }) => formatFEIN(getValue<string>()),
  },
  {
    accessorKey: 'agentName',
    header: 'Agent Name',
  },
  {
    accessorKey: 'submittedDate',
    header: 'Date Submitted',
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<RFC['status']>()
      return (
        <Badge variant={statusVariant[status]} dot>
          {status}
        </Badge>
      )
    },
  },
]

function RFCDetailCard({ rfc }: { rfc: RFC }) {
  const navigate = useNavigate()
  const addr = rfc.address

  return (
    <Card className="mt-4">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Group Information
          </h3>
          <dl className="space-y-3 text-sm">
            <Field label="Legal Name" value={rfc.groupName} />
            <Field label="DBA" value={rfc.dba} />
            <Field label="FEIN" value={formatFEIN(rfc.fein)} />
            <Field
              label="Address"
              value={`${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`}
            />
            <Field label="Phone" value={formatPhone(rfc.phone)} />
            <Field label="Primary Contact" value={`${rfc.primaryContactName} (${rfc.primaryContactEmail})`} />
            <Field label="Eligibility Contact" value={rfc.eligibilityContactEmail} />
          </dl>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Agent &amp; Plan Details
          </h3>
          <dl className="space-y-3 text-sm">
            <Field label="Agent Name" value={rfc.agentName} />
            <Field label="Agent Number" value={rfc.agentNumber} />
            <Field label="Agent Company" value={rfc.agentCompany} />
            <Field label="Agent Phone" value={formatPhone(rfc.agentPhone)} />
            <Field label="Agent Email" value={rfc.agentEmail} />
            <Field label="PPO Network" value={rfc.ppoNetwork} />
            <Field label="PBM" value={rfc.pbm} />
            <div className="flex items-center gap-6">
              <div>
                <dt className="text-gray-500">HSA</dt>
                <dd className="mt-0.5">
                  <Badge variant={rfc.hsaFlag ? 'success' : 'gray'}>
                    {rfc.hsaFlag ? 'Yes' : 'No'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">First Stop Health</dt>
                <dd className="mt-0.5">
                  <Badge variant={rfc.firstStopFlag ? 'success' : 'gray'}>
                    {rfc.firstStopFlag ? 'Yes' : 'No'}
                  </Badge>
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
        <Button onClick={() => navigate(`/groups/new?rfc=${rfc.id}`)}>
          Create Group from RFC
        </Button>
      </div>
    </Card>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-gray-900">{value}</dd>
    </div>
  )
}

export function RFCQueue() {
  const [selectedRfc, setSelectedRfc] = useState<RFC | null>(null)

  return (
    <div>
      <PageHeader
        title="Pending RFC Reviews"
        description="Review submitted requests and create new groups"
      />

      <DataTable
        columns={columns}
        data={RFCS}
        emptyMessage="No pending RFCs"
        emptyIcon={FileText}
        onRowClick={(rfc) =>
          setSelectedRfc((prev) => (prev?.id === rfc.id ? null : rfc))
        }
      />

      {selectedRfc && <RFCDetailCard rfc={selectedRfc} />}
    </div>
  )
}
