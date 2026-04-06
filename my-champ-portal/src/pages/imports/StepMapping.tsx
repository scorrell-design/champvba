import { ArrowRight } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

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
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-section-title text-gray-900">Column Mapping</h3>
          <Badge variant="success">18 of 18 mapped</Badge>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Match each CSV column to the corresponding system field.
        </p>

        <div className="mt-6 space-y-2">
          <div className="grid grid-cols-[1fr_32px_1fr] items-center gap-4 px-3 pb-2">
            <span className="text-table-header uppercase text-gray-500">CSV Column</span>
            <span />
            <span className="text-table-header uppercase text-gray-500">System Field</span>
          </div>

          {csvColumns.map((col) => (
            <div
              key={col}
              className="grid grid-cols-[1fr_32px_1fr] items-center gap-4 rounded-lg border border-gray-200 px-3 py-2"
            >
              <span className="text-sm font-medium text-gray-700">{col}</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <Select
                options={systemFields}
                defaultValue={defaultMappings[col] ?? 'skip'}
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={onContinue}>Continue to Import</Button>
      </div>
    </div>
  )
}
