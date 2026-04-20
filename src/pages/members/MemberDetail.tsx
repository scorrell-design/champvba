import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Pencil, XCircle, Plus, UserMinus, Lock, MinusCircle, ArrowLeftRight, RotateCcw } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { StatusBadge, MemberTags } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { DatePicker } from '../../components/forms/DatePicker'
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog'
import { useGroup } from '../../hooks/useQueries'
import { useMemberStore } from '../../stores/member-store'
import { logAuditEntry } from '../../utils/audit'
import { CURRENT_USER } from '../../constants/user'
import { useNotesStore } from '../../stores/notes-store'
import { useAuditStore } from '../../stores/audit-store'
import { useToast } from '../../components/feedback/Toast'
import { formatDate } from '../../utils/formatters'
import { MemberInfoCard } from './components/MemberInfoCard'
import { MemberProductsTab } from './components/MemberProductsTab'
import { MemberNotesTab } from './components/MemberNotesTab'
import { MemberHistoryTab } from './components/MemberHistoryTab'
import { EditMemberSlideOver } from './components/EditMemberSlideOver'
import { TerminateMemberModal } from './components/TerminateMemberModal'
import type { Dependent, DependentRelationship } from '../../types/member'

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'notes', label: 'Notes' },
  { id: 'dependents', label: 'Dependents' },
  { id: 'history', label: 'History' },
]

