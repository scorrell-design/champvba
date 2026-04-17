import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { TypeBadge } from '../../components/ui/Badge'
import { DatePicker } from '../../components/forms/DatePicker'
import { SearchDropdown } from '../../components/forms/SearchDropdown'
import { useGroups, useCreateMember, useMembers } from '../../hooks/useQueries'
import { useToast } from '../../components/feedback/Toast'
import { useAuditStore } from '../../stores/audit-store'
import { addMemberSchema, type AddMemberFormData } from '../../utils/schemas'
import { US_STATES, HOLD_REASONS } from '../../utils/constants'
import type { Member } from '../../types/member'
import { formatDate } from '../../utils/formatters'

const STATE_OPTIONS = US_STATES.map((s) => ({ value: s, label: s }))
const HOLD_OPTIONS = [
  { value: '', label: 'None' },
  ...HOLD_REASONS.map((r) => ({ value: r, label: r })),
]

export const AddNewHire = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [ssnCheckResult, setSsnCheckResult] = useState<{ found: boolean; member?: any } | null>(null)
  const { data: groups = [] } = useGroups()
  const { data: allMembers = [] } = useMembers()
  const mutation = useCreateMember()
  const addToast = useToast((s) => s.addToast)
  const addAuditEntry = useAuditStore((s) => s.addEntry)

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema) as never,
    defaultValues: {
      firstName: '',
      lastName: '',
      dob: '',
      email: '',
      phone: '',
      ssn: '',
      groupId: '',
      coverageEffectiveDate: '',
      planId: '',
      vbaEligible: false,
      employeeId: '',
      address: { street: '', city: '', state: '', zip: '' },
      dependents: 0,
      optIn: false,
      holdReason: '',
    },
  })

  const groupOptions = useMemo(
    () =>
      groups.map((g) => ({
        value: g.id,
        label: g.legalName,
        description: `${g.memberCount} members`,
      })),
    [groups],
  )

  const watchedGroupId = watch('groupId')
  const watchedVba = watch('vbaEligible')
  const watchedCovDate = watch('coverageEffectiveDate')

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === watchedGroupId),
    [groups, watchedGroupId],
  )

  const planOptions = useMemo(() => {
    if (!selectedGroup) return []
    return selectedGroup.products.map((p) => ({
      value: p.productId,
      label: p.name,
    }))
  }, [selectedGroup])

  const watchedPlanId = watch('planId')

  useEffect(() => {
    if (selectedGroup) {
      const valid = selectedGroup.products.some(p => p.productId === watchedPlanId)
      if (!valid && watchedPlanId) {
        setValue('planId', '')
      }
    }
  }, [watchedGroupId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleContinue = async () => {
    const valid = await trigger()
    if (valid) setStep(2)
  }

  const onSubmit = (data: AddMemberFormData) => {
    mutation.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        email: data.email,
        phone: data.phone,
        ssn: data.ssn,
        groupId: data.groupId,
        groupName: selectedGroup?.legalName ?? '',
        coverageEffectiveDate: data.coverageEffectiveDate,
        vbaEligible: data.vbaEligible,
        type: data.vbaEligible ? 'VBA' : 'Non-VBA',
        employeeId: data.employeeId ?? '',
        agentId: selectedGroup?.agentNumber ?? '',
        address: data.address,
        optIn: data.optIn,
        planId: data.planId,
      } as Partial<Member> & { planId: string },
      {
        onSuccess: (newMember) => {
          addAuditEntry({
            entityType: 'Member',
            entityId: newMember.id,
            entityName: `${data.firstName} ${data.lastName}`,
            fieldChanged: 'Member Profile',
            oldValue: '—',
            newValue: 'New member created',
            changedBy: 'Tori M.',
            actionType: 'Member Created',
            systemsAffected: ['CBS'],
          })
          addToast('success', `${data.firstName} ${data.lastName} has been created successfully.`)
          navigate(`/members/${newMember.id}`)
        },
        onError: () => addToast('error', 'Failed to add member'),
      },
    )
  }

  const normalizeSSN = (ssn: string) => ssn.replace(/\D/g, '')

  const checkDuplicateSSN = (ssn: string) => {
    const normalized = normalizeSSN(ssn)
    if (normalized.length < 9) {
      setSsnCheckResult(null)
      return
    }
    const match = allMembers.find(m => normalizeSSN(m.ssn) === normalized)
    setSsnCheckResult(match ? { found: true, member: match } : { found: false })
  }

  const values = getValues()

  if (step === 2) {
    return (
      <div>
        <PageHeader title="Add a Member" backLink="/members" description="Step 2 — Review" />
        <ConfirmationView
          values={values}
          groupName={selectedGroup?.legalName ?? ''}
          agentId={selectedGroup?.agentNumber ?? ''}
          planName={planOptions.find((p) => p.value === values.planId)?.label ?? ''}
          onBack={() => setStep(1)}
          onConfirm={handleSubmit(onSubmit)}
          isLoading={mutation.isPending}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Add a Member" backLink="/members" description="Step 1 — Enter Details" />

      <Card>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left — Personal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Personal
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  required
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />
                <Input
                  label="Last Name"
                  required
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
              </div>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Date of Birth"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.dob?.message}
                  />
                )}
              />
              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
              <Input
                label="Phone"
                {...register('phone')}
                error={errors.phone?.message}
              />
              <Controller
                name="ssn"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      label="SSN"
                      required
                      placeholder="###-##-####"
                      inputMode="numeric"
                      value={field.value}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
                        let formatted = raw
                        if (raw.length > 5) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5)}`
                        else if (raw.length > 3) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`
                        field.onChange(formatted)
                        checkDuplicateSSN(formatted)
                      }}
                      error={errors.ssn?.message}
                    />
                    {ssnCheckResult && (
                      <div className={`mt-2 flex items-start gap-2 rounded-lg px-3 py-2 ${
                        ssnCheckResult.found 
                          ? 'bg-amber-50 border border-amber-200' 
                          : 'bg-emerald-50 border border-emerald-200'
                      }`}>
                        <span className={`text-sm ${ssnCheckResult.found ? 'text-amber-800' : 'text-emerald-800'}`}>
                          {ssnCheckResult.found 
                            ? `⚠ Potential duplicate found: ${ssnCheckResult.member.firstName} ${ssnCheckResult.member.lastName} (Member ID: ${ssnCheckResult.member.memberId}, Group: ${ssnCheckResult.member.groupName}, Status: ${ssnCheckResult.member.status})`
                            : '✓ No duplicate found'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Right — Coverage */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Coverage
              </h3>
              <Controller
                name="groupId"
                control={control}
                render={({ field }) => (
                  <SearchDropdown
                    label="Group"
                    required
                    options={groupOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Search groups…"
                    error={errors.groupId?.message}
                  />
                )}
              />
              {selectedGroup && (
                <div className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700">
                  <span className="font-medium">{selectedGroup.legalName}</span> selected
                </div>
              )}
              <Controller
                name="coverageEffectiveDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Coverage Effective Date"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.coverageEffectiveDate?.message}
                  />
                )}
              />
              {watchedCovDate && (() => {
                const entered = new Date(watchedCovDate + 'T00:00:00')
                const now = new Date()
                const diffMs = entered.getTime() - now.getTime()
                const fiveYearsMs = 5 * 365.25 * 24 * 60 * 60 * 1000
                const oneYearMs = 365.25 * 24 * 60 * 60 * 1000
                if (diffMs > fiveYearsMs) {
                  return (
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                      <span className="text-sm text-amber-800">⚠ This date is more than 5 years in the future. Please verify this is correct.</span>
                    </div>
                  )
                }
                if (diffMs < -oneYearMs) {
                  return (
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                      <span className="text-sm text-amber-800">⚠ This date is more than 1 year in the past. Please verify this is correct.</span>
                    </div>
                  )
                }
                return null
              })()}
              <Controller
                name="planId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Plan"
                    required
                    options={planOptions}
                    placeholder="Select a plan…"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={errors.planId?.message}
                    disabled={!selectedGroup}
                  />
                )}
              />
              <Controller
                name="vbaEligible"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
                      />
                      <span className="text-sm font-medium text-gray-700">VBA Eligible</span>
                    </label>
                    {watchedVba && (
                      <div className="mt-2 flex items-start gap-2 rounded-lg bg-primary-50 px-3 py-2">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                        <span className="text-sm text-primary-700">
                          This member will be synced to the VBA system. VBA compliance rules will
                          apply.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              />
              <Input label="Employee ID" {...register('employeeId')} />
              <Input
                label="Agent ID"
                value={selectedGroup?.agentNumber ?? ''}
                disabled
                readOnly
              />
            </div>
          </div>

          {/* Employment & Address */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                label="Street"
                required
                {...register('address.street')}
                error={errors.address?.street?.message}
              />
              <Input
                label="City"
                required
                {...register('address.city')}
                error={errors.address?.city?.message}
              />
              <Controller
                name="address.state"
                control={control}
                render={({ field }) => (
                  <Select
                    label="State"
                    required
                    options={STATE_OPTIONS}
                    placeholder="State"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={errors.address?.state?.message}
                  />
                )}
              />
              <Input
                label="ZIP"
                required
                {...register('address.zip')}
                error={errors.address?.zip?.message}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Dependents"
                type="number"
                {...register('dependents', { valueAsNumber: true })}
              />
              <Controller
                name="optIn"
                control={control}
                render={({ field }) => (
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
                      />
                      <span className="text-sm font-medium text-gray-700">Opt In</span>
                    </label>
                  </div>
                )}
              />
              <Controller
                name="holdReason"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Hold Reason"
                    options={HOLD_OPTIONS}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={handleContinue}>
              Continue to Review
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

const ConfirmationView = ({
  values,
  groupName,
  agentId,
  planName,
  onBack,
  onConfirm,
  isLoading,
}: {
  values: AddMemberFormData
  groupName: string
  agentId: string
  planName: string
  onBack: () => void
  onConfirm: () => void
  isLoading: boolean
}) => (
  <Card>
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900">
          {values.firstName} {values.lastName}
        </h2>
        {values.vbaEligible && <TypeBadge type="VBA" />}
        {!values.vbaEligible && <TypeBadge type="Non-VBA" />}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryField label="Email" value={values.email || '—'} />
        <SummaryField label="Phone" value={values.phone || '—'} />
        <SummaryField label="Date of Birth" value={formatDate(values.dob)} />
        <SummaryField label="SSN" value={values.ssn} />
        <SummaryField label="Group" value={groupName} />
        <SummaryField label="Agent ID" value={agentId} />
        <SummaryField label="Plan" value={planName} />
        <SummaryField label="Coverage Date" value={formatDate(values.coverageEffectiveDate)} />
        <SummaryField label="Employee ID" value={values.employeeId || '—'} />
        <SummaryField
          label="Address"
          value={`${values.address.street}, ${values.address.city}, ${values.address.state} ${values.address.zip}`}
        />
        <SummaryField label="Dependents" value={String(values.dependents)} />
        <SummaryField label="Opt In" value={values.optIn ? 'Yes' : 'No'} />
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-primary-50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
        <span className="text-sm text-primary-700">
          {values.vbaEligible
            ? 'This member will be created in the CHAMP portal and synced to the VBA system.'
            : 'This member will be created in the CHAMP portal only. No external system sync.'}
        </span>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onConfirm} isLoading={isLoading}>
          Confirm & Add Member
        </Button>
      </div>
    </div>
  </Card>
)

const SummaryField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs text-gray-500">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium text-gray-900">{value}</dd>
  </div>
)
