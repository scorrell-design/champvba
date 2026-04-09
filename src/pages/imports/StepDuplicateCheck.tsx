import { useState } from 'react'
import { AlertTriangle, Check } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Select'
import { Link } from 'react-router-dom'

interface DupRow {
  id: string
  ssnLast4: string
  fileName: string
  fileGroup: string
  existingName: string
  existingGroup: string
  existingStatus: 'Active' | 'Inactive' | 'Terminated'
  existingMemberId: string
  resolution: '' | 'update' | 'reactivate' | 'flag' | 'skip' | 'create'
}

const MOCK_DUPS: DupRow[] = [
  { id: 'd1', ssnLast4: '4561', fileName: 'NICOLE CLEVELAND', fileGroup: 'Sterling Health', existingName: 'Nicole A Cleveland', existingGroup: 'Sterling Health', existingStatus: 'Active', existingMemberId: 'm-1', resolution: '' },
  { id: 'd2', ssnLast4: '8832', fileName: 'JAMES BARTLETT', fileGroup: 'Sterling Health', existingName: 'James R Bartlett', existingGroup: 'Sterling Health', existingStatus: 'Inactive', existingMemberId: 'm-3', resolution: '' },
  { id: 'd3', ssnLast4: '9901', fileName: 'MARIA GONZALEZ', fileGroup: 'Sterling Health', existingName: 'Maria Gonzalez', existingGroup: 'Acme Corp', existingStatus: 'Active', existingMemberId: 'm-5', resolution: '' },
  { id: 'd4', ssnLast4: '2207', fileName: 'DAVID CHEN', fileGroup: 'Sterling Health', existingName: 'David L Chen', existingGroup: 'Sterling Health', existingStatus: 'Active', existingMemberId: 'm-7', resolution: '' },
  { id: 'd5', ssnLast4: '7743', fileName: 'SARAH JOHNSON', fileGroup: 'Sterling Health', existingName: 'Sarah M Johnson', existingGroup: 'Sterling Health', existingStatus: 'Active', existingMemberId: 'm-9', resolution: '' },
]

const RESOLUTION_OPTIONS = [
  { value: '', label: 'Select action...' },
  { value: 'update', label: 'Update Existing' },
  { value: 'reactivate', label: 'Reactivate' },
  { value: 'flag', label: 'Flag for Review' },
  { value: 'skip', label: 'Skip' },
  { value: 'create', label: 'Create Anyway' },
]

interface StepDuplicateCheckProps {
  onContinue: () => void
  onBack: () => void
}

export function StepDuplicateCheck({ onContinue, onBack }: StepDuplicateCheckProps) {
  const [rows, setRows] = useState(MOCK_DUPS)
  const allResolved = rows.every((r) => r.resolution !== '')
  const unresolvedCount = rows.filter((r) => r.resolution === '').length

  const setResolution = (id: string, resolution: DupRow['resolution']) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, resolution } : r)))
  }

  const statusVariant = (s: string) => {
    if (s === 'Active') return 'success' as const
    if (s === 'Inactive') return 'gray' as const
    return 'warning' as const
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <h3 className="font-semibold text-gray-900">
              Duplicate Check Results
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {rows.length} members in this file match existing records in the system.
              You must resolve each duplicate before proceeding.
            </p>
          </div>
        </div>
      </Card>

      {unresolvedCount > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700">
          {unresolvedCount} duplicate{unresolvedCount !== 1 ? 's' : ''} still need a resolution
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">SSN (Last 4)</th>
              <th className="px-4 py-3">File Name</th>
              <th className="px-4 py-3">File Group</th>
              <th className="px-4 py-3">Existing Name</th>
              <th className="px-4 py-3">Existing Group</th>
              <th className="px-4 py-3">Existing Status</th>
              <th className="px-4 py-3 w-48">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className={row.resolution ? 'bg-gray-50/50' : ''}>
                <td className="px-4 py-3 font-mono">XXX-XX-{row.ssnLast4}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{row.fileName}</td>
                <td className="px-4 py-3 text-gray-600">{row.fileGroup}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/members/${row.existingMemberId}`}
                    className="font-medium text-primary-600 hover:underline"
                  >
                    {row.existingName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{row.existingGroup}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(row.existingStatus)} dot>
                    {row.existingStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Select
                      options={RESOLUTION_OPTIONS}
                      value={row.resolution}
                      onChange={(e) => setResolution(row.id, e.target.value as DupRow['resolution'])}
                    />
                    {row.resolution && (
                      <Check className="h-4 w-4 shrink-0 text-green-500" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <div className="flex items-center gap-3">
          {!allResolved && (
            <p className="text-sm text-amber-600">
              Resolve all duplicates to continue
            </p>
          )}
          <Button onClick={onContinue} disabled={!allResolved}>
            Continue to Column Mapping
          </Button>
        </div>
      </div>
    </div>
  )
}
