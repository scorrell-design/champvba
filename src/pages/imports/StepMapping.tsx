import { useState } from 'react'
import { ArrowRight, Save, FileCheck } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useToast } from '../../components/feedback/Toast'
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog'
import { useTemplateStore, defaultMapping, type MappingTemplate } from '../../stores/template-store'
import { cn } from '../../utils/cn'
import { CURRENT_USER } from '../../constants/user'

const csvColumns = [
  'Group ID',
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

const systemFields = [
  { value: 'skip', label: '— Skip —' },
  { value: 'groupId', label: 'Group ID' },
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
  { value: 'anticipatedDate', label: 'Anticipated Date' },
  { value: 'planCode', label: 'Plan Code' },
]

export function StepMapping({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  const [mappings, setMappings] = useState<Record<string, string>>({ ...defaultMapping })
  const [templateName, setTemplateName] = useState('')
  const [overwriteTarget, setOverwriteTarget] = useState<MappingTemplate | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl-default')
  const { addToast } = useToast()

  const customTemplates = useTemplateStore((s) => s.customTemplates)
  const allTemplates = useTemplateStore((s) => s.allTemplates)()
  const addTemplate = useTemplateStore((s) => s.addTemplate)
  const findByName = useTemplateStore((s) => s.findByName)

  const mappedCount = Object.values(mappings).filter((v) => v !== 'skip').length
  const total = csvColumns.length
  const allMapped = mappedCount === total

  const templateOptions = allTemplates.map((t) => ({
    value: t.id,
    label: t.isCustom ? `${t.name} (Custom)` : t.name,
  }))

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id)
    const tpl = allTemplates.find((t) => t.id === id)
    if (tpl) {
      setMappings({ ...tpl.columnMapping })
    }
  }

  const doSaveTemplate = (name: string) => {
    const existingCustom = customTemplates.find(
      (t) => t.name.toLowerCase() === name.toLowerCase(),
    )

    const template: MappingTemplate = {
      id: existingCustom?.id ?? `tpl-custom-${Date.now().toString(36)}`,
      name,
      columnMapping: { ...mappings },
      createdAt: new Date().toISOString(),
      createdBy: CURRENT_USER,
      isCustom: true,
    }

    addTemplate(template)
    setSelectedTemplateId(template.id)
    setTemplateName('')
    addToast('success', `Template '${name}' saved successfully`)
  }

  const handleSaveTemplate = () => {
    const name = templateName.trim()
    if (!name) return

    const existing = findByName(name)
    if (existing) {
      setOverwriteTarget(existing)
      return
    }

    doSaveTemplate(name)
  }

  return (
    <div className="space-y-6">
      {/* Template selection & save */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Load Template"
              options={templateOptions}
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Save as New Template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name…"
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleSaveTemplate}
            disabled={!templateName.trim()}
          >
            <Save className="h-4 w-4" />
            Save Template
          </Button>
        </div>
        {customTemplates.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {customTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTemplate(t.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  selectedTemplateId === t.id
                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                )}
              >
                <FileCheck className="h-3 w-3" />
                {t.name}
                <Badge variant="info" className="ml-1 !px-1.5 !py-0 !text-[10px]">Custom</Badge>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Column mapping table */}
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

      <ConfirmDialog
        open={!!overwriteTarget}
        onClose={() => setOverwriteTarget(null)}
        onConfirm={() => {
          if (overwriteTarget) {
            doSaveTemplate(templateName.trim())
            setOverwriteTarget(null)
          }
        }}
        title="Overwrite Template"
        message={`A template with the name "${overwriteTarget?.name}" already exists. Do you want to overwrite it?`}
        confirmLabel="Overwrite"
        confirmVariant="danger"
      />
    </div>
  )
}
