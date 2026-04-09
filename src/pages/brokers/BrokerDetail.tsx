import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import {
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ChevronDown,
  Users,
  GitBranch,
} from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { DataTable } from '../../components/ui/DataTable'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useBroker, useBrokers, useGroups } from '../../hooks/useQueries'
import type { Broker } from '../../types/broker'
import type { Group } from '../../types/group'

const statusVariant: Record<string, BadgeVariant> = {
  Active: 'success',
  Inactive: 'gray',
}

const groupStatusVariant: Record<string, BadgeVariant> = {
  Active: 'success',
  Inactive: 'gray',
  'Pending Setup': 'warning',
}

const agentTypeLabel: Record<string, string> = {
  main: 'Main Office',
  parent: 'Parent Agent',
  individual: 'Individual Agent',
}

interface TreeNode {
  broker: Broker
  children: TreeNode[]
  groupCount: number
}

function buildTree(root: Broker, allBrokers: Broker[]): TreeNode {
  const brokerMap = new Map<string, Broker>()
  allBrokers.forEach((b) => brokerMap.set(b.id, b))

  function recurse(broker: Broker): TreeNode {
    const children = broker.childBrokerIds
      .map((id) => brokerMap.get(id))
      .filter((b): b is Broker => !!b)
      .map(recurse)
    return { broker, children, groupCount: broker.associatedGroupIds.length }
  }

  return recurse(root)
}

function findRoot(broker: Broker, allBrokers: Broker[]): Broker {
  const map = new Map<string, Broker>()
  allBrokers.forEach((b) => map.set(b.id, b))
  let current = broker
  while (current.parentBrokerId) {
    const parent = map.get(current.parentBrokerId)
    if (!parent) break
    current = parent
  }
  return current
}

function TreeNodeView({ node, depth = 0, defaultExpanded = false }: { node: TreeNode; depth?: number; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-200"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <Link
          to={`/brokers/${node.broker.id}`}
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          {node.broker.agentNumber} - {node.broker.name}
        </Link>
        <span className="text-xs text-gray-500">({node.broker.company})</span>
        {node.broker.agentType === 'main' && (
          <Badge variant="info" className="!text-[10px]">MAIN</Badge>
        )}
        {node.groupCount > 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <Users className="h-3 w-3" />
            {node.groupCount} group{node.groupCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNodeView key={child.broker.id} node={child} depth={depth + 1} defaultExpanded={depth < 1} />
          ))}
        </div>
      )}
    </div>
  )
}

const groupColumns: ColumnDef<Group, unknown>[] = [
  {
    accessorKey: 'legalName',
    header: 'Group Name',
    cell: ({ row }) => (
      <Link to={`/groups/${row.original.id}`} className="font-medium text-primary-600 hover:underline">
        {row.original.legalName}
      </Link>
    ),
  },
  { accessorKey: 'id', header: 'Group ID' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<string>()
      return (
        <Badge variant={groupStatusVariant[status] ?? 'gray'} dot>
          {status}
        </Badge>
      )
    },
  },
  { accessorKey: 'memberCount', header: 'Member Count' },
]

