import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Copy, Plus, Building2 } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { DataTable } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { SearchBar } from '../../components/ui/SearchBar'
import { useToast } from '../../components/feedback/Toast'
import { useGroups } from '../../hooks/useQueries'
import { formatCurrency } from '../../utils/formatters'
import type { ColumnDef } from '@tanstack/react-table'

interface CommissionRecord {
  id: string
  groupName: string
  productName: string
  productId: string
  payoutType: string
  payoutAmount: number
  pricingBasis: string
  entity: string
}

const MOCK_COMMISSIONS: CommissionRecord[] = [
  { id: 'c-1', groupName: 'Apex Manufacturing LLC', productName: 'Champion Employer Fee', productId: '37618', payoutType: 'Percent', payoutAmount: 10, pricingBasis: 'Product', entity: 'Champion Health (MAIN)' },
  { id: 'c-2', groupName: 'Apex Manufacturing LLC', productName: 'Champ 125 Plan', productId: '37680', payoutType: 'Percent', payoutAmount: 8, pricingBasis: 'Product', entity: 'Champion Health (MAIN)' },
  { id: 'c-3', groupName: 'Apex Manufacturing LLC', productName: 'CHAMP Claims Funding', productId: '40624', payoutType: 'Flat Dollar', payoutAmount: 15, pricingBasis: 'Product', entity: 'Pinnacle Benefits Group' },
  { id: 'c-4', groupName: 'Redwood Financial Services', productName: 'Champion Employer Fee', productId: '37618', payoutType: 'Percent', payoutAmount: 10, pricingBasis: 'Product', entity: 'Champion Health (MAIN)' },
  { id: 'c-5', groupName: 'Redwood Financial Services', productName: 'HSA Product', productId: '37700', payoutType: 'Percent', payoutAmount: 5, pricingBasis: 'Product', entity: 'Pacific Brokers Alliance' },
  { id: 'c-6', groupName: 'Coastal Logistics Group', productName: 'Champion Employer Fee', productId: '37618', payoutType: 'Percent', payoutAmount: 10, pricingBasis: 'Product', entity: 'Champion Health (MAIN)' },
  { id: 'c-7', groupName: 'Coastal Logistics Group', productName: 'First Stop Post-tax Premium', productId: '37750', payoutType: 'Flat Dollar', payoutAmount: 12, pricingBasis: 'Product', entity: 'Southeast Benefits Consulting' },
  { id: 'c-8', groupName: 'Summit Healthcare Partners', productName: 'Champion Employer Fee', productId: '37618', payoutType: 'Percent', payoutAmount: 10, pricingBasis: 'Product', entity: 'Champion Health (MAIN)' },
]

const columns: ColumnDef<CommissionRecord, unknown>[] = [
  { accessorKey: 'groupName', header: 'Group', cell: (info) => <span className="font-medium text-gray-800">{info.getValue() as string}</span> },
  { accessorKey: 'productName', header: 'Product', cell: (info) => <span>{info.getValue() as string}</span> },
  { accessorKey: 'productId', header: 'Product ID', cell: (info) => <span className="text-gray-500">{info.getValue() as string}</span> },
  { accessorKey: 'entity', header: 'Payout Entity' },
  { accessorKey: 'payoutType', header: 'Type', cell: (info) => <Badge variant="gray">{info.getValue() as string}</Badge> },
  {
    accessorKey: 'payoutAmount',
    header: 'Amount',
    cell: (info) => {
      const row = info.row.original
      return row.payoutType === 'Percent' ? `${info.getValue()}%` : formatCurrency(info.getValue() as number)
    },
  },
  { accessorKey: 'pricingBasis', header: 'Pricing Basis' },
]

export function CommissionsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { addToast } = useToast()
  const { data: groups } = useGroups()

  const filtered = search
    ? MOCK_COMMISSIONS.filter(
        (c) =>
          c.groupName.toLowerCase().includes(search.toLowerCase()) ||
          c.productName.toLowerCase().includes(search.toLowerCase()),
      )
    : MOCK_COMMISSIONS

  const tabs = [
    { id: 'all', label: 'All Commissions', count: MOCK_COMMISSIONS.length },
    { id: 'setup', label: 'Commission Setup' },
    { id: 'copy', label: 'Copy Commissions' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commission Management"
        description="Configure and manage commissions across groups and products."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setCopyModalOpen(true)}>
              <Copy className="mr-2 h-4 w-4" /> Copy Commissions
            </Button>
            <Button variant="primary">
              <Plus className="mr-2 h-4 w-4" /> Add Commission
            </Button>
          </div>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'all' && (
        <div className="space-y-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by group or product..." />
          <DataTable columns={columns} data={filtered} emptyMessage="No commission records found" emptyIcon={DollarSign} />
        </div>
      )}

      {activeTab === 'setup' && <CommissionSetup groups={groups} />}

      {activeTab === 'copy' && <CopyCommissions onCopy={() => addToast('success', 'Commissions copied successfully')} />}

      <CopyCommissionsModal open={copyModalOpen} onClose={() => setCopyModalOpen(false)} onCopy={() => { setCopyModalOpen(false); addToast('success', 'Commissions copied successfully') }} />
    </div>
  )
}

