import { CheckCircle, AlertTriangle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

const mockWarnings = [
  { row: 14, field: 'Phone', issue: 'Phone field appears to contain SSN' },
  { row: 67, field: 'Email', issue: 'Dummy email detected (no@no.com)' },
]

export function StepValidation({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
            <CheckCircle className="h-6 w-6 text-success-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-section-title text-gray-900">File Health</h3>
              <Badge variant="success" dot>Clean</Badge>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Rows Found</p>
                <p className="text-stat-value text-gray-800">91</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Errors</p>
                <p className="text-stat-value text-success-600">0</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Warnings</p>
                <p className="text-stat-value text-warning-600">2</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card padding={false}>
        <div className="flex items-center gap-2 px-6 pt-6 pb-3">
          <AlertTriangle className="h-4 w-4 text-warning-500" />
          <h3 className="text-sm font-semibold text-gray-800">Warnings ({mockWarnings.length})</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-table-header uppercase text-gray-500">Row</th>
              <th className="px-6 py-3 text-left text-table-header uppercase text-gray-500">Field</th>
              <th className="px-6 py-3 text-left text-table-header uppercase text-gray-500">Issue</th>
            </tr>
          </thead>
          <tbody>
            {mockWarnings.map((w) => (
              <tr key={w.row} className="border-t border-gray-200">
                <td className="px-6 py-3 text-sm text-gray-700">{w.row}</td>
                <td className="px-6 py-3 text-sm text-gray-700">{w.field}</td>
                <td className="px-6 py-3 text-sm text-warning-600">{w.issue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={onContinue}>Continue to Mapping</Button>
      </div>
    </div>
  )
}
