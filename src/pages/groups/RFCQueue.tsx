import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { FileText } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { useRFCStore } from '../../stores/rfc-store'
import { formatDate, formatFEIN } from '../../utils/formatters'
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

// ─── Main Page ─────────────────────────────────────────────

export function RFCQueue() {
  const navigate = useNavigate()
  const { rfcs, setRfcForWizard } = useRFCStore()

  const readyToBuild = rfcs.filter((r) => r.status === 'ready_to_build')

  const handleRowClick = (rfc: RFC) => {
    setRfcForWizard(rfc)
    navigate('/groups/new')
  }

  return (
    <div>
      <PageHeader
        title="Groups Ready to Build"
        description="Click a group to start the Group Build Wizard"
      />

      <DataTable
        columns={columns}
        data={readyToBuild}
        emptyMessage="No groups are currently ready to build."
        emptyIcon={FileText}
        onRowClick={handleRowClick}
        rowClassName={() => 'bg-success-50/50 border-l-2 border-l-success-400 cursor-pointer'}
      />
    </div>
  )
}
