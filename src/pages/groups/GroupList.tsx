import { useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, ChevronDown, Download, X } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { SearchBar } from '../../components/ui/SearchBar'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
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

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Pending Setup', label: 'Pending Setup' },
]

const FSH_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Enabled' },
  { value: 'false', label: 'Disabled' },
]

interface AdvancedFilters {
  groupName: string
  fein: string
  wltGroupNumber: string
  status: string
  agentName: string
  firstStopHealth: string
  benefitsFrom: string
  benefitsTo: string
}

const emptyFilters: AdvancedFilters = {
  groupName: '',
  fein: '',
  wltGroupNumber: '',
  status: '',
  agentName: '',
  firstStopHealth: '',
  benefitsFrom: '',
  benefitsTo: '',
}

function buildFilterChips(filters: AdvancedFilters): { key: keyof AdvancedFilters; label: string; value: string }[] {
  const chips: { key: keyof AdvancedFilters; label: string; value: string }[] = []
  if (filters.groupName) chips.push({ key: 'groupName', label: 'Group Name', value: filters.groupName })
  if (filters.fein) chips.push({ key: 'fein', label: 'FEIN', value: filters.fein })
  if (filters.wltGroupNumber) chips.push({ key: 'wltGroupNumber', label: 'WLT#', value: filters.wltGroupNumber })
  if (filters.status) chips.push({ key: 'status', label: 'Status', value: filters.status })
  if (filters.agentName) chips.push({ key: 'agentName', label: 'Agent', value: filters.agentName })
  if (filters.firstStopHealth) chips.push({ key: 'firstStopHealth', label: 'First Stop', value: filters.firstStopHealth === 'true' ? 'Enabled' : 'Disabled' })
  if (filters.benefitsFrom) chips.push({ key: 'benefitsFrom', label: 'Benefits From', value: filters.benefitsFrom })
  if (filters.benefitsTo) chips.push({ key: 'benefitsTo', label: 'Benefits To', value: filters.benefitsTo })
  return chips
}

function exportGroupsCsv(groups: Group[]) {
  const headers = ['Client Name', 'DBA', 'FEIN', 'CBS Group ID', 'WLT#', 'Status', 'Agent', 'Benefits Effective Date', 'First Stop Health']
  const rows = groups.map((g) => [
    g.legalName,
    g.dba,
    g.fein,
    g.cbsGroupId,
    g.wltGroupNumber,
    g.status,
    g.agentName,
    g.benefitsEffectiveDate ? formatDate(g.benefitsEffectiveDate) : '',
    g.firstStopHealth ? 'Enabled' : 'Disabled',
  ])

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
  const { data: groups = [], isLoading } = useGroups()

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
    setAdvancedFilters((prev) => ({ ...prev, [key]: '' }))
    setAppliedFilters((prev) => ({ ...prev, [key]: '' }))
  }

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
    if (f.wltGroupNumber) {
      result = result.filter((g) => g.wltGroupNumber.toLowerCase().includes(f.wltGroupNumber.toLowerCase()))
    }
    if (f.status) {
      result = result.filter((g) => g.status === f.status)
    }
    if (f.agentName) {
      const q = f.agentName.toLowerCase()
      result = result.filter((g) => g.agentName.toLowerCase().includes(q))
    }
    if (f.firstStopHealth) {
      const fsh = f.firstStopHealth === 'true'
      result = result.filter((g) => g.firstStopHealth === fsh)
    }
    if (f.benefitsFrom) {
      result = result.filter((g) => g.benefitsEffectiveDate >= f.benefitsFrom)
    }
    if (f.benefitsTo) {
      result = result.filter((g) => g.benefitsEffectiveDate <= f.benefitsTo)
    }

    return result
  }, [groups, search, appliedFilters])

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
              label="WLT Group Number"
              value={advancedFilters.wltGroupNumber}
              onChange={(e) => updateFilter('wltGroupNumber', e.target.value)}
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
              label="First Stop Health"
              value={advancedFilters.firstStopHealth}
              onChange={(e) => updateFilter('firstStopHealth', e.target.value)}
              options={FSH_OPTIONS}
            />
            <DatePicker
              label="Benefits Effective From"
              value={advancedFilters.benefitsFrom}
              onChange={(v) => updateFilter('benefitsFrom', v)}
            />
            <DatePicker
              label="Benefits Effective To"
              value={advancedFilters.benefitsTo}
              onChange={(v) => updateFilter('benefitsTo', v)}
            />
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
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No groups found"
      />
    </div>
  )
}
