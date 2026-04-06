import { Link } from 'react-router-dom'
import { CheckCircle, Info, UserPlus, Users } from 'lucide-react'
import { Card, StatCard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export function StepResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="space-y-6">
      <Card className="text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
            <CheckCircle className="h-8 w-8 text-success-500" />
          </div>
          <h2 className="text-page-title text-gray-900">Import Complete</h2>
          <p className="text-sm text-gray-500">
            Your file has been processed successfully.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Adds" value={91} icon={UserPlus} className="rounded-2xl" />
        <StatCard label="Updates" value={0} icon={Users} className="rounded-2xl" />
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
        <p className="text-sm text-primary-700">
          All 91 members have been created. Product assignment is recommended.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link to="/members">
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
