import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Pencil, Users, Clock, MapPin } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Badge, type BadgeVariant, GroupTags } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import { useGroup, useGroups } from '../../hooks/useQueries'
import { formatDate } from '../../utils/formatters'
import type { GroupStatus } from '../../utils/constants'
import { GroupInfoCard } from './components/GroupInfoCard'
import { GroupProductsTab } from './components/GroupProductsTab'
import { GroupMembersTab } from './components/GroupMembersTab'
import { GroupNotesTab } from './components/GroupNotesTab'
import { GroupHistoryTab } from './components/GroupHistoryTab'
import { EditGroupSlideOver } from './components/EditGroupSlideOver'

const groupStatusVariant: Record<GroupStatus, BadgeVariant> = {
  Active: 'success',
  Inactive: 'gray',
  'Pending Setup': 'warning',
}

function PlanDatePill({ label, date }: { label: string; date?: string }) {
  if (!date) {
    return (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-gray-50 text-gray-400 border-gray-200">
        {label}: Not Set
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 border-purple-200">
      {label}: {formatDate(date)}
    </span>
  )
}

export const GroupDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: group, isLoading } = useGroup(id!)
  const { data: allGroups = [] } = useGroups()
  const [activeTab, setActiveTab] = useState('products')
  const [editOpen, setEditOpen] = useState(false)

  const parentGroup = useMemo(() => {
    if (!group?.parentGroupId) return null
    return allGroups.find((g) => g.id === group.parentGroupId) ?? null
  }, [group, allGroups])

  const childGroups = useMemo(() => {
    if (!group?.isParentGroup || !group.childGroupIds.length) return []
    return allGroups.filter((g) => group.childGroupIds.includes(g.id))
  }, [group, allGroups])

  const tabs = useMemo(() => {
    const base = [
      { id: 'products', label: 'Products' },
      { id: 'members', label: 'Members' },
      { id: 'notes', label: 'Notes' },
      { id: 'history', label: 'History' },
    ]
    if (group?.isParentGroup && group.childGroupIds.length > 0) {
      base.splice(1, 0, { id: 'locations', label: 'Locations' })
    }
    return base
  }, [group])

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
            <Link to={`/members?groupId=${id}`}>
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

      {parentGroup && (
        <div className="mb-2 text-sm text-gray-500">
          Parent Group:{' '}
          <Link to={`/groups/${parentGroup.id}`} className="font-medium text-primary-600 hover:underline">
            {parentGroup.legalName}
          </Link>
        </div>
      )}

      <div className="mb-2 flex items-center gap-3">
        <Badge variant={groupStatusVariant[group.status]} dot>
          {group.status}
        </Badge>
        <GroupTags
          isVBA={group.isVBA}
          hasHSA={group.hasHSA}
          hasFirstStopHealth={group.hasFirstStopHealth}
          isOpenEnrollment={group.isOpenEnrollment}
        />
        <span className="text-sm text-gray-500">
          Agent: {group.agentName} ({group.agentNumber})
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <PlanDatePill label="Anticipated" date={group.anticipatedDate} />
        <PlanDatePill label="Start" date={group.planStartDate} />
        <PlanDatePill label="End" date={group.planEndDate} />
      </div>

      <div className="mt-6">
        <GroupInfoCard group={group} />
      </div>

      <div className="mt-8">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'products' && <GroupProductsTab products={group.products} groupId={group.id} />}
          {activeTab === 'locations' && (
            <div className="space-y-3">
              {childGroups.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No child locations</p>
              ) : (
                childGroups.map((child) => (
                  <Card key={child.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <Link
                            to={`/groups/${child.id}`}
                            className="font-medium text-primary-600 hover:underline"
                          >
                            {child.locationName || child.legalName}
                          </Link>
                          {child.address && (
                            <p className="text-xs text-gray-500">
                              {[child.address.city, child.address.state].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={groupStatusVariant[child.status]} dot>
                          {child.status}
                        </Badge>
                        <span className="text-xs text-gray-400">{child.memberCount} members</span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
          {activeTab === 'members' && <GroupMembersTab groupId={group.id} groupName={group.legalName} />}
          {activeTab === 'notes' && <GroupNotesTab groupId={group.id} groupName={group.legalName} notes={group.notes} />}
          {activeTab === 'history' && <GroupHistoryTab groupId={group.id} />}
        </div>
      </div>

      <EditGroupSlideOver open={editOpen} onClose={() => setEditOpen(false)} group={group} />
    </div>
  )
}
