import { useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, ChevronDown, Download, X } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { SearchBar } from '../../components/ui/SearchBar'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, type BadgeVariant, GroupTags, type TagType } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { DatePicker } from '../../components/forms/DatePicker'
import { useGroups } from '../../hooks/useQueries'
import { cn } from '../../utils/cn'
import { formatFEIN, formatDate } from '../../utils/formatters'
import type { Group } from '../../types/group'
import type { GroupStatus } from '../../utils/constants'
import { US_STATES } from '../../utils/constants'

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
      <div className="flex items-center gap-2">
        <Link
          to={`/groups/${row.original.id}`}
          className="font-medium text-primary-600 hover:underline"
        >
          {row.original.locationName
            ? `↳ ${row.original.locationName}`
            : row.original.legalName}
        </Link>
        {row.original.isParentGroup && row.original.childGroupIds.length > 0 && (
          <span className="inline-flex items-center gap-0.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
            ▸ {row.original.childGroupIds.length} locations
          </span>
        )}
      </div>
    ),
  },
  { accessorKey: 'dba', header: 'DBA' },
  {
    accessorKey: 'fein',
    header: 'FEIN',
    cell: ({ getValue }) => formatFEIN(getValue<string>()),
  },
  {
    id: 'groupId',
    header: 'Group ID #',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.cbsGroupId}</span>,
  },
  { accessorKey: 'groupType', header: 'Group Type' },
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
    id: 'tags',
    header: 'Tags',
    cell: ({ row }) => (
      <GroupTags
        isVBA={row.original.isVBA}
        hasHSA={row.original.hasHSA}
        hasFirstStopHealth={row.original.hasFirstStopHealth}
        isOpenEnrollment={row.original.isOpenEnrollment}
      />
    ),
  },
  {
    accessorKey: 'anticipatedDate',
    header: 'Anticipated Date',
    cell: ({ getValue }) => {
      const val = getValue<string>()
      return val ? formatDate(val) : '—'
    },
  },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Pending Setup', label: 'Pending Setup' },
]

const STATE_OPTIONS = [
  { value: '', label: 'All States' },
  ...US_STATES.map((s) => ({ value: s, label: s })),
]

const TAG_OPTIONS: { value: TagType; label: string }[] = [
  { value: 'VBA', label: 'VBA' },
  { value: 'HSA', label: 'HSA' },
  { value: 'First Stop', label: 'First Stop' },
  { value: 'Open Enrollment', label: 'Open Enrollment' },
]

interface AdvancedFilters {
  groupName: string
  fein: string
  groupId: string
  status: string
  agentName: string
  anticipatedFrom: string
  anticipatedTo: string
  state: string
  tags: TagType[]
}

const emptyFilters: AdvancedFilters = {
  groupName: '',
  fein: '',
  groupId: '',
  status: '',
  agentName: '',
  anticipatedFrom: '',
  anticipatedTo: '',
  state: '',
  tags: [],
}

type FilterChipKey = Exclude<keyof AdvancedFilters, 'tags'>

function buildFilterChips(filters: AdvancedFilters): { key: FilterChipKey | 'tags'; label: string; value: string }[] {
  const chips: { key: FilterChipKey | 'tags'; label: string; value: string }[] = []
  if (filters.groupName) chips.push({ key: 'groupName', label: 'Group Name', value: filters.groupName })
  if (filters.fein) chips.push({ key: 'fein', label: 'FEIN', value: filters.fein })
  if (filters.groupId) chips.push({ key: 'groupId', label: 'Group ID', value: filters.groupId })
  if (filters.status) chips.push({ key: 'status', label: 'Status', value: filters.status })
  if (filters.agentName) chips.push({ key: 'agentName', label: 'Agent', value: filters.agentName })
  if (filters.anticipatedFrom) chips.push({ key: 'anticipatedFrom', label: 'Anticipated From', value: filters.anticipatedFrom })
  if (filters.anticipatedTo) chips.push({ key: 'anticipatedTo', label: 'Anticipated To', value: filters.anticipatedTo })
  if (filters.state) chips.push({ key: 'state', label: 'State', value: filters.state })
  if (filters.tags.length > 0) chips.push({ key: 'tags', label: 'Tags', value: filters.tags.join(', ') })
  return chips
}

function groupHasTag(g: Group, tag: TagType): boolean {
  switch (tag) {
    case 'VBA': return g.isVBA
    case 'HSA': return g.hasHSA
    case 'First Stop': return g.hasFirstStopHealth
    case 'Open Enrollment': return g.isOpenEnrollment
    default: return false
  }
}

