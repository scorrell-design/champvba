import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Check, ArrowRight, AlertTriangle, ArrowLeftRight } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge, GroupTags } from '../../components/ui/Badge'
import { SearchBar } from '../../components/ui/SearchBar'
import { DatePicker } from '../../components/forms/DatePicker'
import { Textarea } from '../../components/ui/Textarea'
import { InlineWarning } from '../../components/feedback/InlineWarning'
import { useToast } from '../../components/feedback/Toast'
import { useMember, useGroup, useGroups, useUpdateMember } from '../../hooks/useQueries'
import { useAuditStore } from '../../stores/audit-store'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { cn } from '../../utils/cn'
import type { Group } from '../../types/group'
import type { GroupStatus, ProductStatus } from '../../utils/constants'

// ── Types ───────────────────────────────────────────────────────────

const STEPS = ['Current Group', 'Select Destination', 'Product Comparison', 'Confirm']

interface ProductAction {
  productId: string
  name: string
  sourceStatus: 'on_member' | 'not_on_member'
  destStatus: 'on_dest' | 'not_on_dest'
  action: 'keep' | 'terminate' | 'add' | 'skip'
  fee: number
}

// ── Helpers ─────────────────────────────────────────────────────────

function endOfMonth(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return last.toISOString().split('T')[0]
}

const groupStatusVariant = (status: GroupStatus) => {
  const map: Record<GroupStatus, 'success' | 'gray' | 'warning'> = {
    Active: 'success',
    Inactive: 'gray',
    'Pending Setup': 'warning',
  }
  return map[status] ?? 'gray'
}

const productStatusVariant = (status: ProductStatus) => {
  const map: Record<ProductStatus, 'success' | 'info' | 'gray' | 'warning'> = {
    Active: 'success',
    'Future Active': 'info',
    Inactive: 'gray',
    Pending: 'warning',
  }
  return map[status] ?? 'gray'
}

// ── Progress Bar ────────────────────────────────────────────────────

const WizardProgress = ({ current }: { current: number }) => (
  <div className="mb-8 flex items-center justify-between">
    {STEPS.map((label, i) => {
      const completed = i < current
      const active = i === current
      return (
        <div key={label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                completed && 'bg-success-500 text-white',
                active && 'bg-primary-500 text-white',
                !completed && !active && 'bg-gray-200 text-gray-500',
              )}
            >
              {completed ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                'text-xs whitespace-nowrap',
                active ? 'font-medium text-primary-600' : 'text-gray-500',
              )}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('mx-2 h-0.5 flex-1', completed ? 'bg-success-500' : 'bg-gray-200')} />
          )}
        </div>
      )
    })}
  </div>
)

// ── Main Component ──────────────────────────────────────────────────

