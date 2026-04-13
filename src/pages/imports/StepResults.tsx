import { Link } from 'react-router-dom'
import { CheckCircle, Info, UserPlus, Users, Building2 } from 'lucide-react'
import { Card, StatCard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

const MOCK_GROUP_ROUTING = [
  { groupId: 'g-1', groupName: 'Apex Manufacturing LLC', memberCount: 34 },
  { groupId: 'g-2', groupName: 'Redwood Financial Services', memberCount: 28 },
  { groupId: 'g-3', groupName: 'Coastal Logistics Group', memberCount: 29 },
]

export function StepResults({ onReset }: { onReset: () => void }) {
  const totalMembers = MOCK_GROUP_ROUTING.reduce((sum, g) => sum + g.memberCount, 0)

  return (
    <div className="space-y-6">
      <Card className="text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
            <CheckCircle className="h-8 w-8 text-success-500" />
          </div>
          <h2 className="text-page-title text-gray-900">Import Complete</h2>
          <p className="text-sm text-gray-500">
            Your file has been processed successfully. Members have been routed to their groups based on Group ID.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Adds" value={totalMembers} icon={UserPlus} className="rounded-2xl" />
        <StatCard label="Groups Detected" value={MOCK_GROUP_ROUTING.length} icon={Building2} className="rounded-2xl" />
        <StatCard label="Updates" value={0} icon={Users} className="rounded-2xl" />
      </div>

      <Card>
        <h3 className="text-section-title text-gray-900 mb-3">Group Routing Summary</h3>
        <div className="space-y-2">
          {MOCK_GROUP_ROUTING.map((g) => (
            <div key={g.groupId} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-gray-400" />
                <div>
                  <Link to={`/groups/${g.groupId}`} className="text-sm font-medium text-primary-600 hover:underline">
                    {g.groupName}
                  </Link>
                  <p className="text-xs text-gray-500">ID: {g.groupId}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">{g.memberCount} members</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
        <p className="text-sm text-primary-700">
          {totalMembers} members have been created across {MOCK_GROUP_ROUTING.length} groups. Product assignment is recommended for each group.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link to="/imports/assign-products">
          <Button variant="primary">
            <UserPlus className="h-4 w-4" />
            Assign Products
          </Button>
        </Link>
        <Link to="/members" className="text-sm font-medium text-primary-500 hover:underline">
          View Members
        </Link>
        <button
          onClick={onReset}
          className="text-sm font-medium text-primary-500 hover:underline"
        >
          Import Another File
        </button>
      </div>
    </div>
  )
}
