import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { FileText, Check, AlertTriangle } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Card } from '../../components/ui/Card'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/feedback/Toast'
import { useRFCStore } from '../../stores/rfc-store'
import { PRODUCT_TEMPLATES } from '../../data/products'
import { formatDate, formatFEIN, formatPhone, formatCurrency } from '../../utils/formatters'
import { cn } from '../../utils/cn'
import type { RFC, RFCStatus } from '../../types/rfc'

const statusVariant: Record<RFCStatus, BadgeVariant> = {
  new: 'info',
  in_review: 'warning',
  ready_to_build: 'success',
  completed: 'gray',
}

const statusLabel: Record<RFCStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  ready_to_build: 'Ready to Build',
  completed: 'Completed',
}

function hsaBadgeVariant(flag: RFC['hsaFlag']): BadgeVariant {
  if (flag === 'yes') return 'success'
  if (flag === 'unsure') return 'warning'
  return 'gray'
}

const columns: ColumnDef<RFC, unknown>[] = [
  {
    accessorKey: 'legalName',
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
    id: 'agentName',
    header: 'Agent Name',
    accessorFn: (row) => `${row.agent.firstName} ${row.agent.lastName}`,
  },
  {
    accessorKey: 'hsaFlag',
    header: 'HSA Flag',
    cell: ({ getValue }) => {
      const flag = getValue<RFC['hsaFlag']>()
      return (
        <Badge variant={hsaBadgeVariant(flag)}>
          {flag === 'yes' ? 'Yes' : flag === 'no' ? 'No' : 'Unsure'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'firstStopHealthFlag',
    header: 'First Stop',
    cell: ({ getValue }) => {
      const flag = getValue<boolean>()
      return <Badge variant={flag ? 'success' : 'gray'}>{flag ? 'Yes' : 'No'}</Badge>
    },
  },
  {
    accessorKey: 'dateSubmitted',
    header: 'Date Submitted',
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<RFCStatus>()
      return (
        <Badge variant={statusVariant[status]} dot>
          {statusLabel[status]}
        </Badge>
      )
    },
  },
]

function getTemplateKey(rfc: RFC): string {
  const isHsa = rfc.hsaFlag === 'yes'
  const isFsh = rfc.firstStopHealthFlag
  if (isHsa && isFsh) return 'firstStopHsa'
  if (isHsa) return 'hsa'
  if (isFsh) return 'firstStop'
  return 'standard'
}

function computeFieldStats(rfc: RFC) {
  const fields: [string, boolean][] = [
    ['Agent Name', !!rfc.agent.firstName],
    ['Agent Number', !!rfc.agent.agentNumber],
    ['Agent Company', !!rfc.agent.company],
    ['Agent Phone', !!rfc.agent.phone],
    ['Agent Email', !!rfc.agent.email],
    ['TIN/NPI Code', !!rfc.agent.tinNpiCode],
    ['Legal Name', !!rfc.legalName],
    ['DBA', !!rfc.dba],
    ['FEIN', !!rfc.fein],
    ['Address', !!rfc.address.street],
    ['Phone', !!rfc.phone],
    ['Primary Contact', !!rfc.primaryContact.name],
    ['Primary Contact Email', !!rfc.primaryContact.email],
    ['Eligibility Email', !!rfc.eligibilityContact?.email],
    ['Eligibility Phone', !!rfc.eligibilityContact?.phone],
    ['Billing Contact', !!rfc.billingContact?.name],
    ['PPO Network', !!rfc.ppoNetwork],
    ['PBM', !!rfc.pbm],
    ['WLT Group Number', false],
    ['CBS Group Code', false],
  ]
  const populated = fields.filter(([, v]) => v).length
  const missing = fields.filter(([, v]) => !v).map(([name]) => name)
  return { total: fields.length, populated, missing }
}

// ─── Detail Field ──────────────────────────────────────────

function DetailField({ label, value }: { label: string; value?: string | null }) {
  const filled = !!value
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <dt className="text-xs uppercase text-gray-500">{label}</dt>
        <dd className={cn('mt-0.5 text-sm font-medium', filled ? 'text-gray-900' : 'text-gray-400')}>
          {filled ? value : '—'}
        </dd>
      </div>
      {filled ? (
        <Check className="mt-3.5 h-3.5 w-3.5 shrink-0 text-success-500" />
      ) : (
        <span className="mt-3 shrink-0 rounded bg-warning-50 px-1.5 py-0.5 text-xs text-warning-700">
          Manual entry needed
        </span>
      )}
    </div>
  )
}

// ─── Section wrapper ───────────────────────────────────────

function Section({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
        {title}
        <span className="ml-2 text-xs font-normal normal-case text-gray-400">(Wizard Step {step})</span>
      </h3>
      {children}
    </div>
  )
}

// ─── RFC Detail View ───────────────────────────────────────

function RFCDetailView({ rfc }: { rfc: RFC }) {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { setRfcForWizard, setSelectedRfc, updateStatus } = useRFCStore()
  const addr = rfc.address
  const template = PRODUCT_TEMPLATES[getTemplateKey(rfc)]
  const stats = computeFieldStats(rfc)

  return (
    <Card className="mt-6 space-y-8">
      {/* Section 1: Agent / Broker */}
      <Section title="Agent / Broker" step={1}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <DetailField label="Agent Name" value={`${rfc.agent.firstName} ${rfc.agent.lastName}`} />
          <DetailField label="Agent Number" value={rfc.agent.agentNumber} />
          <DetailField label="Company" value={rfc.agent.company} />
          <DetailField label="Phone" value={rfc.agent.phone ? formatPhone(rfc.agent.phone) : undefined} />
          <DetailField label="Email" value={rfc.agent.email} />
          <DetailField label="TIN/NPI Code" value={rfc.agent.tinNpiCode} />
        </div>
      </Section>

      <hr className="border-gray-200" />

      {/* Section 2: Group Info */}
      <Section title="Group Info" step={2}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <DetailField label="Legal Name" value={rfc.legalName} />
          <DetailField label="DBA" value={rfc.dba} />
          <DetailField label="FEIN" value={rfc.fein ? formatFEIN(rfc.fein) : undefined} />
          <DetailField
            label="Address"
            value={addr.street ? `${addr.street}${addr.street2 ? `, ${addr.street2}` : ''}, ${addr.city}, ${addr.state} ${addr.zip}` : undefined}
          />
          <DetailField label="Phone" value={rfc.phone ? formatPhone(rfc.phone) : undefined} />
          <DetailField label="Primary Contact Name" value={rfc.primaryContact.name} />
          <DetailField label="Primary Contact Email" value={rfc.primaryContact.email} />
          <DetailField label="Eligibility Contact Email" value={rfc.eligibilityContact?.email} />
          <DetailField label="Eligibility Contact Phone" value={rfc.eligibilityContact?.phone ? formatPhone(rfc.eligibilityContact.phone) : undefined} />
          <DetailField label="Billing Contact" value={rfc.billingContact?.name} />
          {rfc.billingContact?.email && (
            <DetailField label="Billing Contact Email" value={rfc.billingContact.email} />
          )}
          {rfc.billingContact?.phone && (
            <DetailField label="Billing Contact Phone" value={formatPhone(rfc.billingContact.phone)} />
          )}
          <DetailField label="PPO Network" value={rfc.ppoNetwork} />
          <DetailField label="PBM" value={rfc.pbm} />
        </div>
      </Section>

      <hr className="border-gray-200" />

      {/* Section 3: Product Configuration */}
      <Section title="Product Configuration" step={3}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div>
            <span className="mr-2 text-xs uppercase text-gray-500">HSA</span>
            <Badge variant={hsaBadgeVariant(rfc.hsaFlag)} className="text-sm">
              {rfc.hsaFlag === 'yes' ? 'Yes' : rfc.hsaFlag === 'no' ? 'No' : 'Unsure'}
            </Badge>
          </div>
          <div>
            <span className="mr-2 text-xs uppercase text-gray-500">First Stop Health</span>
            <Badge variant={rfc.firstStopHealthFlag ? 'success' : 'gray'} className="text-sm">
              {rfc.firstStopHealthFlag ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">
            Auto-selected template:{' '}
            <span className="font-semibold text-gray-900">{template.name}</span>
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 text-right font-medium">Default Fee</th>
              </tr>
            </thead>
            <tbody>
              {template.products.map((p) => (
                <tr key={p.productId} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 text-gray-700">{p.name}</td>
                  <td className="py-2 font-mono text-gray-500">{p.productId}</td>
                  <td className="py-2 text-right text-gray-700">{formatCurrency(p.monthlyFee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rfc.hsaFlag === 'unsure' && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning-200 bg-warning-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-500" />
            <p className="text-sm text-warning-700">
              The RFC indicated &quot;Unsure&quot; for HSA. Standard Build template applied. HSA product can be added manually in the wizard.
            </p>
          </div>
        )}
      </Section>

      <hr className="border-gray-200" />

      {/* Section 4: Auto-Configured Settings */}
      <Section title="Auto-Configured Settings" step={4}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          {[
            ['Group Type', 'CHAMP Invoice Group'],
            ['Invoice Template', 'Champion Health, Inc.'],
            ['Wellness Vendor', 'CLEVER'],
            ['HW TeleHealth', 'No'],
            ['Enroller', 'CHAMP'],
            ['Internal Process', 'Monthly Invoice'],
            ['DPC', 'CLEVER'],
            ['Payment Processor', 'List Bill'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center gap-2 py-1">
              <Check className="h-3.5 w-3.5 shrink-0 text-success-500" />
              <span className="text-xs uppercase text-gray-500">{label}:</span>
              <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </Section>

      <hr className="border-gray-200" />

      {/* Summary Footer */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-success-600">{stats.populated}</span> of{' '}
          <span className="font-semibold">{stats.total}</span> fields will be auto-populated.{' '}
          <span className="font-semibold text-warning-600">{stats.missing.length}</span> fields
          require manual entry.
        </p>
        {stats.missing.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            Manual entry: {stats.missing.join(', ')}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-5">
        <Button variant="ghost" onClick={() => setSelectedRfc(null)}>
          Back to Queue
        </Button>
        {rfc.status !== 'in_review' && rfc.status !== 'completed' && (
          <Button
            variant="secondary"
            onClick={() => {
              updateStatus(rfc.id, 'in_review')
              addToast('info', `${rfc.legalName} marked as In Review`)
            }}
          >
            Mark as In Review
          </Button>
        )}
        <Button
          size="lg"
          className="rounded-full"
          onClick={() => {
            setRfcForWizard(rfc)
            navigate('/groups/new')
          }}
        >
          Create Group from This RFC
        </Button>
      </div>
    </Card>
  )
}

// ─── Main Page ─────────────────────────────────────────────

export function RFCQueue() {
  const [showCompleted, setShowCompleted] = useState(false)
  const { rfcs, selectedRfc, setSelectedRfc } = useRFCStore()

  const activeRfcs = rfcs.filter((r) => r.status !== 'completed')
  const completedRfcs = rfcs.filter((r) => r.status === 'completed')
  const displayRfcs = showCompleted ? [...activeRfcs, ...completedRfcs] : activeRfcs

  return (
    <div>
      <PageHeader
        title="RFC Queue"
        description="Review submitted requests for coverage and create new groups"
        actions={
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
            />
            Show completed
          </label>
        }
      />

      <DataTable
        columns={columns}
        data={displayRfcs}
        emptyMessage="No pending RFCs"
        emptyIcon={FileText}
        onRowClick={(rfc) => {
          setSelectedRfc(selectedRfc?.id === rfc.id ? null : rfc)
        }}
        rowClassName={(rfc) => {
          if (rfc.status === 'ready_to_build') return 'bg-success-50/50 border-l-2 border-l-success-400'
          if (rfc.status === 'completed') return 'opacity-50'
          return undefined
        }}
      />

      {selectedRfc && <RFCDetailView rfc={selectedRfc} />}
    </div>
  )
}
