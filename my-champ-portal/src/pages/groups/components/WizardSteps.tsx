import { useState, useMemo, useEffect } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Check, AlertTriangle, Info } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { SearchBar } from '../../../components/ui/SearchBar'
import { DataTable } from '../../../components/ui/DataTable'
import { cn } from '../../../utils/cn'
import { formatCurrency } from '../../../utils/formatters'
import { PRODUCT_TEMPLATES } from '../../../data/products'
import { US_STATES } from '../../../utils/constants'

// ── Shared types ─────────────────────────────────────────────────────

export interface WizardAgent {
  id: string
  name: string
  number: string
  company: string
  phone: string
  email: string
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
  wltGroupNumber: string
  ppoNetwork: string
  pbm: string
  invoiceTemplate: string
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

// ── Step 1: Agent Lookup ─────────────────────────────────────────────

export const StepAgent = ({
  agent,
  onSelect,
}: {
  agent: WizardAgent | null
  onSelect: (a: WizardAgent) => void
}) => {
  const [search, setSearch] = useState('')
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
}: {
  form: WizardFormData
  onChange: (f: WizardFormData) => void
}) => {
  const set = (field: keyof WizardFormData, value: string) =>
    onChange({ ...form, [field]: value })

  const tmHwCode = form.wltGroupNumber ? `HW-${form.wltGroupNumber}` : ''
  const tpaCode = form.wltGroupNumber ? `TPA-${form.wltGroupNumber}` : ''

  return (
    <Card>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Legal Name" value={form.legalName} onChange={(e) => set('legalName', e.target.value)} required />
        <Input label="DBA" value={form.dba} onChange={(e) => set('dba', e.target.value)} />
        <Input label="FEIN" value={form.fein} onChange={(e) => set('fein', e.target.value)} placeholder="##-#######" required />
        <Input label="Street" value={form.street} onChange={(e) => set('street', e.target.value)} />
        <Input label="Street 2" value={form.street2} onChange={(e) => set('street2', e.target.value)} />
        <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
        <Select label="State" value={form.state} onChange={(e) => set('state', e.target.value)} options={stateOptions} placeholder="Select state" />
        <Input label="ZIP" value={form.zip} onChange={(e) => set('zip', e.target.value)} />
        <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        <Input label="Primary Contact Name" value={form.contactName} onChange={(e) => set('contactName', e.target.value)} />
        <Input label="Primary Contact Email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
        <Input label="WLT Group Number" value={form.wltGroupNumber} onChange={(e) => set('wltGroupNumber', e.target.value)} />
        {form.wltGroupNumber && (
          <>
            <Input label="TM/HW Code" value={tmHwCode} disabled />
            <Input label="TPA Group Code" value={tpaCode} disabled />
          </>
        )}
        <Input label="PPO Network" value={form.ppoNetwork} onChange={(e) => set('ppoNetwork', e.target.value)} />
        <Input label="PBM" value={form.pbm} onChange={(e) => set('pbm', e.target.value)} />
        <div className="col-span-2">
          <Input label="Invoice Template" value={form.invoiceTemplate} onChange={(e) => set('invoiceTemplate', e.target.value)} />
        </div>
      </div>
    </Card>
  )
}

// ── Step 3: Product Template ─────────────────────────────────────────

export const StepTemplate = ({
  templateKey,
  onTemplateChange,
  products,
  onProductsChange,
}: {
  templateKey: string
  onTemplateChange: (k: string) => void
  products: WizardTemplateProduct[]
  onProductsChange: (p: WizardTemplateProduct[]) => void
}) => {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {TEMPLATE_KEYS.map((key) => {
          const tpl = PRODUCT_TEMPLATES[key]
          const selected = templateKey === key
          return (
            <button
              key={key}
              onClick={() => onTemplateChange(key)}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-colors',
                selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <p className={cn('text-sm font-medium', selected ? 'text-primary-700' : 'text-gray-700')}>
                {tpl.name}
              </p>
              <p className="mt-1 text-xs text-gray-500">{tpl.products.length} products</p>
            </button>
          )
        })}
      </div>

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

export const StepPayment = () => (
  <div className="space-y-4">
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
                'mt-0.5 text-sm',
                OVERRIDE_KEYS.has(label) ? 'font-medium text-warning-600' : 'text-gray-800',
              )}
            >
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
}: {
  agent: WizardAgent | null
  form: WizardFormData
  templateKey: string
  products: WizardTemplateProduct[]
}) => {
  const tpl = PRODUCT_TEMPLATES[templateKey]

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
      <Card>
        <h4 className="text-section-title mb-4 text-gray-900">Group Summary</h4>
        <dl className="grid grid-cols-2 gap-4">
          {([
            ['Legal Name', form.legalName],
            ['DBA', form.dba],
            ['FEIN', form.fein],
            ['Agent', agent ? `${agent.name} (${agent.number})` : '—'],
            ['Address', [form.street, form.city, form.state, form.zip].filter(Boolean).join(', ')],
            ['Template', tpl?.name ?? templateKey],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase text-gray-400">{label}</dt>
              <dd className="text-sm text-gray-800">{value || '—'}</dd>
            </div>
          ))}
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
