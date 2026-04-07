import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { cn } from '../../utils/cn'

const csvColumns = [
  'Agent ID',
  'Employee ID',
  'Last Name',
  'First Name',
  'Middle Initial',
  'SSN',
  'DOB',
  'Gender',
  'Address 1',
  'Address 2',
  'City',
  'State',
  'Zip',
  'Phone',
  'Email',
  'Hire Date',
  'Active Date',
  'Plan Code',
] as const

const systemFields = [
  { value: 'skip', label: '— Skip —' },
  { value: 'agentId', label: 'Agent ID' },
  { value: 'employeeId', label: 'Employee ID' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'firstName', label: 'First Name' },
  { value: 'middleInitial', label: 'Middle Initial' },
  { value: 'ssn', label: 'SSN' },
  { value: 'dob', label: 'Date of Birth' },
  { value: 'gender', label: 'Gender' },
  { value: 'address1', label: 'Address Line 1' },
  { value: 'address2', label: 'Address Line 2' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'zip', label: 'Zip Code' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'hireDate', label: 'Hire Date' },
  { value: 'activeDate', label: 'Active Date' },
  { value: 'planCode', label: 'Plan Code' },
]

const defaultMappings: Record<string, string> = {
  'Agent ID': 'agentId',
  'Employee ID': 'employeeId',
  'Last Name': 'lastName',
  'First Name': 'firstName',
  'Middle Initial': 'middleInitial',
  SSN: 'ssn',
  DOB: 'dob',
  Gender: 'gender',
  'Address 1': 'address1',
  'Address 2': 'address2',
  City: 'city',
  State: 'state',
  Zip: 'zip',
  Phone: 'phone',
  Email: 'email',
  'Hire Date': 'hireDate',
  'Active Date': 'activeDate',
  'Plan Code': 'planCode',
}

export function StepMapping({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  const [mappings, setMappings] = useState<Record<string, string>>(defaultMappings)

  const mappedCount = Object.values(mappings).filter((v) => v !== 'skip').length
  const total = csvColumns.length
  const allMapped = mappedCount === total

  return (
    <div className="space-y-6">
      <Card padding={false}>
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-section-title text-gray-900">Column Mapping</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Match each CSV column to the corresponding system field.
            </p>
          </div>
          <Badge variant={allMapped ? 'success' : 'warning'}>
            {mappedCount} of {total} mapped
          </Badge>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-200 bg-gray-50">
              <th className="px-4 py-2 text-left text-table-header uppercase text-gray-500">CSV Column</th>
              <th className="w-8" />
              <th className="px-4 py-2 text-left text-table-header uppercase text-gray-500">System Field</th>
            </tr>
          </thead>
          <tbody>
            {csvColumns.map((col) => {
              const isSkipped = mappings[col] === 'skip'
              return (
                <tr
                  key={col}
                  className={cn(
                    'border-b border-gray-100',
                    isSkipped && 'bg-warning-50',
                  )}
                >
                  <td className="px-4 py-2 text-sm font-medium text-gray-700">{col}</td>
                  <td className="py-2 text-center">
                    <ArrowRight className="inline-block h-3.5 w-3.5 text-gray-400" />
                  </td>
                  <td className="px-4 py-2">
                    <Select
                      options={systemFields}
                      value={mappings[col] ?? 'skip'}
                      onChange={(e) =>
                        setMappings((prev) => ({ ...prev, [col]: e.target.value }))
                      }
                      className="!py-1.5 !text-xs"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={onContinue}>Continue to Import</Button>
      </div>
    </div>
  )
}
