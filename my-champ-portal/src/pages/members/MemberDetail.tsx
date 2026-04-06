import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Pencil, XCircle, Info } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { StatusBadge, TypeBadge } from '../../components/ui/Badge'
import { useMember } from '../../hooks/useQueries'
import { MemberInfoCard } from './components/MemberInfoCard'
import { MemberProductsTab } from './components/MemberProductsTab'
import { MemberNotesTab } from './components/MemberNotesTab'
import { MemberHistoryTab } from './components/MemberHistoryTab'
import { EditMemberSlideOver } from './components/EditMemberSlideOver'
import { TerminateMemberModal } from './components/TerminateMemberModal'

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'notes', label: 'Notes' },
  { id: 'dependents', label: 'Dependents' },
  { id: 'history', label: 'History' },
]

export const MemberDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: member, isLoading } = useMember(id!)

  const [activeTab, setActiveTab] = useState('products')
  const [editOpen, setEditOpen] = useState(false)
  const [terminateOpen, setTerminateOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('edit') === 'true' && member) {
      setEditOpen(true)
      setSearchParams({}, { replace: true })
    }
    if (searchParams.get('terminate') === 'true' && member) {
      setTerminateOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, member, setSearchParams])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p>Member not found</p>
      </div>
    )
  }

  const tabsWithCounts = TABS.map((t) => {
    if (t.id === 'products') return { ...t, count: member.products.length }
    if (t.id === 'notes') return { ...t, count: member.notes.length }
    return t
  })

  return (
    <div>
      <PageHeader
        title={`${member.firstName} ${member.lastName}`}
        backLink="/members"
        description={member.memberId}
        actions={
          <div className="flex items-center gap-3">
            <TypeBadge type={member.type} />
            <StatusBadge status={member.status} />
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit Member
            </Button>
            <Button variant="danger" onClick={() => setTerminateOpen(true)}>
              <XCircle className="h-4 w-4" />
              Terminate
            </Button>
          </div>
        }
      />

      <MemberInfoCard member={member} />

      <div className="mt-6">
        <Tabs tabs={tabsWithCounts} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-4">
          {activeTab === 'products' && <MemberProductsTab products={member.products} />}
          {activeTab === 'notes' && <MemberNotesTab notes={member.notes} />}
          {activeTab === 'dependents' && <DependentsTab />}
          {activeTab === 'history' && <MemberHistoryTab memberId={member.id} />}
        </div>
      </div>

      <EditMemberSlideOver open={editOpen} onClose={() => setEditOpen(false)} member={member} />
      <TerminateMemberModal
        open={terminateOpen}
        onClose={() => setTerminateOpen(false)}
        member={member}
      />
    </div>
  )
}

const DependentsTab = () => (
  <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-6">
    <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
    <p className="text-sm text-gray-600">
      CHAMP does not manage dependent records. Dependents flow through the Clever member app
      directly to CBS.
    </p>
  </div>
)
