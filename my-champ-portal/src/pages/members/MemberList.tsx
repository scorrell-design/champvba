import { useState, useMemo, useCallback } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Upload, Eye, Pencil, XCircle, Users, ChevronDown, Download, X, ArrowUp, ArrowDown } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { SearchBar } from '../../components/ui/SearchBar'
import { StatusBadge, GroupTags } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { DatePicker } from '../../components/forms/DatePicker'
import { useMembers, useGroups } from '../../hooks/useQueries'
import { cn } from '../../utils/cn'
import { US_STATES } from '../../utils/constants'
import type { Member } from '../../types/member'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Terminated', label: 'Terminated' },
  { value: 'On Hold', label: 'On Hold' },
]

const STATE_OPTIONS = [
  { value: '', label: 'All' },
  ...US_STATES.map((s) => ({ value: s, label: s })),
]

const SORT_OPTIONS = [
  { value: 'createdDate', label: 'Date Created' },
  { value: 'name', label: 'Name' },
  { value: 'memberId', label: 'ID' },
]

interface AdvancedFilters {
  memberIds: string
  firstName: string
  lastName: string
  phone: string
  email: string
  state: string
  zip: string
  employeeId: string
  status: string
  activeFrom: string
  activeTo: string
  sortBy: string
  sortDir: 'asc' | 'desc'
}

const emptyFilters: AdvancedFilters = {
  memberIds: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  state: '',
  zip: '',
  employeeId: '',
  status: '',
  activeFrom: '',
  activeTo: '',
  sortBy: 'createdDate',
  sortDir: 'desc',
}

function buildFilterChips(filters: AdvancedFilters): { key: keyof AdvancedFilters; label: string; value: string }[] {
  const chips: { key: keyof AdvancedFilters; label: string; value: string }[] = []
  if (filters.memberIds) chips.push({ key: 'memberIds', label: 'Member IDs', value: filters.memberIds.split(/[,\n]/).filter(Boolean).length + ' IDs' })
  if (filters.firstName) chips.push({ key: 'firstName', label: 'First Name', value: filters.firstName })
  if (filters.lastName) chips.push({ key: 'lastName', label: 'Last Name', value: filters.lastName })
  if (filters.phone) chips.push({ key: 'phone', label: 'Phone', value: filters.phone })
  if (filters.email) chips.push({ key: 'email', label: 'Email', value: filters.email })
  if (filters.state) chips.push({ key: 'state', label: 'State', value: filters.state })
  if (filters.zip) chips.push({ key: 'zip', label: 'Zip', value: filters.zip })
  if (filters.employeeId) chips.push({ key: 'employeeId', label: 'Employee ID', value: filters.employeeId })
  if (filters.status) chips.push({ key: 'status', label: 'Status', value: filters.status })
  if (filters.activeFrom) chips.push({ key: 'activeFrom', label: 'Active From', value: filters.activeFrom })
  if (filters.activeTo) chips.push({ key: 'activeTo', label: 'Active To', value: filters.activeTo })
  return chips
}