export const GroupReassignment = () => {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addToast = useToast((s) => s.addToast)
  const addAuditEntry = useAuditStore((s) => s.addEntry)
  const updateMember = useUpdateMember()

  const { data: member } = useMember(id)
  const { data: sourceGroup } = useGroup(member?.groupId ?? '')
  const { data: groups = [] } = useGroups()

  const [step, setStep] = useState(0)
  const [destGroup, setDestGroup] = useState<Group | null>(null)
  const [search, setSearch] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [notes, setNotes] = useState('')
  const [productActions, setProductActions] = useState<ProductAction[]>([])

  // ── Product comparison builder ────────────────────────────────────

  const buildProductActions = (dest: Group): ProductAction[] => {
    if (!member) return []
    const actions: ProductAction[] = []
    const destProductIds = new Set(dest.products.map((p) => p.productId))
    const memberProductIds = new Set(member.products.map((p) => p.productId))

    for (const mp of member.products) {
      actions.push({
        productId: mp.productId,
        name: mp.name,
        sourceStatus: 'on_member',
        destStatus: destProductIds.has(mp.productId) ? 'on_dest' : 'not_on_dest',
        action: destProductIds.has(mp.productId) ? 'keep' : 'terminate',
        fee: mp.fee,
      })
    }

    for (const dp of dest.products) {
      if (!memberProductIds.has(dp.productId)) {
        actions.push({
          productId: dp.productId,
          name: dp.name,
          sourceStatus: 'not_on_member',
          destStatus: 'on_dest',
          action: 'add',
          fee: dp.monthlyFee,
        })
      }
    }

    return actions
  }

  const handleSelectDest = (group: Group) => {
    setDestGroup(group)
    setProductActions(buildProductActions(group))
    setStep(2)
  }

  const setActionForProduct = (productId: string, action: ProductAction['action']) => {
    setProductActions((prev) =>
      prev.map((pa) => (pa.productId === productId ? { ...pa, action } : pa)),
    )
  }

  // ── Tag change warnings ───────────────────────────────────────────

  const tagWarnings = useMemo(() => {
    if (!sourceGroup || !destGroup) return []
    const warnings: string[] = []
    if (sourceGroup.isVBA !== destGroup.isVBA)
      warnings.push(destGroup.isVBA ? 'Member will gain VBA status' : 'Member will lose VBA status')
    if (sourceGroup.hasHSA !== destGroup.hasHSA)
      warnings.push(destGroup.hasHSA ? 'Destination group offers HSA' : 'Destination group does not offer HSA')
    if (sourceGroup.hasFirstStopHealth !== destGroup.hasFirstStopHealth)
      warnings.push(
        destGroup.hasFirstStopHealth
          ? 'Destination group has First Stop Health'
          : 'Destination group does not have First Stop Health',
      )
    if (sourceGroup.isOpenEnrollment !== destGroup.isOpenEnrollment)
      warnings.push(
        destGroup.isOpenEnrollment
          ? 'Destination group is in Open Enrollment'
          : 'Destination group is not in Open Enrollment',
      )
    return warnings
  }, [sourceGroup, destGroup])

  // ── Search / filter ───────────────────────────────────────────────

  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase().trim()
    return groups.filter((g) => {
      if (g.id === member?.groupId) return false
      if (g.status === 'Inactive') return false
      if (!q) return true
      return (
        g.legalName.toLowerCase().includes(q) ||
        g.dba.toLowerCase().includes(q) ||
        g.fein.toLowerCase().includes(q) ||
        g.cbsGroupId.toLowerCase().includes(q) ||
        g.wltGroupNumber.toLowerCase().includes(q)
      )
    })
  }, [groups, search, member?.groupId])

  // ── Confirm handler ───────────────────────────────────────────────

  const handleConfirm = () => {
    if (!member || !destGroup || !sourceGroup) return

    updateMember.mutate(
      {
        id: member.id,
        data: {
          groupId: destGroup.id,
          groupName: destGroup.legalName,
        },
      },
      {
        onSuccess: () => {
          addAuditEntry({
            entityType: 'Member',
            entityId: member.id,
            entityName: `${member.firstName} ${member.lastName}`,
            fieldChanged: 'Group',
            oldValue: `${sourceGroup.legalName} (${sourceGroup.cbsGroupId})`,
            newValue: `${destGroup.legalName} (${destGroup.cbsGroupId})`,
            changedBy: 'Stephanie C.',
            actionType: 'Group Reassignment',
          })
          addToast(
            'success',
            `${member.firstName} ${member.lastName} reassigned to ${destGroup.legalName} effective ${formatDate(effectiveDate)}`,
          )
          navigate(`/members/${member.id}`)
        },
        onError: () => addToast('error', 'Group reassignment failed'),
      },
    )
  }

  // ── Loading state ─────────────────────────────────────────────────

  if (!member || !sourceGroup) {
    return (
      <div>
        <PageHeader title="Group Reassignment" backLink={`/members/${id}`} />
        <Card>
          <p className="text-sm text-gray-500">Loading member data…</p>
        </Card>
      </div>
    )
  }

  const activeProducts = member.products.filter(
    (p) => p.status === 'Active' || p.status === 'Future Active',
  )
  const terminated = productActions.filter((pa) => pa.action === 'terminate')
  const added = productActions.filter((pa) => pa.action === 'add')
  const kept = productActions.filter((pa) => pa.action === 'keep')
  const skipped = productActions.filter((pa) => pa.action === 'skip')

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Group Reassignment"
        backLink={`/members/${id}`}
        description={
          <span className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            {member.firstName} {member.lastName} — {member.memberId}
          </span>
        }
      />
      <WizardProgress current={step} />

      {/* ── STEP 1: Current Group Context ────────────────────────── */}
      {step === 0 && (
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.firstName} {member.lastName}
                </h3>
                <p className="text-sm text-gray-500">Member ID: {member.memberId}</p>
              </div>
              <StatusBadge status={member.status} />
            </div>

            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Current Group</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Group Name:</span>{' '}
                  <Link
                    to={`/groups/${sourceGroup.id}`}
                    className="font-medium text-primary-600 hover:underline"
                  >
                    {sourceGroup.legalName}
                  </Link>
                </div>
                <div>
                  <span className="text-gray-500">CBS Group ID:</span>{' '}
                  <span className="font-medium">{sourceGroup.cbsGroupId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Agent:</span>{' '}
                  <span className="font-medium">
                    {sourceGroup.agentName} ({sourceGroup.agentNumber})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Status:</span>
                  <Badge variant={groupStatusVariant(sourceGroup.status)} dot>
                    {sourceGroup.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Plan Year:</span>{' '}
                  <span className="font-medium">
                    {formatDate(sourceGroup.planStartDate)} — {formatDate(sourceGroup.planEndDate)}
                  </span>
                </div>
                <div>
                  <GroupTags
                    isVBA={sourceGroup.isVBA}
                    hasHSA={sourceGroup.hasHSA}
                    hasFirstStopHealth={sourceGroup.hasFirstStopHealth}
                    isOpenEnrollment={sourceGroup.isOpenEnrollment}
                  />
                </div>
              </div>
            </div>
          </Card>

          {activeProducts.length > 0 && (
            <Card>
              <h4 className="mb-3 text-sm font-medium text-gray-900">Active Products</h4>
              <div className="space-y-2">
                {activeProducts.map((p) => (
                  <div
                    key={p.productId}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{p.productId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={productStatusVariant(p.status)} dot>
                        {p.status}
                      </Badge>
                      <span className="text-sm font-medium text-gray-700">
                        {formatCurrency(p.fee)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {member.dependents.length > 0 && (
            <Card>
              <h4 className="mb-3 text-sm font-medium text-gray-900">Dependents</h4>
              <div className="space-y-2">
                {member.dependents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">
                      {d.firstName} {d.lastName}
                    </span>
                    <span className="text-gray-500">{d.relationship}</span>
                  </div>
                ))}
              </div>
              <InlineWarning message="Dependents will also be reassigned." className="mt-3" />
            </Card>
          )}
        </div>
      )}

      {/* ── STEP 2: Select Destination Group ─────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, DBA, FEIN, CBS Group ID, or WLT Group #…"
          />

          {filteredGroups.length === 0 ? (
            <Card>
              <p className="text-center text-sm text-gray-500">
                {search ? 'No groups match your search.' : 'No eligible groups available.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredGroups.map((g) => (
                <Card key={g.id} className="transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900">{g.legalName}</h4>
                        <Badge variant={groupStatusVariant(g.status)} dot>
                          {g.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>CBS: {g.cbsGroupId}</span>
                        <span>FEIN: {g.fein}</span>
                        <span>Agent: {g.agentName}</span>
                        <span>
                          {g.products.length} product{g.products.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <GroupTags
                        isVBA={g.isVBA}
                        hasHSA={g.hasHSA}
                        hasFirstStopHealth={g.hasFirstStopHealth}
                        isOpenEnrollment={g.isOpenEnrollment}
                        className="mt-1"
                      />
                    </div>
                    <Button size="sm" onClick={() => handleSelectDest(g)}>
                      Select Group <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Product Comparison & Handling ────────────────── */}
      {step === 2 && destGroup && (
        <div className="space-y-6">
          {tagWarnings.length > 0 && (
            <div className="space-y-2">
              {tagWarnings.map((w) => (
                <InlineWarning key={w} message={w} />
              ))}
            </div>
          )}

          <Card>
            <h4 className="mb-4 text-sm font-medium text-gray-900">Product Comparison</h4>
            {productActions.length === 0 ? (
              <p className="text-sm text-gray-500">No products to compare.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-2 pr-4 font-medium text-gray-500">Product</th>
                      <th className="pb-2 pr-4 font-medium text-gray-500">Current Group</th>
                      <th className="pb-2 pr-4 font-medium text-gray-500">Destination</th>
                      <th className="pb-2 font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productActions.map((pa) => (
                      <tr key={pa.productId}>
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-900">{pa.name}</div>
                          <div className="text-xs text-gray-500">{formatCurrency(pa.fee)}</div>
                        </td>
                        <td className="py-3 pr-4">
                          {pa.sourceStatus === 'on_member' ? (
                            <Badge variant="success" dot>
                              On Member
                            </Badge>
                          ) : (
                            <Badge variant="gray">Not on Member</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {pa.destStatus === 'on_dest' ? (
                            <Badge variant="success" dot>
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="gray">Not Available</Badge>
                          )}
                        </td>
                        <td className="py-3">
                          {pa.sourceStatus === 'on_member' && pa.destStatus === 'on_dest' ? (
                            <Badge variant="info">Keep (Auto)</Badge>
                          ) : pa.sourceStatus === 'on_member' ? (
                            <div className="flex gap-3">
                              <label className="flex items-center gap-1.5">
                                <input
                                  type="radio"
                                  name={`action-${pa.productId}`}
                                  checked={pa.action === 'terminate'}
                                  onChange={() => setActionForProduct(pa.productId, 'terminate')}
                                  className="h-3.5 w-3.5 text-primary-500"
                                />
                                <span className="text-xs">Terminate</span>
                              </label>
                              <label className="flex items-center gap-1.5">
                                <input
                                  type="radio"
                                  name={`action-${pa.productId}`}
                                  checked={pa.action === 'keep'}
                                  onChange={() => setActionForProduct(pa.productId, 'keep')}
                                  className="h-3.5 w-3.5 text-primary-500"
                                />
                                <span className="text-xs">Keep</span>
                              </label>
                            </div>
                          ) : (
                            <div className="flex gap-3">
                              <label className="flex items-center gap-1.5">
                                <input
                                  type="radio"
                                  name={`action-${pa.productId}`}
                                  checked={pa.action === 'add'}
                                  onChange={() => setActionForProduct(pa.productId, 'add')}
                                  className="h-3.5 w-3.5 text-primary-500"
                                />
                                <span className="text-xs">Add</span>
                              </label>
                              <label className="flex items-center gap-1.5">
                                <input
                                  type="radio"
                                  name={`action-${pa.productId}`}
                                  checked={pa.action === 'skip'}
                                  onChange={() => setActionForProduct(pa.productId, 'skip')}
                                  className="h-3.5 w-3.5 text-primary-500"
                                />
                                <span className="text-xs">Skip</span>
                              </label>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <DatePicker
                    label="Effective Date"
                    value={effectiveDate}
                    onChange={setEffectiveDate}
                    required
                  />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setEffectiveDate(endOfMonth(new Date().toISOString()))}
                >
                  End of Month
                </Button>
              </div>

              <Textarea
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for reassignment…"
              />
            </div>
          </Card>
        </div>
      )}

      {/* ── STEP 4: Confirmation ─────────────────────────────────── */}
      {step === 3 && destGroup && (
        <div className="space-y-6">
          <Card>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Reassignment Summary</h4>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Member:</span>{' '}
                  <span className="font-medium">
                    {member.firstName} {member.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Member ID:</span>{' '}
                  <span className="font-medium">{member.memberId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Effective Date:</span>{' '}
                  <span className="font-medium">{formatDate(effectiveDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase text-gray-400">From</p>
                  <p className="font-semibold text-gray-900">{sourceGroup.legalName}</p>
                  <p className="text-xs text-gray-500">{sourceGroup.cbsGroupId}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase text-gray-400">To</p>
                  <p className="font-semibold text-gray-900">{destGroup.legalName}</p>
                  <p className="text-xs text-gray-500">{destGroup.cbsGroupId}</p>
                </div>
              </div>

              {sourceGroup.agentName !== destGroup.agentName && (
                <div className="text-sm">
                  <span className="text-gray-500">Agent Change:</span>{' '}
                  <span className="font-medium">{sourceGroup.agentName}</span>
                  <ArrowRight className="mx-1 inline h-3 w-3 text-gray-400" />
                  <span className="font-medium">{destGroup.agentName}</span>
                </div>
              )}

              {tagWarnings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Tag Changes:</p>
                  <div className="flex items-center gap-3">
                    <GroupTags
                      isVBA={sourceGroup.isVBA}
                      hasHSA={sourceGroup.hasHSA}
                      hasFirstStopHealth={sourceGroup.hasFirstStopHealth}
                      isOpenEnrollment={sourceGroup.isOpenEnrollment}
                    />
                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                    <GroupTags
                      isVBA={destGroup.isVBA}
                      hasHSA={destGroup.hasHSA}
                      hasFirstStopHealth={destGroup.hasFirstStopHealth}
                      isOpenEnrollment={destGroup.isOpenEnrollment}
                    />
                  </div>
                  {sourceGroup.isVBA !== destGroup.isVBA && (
                    <InlineWarning
                      message={
                        destGroup.isVBA
                          ? 'Member will gain VBA status'
                          : 'Member will lose VBA status'
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Product Changes</h4>
            <div className="space-y-4">
              {terminated.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase text-danger-600">Terminating</p>
                  {terminated.map((pa) => (
                    <div
                      key={pa.productId}
                      className="mb-1 flex items-center justify-between rounded border border-danger-100 bg-danger-50 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-danger-700">{pa.name}</span>
                      <span className="text-xs text-danger-600">Reason: Group Reassignment</span>
                    </div>
                  ))}
                </div>
              )}

              {added.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase text-success-600">Adding</p>
                  {added.map((pa) => (
                    <div
                      key={pa.productId}
                      className="mb-1 flex items-center justify-between rounded border border-success-100 bg-success-50 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-success-700">{pa.name}</span>
                      <span className="text-xs text-success-600">
                        {formatCurrency(pa.fee)}/mo — anticipated {formatDate(effectiveDate)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {kept.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase text-gray-500">Unchanged</p>
                  {kept.map((pa) => (
                    <div
                      key={pa.productId}
                      className="mb-1 flex items-center justify-between rounded border border-gray-100 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-gray-700">{pa.name}</span>
                      <span className="text-xs text-gray-500">{formatCurrency(pa.fee)}/mo</span>
                    </div>
                  ))}
                </div>
              )}

              {skipped.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase text-gray-400">Skipped</p>
                  {skipped.map((pa) => (
                    <div
                      key={pa.productId}
                      className="mb-1 rounded border border-gray-100 px-3 py-2 text-sm text-gray-400"
                    >
                      {pa.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {member.dependents.length > 0 && (
            <Card>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">
                Dependents Being Reassigned
              </h4>
              <div className="space-y-1">
                {member.dependents.map((d) => (
                  <div key={d.id} className="text-sm text-gray-700">
                    {d.firstName} {d.lastName}{' '}
                    <span className="text-gray-400">({d.relationship})</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {notes && (
            <Card>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">Notes</h4>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{notes}</p>
            </Card>
          )}
        </div>
      )}

      {/* ── Footer Navigation ────────────────────────────────────── */}
      <div className="mt-8 flex justify-between">
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(`/members/${id}`)}>
            Cancel
          </Button>
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
        </div>
        {step === 0 && (
          <Button onClick={() => setStep(1)}>Next</Button>
        )}
        {step === 2 && (
          <Button onClick={() => setStep(3)} disabled={!effectiveDate}>
            Next
          </Button>
        )}
        {step === 3 && (
          <Button onClick={handleConfirm} isLoading={updateMember.isPending}>
            Confirm Reassignment
          </Button>
        )}
      </div>
    </div>
  )
}
