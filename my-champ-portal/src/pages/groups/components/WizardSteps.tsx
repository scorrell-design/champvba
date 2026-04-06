import { useState, useMemo, useEffect } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Check, AlertTriangle, Info } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { SearchBar } from '../../../components/ui/SearchBar'
import { DataTable } from '../../../components/ui/DataTable'
import { cn } from '../../../utils/cn'
import { formatCurrency, formatDate } from '../../../utils/formatters'
import { PRODUCT_TEMPLATES } from '../../../data/products'
import { US_STATES } from '../../../utils/constants'
import type { RFC } from '../../../types/rfc'

// ── Shared types ─────────────────────────────────────────────────────

export interface WizardAgent {
  id: string
  name: string
  number: string
  company: string
  phone: string
  email: string
  tinNpiCode?: string
}

export interface WizardFormData {
  legalName: string
  dba: string
  fein: string
  street: string
  street2: string
  city: string
  state: string
  zip: string
  phone: string
  contactName: string
  contactEmail: string
  eligibilityContactEmail: string
  eligibilityContactPhone: string
  billingContactName: string
  billingContactEmail: string
  billingContactPhone: string
  wltGroupNumber: string
  ppoNetwork: string
  pbm: string
  invoiceTemplate: string
  section125PostTax: string
}

export interface WizardTemplateProduct {
  productId: string
  name: string
  monthlyFee: number
  commissionable: boolean
}

// ── Mock data ────────────────────────────────────────────────────────

const MOCK_AGENTS: WizardAgent[] = [
  { id: 'a1', name: 'Marcus Webb', number: 'A-7821', company: 'Pinnacle Benefits Group', phone: '(313) 555-7821', email: 'mwebb@pinnaclebenefits.com' },
  { id: 'a2', name: 'Diana Cho', number: 'A-4456', company: 'Pacific Brokers Alliance', phone: '(415) 555-4456', email: 'dcho@pacificbrokers.com' },
  { id: 'a3', name: 'Kevin Briggs', number: 'A-6103', company: 'Southeast Benefits Consulting', phone: '(843) 555-6103', email: 'kbriggs@sebenefits.com' },
  { id: 'a4', name: 'Sarah Okafor', number: 'A-5590', company: 'Mountain West Insurance', phone: '(720) 555-5590', email: 'sokafor@mtnwestins.com' },
  { id: 'a5', name: 'Tom Hendricks', number: 'A-8912', company: 'Heartland Brokers', phone: '(316) 555-8912', email: 'thendricks@heartlandbrokers.com' },
]

const agentColumns: ColumnDef<WizardAgent, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'number', header: 'Number' },
  { accessorKey: 'company', header: 'Company' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'email', header: 'Email' },
]

const stateOptions = US_STATES.map((s) => ({ value: s, label: s }))
const TEMPLATE_KEYS = ['standard', 'hsa', 'firstStop', 'firstStopHsa'] as const

// ── Helpers ──────────────────────────────────────────────────────────

function RFCFieldIndicator({ isRFC, hasValue }: { isRFC: boolean; hasValue: boolean }) {
  if (!isRFC) return null
  if (hasValue) {
    return <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-primary-50 px-1 py-0.5 text-[10px] font-medium text-primary-600">RFC</span>
  }
  return <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-warning-50 px-1 py-0.5 text-[10px] font-medium text-warning-600">Manual</span>
}

function FieldTag({ type }: { type: 'rfc' | 'default' | 'manual' }) {
  const styles = {
    rfc: 'bg-primary-50 text-primary-600',
    default: 'bg-gray-100 text-gray-500',
    manual: 'bg-success-50 text-success-600',
  }
  const labels = { rfc: 'RFC', default: 'Default', manual: 'Manual' }
  return (
    <span className={cn('ml-2 inline-flex rounded px-1 py-0.5 text-[10px] font-medium', styles[type])}>
      {labels[type]}
    </span>
  )
}

