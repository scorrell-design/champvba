import { ChampionMark } from './ChampionMark'

const summaryStats = [
  {
    label: 'Open Enrollment',
    value: '18 days left',
    hint: 'Closes May 1, 2026',
  },
  {
    label: 'Total Members',
    value: '12,847',
    hint: '+2.4% vs last month',
  },
  {
    label: 'Active Groups',
    value: '156',
    hint: '3 pending setup',
  },
] as const

const recentActivity = [
  {
    time: 'Apr 4, 2026 · 9:14 AM',
    actor: 'Jordan Lee',
    record: 'Member · #M-48291',
    field: 'Work email',
    previous: 'j.smith@oldco.com',
    next: 'j.smith@newco.com',
  },
  {
    time: 'Apr 4, 2026 · 8:02 AM',
    actor: 'Admin · Stephanie',
    record: 'Group · Acme Logistics',
    field: 'Plan tier',
    previous: 'Silver',
    next: 'Gold',
  },
  {
    time: 'Apr 3, 2026 · 4:41 PM',
    actor: 'System import',
    record: 'Member · #M-51002',
    field: 'Coverage start date',
    previous: '—',
    next: '2026-04-01',
  },
  {
    time: 'Apr 3, 2026 · 2:18 PM',
    actor: 'Alex Rivera',
    record: 'Member · #M-44107',
    field: 'Mobile phone',
    previous: '(555) 010-9988',
    next: '(555) 010-2211',
  },
] as const

export function DashboardShell() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-gray-200 bg-white shadow-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ChampionMark className="size-10 shrink-0 rounded-lg" />
              <div>
                <p className="text-lg font-bold tracking-tight text-gray-900">
                  Champion Health
                </p>
                <p className="text-sm text-gray-500">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="hidden sm:inline">Welcome back</span>
              <span className="rounded-full bg-primary-100 px-3 py-1 font-semibold text-primary-700">
                Stephanie
              </span>
            </div>
          </div>
          <div
            className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-gray-800"
            role="status"
          >
            <span className="font-semibold text-gray-900">Principle: </span>
            All auto-populated fields must remain fully editable.
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section aria-labelledby="summary-heading">
          <h1
            id="summary-heading"
            className="text-page-title font-bold text-gray-900"
          >
            Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Snapshot of enrollment, membership, and groups.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summaryStats.map((card) => (
              <article
                key={card.label}
                className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="mt-2 text-stat-value text-gray-900">{card.value}</p>
                <p className="mt-1 text-xs text-gray-500">{card.hint}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="activity-heading"
          className="rounded-xl border border-gray-200 bg-white shadow-card"
        >
          <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
            <h2
              id="activity-heading"
              className="text-section-title text-gray-900"
            >
              Recent activity
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Field-level edits and system updates across the portal.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th
                    scope="col"
                    className="px-5 py-3 text-table-header text-gray-500 uppercase sm:px-6"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-table-header text-gray-500 uppercase sm:px-6"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-table-header text-gray-500 uppercase sm:px-6"
                  >
                    Record
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-table-header text-gray-500 uppercase sm:px-6"
                  >
                    Field
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-table-header text-gray-500 uppercase sm:px-6"
                  >
                    Previous
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-table-header text-gray-500 uppercase sm:px-6"
                  >
                    New value
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row) => (
                  <tr
                    key={`${row.time}-${row.field}`}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-gray-600 sm:px-6">
                      {row.time}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800 sm:px-6">
                      {row.actor}
                    </td>
                    <td className="px-5 py-3 text-gray-700 sm:px-6">{row.record}</td>
                    <td className="px-5 py-3 text-gray-800 sm:px-6">{row.field}</td>
                    <td className="max-w-[140px] truncate px-5 py-3 text-gray-500 sm:max-w-[180px] sm:px-6">
                      {row.previous}
                    </td>
                    <td className="max-w-[140px] truncate px-5 py-3 font-medium text-primary-600 sm:max-w-[180px] sm:px-6">
                      {row.next}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
