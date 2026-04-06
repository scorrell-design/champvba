import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Pencil, Users, Clock } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { useGroup } from '../../hooks/useQueries'
import type { GroupStatus } from '../../utils/constants'
import { GroupInfoCard } from './components/GroupInfoCard'
import { GroupProductsTab } from './components/GroupProductsTab'
import { GroupPaymentProcessorsTab } from './components/GroupPaymentProcessorsTab'
import { GroupMembersTab } from './components/GroupMembersTab'
import { GroupNotesTab } from './components/GroupNotesTab'
import { GroupHistoryTab } from './components/GroupHistoryTab'
import { GroupCommissionsTab } from './components/GroupCommissionsTab'
import { EditGroupSlideOver } from './components/EditGroupSlideOver'

const groupStatusVariant: Record<GroupStatus, BadgeVariant> = {
  Active: 'success',
  Inactive: 'gray',
  'Pending Setup': 'warning',
}

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'processors', label: 'Payment Processors' },
  { id: 'members', label: 'Members' },
  { id: 'notes', label: 'Notes' },
  { id: 'history', label: 'History' },
  { id: 'commissions', label: 'Commissions' },
]

export const GroupDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: group, isLoading } = useGroup(id!)
  const [activeTab, setActiveTab] = useState('products')
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-72 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    )
  }

  if (!group) {
    return <p className="py-16 text-center text-gray-500">Group not found</p>
  }

  return (
    <div>
      <PageHeader
        title={group.legalName}
        backLink="/groups"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit Group
            </Button>
            <Link to={`/groups/${id}/members`}>
              <Button variant="secondary">
                <Users className="h-4 w-4" />
                Members
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => setActiveTab('history')}>
              <Clock className="h-4 w-4" />
              View History
            </Button>
          </div>
        }
      />

      <div className="mb-2 flex items-center gap-3">
        <Badge variant={groupStatusVariant[group.status]} dot>
          {group.status}
        </Badge>
        <span className="text-sm text-gray-500">
          Agent: {group.agentName} ({group.agentNumber})
        </span>
      </div>

      <div className="mt-6">
        <GroupInfoCard group={group} />
      </div>

      <div className="mt-8">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'products' && <GroupProductsTab products={group.products} />}
          {activeTab === 'processors' && (
            <GroupPaymentProcessorsTab processors={group.paymentProcessors} />
          )}
          {activeTab === 'members' && <GroupMembersTab groupId={group.id} />}
          {activeTab === 'notes' && <GroupNotesTab groupId={group.id} notes={group.notes} />}
          {activeTab === 'history' && <GroupHistoryTab groupId={group.id} />}
          {activeTab === 'commissions' && <GroupCommissionsTab products={group.products} />}
        </div>
      </div>

      <EditGroupSlideOver open={editOpen} onClose={() => setEditOpen(false)} group={group} />
    </div>
  )
}