const RFC_SOURCED_FIELDS = new Set<string>([
  'legalName', 'dba', 'fein', 'street', 'street2', 'city', 'state', 'zip',
  'phone', 'contactName', 'contactEmail', 'eligibilityContactEmail',
  'eligibilityContactPhone', 'billingContactName', 'billingContactEmail',
  'billingContactPhone', 'ppoNetwork', 'pbm', 'section125PostTax',
])

const DEFAULT_ONLY_FIELDS = new Set(['invoiceTemplate'])

function getRfcFieldValue(fieldKey: string, rfcData: RFC): string | undefined {
  const map: Record<string, string | undefined> = {
    legalName: rfcData.legalName,
    dba: rfcData.dba ?? '',
    fein: rfcData.fein,
    street: rfcData.address.street,
    street2: rfcData.address.street2 ?? '',
    city: rfcData.address.city,
    state: rfcData.address.state,
    zip: rfcData.address.zip,
    phone: rfcData.phone,
    contactName: rfcData.primaryContact.name,
    contactEmail: rfcData.primaryContact.email,
    eligibilityContactEmail: rfcData.eligibilityContact?.email ?? '',
    eligibilityContactPhone: rfcData.eligibilityContact?.phone ?? '',
    billingContactName: rfcData.billingContact?.name ?? '',
    billingContactEmail: rfcData.billingContact?.email ?? '',
    billingContactPhone: rfcData.billingContact?.phone ?? '',
    ppoNetwork: rfcData.ppoNetwork || 'First Health',
    pbm: rfcData.pbm || 'CleverRx',
    section125PostTax: rfcData.section125PostTax ?? '',
  }
  return map[fieldKey]
}

function getFieldTag(
  fieldKey: string,
  currentValue: string,
  rfcData: RFC,
): 'rfc' | 'default' | 'manual' {
  if (fieldKey === 'wltGroupNumber') return 'manual'
  if (fieldKey.startsWith('_')) return 'rfc'
  if (DEFAULT_ONLY_FIELDS.has(fieldKey)) return 'default'
  if (RFC_SOURCED_FIELDS.has(fieldKey)) {
    const rfcValue = getRfcFieldValue(fieldKey, rfcData)
    return currentValue === rfcValue ? 'rfc' : 'manual'
  }
  return 'default'
}

// ── Step 1: Agent Lookup ─────────────────────────────────────────────

