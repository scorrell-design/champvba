import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Download, Plus, Users, Upload } from 'lucide-react'
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
  {
    id: 'products',
    header: 'Products',
    cell: ({ row }) => {
      const count = row.original.products?.filter((p) => p.status === 'Active').length ?? 0
      return <Badge variant={count > 0 ? 'info' : 'gray'}>{count} active</Badge>
    },
  },
]

interface GroupMembersTabProps {
  groupId: string
  groupName: string
}

export const GroupMembersTab = ({ groupId, groupName }: GroupMembersTabProps) => {
  const { data: members = [], isLoading } = useMembers({ groupId })

  if (!isLoading && members.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-card">
        <Users className="h-12 w-12 text-gray-300" />
        <div>
          <p className="text-lg font-semibold text-gray-900">No members yet.</p>
          <p className="mt-1 text-sm text-gray-500">
            Add members by importing an eligibility file or adding a new hire.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/imports">
            <Button variant="secondary">
              <Upload className="h-4 w-4" />
              Import File
            </Button>
          </Link>
          <Link to={`/members/new?groupId=${groupId}`}>
            <Button>
              <Plus className="h-4 w-4" />
              Add New Member
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{members.length} Members</h3>
          <p className="text-xs text-gray-500">All members enrolled in {groupName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4" />
            Export Members
          </Button>
          <Link to={`/members/new?groupId=${groupId}`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add New Member
            </Button>
          </Link>
        </div>
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
