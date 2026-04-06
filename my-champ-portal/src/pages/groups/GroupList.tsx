import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { SearchBar } from '../../components/ui/SearchBar'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useGroups } from '../../hooks/useQueries'
import { formatFEIN, formatDate } from '../../utils/formatters'
import type { Group } from '../../types/group'
import type { GroupStatus } from '../../utils/constants'

const groupStatusVariant: Record<GroupStatus, BadgeVariant> = {
  Active: 'success',
  Inactive: 'gray',
  'Pending Setup': 'warning',
}

const columns: ColumnDef<Group, unknown>[] = [
  {
    accessorKey: 'legalName',
    header: 'Client Name',
    cell: ({ row }) => (
      <Link
        to={`/groups/${row.original.id}`}
        className="font-medium text-primary-600 hover:underline"
      >
        {row.original.legalName}
      </Link>
    ),
  },
  { accessorKey: 'dba', header: 'DBA' },
  {
    accessorKey: 'fein',
    header: 'FEIN',
    cell: ({ getValue }) => formatFEIN(getValue<string>()),
  },
  { accessorKey: 'cbsGroupId', header: 'CBS Group ID' },
  { accessorKey: 'wltGroupNumber', header: 'WLT#' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<GroupStatus>()
      return (
        <Badge variant={groupStatusVariant[status]} dot>
          {status}
        </Badge>
      )
    },
  },
  { accessorKey: 'agentName', header: 'Agent' },
  {
    accessorKey: 'benefitsEffectiveDate',
    header: 'Benefits Effective Date',
    cell: ({ getValue }) => {
      const val = getValue<string>()
      return val ? formatDate(val) : '—'
    },
  },
  {
    accessorKey: 'firstStopHealth',
    header: 'First Stop Health',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge variant="success">Enabled</Badge>
      ) : (
        <Badge variant="gray">Disabled</Badge>
      ),
  },
]

export const GroupList = () => {
  const [search, setSearch] = useState('')
  const { data: groups = [], isLoading } = useGroups()

  const filtered = useMemo(() => {
    if (!search) return groups
    const q = search.toLowerCase()
    return groups.filter(
      (g) =>
        g.legalName.toLowerCase().includes(q) ||
        g.dba.toLowerCase().includes(q) ||
        g.fein.includes(q),
    )
  }, [groups, search])

  return (
    <div>
      <PageHeader
        title="Groups / Clients"
        actions={
          <Link to="/groups/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add Group
            </Button>
          </Link>
        }
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name or FEIN…"
        className="mb-4 max-w-md"
      />
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No groups found"
      />
    </div>
  )
}