export const MemberDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const member = useMemberStore((state) => state.getMemberById(id!))
  const allMembers = useMemberStore((state) => state.members)
  const isLoading = false
  const { data: group } = useGroup(member?.groupId ?? '')
  const addAuditEntry = useAuditStore((s) => s.addEntry)
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState('products')
  const [editOpen, setEditOpen] = useState(false)
  const [terminateOpen, setTerminateOpen] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)
  const [localDeps, setLocalDeps] = useState<Dependent[] | null>(null)
  const updateMember = useMemberStore((s) => s.updateMember)

  const dependents = localDeps ?? member?.dependents ?? []
  const memberName = member ? `${member.firstName} ${member.lastName}` : ''

  const primaryMember = useMemo(() => {
    if (!member?.primaryMemberId) return null
    return allMembers.find((m) => m.id === member.primaryMemberId) ?? null
  }, [member?.primaryMemberId, allMembers])

  const handleAddDependent = (form: DependentFormState) => {
    const newDep: Dependent = {
      id: `dep-new-${Date.now().toString(36)}`,
      firstName: form.firstName,
      lastName: form.lastName,
      relationship: form.relationship as DependentRelationship,
      dob: form.dob,
      ssn: form.ssn || undefined,
      gender: form.gender,
      status: 'Active',
      effectiveDate: form.effectiveDate,
      sameAddressAsMember: form.sameAddressAsMember,
    }
    setLocalDeps([...dependents, newDep])
    addAuditEntry({
      entityType: 'Member',
      entityId: member!.id,
      entityName: memberName,
      fieldChanged: 'Dependent',
      oldValue: '',
      newValue: `Added: ${form.firstName} ${form.lastName} (${form.relationship})`,
      changedBy: CURRENT_USER,
      actionType: 'Dependent Added',
    })
    addToast('success', `Dependent ${form.firstName} ${form.lastName} added`)
  }

  const handleEditDependent = (depId: string, form: DependentFormState) => {
    setLocalDeps(dependents.map((d) =>
      d.id === depId
        ? { ...d, firstName: form.firstName, lastName: form.lastName, relationship: form.relationship as DependentRelationship, dob: form.dob, ssn: form.ssn || undefined, gender: form.gender, effectiveDate: form.effectiveDate, sameAddressAsMember: form.sameAddressAsMember }
        : d
    ))
    addAuditEntry({
      entityType: 'Member',
      entityId: member!.id,
      entityName: memberName,
      fieldChanged: 'Dependent',
      oldValue: '',
      newValue: `Updated: ${form.firstName} ${form.lastName}`,
      changedBy: CURRENT_USER,
      actionType: 'Dependent Updated',
    })
    addToast('success', `Dependent ${form.firstName} ${form.lastName} updated`)
  }

  const handleDeactivateDependent = (depId: string) => {
    const dep = dependents.find((d) => d.id === depId)
    setLocalDeps(dependents.map((d) => d.id === depId ? { ...d, status: 'Inactive' as const } : d))
    addAuditEntry({
      entityType: 'Member',
      entityId: member!.id,
      entityName: memberName,
      fieldChanged: 'Dependent',
      oldValue: 'Active',
      newValue: `Deactivated: ${dep?.firstName} ${dep?.lastName}`,
      changedBy: CURRENT_USER,
      actionType: 'Dependent Removed',
    })
    addToast('success', `Dependent ${dep?.firstName} ${dep?.lastName} deactivated`)
  }

  const addedNotes = useNotesStore((s) => (member ? s.added[member.id] : undefined))
  const userNotes = useMemo(() => {
    if (!member) return []
    const all = [...(addedNotes ?? []), ...member.notes]
    return all.filter((n) => n.type !== 'History Note')
  }, [addedNotes, member])

  useEffect(() => {
    if (searchParams.get('edit') === 'true' && member) {
      setEditOpen(true)
      setSearchParams({}, { replace: true })
    }
    if (searchParams.get('terminate') === 'true' && member) {
      setTerminateOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, member, setSearchParams])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p>Member not found</p>
      </div>
    )
  }

  const tabsWithCounts = TABS.map((t) => {
    if (t.id === 'products') return { ...t, count: member.products.length }
    if (t.id === 'notes') return { ...t, count: userNotes.length }
    if (t.id === 'dependents') return { ...t, count: dependents.length }
    return t
  })

  return (
    <div>
      <PageHeader
        title={`${member.firstName} ${member.lastName}`}
        backLink="/members"
        description={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-600">
              <Lock className="h-3 w-3 text-gray-400" />
              {member.memberId}
            </span>
            {member.relationship !== 'Primary' && (
              <Badge variant="gray">Dependent — {member.relationship}</Badge>
            )}
            {member.relationship !== 'Primary' && primaryMember && (
              <span className="text-sm text-gray-500">
                Primary:{' '}
                <Link to={`/members/${member.primaryMemberId}`} className="font-medium text-primary-600 hover:underline">
                  {primaryMember.firstName} {primaryMember.lastName}
                </Link>
              </span>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            {group && (
              <MemberTags
                isVBA={group.isVBA}
                hasHSA={group.hasHSA}
                hasFirstStopHealth={group.hasFirstStopHealth}
                isOpenEnrollment={group.isOpenEnrollment}
                isAppUser={member.isAppUser}
                relationship={member.relationship}
              />
            )}
            <StatusBadge status={member.status} />
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit Member
            </Button>
            {member.status === 'Terminated' ? (
              <Button variant="primary" onClick={() => setReactivateOpen(true)}>
                <RotateCcw className="h-4 w-4" />
                Reactivate Member
              </Button>
            ) : member.status !== 'Inactive' && member.status !== 'Merged' ? (
              <>
                <Button variant="danger" onClick={() => setTerminateOpen(true)}>
                  <XCircle className="h-4 w-4" />
                  Terminate
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    addAuditEntry({
                      entityType: 'Member',
                      entityId: member.id,
                      entityName: memberName,
                      fieldChanged: 'Status',
                      oldValue: member.status,
                      newValue: 'Inactive',
                      changedBy: CURRENT_USER,
                      actionType: 'Status Changed',
                    })
                    addToast('success', `${memberName} marked inactive`)
                  }}
                >
                  <MinusCircle className="h-4 w-4" />
                  Mark Inactive
                </Button>
                <Link to={`/members/${id}/reassign`}>
                  <Button variant="ghost">
                    <ArrowLeftRight className="h-4 w-4" />
                    Reassign Group
                  </Button>
                </Link>
              </>
            ) : null}
          </div>
        }
      />

      <MemberInfoCard member={member} />

      <div className="mt-6">
        <Tabs tabs={tabsWithCounts} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-4">
          {activeTab === 'products' && <MemberProductsTab products={member.products} groupId={member.groupId} />}
          {activeTab === 'notes' && <MemberNotesTab memberId={member.id} memberName={`${member.firstName} ${member.lastName}`} notes={member.notes} />}
          {activeTab === 'dependents' && (
            <DependentsTab
              dependents={dependents}
              onAdd={handleAddDependent}
              onEdit={handleEditDependent}
              onDeactivate={handleDeactivateDependent}
            />
          )}
          {activeTab === 'history' && <MemberHistoryTab memberId={member.id} />}
        </div>
      </div>

      <EditMemberSlideOver open={editOpen} onClose={() => setEditOpen(false)} member={member} />
      <TerminateMemberModal
        open={terminateOpen}
        onClose={() => setTerminateOpen(false)}
        member={member}
      />
      <ReactivateMemberModal
        open={reactivateOpen}
        onClose={() => setReactivateOpen(false)}
        member={member}
        group={group ?? null}
        onReactivate={(data) => {
          try {
            const idsToReactivate = data.productIdsToReactivate ?? member.products.filter((p) => p.status === 'Inactive').map((p) => p.productId)
            const updatedProducts = member.products.map((p) =>
              idsToReactivate.includes(p.productId) ? { ...p, status: 'Active' as const, inactiveDate: undefined, inactiveReason: undefined } : p,
            )
            updateMember(member.id, { status: 'Active', products: updatedProducts, inactiveDate: undefined, inactiveReason: undefined })

            logAuditEntry({
              entityType: 'Member',
              entityId: member.id,
              entityName: memberName,
              fieldChanged: 'Status',
              oldValue: 'Terminated',
              newValue: `Active (Reactivation date: ${data.effectiveDate}, Reason: ${data.reason}, ${idsToReactivate.length} product${idsToReactivate.length !== 1 ? 's' : ''} reactivated)`,
              action: 'Member Reactivated',
            })
            addToast('success', `${memberName} has been reactivated`)
            setReactivateOpen(false)
          } catch {
            addToast('error', 'Failed to reactivate member')
          }
        }}
        isLoading={false}
      />
    </div>
  )
}

