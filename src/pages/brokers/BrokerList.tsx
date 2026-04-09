import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '../../components/layout/PageHeader'
import { SearchBar } from '../../components/ui/SearchBar'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Select'
import { useBrokers } from '../../hooks/useQueries'
import type { Broker } from '../../types/broker'

const statusVariant: Record<string, BadgeVariant> = {
  Active: 'success',
  Inactive: 'gray',
}

const columns: ColumnDef<Broker, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <Link
        to={`/brokers/${row.original.id}`}
        className="font-medium text-primary-600 hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: 'agentNumber', header: 'Agent #' },
  { accessorKey: 'company', header: 'Company' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'tinNpiCode',
    header: 'TIN/NPI',
    cell: ({ getValue }) => getValue<string>() || '—',
  },
  {
    id: 'parentBroker',
    header: 'Parent Broker',
    accessorFn: () => null,
  },
  {
    id: 'groupCount',
    header: 'Active Groups',
    cell: ({ row }) => row.original.associatedGroupIds.length,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<string>()
      return (
        <Badge variant={statusVariant[status] ?? 'gray'} dot>
          {status}
        </Badge>
      )
    },
  },
]

export function BrokerList() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [parentFilter, setParentFilter] = useState('')
  const { data: brokers = [], isLoading } = useBrokers()

  const brokerMap = useMemo(() => {
    const map = new Map<string, Broker>()
    brokers.forEach((b) => map.set(b.id, b))
    return map
  }, [brokers])

  const parentOptions = useMemo(() => {
    const parents = brokers.filter((b) => b.childBrokerIds.length > 0)
    return [
      { value: '', label: 'All Parent Brokers' },
      ...parents.map((b) => ({ value: b.id, label: `${b.name} (${b.agentNumber})` })),
    ]
  }, [brokers])

  const columnsWithParent = useMemo<ColumnDef<Broker, unknown>[]>(() => {
    return columns.map((col) => {
      if ('id' in col && col.id === 'parentBroker') {
        return {
          ...col,
          cell: ({ row }: { row: { original: Broker } }) => {
            const parentId = row.original.parentBrokerId
            if (!parentId) return '—'
            const parent = brokerMap.get(parentId)
            return parent ? (
              <Link to={`/brokers/${parentId}`} className="text-primary-600 hover:underline">
                {parent.name}
              </Link>
            ) : (
              '—'
            )
          },
        }
      }
      return col
    })
  }, [brokerMap])

  const filtered = useMemo(() => {
    let result = brokers

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.agentNumber.toLowerCase().includes(q) ||
          b.company.toLowerCase().includes(q) ||
          (b.tinNpiCode?.toLowerCase().includes(q) ?? false),
      )
    }

    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter)
    }

    if (parentFilter) {
      result = result.filter(
        (b) => b.parentBrokerId === parentFilter || b.id === parentFilter,
      )
    }

    return result
  }, [brokers, search, statusFilter, parentFilter])

  return (
    <div>
      <PageHeader title="Brokers / Agents" />

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, agent #, company, or TIN/NPI…"
          className="min-w-[280px] flex-1"
        />
        <Select
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="!w-40"
        />
        <Select
          options={parentOptions}
          value={parentFilter}
          onChange={(e) => setParentFilter(e.target.value)}
          className="!w-56"
        />
      </div>

      <p className="mb-2 text-sm text-gray-500">{filtered.length} brokers found</p>

      <DataTable
        columns={columnsWithParent}
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No brokers found"
      />
    </div>
  )
}