function CommissionSetup({ groups }: { groups?: { id: string; legalName: string }[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="text-section-title text-gray-900">Payouts</h3>
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Group/Broker Tree Payouts</h4>
            {['Champion Health (MAIN)', 'CBS Internal Admin Level', 'Selling Broker'].map((entity) => (
              <div key={entity} className="flex items-center gap-3 border-b border-gray-100 py-2">
                <span className="w-48 text-sm text-gray-600">{entity}</span>
                <Select options={[{ value: 'percent', label: 'Percent' }, { value: 'flat', label: 'Flat Dollar' }]} className="w-32" />
                <Input placeholder="0.00" className="w-24" />
              </div>
            ))}
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Dynamic Payouts</h4>
            {['Enroller for Member Product', 'Assigned for Member Product'].map((label) => (
              <div key={label} className="flex items-center gap-3 border-b border-gray-100 py-2">
                <span className="w-48 text-sm text-gray-600">{label}</span>
                <Select options={[{ value: 'percent', label: 'Percent' }, { value: 'flat', label: 'Flat Dollar' }]} className="w-32" />
                <Input placeholder="0.00" className="w-24" />
              </div>
            ))}
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Miscellaneous Payouts</h4>
            <div className="flex items-center gap-3 py-2">
              <Input placeholder="Group/Broker ID" className="w-48" />
              <Select options={[{ value: 'percent', label: 'Percent' }, { value: 'flat', label: 'Flat Dollar' }]} className="w-32" />
              <Input placeholder="0.00" className="w-24" />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-section-title text-gray-900">Commission Filters</h3>
        <div className="mt-4 space-y-4">
          <Select label="Pay based on Price Type" options={[{ value: 'product', label: 'Product' }, { value: 'benefit', label: 'Benefit' }]} />
          <Select label="Pay based on Benefit" options={[{ value: 'ee', label: 'Employee Only' }, { value: 'es', label: 'Employee + Spouse' }, { value: 'ef', label: 'Employee + Family' }]} />
          <Select label="Pay based on Payment Period" options={[{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }]} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">Pay based on Price Amount</label>
            <div className="flex items-center gap-2">
              <Input placeholder="$ Min" className="w-32" />
              <span className="text-gray-400">to</span>
              <Input placeholder="$ Max" className="w-32" />
            </div>
          </div>
          <Input label="Non-commissionable amount ($)" placeholder="0.00" />
          <Input label="Pay until transaction #" placeholder="e.g., 12" />
          <Input label="Include for payment numbers" placeholder="1,13,25" />
          <Input label="Exclude for payment numbers" placeholder="1,13,25" />
        </div>
        <div className="mt-6">
          <Button variant="primary">Save Commission</Button>
        </div>
      </Card>

      {groups && groups.length > 0 && (
        <Card className="lg:col-span-2">
          <h3 className="text-section-title text-gray-900">Select Group</h3>
          <p className="mt-1 text-sm text-gray-500">Choose a group to configure commissions for</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <Link key={g.id} to={`/groups/${g.id}`} className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-800">{g.legalName}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function CopyCommissions({ onCopy }: { onCopy: () => void }) {
  return (
    <Card>
      <h3 className="text-section-title text-gray-900">Copy Commissions</h3>
      <p className="mt-1 text-sm text-gray-500">Copy commission configurations from one group to others.</p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Input label="Copy FROM Group/Broker ID" placeholder="Enter source group ID" />
          <Select label="Copy Product IDs" options={[
            { value: '37618', label: 'Champion Employer Fee (37618)' },
            { value: '37680', label: 'Champ 125 Plan (37680)' },
            { value: '40624', label: 'CHAMP Claims Funding (40624)' },
            { value: '37700', label: 'HSA Product (37700)' },
            { value: '37750', label: 'First Stop Post-tax Premium (37750)' },
          ]} />
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">Copy TO Group/Broker IDs</label>
            <textarea rows={4} className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200" placeholder="Enter IDs (one per line or comma-separated)" />
          </div>
          <Select label="Existing Commissions" options={[{ value: 'leave', label: 'Leave as-is' }, { value: 'delete', label: 'Delete existing' }]} />
          <Select label="Tree Payouts" options={[{ value: 'adjust-all', label: 'Adjust all' }, { value: 'selling-only', label: 'Only adjust selling group/broker' }, { value: 'none', label: 'Do not adjust' }]} />
          <Select label="Preview Mode" options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes (show what would change)' }]} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="primary" onClick={onCopy}>Copy Commissions</Button>
      </div>
    </Card>
  )
}

function CopyCommissionsModal({ open, onClose, onCopy }: { open: boolean; onClose: () => void; onCopy: () => void }) {
  const [sourceSearch, setSourceSearch] = useState('')

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} title="Copy Commissions" size="lg">
      <div className="space-y-4 p-4">
        <SearchBar value={sourceSearch} onChange={setSourceSearch} placeholder="Search source group..." />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">Source Group ID</label>
            <Input placeholder="e.g., GB-10234" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-500">Destination Group IDs</label>
            <Input placeholder="Comma-separated IDs" />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onCopy}>Copy</Button>
        </div>
      </div>
    </Modal>
  )
}
