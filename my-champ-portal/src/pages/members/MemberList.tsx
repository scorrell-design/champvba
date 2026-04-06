import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Upload, Eye, Pencil, XCircle, Users } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { SearchBar } from '../../components/ui/SearchBar'
import { StatusBadge, TypeBadge } from '../../components/ui/Badge'
import { useMembers } from '../../hooks/useQueries'
import { cn } from '../../utils/cn'
import type { Member } from '../../types/member'
import type { MemberType } from '../../utils/constants'

type TypeFilter = 'All' | MemberType

export const MemberList = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filters = useMemo(
    () => ({
      search: search || undefined,
      type: typeFilter === 'All' ? undefined : typeFilter,
    }),
    [search, typeFilter],
  )

  const { data: members = [], isLoading } = useMembers(filters)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === members.length) setSelected(new Set())
    else setSelected(new Set(members.map((m) => m.id)))
  }

  const columns: ColumnDef<Member, unknown>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={members.length > 0 && selected.size === members.length}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selected.has(row.original.id)}
            onChange={(e) => {
              e.stopPropagation()
              toggleSelect(row.original.id)
            }}
            className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
          />
        ),
        enableSorting: false,
      },
      {
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            to={`/members/${row.original.id}`}
            className="font-medium text-primary-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.firstName} {row.original.lastName}
          </Link>
        ),
      },
      {
        accessorKey: 'memberId',
        header: 'Member ID',
        cell: ({ row }) => <span className="text-gray-500">{row.original.memberId}</span>,
      },
      {
        accessorKey: 'groupName',
        header: 'Group',
        cell: ({ row }) => (
          <Link
            to={`/groups/${row.original.groupId}`}
            className="text-primary-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.groupName}
          </Link>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => <TypeBadge type={row.original.type} />,
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/members/${row.original.id}`)}
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/members/${row.original.id}?edit=true`)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger-500 hover:text-danger-600"
              onClick={() => navigate(`/members/${row.original.id}?terminate=true`)}
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [members.length, selected, navigate],
  )

  const PILLS: { label: string; value: TypeFilter }[] = [
    { label: 'All', value: 'All' },
    { label: 'VBA', value: 'VBA' },
    { label: 'Non-VBA', value: 'Non-VBA' },
  ]

  return (
    <div>
      <PageHeader
        title="Members"
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/imports')}>
              <Upload className="h-4 w-4" />
              Import File
            </Button>
            <Button onClick={() => navigate('/members/new')}>
              <Plus className="h-4 w-4" />
              Add New Hire
            </Button>
          </>
        }
      />

      {/* Filter row */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-0.5">
          {PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setTypeFilter(pill.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                typeFilter === pill.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, ID, or email…"
          className="w-80"
        />
      </div>

      <DataTable
        columns={columns}
        data={members}
        isLoading={isLoading}
        emptyMessage="No members found"
        emptyIcon={Users}
      />

      {/* Sticky bottom bar for multi-select */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-6 py-3 shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selected.size} member{selected.size > 1 ? 's' : ''} selected
            </span>
            <Button onClick={() => navigate('/members/batch')}>Batch Update</Button>
          </div>
        </div>
      )}
    </div>
  )
}
