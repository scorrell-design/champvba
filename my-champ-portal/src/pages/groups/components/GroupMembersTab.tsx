import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Download } from 'lucide-react'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge, StatusBadge, TypeBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { useMembers } from '../../../hooks/useQueries'
import type { Member } from '../../../types/member'

const columns: ColumnDef<Member, unknown>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorFn: (row) => `${row.lastName}, ${row.firstName}`,
    cell: ({ row }) => (
      <Link
        to={`/members/${row.original.id}`}
        className="font-medium text-primary-600 hover:underline"
      >
        {row.original.lastName}, {row.original.firstName}
      </Link>
    ),
  },
  { accessorKey: 'memberId', header: 'Member ID' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue<Member['status']>()} />,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => <TypeBadge type={getValue<Member['type']>()} />,
  },
  { accessorKey: 'email', header: 'Email' },
]

interface GroupMembersTabProps {
  groupId: string
}

export const GroupMembersTab = ({ groupId }: GroupMembersTabProps) => {
  const { data: members = [], isLoading } = useMembers({ groupId })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="info">{members.length} Members</Badge>
        <Button variant="secondary" size="sm">
          <Download className="h-4 w-4" />
          Export Members
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={members}
        isLoading={isLoading}
        emptyMessage="No members in this group"
      />
    </div>
  )
}
