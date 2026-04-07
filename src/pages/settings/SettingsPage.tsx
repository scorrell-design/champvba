import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage portal preferences and configuration."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-section-title text-gray-900">General</h3>
          <div className="mt-4 space-y-4">
            <Input label="Portal Name" defaultValue="CHAMP Admin Portal" />
            <Select
              label="Default Page Size"
              options={[
                { value: '10', label: '10 rows' },
                { value: '20', label: '20 rows' },
                { value: '50', label: '50 rows' },
              ]}
              defaultValue="20"
            />
            <Select
              label="Date Format"
              options={[
                { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
                { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
                { value: 'MMM d, yyyy', label: 'MMM D, YYYY' },
              ]}
              defaultValue="MMM d, yyyy"
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-section-title text-gray-900">Notifications</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">CBS Change Alerts</p>
                <p className="text-xs text-gray-500">Notify when FEIN or legal name changes</p>
              </div>
              <div className="relative h-6 w-11 cursor-pointer rounded-full bg-primary-500 transition-colors">
                <span className="absolute left-[22px] top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Import Completion</p>
                <p className="text-xs text-gray-500">Notify when file imports finish</p>
              </div>
              <div className="relative h-6 w-11 cursor-pointer rounded-full bg-primary-500 transition-colors">
                <span className="absolute left-[22px] top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Batch Update Alerts</p>
                <p className="text-xs text-gray-500">Notify on mass update operations</p>
              </div>
              <div className="relative h-6 w-11 cursor-pointer rounded-full bg-gray-300 transition-colors">
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-section-title text-gray-900">System Information</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Version</p>
              <p className="text-sm font-medium text-gray-800">V1.0.0 (April 2026)</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Environment</p>
              <p className="text-sm font-medium text-gray-800">Demo / Prototype</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Last Sync</p>
              <p className="text-sm font-medium text-gray-800">Apr 6, 2026 · 9:00 AM</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="primary">Save Settings</Button>
      </div>
    </div>
  )
}
