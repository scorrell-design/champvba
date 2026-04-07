import { useState } from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { cn } from '../../utils/cn'

interface Warning {
  row: number
  field: string
  issue: string
  action: 'fix' | 'skip'
}

const mockWarnings: Warning[] = [
  { row: 14, field: 'Phone', issue: 'Phone field appears to contain SSN', action: 'fix' },
  { row: 67, field: 'Email', issue: 'Dummy email detected (no@no.com)', action: 'skip' },
]

export function StepValidation({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  const [resolved, setResolved] = useState<Set<number>>(new Set())

  const allResolved = resolved.size === mockWarnings.length
  const unresolvedCount = mockWarnings.length - resolved.size

  function resolveWarning(row: number) {
    setResolved((prev) => new Set(prev).add(row))
  }

  function resolveAll() {
    setResolved(new Set(mockWarnings.map((w) => w.row)))
  }

  function skipAll() {
    setResolved(new Set(mockWarnings.map((w) => w.row)))
  }

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
                <p className="text-stat-value text-warning-600">{unresolvedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card padding={false}>
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning-500" />
            <h3 className="text-sm font-semibold text-gray-800">Warnings ({mockWarnings.length})</h3>
          </div>
          {!allResolved && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={resolveAll}>
                Auto-Fix All ({unresolvedCount})
              </Button>
              <Button variant="ghost" size="sm" onClick={skipAll}>
                Skip All Warnings
              </Button>
            </div>
          )}
        </div>

        {allResolved && (
          <div className="mx-6 mb-4 flex items-center gap-2 rounded-lg bg-success-50 px-4 py-3">
            <CheckCircle className="h-4 w-4 text-success-500" />
            <span className="text-sm font-medium text-success-700">All warnings resolved</span>
          </div>
        )}

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-table-header uppercase text-gray-500">Row</th>
              <th className="px-6 py-3 text-left text-table-header uppercase text-gray-500">Field</th>
              <th className="px-6 py-3 text-left text-table-header uppercase text-gray-500">Issue</th>
              <th className="px-6 py-3 text-right text-table-header uppercase text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockWarnings.map((w) => {
              const isResolved = resolved.has(w.row)
              return (
                <tr
                  key={w.row}
                  className={cn('border-t border-gray-200', isResolved && 'bg-gray-50/50')}
                >
                  <td className={cn('px-6 py-3 text-sm', isResolved ? 'text-gray-400' : 'text-gray-700')}>
                    {w.row}
                  </td>
                  <td className={cn('px-6 py-3 text-sm', isResolved ? 'text-gray-400' : 'text-gray-700')}>
                    {w.field}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {isResolved ? (
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <CheckCircle className="h-3.5 w-3.5 text-success-500" />
                        <span className="line-through">{w.issue}</span>
                      </span>
                    ) : (
                      <span className="text-warning-600">{w.issue}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {!isResolved && (
                      <Button variant="secondary" size="sm" onClick={() => resolveWarning(w.row)}>
                        {w.action === 'fix' ? 'Fix' : 'Skip Row'}
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
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