export const StepAgent = ({
  agent,
  onSelect,
  isRFCMode = false,
  rfcData,
}: {
  agent: WizardAgent | null
  onSelect: (a: WizardAgent) => void
  isRFCMode?: boolean
  rfcData?: RFC | null
}) => {
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const filtered = useMemo(() => {
    if (!search) return MOCK_AGENTS
    const q = search.toLowerCase()
    return MOCK_AGENTS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.number.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q),
    )
  }, [search])

  if (isRFCMode && agent) {
    return (
      <div className="space-y-4">
        <Card className="border-l-4 border-l-primary-400">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Agent from RFC</h4>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-gray-500">Name <RFCFieldIndicator isRFC hasValue={!!agent.name} /></dt>
              <dd className="font-medium text-gray-900">{agent.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Number <RFCFieldIndicator isRFC hasValue={!!agent.number} /></dt>
              <dd className="font-medium text-gray-900">{agent.number}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Company <RFCFieldIndicator isRFC hasValue={!!agent.company} /></dt>
              <dd className="font-medium text-gray-900">{agent.company}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Phone <RFCFieldIndicator isRFC hasValue={!!agent.phone} /></dt>
              <dd className="font-medium text-gray-900">{agent.phone}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Email <RFCFieldIndicator isRFC hasValue={!!agent.email} /></dt>
              <dd className="font-medium text-gray-900">{agent.email}</dd>
            </div>
            {agent.tinNpiCode && (
              <div>
                <dt className="text-xs text-gray-500">TIN/NPI <RFCFieldIndicator isRFC hasValue /></dt>
                <dd className="font-medium text-gray-900">{agent.tinNpiCode}</dd>
              </div>
            )}
          </dl>
          {!showSearch && (
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => setShowSearch(true)}>
              Change Agent
            </Button>
          )}
        </Card>
        {showSearch && (
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search agents by name, number, or company…"
              className="max-w-md"
            />
            <DataTable columns={agentColumns} data={filtered} onRowClick={onSelect} emptyMessage="No agents found" />
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search agents by name, number, or company…"
        className="max-w-md"
      />
      <DataTable columns={agentColumns} data={filtered} onRowClick={onSelect} emptyMessage="No agents found" />
      {agent && (
        <Card className="border-primary-200 bg-primary-50">
          <p className="text-sm font-medium text-primary-700">
            Selected: {agent.name} ({agent.number}) — {agent.company}
          </p>
        </Card>
      )}
    </div>
  )
}

// ── Step 2: Group Info ───────────────────────────────────────────────

export const StepInfo = ({
  form,
  onChange,
  isRFCMode = false,
  rfcData,
}: {
  form: WizardFormData
  onChange: (f: WizardFormData) => void
  isRFCMode?: boolean
  rfcData?: RFC | null
}) => {
  const set = (field: keyof WizardFormData, value: string) =>
    onChange({ ...form, [field]: value })

  const tmHwCode = form.wltGroupNumber ? `HW-${form.wltGroupNumber}` : ''
  const tpaCode = form.wltGroupNumber ? `TPA-${form.wltGroupNumber}` : ''

  const rfcInputClass = (field: keyof WizardFormData) => {
    if (!isRFCMode) return ''
    if (field === 'wltGroupNumber') return 'border-l-2 border-l-warning-300 bg-warning-50/30'
    return form[field] ? 'border-l-2 border-l-primary-300' : 'border-l-2 border-l-warning-300 bg-warning-50/30'
  }

  const formFields: (keyof WizardFormData)[] = [
    'legalName', 'dba', 'fein', 'street', 'street2', 'city', 'state', 'zip',
    'phone', 'contactName', 'contactEmail', 'eligibilityContactEmail',
    'eligibilityContactPhone', 'billingContactName', 'billingContactEmail',
    'billingContactPhone', 'wltGroupNumber', 'ppoNetwork', 'pbm',
    'invoiceTemplate', 'section125PostTax',
  ]
  const totalFieldCount = formFields.length
  const populatedCount = formFields.filter((f) => !!form[f]).length
  const missingCount = totalFieldCount - populatedCount

  return (
    <Card>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Legal Name" value={form.legalName} onChange={(e) => set('legalName', e.target.value)} required className={rfcInputClass('legalName')} />
        <Input label="DBA" value={form.dba} onChange={(e) => set('dba', e.target.value)} className={rfcInputClass('dba')} />
        <Input label="FEIN" value={form.fein} onChange={(e) => set('fein', e.target.value)} placeholder="##-#######" required className={rfcInputClass('fein')} />
        <Input label="Street" value={form.street} onChange={(e) => set('street', e.target.value)} className={rfcInputClass('street')} />
        <Input label="Street 2" value={form.street2} onChange={(e) => set('street2', e.target.value)} className={rfcInputClass('street2')} />
        <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} className={rfcInputClass('city')} />
        <Select label="State" value={form.state} onChange={(e) => set('state', e.target.value)} options={stateOptions} placeholder="Select state" className={rfcInputClass('state')} />
        <Input label="ZIP" value={form.zip} onChange={(e) => set('zip', e.target.value)} className={rfcInputClass('zip')} />
        <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={rfcInputClass('phone')} />
        <Input label="Primary Contact Name" value={form.contactName} onChange={(e) => set('contactName', e.target.value)} className={rfcInputClass('contactName')} />
        <Input label="Primary Contact Email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} className={rfcInputClass('contactEmail')} />
        <Input label="Eligibility Contact Email" value={form.eligibilityContactEmail} onChange={(e) => set('eligibilityContactEmail', e.target.value)} className={rfcInputClass('eligibilityContactEmail')} />
        <Input label="Eligibility Contact Phone" value={form.eligibilityContactPhone} onChange={(e) => set('eligibilityContactPhone', e.target.value)} className={rfcInputClass('eligibilityContactPhone')} />

        <div className="col-span-2 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Billing Contact</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.billingContactName} onChange={(e) => set('billingContactName', e.target.value)} className={rfcInputClass('billingContactName')} />
            <Input label="Email" value={form.billingContactEmail} onChange={(e) => set('billingContactEmail', e.target.value)} className={rfcInputClass('billingContactEmail')} />
            <Input label="Phone" value={form.billingContactPhone} onChange={(e) => set('billingContactPhone', e.target.value)} className={rfcInputClass('billingContactPhone')} />
          </div>
        </div>

        <Input label="WLT Group Number" value={form.wltGroupNumber} onChange={(e) => set('wltGroupNumber', e.target.value)} className={rfcInputClass('wltGroupNumber')} />
        {form.wltGroupNumber && (
          <>
            <Input label="TM/HW Code" value={tmHwCode} disabled />
            <Input label="TPA Group Code" value={tpaCode} disabled />
          </>
        )}
        <Select
          label="Section 125/Post-Tax"
          value={form.section125PostTax}
          onChange={(e) => set('section125PostTax', e.target.value)}
          options={[{ value: 'Post-Tax', label: 'Post-Tax' }, { value: 'Pre-Tax', label: 'Pre-Tax' }]}
          placeholder="Select…"
          className={rfcInputClass('section125PostTax')}
        />
        <Input label="PPO Network" value={form.ppoNetwork} onChange={(e) => set('ppoNetwork', e.target.value)} className={rfcInputClass('ppoNetwork')} />
        <Input label="PBM" value={form.pbm} onChange={(e) => set('pbm', e.target.value)} className={rfcInputClass('pbm')} />
        <div className="col-span-2">
          <Input label="Invoice Template" value={form.invoiceTemplate} onChange={(e) => set('invoiceTemplate', e.target.value)} className={rfcInputClass('invoiceTemplate')} />
        </div>
      </div>

      {isRFCMode && (
        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">{populatedCount} of {totalFieldCount} fields</span> auto-populated from RFC.
            {missingCount > 0 && <span className="text-warning-600"> {missingCount} fields need your input.</span>}
          </p>
        </div>
      )}
    </Card>
  )
}

// ── Step 3: Product Template ─────────────────────────────────────────

export const StepTemplate = ({
  templateKey,
  onTemplateChange,
  products,
  onProductsChange,
  isRFCMode = false,
  rfcData,
}: {
  templateKey: string
  onTemplateChange: (k: string) => void
  products: WizardTemplateProduct[]
  onProductsChange: (p: WizardTemplateProduct[]) => void
  isRFCMode?: boolean
  rfcData?: RFC | null
}) => {
  const [templateLocked, setTemplateLocked] = useState(isRFCMode)

  useEffect(() => {
    const tpl = PRODUCT_TEMPLATES[templateKey]
    if (tpl) {
      onProductsChange(tpl.products.map((p) => ({ ...p, commissionable: true })))
    }
  }, [templateKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFeeChange = (idx: number, fee: number) => {
    onProductsChange(products.map((p, i) => (i === idx ? { ...p, monthlyFee: fee } : p)))
  }

  const handleCommChange = (idx: number) => {
    onProductsChange(products.map((p, i) => (i === idx ? { ...p, commissionable: !p.commissionable } : p)))
  }

  const tpl = PRODUCT_TEMPLATES[templateKey]

  return (
    <div className="space-y-6">
      {isRFCMode && rfcData && (
        <div className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
          <Info className="h-5 w-5 shrink-0 text-primary-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary-700">
              Template auto-selected based on RFC:{' '}
              <span className="font-semibold">{tpl?.name ?? templateKey}</span>{' '}
              (HSA:{' '}
              <Badge variant={rfcData.hsaFlag === 'yes' ? 'success' : rfcData.hsaFlag === 'unsure' ? 'warning' : 'gray'}>
                {rfcData.hsaFlag}
              </Badge>
              , First Stop:{' '}
              <Badge variant={rfcData.firstStopHealthFlag ? 'success' : 'gray'}>
                {rfcData.firstStopHealthFlag ? 'Yes' : 'No'}
              </Badge>
              )
            </p>
          </div>
          {templateLocked && (
            <button
              onClick={() => setTemplateLocked(false)}
              className="text-sm font-medium text-primary-600 hover:text-primary-800 underline"
            >
              Change Template
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {TEMPLATE_KEYS.map((key) => {
          const t = PRODUCT_TEMPLATES[key]
          const selected = templateKey === key
          return (
            <button
              key={key}
              onClick={() => !templateLocked && onTemplateChange(key)}
              disabled={templateLocked && !selected}
              className={cn(
                'relative rounded-xl border-2 p-4 text-left transition-colors',
                selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300',
                templateLocked && !selected && 'opacity-50 cursor-not-allowed',
              )}
            >
              {isRFCMode && selected && (
                <span className="absolute -top-2 right-2 rounded bg-primary-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  RFC
                </span>
              )}
              <p className={cn('text-sm font-medium', selected ? 'text-primary-700' : 'text-gray-700')}>
                {t.name}
              </p>
              <p className="mt-1 text-xs text-gray-500">{t.products.length} products</p>
            </button>
          )
        })}
      </div>

      {isRFCMode && rfcData?.hsaFlag === 'unsure' && (
        <div className="flex items-start gap-2 rounded-lg bg-warning-50 border border-warning-200 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-warning-500 shrink-0" />
          <p className="text-sm text-warning-700">
            The RFC indicated "Unsure" for HSA. No HSA product has been added.
            If this group offers HSA, add the HSA product manually or change the template.
          </p>
        </div>
      )}

      {products.length > 0 && (
        <Card padding={false}>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Product ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Monthly Fee</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Commissionable</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.productId} className="border-t border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-700">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.productId}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={p.monthlyFee}
                      onChange={(e) => handleFeeChange(i, parseFloat(e.target.value) || 0)}
                      className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={p.commissionable}
                      onChange={() => handleCommChange(i)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-200"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

// ── Step 4: Payment & Config ─────────────────────────────────────────

const PAYMENT_DEFAULTS: [string, string][] = [
  ['Type', 'List Bill'],
  ['Processor', 'Internal'],
  ['Allow Payments', 'Yes'],
  ['Allow Refunds', 'No'],
  ['Display on Frontend', 'Yes'],
  ['Frontend Create Transaction', 'No'],
  ['Mark Transaction Complete', 'Yes'],
  ['Stick Processor to Member', 'Yes'],
]

const OVERRIDE_KEYS = new Set(['Frontend Create Transaction', 'Stick Processor to Member'])

export const StepPayment = ({ isRFCMode = false }: { isRFCMode?: boolean }) => (
  <div className="space-y-4">
    {isRFCMode && (
      <div className="flex items-center gap-2 rounded-lg bg-success-50 border border-success-200 px-4 py-3">
        <Check className="h-4 w-4 text-success-500" />
        <span className="text-sm font-medium text-success-700">
          Payment configuration auto-applied for monthly invoice group.
        </span>
      </div>
    )}
    <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-3">
      <Info className="h-5 w-5 text-primary-500" />
      <span className="text-sm font-medium text-primary-700">This group will be invoiced Monthly</span>
    </div>
    <Card>
      <h4 className="text-section-title mb-4 text-gray-900">Payment Processor Defaults</h4>
      <dl className="grid grid-cols-2 gap-4">
        {PAYMENT_DEFAULTS.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase text-gray-400">{label}</dt>
            <dd
              className={cn(
                'mt-0.5 flex items-center gap-1.5 text-sm',
                OVERRIDE_KEYS.has(label) ? 'font-medium text-warning-600' : 'text-gray-800',
              )}
            >
              {isRFCMode && <Check className="h-3.5 w-3.5 text-success-500 shrink-0" />}
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  </div>
)

// ── Step 5: Review & Create ──────────────────────────────────────────

export const StepReview = ({
  agent,
  form,
  templateKey,
  products,
  isRFCMode = false,
  rfcData,
}: {
  agent: WizardAgent | null
  form: WizardFormData
  templateKey: string
  products: WizardTemplateProduct[]
  isRFCMode?: boolean
  rfcData?: RFC | null
}) => {
  const tpl = PRODUCT_TEMPLATES[templateKey]

  const summaryFields: [string, string, string][] = [
    ['Legal Name', form.legalName, 'legalName'],
    ['DBA', form.dba, 'dba'],
    ['FEIN', form.fein, 'fein'],
    ['Agent', agent ? `${agent.name} (${agent.number})` : '—', '_agent'],
    ['Address', [form.street, form.city, form.state, form.zip].filter(Boolean).join(', '), '_address'],
    ['Phone', form.phone, 'phone'],
    ['Contact', form.contactName, 'contactName'],
    ['Contact Email', form.contactEmail, 'contactEmail'],
    ['Eligibility Email', form.eligibilityContactEmail, 'eligibilityContactEmail'],
    ['Eligibility Phone', form.eligibilityContactPhone, 'eligibilityContactPhone'],
    ['Billing Contact', form.billingContactName, 'billingContactName'],
    ['Billing Email', form.billingContactEmail, 'billingContactEmail'],
    ['Billing Phone', form.billingContactPhone, 'billingContactPhone'],
    ['WLT Group Number', form.wltGroupNumber, 'wltGroupNumber'],
    ['PPO Network', form.ppoNetwork, 'ppoNetwork'],
    ['PBM', form.pbm, 'pbm'],
    ['Section 125/Post-Tax', form.section125PostTax, 'section125PostTax'],
    ['Invoice Template', form.invoiceTemplate, 'invoiceTemplate'],
    ['Template', tpl?.name ?? templateKey, '_template'],
  ]

  const autoItems = [
    'Payment processor configured with List Bill defaults',
    `Invoice template set to ${form.invoiceTemplate}`,
    `Product template: ${tpl?.name ?? templateKey}`,
    `PBM defaulted to ${form.pbm}`,
    `PPO Network set to ${form.ppoNetwork}`,
  ]

  const amberItems = [
    !form.fein && 'FEIN not provided',
    !form.phone && 'Phone number missing',
    !form.contactEmail && 'Primary contact email missing',
  ].filter(Boolean) as string[]

  return (
    <div className="space-y-6">
      {isRFCMode && rfcData && (
        <div className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
          <Info className="h-5 w-5 shrink-0 text-primary-500" />
          <p className="text-sm text-primary-700">
            Created from RFC:{' '}
            <span className="font-semibold">{rfcData.legalName}</span>, submitted{' '}
            {formatDate(rfcData.dateSubmitted)}, RFC ID:{' '}
            <span className="font-mono text-xs">{rfcData.id}</span>
          </p>
        </div>
      )}

      <Card>
        <h4 className="text-section-title mb-4 text-gray-900">Group Summary</h4>
        <dl className="grid grid-cols-2 gap-4">
          {summaryFields.map(([label, value, fieldKey]) => {
            const tag = isRFCMode && rfcData ? getFieldTag(fieldKey, value, rfcData) : null
            return (
              <div key={label}>
                <dt className="text-xs font-medium uppercase text-gray-400">{label}</dt>
                <dd className="text-sm text-gray-800">
                  {value || '—'}
                  {tag && <FieldTag type={tag} />}
                </dd>
              </div>
            )
          })}
        </dl>
      </Card>

      <Card>
        <h4 className="text-section-title mb-3 text-gray-900">Auto-configured</h4>
        <ul className="space-y-2">
          {autoItems.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="h-4 w-4 text-success-500" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {amberItems.length > 0 && (
        <Card>
          <h4 className="text-section-title mb-3 text-gray-900">Needs Attention</h4>
          <ul className="space-y-2">
            {amberItems.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-warning-600">
                <AlertTriangle className="h-4 w-4 text-warning-500" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h4 className="text-section-title mb-3 text-gray-900">Products ({products.length})</h4>
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.productId} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-sm text-gray-700">{p.name}</span>
              <span className="text-sm font-medium text-gray-800">{formatCurrency(p.monthlyFee)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