function exportMembersCsv(members: Member[]) {
  const headers = ['Member ID', 'First Name', 'Last Name', 'Group', 'Status', 'Email', 'Phone', 'State', 'Employee ID']
  const rows = members.map((m) => [
    m.memberId,
    m.firstName,
    m.lastName,
    m.groupName,
    m.status,
    m.email,
    m.phone,
    m.address?.state ?? '',
    m.employeeId,
  ])

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `members-export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export const MemberList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const groupIdFilter = searchParams.get('groupId') ?? undefined
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters>(emptyFilters)

  const filters = useMemo(
    () => ({
      search: search || undefined,
      groupId: groupIdFilter,
    }),
    [search, groupIdFilter],
  )

  const { data: members = [], isLoading } = useMembers(filters)
  const { data: groups = [] } = useGroups()

  const groupMap = useMemo(() => {
    const map: Record<string, { isVBA: boolean; hasHSA: boolean; hasFirstStopHealth: boolean }> = {}
    for (const g of groups) {
      map[g.id] = { isVBA: g.isVBA, hasHSA: g.hasHSA, hasFirstStopHealth: g.hasFirstStopHealth }
    }
    return map
  }, [groups])

  const updateFilter = useCallback(<K extends keyof AdvancedFilters>(key: K, value: AdvancedFilters[K]) => {
    setAdvancedFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSearch = () => {
    setAppliedFilters(advancedFilters)
  }

  const handleClear = () => {
    setAdvancedFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  const removeChip = (key: keyof AdvancedFilters) => {
    const resetValue = key === 'sortBy' ? 'createdDate' : key === 'sortDir' ? 'desc' : ''
    setAdvancedFilters((prev) => ({ ...prev, [key]: resetValue }))
    setAppliedFilters((prev) => ({ ...prev, [key]: resetValue }))
  }

  const chips = useMemo(() => buildFilterChips(appliedFilters), [appliedFilters])

  const filteredMembers = useMemo(() => {
    let result = members
    const f = appliedFilters

    if (f.memberIds) {
      const ids = f.memberIds.split(/[,\n]/).map((s) => s.trim().toLowerCase()).filter(Boolean)
      if (ids.length) result = result.filter((m) => ids.includes(m.memberId.toLowerCase()))
    }
    if (f.firstName) {
      const q = f.firstName.toLowerCase()
      result = result.filter((m) => m.firstName.toLowerCase().includes(q))
    }
    if (f.lastName) {
      const q = f.lastName.toLowerCase()
      result = result.filter((m) => m.lastName.toLowerCase().includes(q))
    }
    if (f.phone) {
      result = result.filter((m) => m.phone.includes(f.phone))
    }
    if (f.email) {
      const q = f.email.toLowerCase()
      result = result.filter((m) => m.email.toLowerCase().includes(q))
    }
    if (f.state) {
      result = result.filter((m) => m.address?.state === f.state)
    }
    if (f.zip) {
      result = result.filter((m) => m.address?.zip?.startsWith(f.zip))
    }
    if (f.employeeId) {
      result = result.filter((m) => m.employeeId.toLowerCase().includes(f.employeeId.toLowerCase()))
    }
    if (f.status) {
      result = result.filter((m) => m.status === f.status)
    }
    if (f.activeFrom) {
      result = result.filter((m) => m.activeDate && m.activeDate >= f.activeFrom)
    }
    if (f.activeTo) {
      result = result.filter((m) => m.activeDate && m.activeDate <= f.activeTo)
    }

    if (f.sortBy) {
      const dir = f.sortDir === 'asc' ? 1 : -1
      result = [...result].sort((a, b) => {
        let aVal: string
        let bVal: string
        if (f.sortBy === 'name') {
          aVal = `${a.firstName} ${a.lastName}`.toLowerCase()
          bVal = `${b.firstName} ${b.lastName}`.toLowerCase()
        } else if (f.sortBy === 'memberId') {
          aVal = a.memberId
          bVal = b.memberId
        } else {
          aVal = a.createdDate
          bVal = b.createdDate
        }
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0
      })
    }

    return result
  }, [members, appliedFilters])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === filteredMembers.length) setSelected(new Set())
    else setSelected(new Set(filteredMembers.map((m) => m.id)))
  }

  const columns: ColumnDef<Member, unknown>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={filteredMembers.length > 0 && selected.size === filteredMembers.length}
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
        id: 'tags',
        header: 'Tags',
        cell: ({ row }) => {
          const g = groupMap[row.original.groupId]
          if (!g) return null
          return <GroupTags isVBA={g.isVBA} hasHSA={g.hasHSA} hasFirstStopHealth={g.hasFirstStopHealth} />
        },
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
    [filteredMembers.length, selected, navigate, groupMap],
  )

  return (
    <div>
      <PageHeader
        title="Members"
        actions={
          <>
            <Button variant="secondary" onClick={() => exportMembersCsv(filteredMembers)}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => navigate('/imports')}>
              <Upload className="h-4 w-4" />
              Import File
            </Button>
            <Button onClick={() => navigate('/members/new')}>
              <Plus className="h-4 w-4" />
              Add a Member
            </Button>
          </>
        }
      />

      {groupIdFilter && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5">
          <Users className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-medium text-primary-700">
            Showing members for: {groups.find((g) => g.id === groupIdFilter)?.legalName ?? groupIdFilter}
          </span>
          <button
            onClick={() => navigate('/members')}
            className="ml-auto text-xs font-medium text-primary-600 hover:text-primary-800 underline"
          >
            Show all members
          </button>
        </div>
      )}

      {/* Filter row */}
      <div className="mb-2 flex flex-wrap items-center gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, ID, or email…"
          className="w-80"
        />
      </div>

      <button
        type="button"
        onClick={() => setAdvancedOpen((o) => !o)}
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        Advanced Search
        <ChevronDown className={cn('h-4 w-4 transition-transform', advancedOpen && 'rotate-180')} />
      </button>

      {advancedOpen && (
        <Card className="mb-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Member IDs</label>
              <textarea
                value={advancedFilters.memberIds}
                onChange={(e) => updateFilter('memberIds', e.target.value)}
                placeholder="Comma or newline separated IDs"
                rows={2}
                className={cn(
                  'block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors',
                  'focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200',
                )}
              />
            </div>
            <Input
              label="First Name"
              value={advancedFilters.firstName}
              onChange={(e) => updateFilter('firstName', e.target.value)}
            />
            <Input
              label="Last Name"
              value={advancedFilters.lastName}
              onChange={(e) => updateFilter('lastName', e.target.value)}
            />
            <Input
              label="Phone"
              value={advancedFilters.phone}
              onChange={(e) => updateFilter('phone', e.target.value)}
            />
            <Input
              label="Email"
              value={advancedFilters.email}
              onChange={(e) => updateFilter('email', e.target.value)}
            />
            <Select
              label="State"
              value={advancedFilters.state}
              onChange={(e) => updateFilter('state', e.target.value)}
              options={STATE_OPTIONS}
            />
            <Input
              label="Zip Code"
              value={advancedFilters.zip}
              onChange={(e) => updateFilter('zip', e.target.value)}
            />
            <Input
              label="Employee ID"
              value={advancedFilters.employeeId}
              onChange={(e) => updateFilter('employeeId', e.target.value)}
            />
            <Select
              label="Status"
              value={advancedFilters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              options={STATUS_OPTIONS}
            />
            <DatePicker
              label="Active From"
              value={advancedFilters.activeFrom}
              onChange={(v) => updateFilter('activeFrom', v)}
            />
            <DatePicker
              label="Active To"
              value={advancedFilters.activeTo}
              onChange={(v) => updateFilter('activeTo', v)}
            />
            <Select
              label="Sort By"
              value={advancedFilters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              options={SORT_OPTIONS}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Sort Direction</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateFilter('sortDir', 'asc')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    advancedFilters.sortDir === 'asc'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  Asc
                </button>
                <button
                  type="button"
                  onClick={() => updateFilter('sortDir', 'desc')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    advancedFilters.sortDir === 'desc'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                  Desc
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={handleSearch}>Search</Button>
            <Button variant="ghost" onClick={handleClear}>Clear Filters</Button>
          </div>
        </Card>
      )}

      {chips.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
            >
              {chip.label}: {chip.value}
              <button
                type="button"
                onClick={() => removeChip(chip.key)}
                className="ml-0.5 inline-flex items-center text-primary-400 hover:text-primary-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="mb-2 text-sm text-gray-500">{filteredMembers.length} members found</p>

      <DataTable
        columns={columns}
        data={filteredMembers}
        isLoading={isLoading}
        emptyMessage={groupIdFilter
          ? `No members found for ${groups.find((g) => g.id === groupIdFilter)?.legalName ?? 'this group'}. Add members by uploading an eligibility file or adding a member.`
          : 'No members found'
        }
        emptyIcon={Users}
      />

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-6 py-3 shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selected.size} member{selected.size > 1 ? 's' : ''} selected
            </span>
            <Button onClick={() => navigate('/members/batch', { state: { memberIds: Array.from(selected), returnPath: location.pathname + location.search } })}>Batch Update</Button>
          </div>
        </div>
      )}
    </div>
  )
}