function ReactivateMemberModal({
  open,
  onClose,
  member,
  group,
  onReactivate,
  isLoading,
}: {
  open: boolean
  onClose: () => void
  member: { firstName: string; lastName: string; status: string; groupId: string; products: Array<{ productId: string; name: string; status: string; fee: number }> }
  group: { id: string; legalName: string; status: string } | null
  onReactivate: (data: { reason: string; effectiveDate: string; notes?: string; productIdsToReactivate?: string[] }) => void
  isLoading: boolean
}) {
  const today = new Date().toISOString().split('T')[0]
  const [reason, setReason] = useState('')
  const [effectiveDate, setEffectiveDate] = useState(today)
  const [notes, setNotes] = useState('')
  const inactiveProducts = member.products.filter((p) => p.status === 'Inactive')
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    () => new Set(inactiveProducts.map((p) => p.productId)),
  )

  const toggleProduct = (pid: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      if (next.has(pid)) next.delete(pid)
      else next.add(pid)
      return next
    })
  }

  const groupIsInactive = group && group.status !== 'Active'

  const handleSubmit = () => {
    onReactivate({
      reason,
      effectiveDate,
      notes: notes.trim() || undefined,
      productIdsToReactivate: [...selectedProductIds],
    })
  }

  const canSubmit = reason.trim().length > 0 && !!effectiveDate

  return (
    <Modal open={open} onClose={onClose} title="Reactivate Member" size="lg">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-400">Member</p>
            <p className="text-sm font-semibold text-gray-900">{member.firstName} {member.lastName}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-400">Group ID</p>
            <p className="text-sm font-semibold text-gray-900">
              {group ? `${group.id} — ${group.legalName}` : member.groupId}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-800">
            This will change the member's status from <span className="font-semibold">Terminated</span> to <span className="font-semibold">Active</span>.
          </p>
        </div>

        {groupIsInactive && (
          <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" />
            <p className="text-sm text-danger-700">
              This member's group <span className="font-semibold">{group!.legalName}</span> is currently <span className="font-semibold">{group!.status}</span>.
              Reactivating will restore the member, but they will need to be assigned to an active group.
            </p>
          </div>
        )}

        <DatePicker
          label="Reactivation Date"
          value={effectiveDate}
          onChange={setEffectiveDate}
          required
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Reason for Reactivation <span className="text-danger-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="Explain why this member is being reactivated…"
            required
          />
        </div>

        {inactiveProducts.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Products to Reactivate
            </label>
            <p className="mb-2 text-xs text-gray-500">
              The following products were inactive at the time of termination. Select which to restore.
            </p>
            <div className="space-y-1 rounded-lg border border-gray-200 bg-white p-2">
              {inactiveProducts.map((p) => (
                <label
                  key={p.productId}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.has(p.productId)}
                    onChange={() => toggleProduct(p.productId)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
                  />
                  <span className="flex-1 text-sm text-gray-800">{p.name}</span>
                  <span className="text-xs text-gray-400">{p.productId}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {selectedProductIds.size} of {inactiveProducts.length} product{inactiveProducts.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Additional Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="Optional notes…"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} isLoading={isLoading}>
            Confirm Reactivation
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const RELATIONSHIP_OPTIONS = [
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Child', label: 'Child' },
  { value: 'Domestic Partner', label: 'Domestic Partner' },
  { value: 'Other', label: 'Other' },
]

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
]

interface DependentFormState {
  firstName: string
  lastName: string
  relationship: DependentRelationship | ''
  dob: string
  ssn: string
  gender: string
  effectiveDate: string
  sameAddressAsMember: boolean
}

const emptyForm: DependentFormState = {
  firstName: '',
  lastName: '',
  relationship: '',
  dob: '',
  ssn: '',
  gender: '',
  effectiveDate: '',
  sameAddressAsMember: true,
}

function maskSSN(ssn?: string) {
  if (!ssn) return '—'
  if (ssn.length >= 9) return `***-**-${ssn.slice(-4)}`
  return ssn
}

const DependentsTab = ({
  dependents,
  onAdd,
  onEdit,
  onDeactivate,
}: {
  dependents: Dependent[]
  onAdd: (dep: DependentFormState) => void
  onEdit: (id: string, dep: DependentFormState) => void
  onDeactivate: (id: string) => void
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deactivateId, setDeactivateId] = useState<string | null>(null)
  const [form, setForm] = useState<DependentFormState>(emptyForm)

  const set = (key: keyof DependentFormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const canSave = form.firstName && form.lastName && form.relationship && form.dob && form.gender && form.effectiveDate

  const openAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (dep: Dependent) => {
    setForm({
      firstName: dep.firstName,
      lastName: dep.lastName,
      relationship: dep.relationship,
      dob: dep.dob,
      ssn: dep.ssn ?? '',
      gender: dep.gender,
      effectiveDate: dep.effectiveDate,
      sameAddressAsMember: dep.sameAddressAsMember,
    })
    setEditingId(dep.id)
    setModalOpen(true)
  }

  const handleSave = () => {
    if (editingId) {
      onEdit(editingId, form)
    } else {
      onAdd(form)
    }
    setModalOpen(false)
  }

  const depToDeactivate = deactivateId ? dependents.find((d) => d.id === deactivateId) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Dependents ({dependents.length})</h4>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add Dependent
        </Button>
      </div>

      {dependents.length === 0 ? (
        <Card>
          <p className="py-6 text-center text-sm text-gray-400">No dependents on file.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Relationship</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">DOB</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">SSN</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Gender</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dependents.map((dep) => (
                <tr key={dep.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {dep.memberId ? (
                      <Link to={`/members/${dep.memberId}`} className="text-primary-600 hover:underline">
                        {dep.firstName} {dep.lastName}
                      </Link>
                    ) : (
                      <>{dep.firstName} {dep.lastName}</>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{dep.relationship}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(dep.dob)}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{maskSSN(dep.ssn)}</td>
                  <td className="px-4 py-3 text-gray-600">{dep.gender}</td>
                  <td className="px-4 py-3">
                    <Badge variant={dep.status === 'Active' ? 'success' : 'gray'} dot>{dep.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(dep)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {dep.status === 'Active' && (
                        <Button variant="ghost" size="sm" className="text-danger-500" onClick={() => setDeactivateId(dep.id)}>
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Dependent' : 'Add Dependent'}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required />
          <Input label="Last Name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required />
          <Select
            label="Relationship"
            value={form.relationship}
            onChange={(e) => set('relationship', e.target.value)}
            options={RELATIONSHIP_OPTIONS}
            placeholder="Select…"
            required
          />
          <DatePicker label="Date of Birth" value={form.dob} onChange={(v) => set('dob', v)} required />
          <Input label="SSN" value={form.ssn} onChange={(e) => set('ssn', e.target.value)} placeholder="XXX-XX-XXXX" />
          <Select
            label="Gender"
            value={form.gender}
            onChange={(e) => set('gender', e.target.value)}
            options={GENDER_OPTIONS}
            placeholder="Select…"
            required
          />
          <DatePicker label="Effective Date" value={form.effectiveDate} onChange={(v) => set('effectiveDate', v)} required />
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.sameAddressAsMember}
                onChange={(e) => set('sameAddressAsMember', e.target.checked)}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-200"
              />
              Same address as member
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {editingId ? 'Save Changes' : 'Add Dependent'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deactivateId}
        onClose={() => setDeactivateId(null)}
        onConfirm={() => {
          if (deactivateId) onDeactivate(deactivateId)
          setDeactivateId(null)
        }}
        title="Deactivate Dependent"
        message={depToDeactivate ? `Are you sure you want to deactivate ${depToDeactivate.firstName} ${depToDeactivate.lastName}?` : ''}
        confirmLabel="Deactivate"
        confirmVariant="danger"
      />
    </div>
  )
}
