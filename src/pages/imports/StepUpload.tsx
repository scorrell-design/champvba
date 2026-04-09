import { useState, useCallback, useRef } from 'react'
import { Upload, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { cn } from '../../utils/cn'

const templateOptions = [
  { value: 'champ-eligibility', label: 'Champ Eligibility Template' },
  { value: 'custom', label: 'Custom Template' },
]

const systemFields = [
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
  'Anticipated Date',
  'Plan Code',
] as const

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-primary-500' : 'bg-gray-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  )
}

export function StepUpload({
  file,
  onFileChange,
  onContinue,
}: {
  file: File | null
  onFileChange: (f: File | null) => void
  onContinue: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [template, setTemplate] = useState('champ-eligibility')
  const [customExpanded, setCustomExpanded] = useState(true)
  const [customMappings, setCustomMappings] = useState<Record<string, string>>(
    () => Object.fromEntries(systemFields.map((f) => [f, ''])),
  )
  const [skipFields, setSkipFields] = useState<Record<string, boolean>>(
    () => Object.fromEntries(systemFields.map((f) => [f, false])),
  )
  const [templateName, setTemplateName] = useState('')

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const dropped = e.dataTransfer.files[0]
      if (dropped?.name.endsWith('.csv')) onFileChange(dropped)
    },
    [onFileChange],
  )

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (selected) onFileChange(selected)
    },
    [onFileChange],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <h3 className="text-section-title text-gray-900">Upload File</h3>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'mt-4 flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors',
              file ? 'border-primary-300 bg-primary-50/50' : 'border-gray-300 hover:border-primary-400',
            )}
          >
            {file ? (
              <>
                <FileText className="h-10 w-10 text-primary-500" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onFileChange(null)
                  }}
                  className="mt-1 text-xs text-danger-500 hover:underline"
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Drop CSV file here or click to browse</p>
                  <p className="text-xs text-gray-400">Accepts .csv files only</p>
                </div>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={handleSelect}
              className="hidden"
            />
          </div>

          <div className="mt-4">
            <Select
              label="Template"
              options={templateOptions}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
          </div>
        </Card>

        {template === 'custom' && (
          <Card>
            <button
              type="button"
              onClick={() => setCustomExpanded((v) => !v)}
              className="flex w-full items-center justify-between"
            >
              <h3 className="text-section-title text-gray-900">Define Custom Mapping</h3>
              {customExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {customExpanded && (
              <div className="mt-4 space-y-1">
                <div className="grid grid-cols-[140px_1fr_60px] items-center gap-2 px-1 pb-1">
                  <span className="text-xs font-semibold uppercase text-gray-500">System Field</span>
                  <span className="text-xs font-semibold uppercase text-gray-500">CSV Column Header</span>
                  <span className="text-xs font-semibold uppercase text-gray-500 text-center">Skip</span>
                </div>

                {systemFields.map((field) => (
                  <div
                    key={field}
                    className={cn(
                      'grid grid-cols-[140px_1fr_60px] items-center gap-2 rounded-md px-1 py-1.5',
                      skipFields[field] && 'opacity-50',
                    )}
                  >
                    <span className="text-sm text-gray-700 truncate">{field}</span>
                    <Input
                      placeholder={field}
                      value={customMappings[field]}
                      onChange={(e) =>
                        setCustomMappings((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      disabled={skipFields[field]}
                      className="!py-1.5 !text-xs"
                    />
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={skipFields[field]}
                        onChange={(e) =>
                          setSkipFields((prev) => ({ ...prev, [field]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <Input
                    label="Save as Template"
                    placeholder="e.g. My Custom Template"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    disabled={!templateName.trim()}
                    onClick={() => {}}
                  >
                    Save Template
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      <Card>
        <h3 className="text-section-title text-gray-900">Import Settings</h3>
        <div className="mt-4 space-y-3">
          <ToggleSwitch
            label="Header Row"
            description="First row contains column headers"
            checked={true}
            onChange={() => {}}
          />
          <ToggleSwitch
            label="Fail on Error"
            description="Stop import if any row fails validation"
            checked={true}
            onChange={() => {}}
          />
          <ToggleSwitch
            label="Create New Member"
            description="Auto-create members not found in system"
            checked={true}
            onChange={() => {}}
          />
        </div>

        <div className="mt-6">
          <Button onClick={onContinue} disabled={!file} className="w-full">
            Continue to Validation
          </Button>
        </div>
      </Card>
    </div>
  )
}