export function BrokerDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: broker, isLoading } = useBroker(id ?? '')
  const { data: allBrokers = [] } = useBrokers()
  const { data: allGroups = [] } = useGroups()
  const [treeOpen, setTreeOpen] = useState(false)

  const brokerMap = useMemo(() => {
    const map = new Map<string, Broker>()
    allBrokers.forEach((b) => map.set(b.id, b))
    return map
  }, [allBrokers])

  const parentBroker = broker?.parentBrokerId ? brokerMap.get(broker.parentBrokerId) : null

  const childBrokers = useMemo(() => {
    if (!broker) return []
    return broker.childBrokerIds
      .map((cid) => brokerMap.get(cid))
      .filter((b): b is Broker => !!b)
  }, [broker, brokerMap])

  const associatedGroups = useMemo(() => {
    if (!broker) return []
    return allGroups.filter((g) => broker.associatedGroupIds.includes(g.id))
  }, [broker, allGroups])

  const fullTree = useMemo(() => {
    if (!broker || allBrokers.length === 0) return null
    const root = findRoot(broker, allBrokers)
    return buildTree(root, allBrokers)
  }, [broker, allBrokers])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading…" backLink="/brokers" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        </div>
      </div>
    )
  }

  if (!broker) {
    return (
      <div className="space-y-6">
        <PageHeader title="Broker Not Found" backLink="/brokers" />
        <Card>
          <p className="text-sm text-gray-500">The requested broker could not be found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={broker.name}
        backLink="/brokers"
        actions={
          <Button variant="secondary" onClick={() => setTreeOpen(true)}>
            <GitBranch className="h-4 w-4" />
            View Broker Tree
          </Button>
        }
      />

      {/* Header info */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">{broker.name}</h2>
              <Badge variant={statusVariant[broker.status]} dot>{broker.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Agent #{broker.agentNumber} · {broker.company}
            </p>
          </div>
          <Badge variant="info">{agentTypeLabel[broker.agentType] ?? broker.agentType}</Badge>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact */}
        <Card>
          <h3 className="text-section-title text-gray-900">Contact Information</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{broker.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${broker.email}`} className="text-primary-600 hover:underline">
                {broker.email}
              </a>
            </div>
            {broker.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                <span className="text-gray-700">
                  {broker.address.street}, {broker.address.city}, {broker.address.state} {broker.address.zip}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Identity */}
        <Card>
          <h3 className="text-section-title text-gray-900">Identity & Classification</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">TIN/NPI Code</p>
              <p className="text-sm font-medium text-gray-800">{broker.tinNpiCode || '—'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Agent Type</p>
              <p className="text-sm font-medium text-gray-800">{agentTypeLabel[broker.agentType]}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Hierarchy */}
      <Card>
        <h3 className="text-section-title text-gray-900">Hierarchy</h3>
        <div className="mt-4 space-y-4">
          {parentBroker && (
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Parent</p>
              <Link
                to={`/brokers/${parentBroker.id}`}
                className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
              >
                {parentBroker.name}
                <span className="text-gray-400">({parentBroker.agentNumber})</span>
              </Link>
            </div>
          )}

          {childBrokers.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Children</p>
              <div className="mt-2 space-y-2">
                {childBrokers.map((child) => (
                  <div key={child.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2">
                    <Link
                      to={`/brokers/${child.id}`}
                      className="text-sm font-medium text-primary-600 hover:underline"
                    >
                      {child.name}
                      <span className="ml-2 text-gray-400">({child.agentNumber})</span>
                    </Link>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Users className="h-3 w-3" />
                      {child.associatedGroupIds.length} group{child.associatedGroupIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!parentBroker && childBrokers.length === 0 && (
            <p className="text-sm text-gray-400">No hierarchy relationships</p>
          )}
        </div>
      </Card>

      {/* Associated Groups */}
      <Card padding={false}>
        <div className="px-6 pt-6 pb-3">
          <h3 className="text-section-title text-gray-900">Associated Groups</h3>
          <p className="mt-0.5 text-xs text-gray-500">{associatedGroups.length} group{associatedGroups.length !== 1 ? 's' : ''}</p>
        </div>
        {associatedGroups.length > 0 ? (
          <DataTable
            columns={groupColumns}
            data={associatedGroups}
          />
        ) : (
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-400">No groups currently associated with this broker.</p>
          </div>
        )}
      </Card>

      {/* Commission Summary */}
      <Card>
        <h3 className="text-section-title text-gray-900">Commission Summary</h3>
        <div className="mt-4">
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500">Commission Rate</p>
            <p className="text-lg font-semibold text-gray-800">
              {broker.commissionRate != null ? `${broker.commissionRate}%` : '—'}
            </p>
          </div>
        </div>
      </Card>

      {/* History */}
      <Card>
        <h3 className="text-section-title text-gray-900">History</h3>
        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-6 text-center">
          <p className="text-sm text-gray-400">Activity log coming soon</p>
        </div>
      </Card>

      {/* Tree Modal */}
      <Modal open={treeOpen} onClose={() => setTreeOpen(false)} title="Broker Hierarchy Tree" size="lg">
        {fullTree ? (
          <div className="max-h-[60vh] overflow-y-auto">
            <TreeNodeView node={fullTree} defaultExpanded />
          </div>
        ) : (
          <p className="text-sm text-gray-400">Loading tree…</p>
        )}
      </Modal>
    </div>
  )
}