function exportGroupsCsv(groups: Group[]) {
  const headers = ['Client Name', 'DBA', 'FEIN', 'Group ID #', 'Group Type', 'Status', 'Agent', 'Tags', 'Anticipated Date']
  const rows = groups.map((g) => {
    const tags = [
      g.isVBA && 'VBA',
      g.hasHSA && 'HSA',
      g.hasFirstStopHealth && 'First Stop',
      g.isOpenEnrollment && 'Open Enrollment',
    ].filter(Boolean).join(', ')
    return [
      g.legalName,
      g.dba,
      g.fein,
      g.cbsGroupId,
      g.groupType,
      g.status,
      g.agentName,
      tags,
      g.anticipatedDate ? formatDate(g.anticipatedDate) : '',
    ]
  })

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `groups-export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export const GroupList = () => {
  const [search, setSearch] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters>(emptyFilters)
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())
  const { data: groups = [], isLoading } = useGroups()

  const updateFilter = useCallback(<K extends keyof AdvancedFilters>(key: K, value: AdvancedFilters[K]) => {
    setAdvancedFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const toggleTag = useCallback((tag: TagType) => {
    setAdvancedFilters((prev) => {
      const next = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag]
      return { ...prev, tags: next }
    })
  }, [])

  const handleSearch = () => {
    setAppliedFilters(advancedFilters)
  }

  const handleClear = () => {
    setAdvancedFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  const removeChip = (key: FilterChipKey | 'tags') => {
    if (key === 'tags') {
      setAdvancedFilters((prev) => ({ ...prev, tags: [] }))
      setAppliedFilters((prev) => ({ ...prev, tags: [] }))
    } else {
      setAdvancedFilters((prev) => ({ ...prev, [key]: '' }))
      setAppliedFilters((prev) => ({ ...prev, [key]: '' }))
    }
  }

  const toggleParent = useCallback((groupId: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }, [])

  const chips = useMemo(() => buildFilterChips(appliedFilters), [appliedFilters])

  const filtered = useMemo(() => {
    let result = groups

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (g) =>
          g.legalName.toLowerCase().includes(q) ||
          g.dba.toLowerCase().includes(q) ||
          g.fein.includes(q),
      )
    }

    const f = appliedFilters
    if (f.groupName) {
      const q = f.groupName.toLowerCase()
      result = result.filter((g) => g.legalName.toLowerCase().includes(q) || g.dba.toLowerCase().includes(q))
    }
    if (f.fein) {
      result = result.filter((g) => g.fein.includes(f.fein))
    }
    if (f.groupId) {
      const gq = f.groupId.toLowerCase()
      result = result.filter((g) => g.cbsGroupId.toLowerCase().includes(gq) || g.id.toLowerCase().includes(gq))
    }
    if (f.status) {
      result = result.filter((g) => g.status === f.status)
    }
    if (f.agentName) {
      const q = f.agentName.toLowerCase()
      result = result.filter((g) => g.agentName.toLowerCase().includes(q))
    }
    if (f.anticipatedFrom) {
      result = result.filter((g) => g.anticipatedDate >= f.anticipatedFrom)
    }
    if (f.anticipatedTo) {
      result = result.filter((g) => g.anticipatedDate <= f.anticipatedTo)
    }
    if (f.state) {
      result = result.filter((g) => g.address?.state === f.state)
    }
    if (f.tags.length > 0) {
      result = result.filter((g) => f.tags.every((tag) => groupHasTag(g, tag)))
    }

    return result
  }, [groups, search, appliedFilters])

  const displayRows = useMemo(() => {
    const parentGroups = filtered.filter((g) => !g.parentGroupId)
    const rows: Group[] = []

    for (const parent of parentGroups) {
      rows.push(parent)
      if (parent.isParentGroup && expandedParents.has(parent.id)) {
        const children = groups.filter((g) => g.parentGroupId === parent.id)
        rows.push(...children)
      }
    }

    return rows
  }, [filtered, groups, expandedParents])

  return (
    <div>
      <PageHeader
        title="Groups / Clients"
        actions={
          <>
            <Button variant="secondary" onClick={() => exportGroupsCsv(filtered)}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Link to="/groups/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add Group
              </Button>
            </Link>
          </>
        }
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name or FEIN…"
        className="mb-2 max-w-md"
      />

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
            <Input
              label="Group Name"
              value={advancedFilters.groupName}
              onChange={(e) => updateFilter('groupName', e.target.value)}
              placeholder="Legal name or DBA"
            />
            <Input
              label="FEIN"
              value={advancedFilters.fein}
              onChange={(e) => updateFilter('fein', e.target.value)}
              placeholder="XX-XXXXXXX"
            />
            <Input
              label="Group ID"
              value={advancedFilters.groupId}
              onChange={(e) => updateFilter('groupId', e.target.value)}
              placeholder="Search by ID"
            />
            <Select
              label="Status"
              value={advancedFilters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              options={STATUS_OPTIONS}
            />
            <Input
              label="Agent Name"
              value={advancedFilters.agentName}
              onChange={(e) => updateFilter('agentName', e.target.value)}
            />
            <Select
              label="Location (State)"
              value={advancedFilters.state}
              onChange={(e) => updateFilter('state', e.target.value)}
              options={STATE_OPTIONS}
            />
            <DatePicker
              label="Anticipated Date From"
              value={advancedFilters.anticipatedFrom}
              onChange={(v) => updateFilter('anticipatedFrom', v)}
            />
            <DatePicker
              label="Anticipated Date To"
              value={advancedFilters.anticipatedTo}
              onChange={(v) => updateFilter('anticipatedTo', v)}
            />
          </div>
          <div className="mt-4">
            <span className="mb-2 block text-sm font-medium text-gray-700">Tags</span>
            <div className="flex flex-wrap gap-3">
              {TAG_OPTIONS.map((opt) => (
                <label key={opt.value} className="inline-flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={advancedFilters.tags.includes(opt.value)}
                    onChange={() => toggleTag(opt.value)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  {opt.label}
                </label>
              ))}
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

      <p className="mb-2 text-sm text-gray-500">{filtered.length} groups found</p>

      <DataTable
        columns={columns}
        data={displayRows}
        isLoading={isLoading}
        emptyMessage="No groups found"
        onRowClick={(row) => {
          if (row.isParentGroup && row.childGroupIds.length > 0) {
            toggleParent(row.id)
          }
        }}
        rowClassName={(row) =>
          row.parentGroupId ? 'bg-gray-50/50 pl-4' : row.isParentGroup && row.childGroupIds.length > 0 ? 'cursor-pointer' : ''
        }
      />
    </div>
  )
}
