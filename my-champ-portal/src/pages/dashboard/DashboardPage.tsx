import { Link } from 'react-router-dom'
import { CalendarDays, Users, Building2, Bell, UserPlus, Upload, ClipboardList } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { useDashboardStats, useAuditLog } from '../../hooks/useQueries'
import { StatCard } from '../../components/ui/Card'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { SystemBadge } from '../../components/ui/Badge'
import { DataTable } from '../../components/ui/DataTable'
import { formatDateTime } from '../../utils/formatters'
import { cn } from '../../utils/cn'
import type { AuditEntry } from '../../types/audit'

const recentChangesColumns: ColumnDef<AuditEntry, unknown>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-gray-500">{formatDateTime(getValue<string>())}</span>
    ),
  },
  {
    id: 'entity',
    header: 'Entity',
    cell: ({ row }) => {
      const { entityType, entityId, entityName } = row.original
      const href = entityType === 'Member' ? `/members/${entityId}` : `/groups/${entityId}`
      return (
        <Link to={href} className="text-primary-500 hover:underline">
          {entityType}: {entityName}
        </Link>
      )
    },
  },
  { accessorKey: 'fieldChanged', header: 'Change' },
  { accessorKey: 'changedBy', header: 'Changed By' },
  {
    id: 'systems',
    header: 'Systems',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.systemsAffected.map((s) => (
          <SystemBadge key={s} system={s} />
        ))}
      </div>
    ),
  },
]

const quickActions = [
  { label: 'Add New Hire', icon: UserPlus, to: '/members/new' },
  { label: 'Import File', icon: Upload, to: '/imports' },
  { label: 'View Groups', icon: Building2, to: '/groups' },
  { label: 'Audit Log', icon: ClipboardList, to: '/audit-log' },
] as const

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-6 w-16 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: auditEntries, isLoading: auditLoading } = useAuditLog()

  const recentEntries = auditEntries?.slice(0, 5) ?? []
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-gray-900">Welcome back, Stephanie</h1>
        <p className="mt-1 text-sm text-gray-500">{today}</p>
      </div>

      {statsLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Open Enrollment"
            value={stats?.openEnrollment.count ?? 0}
            icon={CalendarDays}
            hint={`${stats?.openEnrollment.daysLeft} days remaining`}
            className="rounded-2xl"
          />
          <StatCard
            label="Total Members"
            value={stats?.totalMembers.count ?? 0}
            icon={Users}
            trend="up"
            hint={`+${stats?.totalMembers.delta} (${stats?.totalMembers.deltaPercent}%)`}
            className="rounded-2xl"
          />
          <StatCard
            label="Active Groups"
            value={stats?.activeGroups.count ?? 0}
            icon={Building2}
            className="rounded-2xl"
          />
          <StatCard
            label="Pending CBS Notifications"
            value={stats?.pendingNotifications.count ?? 0}
            icon={Bell}
            className="rounded-2xl border-warning-400/30"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card padding={false} className="lg:col-span-2">
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-section-title text-gray-900">Recent Changes</h2>
            <Link to="/audit-log" className="text-sm font-medium text-primary-500 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-2">
            <DataTable
              columns={recentChangesColumns}
              data={recentEntries}
              isLoading={auditLoading}
              emptyIcon={ClipboardList}
              emptyMessage="No recent changes"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-section-title text-gray-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {quickActions.map(({ label, icon: Icon, to }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4',
                  'text-center transition-all hover:border-primary-300 hover:shadow-card-hover',
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                  <Icon className="h-5 w-5 text-primary-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
