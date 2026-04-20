import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, AlertTriangle, Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { TypeBadge } from '../../components/ui/Badge'
import { DatePicker } from '../../components/forms/DatePicker'
import { SearchDropdown } from '../../components/forms/SearchDropdown'
import { useGroups, useDuplicateCheck } from '../../hooks/useQueries'
import { useToast } from '../../components/feedback/Toast'
import { useMemberStore, generateMemberId, generateMemberInternalId } from '../../stores/member-store'
import { addMemberSchema, type AddMemberFormData } from '../../utils/schemas'
import { US_STATES, HOLD_REASONS } from '../../utils/constants'
import { CURRENT_USER } from '../../constants/user'
import { formatDate } from '../../utils/formatters'
import { formatDisplayDate, serializeDate } from '../../utils/dates'
import { normalizeSSN } from '../../utils/ssn'
import { validateEffectiveDate } from '../../utils/dateValidation'
import { logAuditEntry } from '../../utils/audit'
import type { Member } from '../../types/member'
import type { MemberProduct } from '../../types/product'

const STATE_OPTIONS = US_STATES.map((s) => ({ value: s, label: s }))
const HOLD_OPTIONS = [
  { value: '', label: 'None' },
  ...HOLD_REASONS.map((r) => ({ value: r, label: r })),
]

export const AddNewHire = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const { data: groups = [] } = useGroups()
  const addMember = useMemberStore((s) => s.addMember)
  const addToast = useToast((s) => s.addToast)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      employeeId: '',
      address: { street: '', city: '', state: '', zip: '' },
      dependents: 0,
      optIn: false,
      holdReason: '',
      additionalProductIds: [],
      additionalProductDates: {},
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

  const watchedSSN = watch('ssn')
  const { data: duplicateMatch, isLoading: dupChecking } = useDuplicateCheck(watchedSSN || '')
  const [dupOverride, setDupOverride] = useState(false)

  const watchedGroupId = watch('groupId')
  const watchedCoverageDate = watch('coverageEffectiveDate')
  const watchedPlanId = watch('planId')
  const watchedAdditionalProductIds = watch('additionalProductIds') ?? []

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === watchedGroupId),
    [groups, watchedGroupId],
  )

  const planOptions = useMemo(() => {
    if (!selectedGroup) return []
    return selectedGroup.products.map((p) => ({
      value: p.productId,
      label: `${p.name} (${p.productId})`,
    }))
  }, [selectedGroup])

  const additionalProducts = useMemo(() => {
    if (!selectedGroup) return []
    return selectedGroup.products.filter((p) => p.productId !== watchedPlanId)
  }, [selectedGroup, watchedPlanId])

  const effectiveDateWarning = useMemo(() => {
    if (!watchedCoverageDate) return null
    const result = validateEffectiveDate(watchedCoverageDate)
    return result.severity === 'warning' ? result.message : null
  }, [watchedCoverageDate])

  const handleStep1Continue = async () => {
    const valid = await trigger([
      'firstName', 'lastName', 'dob', 'ssn', 'email', 'phone',
      'address.street', 'address.city', 'address.state', 'address.zip',
      'employeeId',
    ])
    if (valid) setStep(2)
  }

  const handleStep2Continue = async () => {
    const valid = await trigger(['groupId', 'coverageEffectiveDate', 'planId'])
    if (valid) setStep(3)
  }

  const handleStep3Continue = () => {
    setStep(4)
  }

  const handleSkipStep3 = () => {
    setValue('additionalProductIds', [])
    setValue('additionalProductDates', {})
    setStep(4)
  }

  const toggleAdditionalProduct = (productId: string) => {
    const current = getValues('additionalProductIds') ?? []
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]
    setValue('additionalProductIds', next)
  }

  const setAdditionalProductDate = (productId: string, date: string) => {
    const current = getValues('additionalProductDates') ?? {}
    setValue('additionalProductDates', { ...current, [productId]: date })
  }

  const buildProduct = (productId: string, effectiveDate: string): MemberProduct => {
    const p = selectedGroup?.products.find((x) => x.productId === productId)
    if (!p) throw new Error(`Product ${productId} not found on group`)
    return {
      productId: p.productId,
      name: p.name,
      category: p.category,
      fee: p.monthlyFee,
      period: 'Monthly',
      benefitTier: 'Employee Only',
      status: 'Active',
      anticipatedDate: effectiveDate,
      createdDate: new Date().toISOString().split('T')[0],
      activeDate: effectiveDate,
      inactiveDate: null,
      paidThrough: null,
      paidStatus: false,
      paymentsCount: 0,
    }
  }

  const onSubmit = (data: AddMemberFormData) => {
    if (!selectedGroup) return
    setIsSubmitting(true)

    try {
      const memberId = generateMemberId()
      const internalId = generateMemberInternalId()
      const covDate = serializeDate(data.coverageEffectiveDate)
      const memberDob = serializeDate(data.dob)
      const ssn = normalizeSSN(data.ssn)

      const initialProduct = buildProduct(data.planId, covDate)
      const additionalProductsList = (data.additionalProductIds ?? []).map((pid) => {
        const dateOverride = data.additionalProductDates?.[pid]
        return buildProduct(pid, dateOverride ? serializeDate(dateOverride) : covDate)
      })

      const dobDate = new Date(Number(memberDob.slice(0, 4)), Number(memberDob.slice(5, 7)) - 1, Number(memberDob.slice(8, 10)))
      const age = Math.floor((Date.now() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

      const newMember: Member = {
        id: internalId,
        memberId,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: memberDob,
        age,
        gender: '',
        email: data.email || '',
        phone: data.phone || '',
        ssn,
        address: data.address,
        employeeId: data.employeeId ?? '',
        agentId: selectedGroup.agentNumber,
        groupId: data.groupId,
        groupName: selectedGroup.legalName,
        status: data.holdReason ? 'On Hold' : 'Active',
        type: selectedGroup.isVBA ? 'VBA' : 'Non-VBA',
        vbaEligible: selectedGroup.isVBA,
        holdReason: (data.holdReason as Member['holdReason']) || undefined,
        optIn: data.optIn,
        coverageEffectiveDate: covDate,
        createdDate: new Date().toISOString().split('T')[0],
        activeDate: covDate,
        inactiveDate: null,
        products: [initialProduct, ...additionalProductsList],
        notes: [],
        dependents: [],
        isAppUser: false,
        relationship: 'Primary',
        primaryMemberId: null,
      }

      addMember(newMember)

      logAuditEntry({
        entityType: 'Member',
        entityId: newMember.id,
        entityName: `${newMember.firstName} ${newMember.lastName}`,
        action: 'Created',
        details: `Member created via Add New Member flow. Group: ${selectedGroup.legalName}. Initial product: ${initialProduct.name}.`,
      })

      for (const prod of newMember.products) {
        logAuditEntry({
          entityType: 'Member',
          entityId: newMember.id,
          entityName: `${newMember.firstName} ${newMember.lastName}`,
          action: 'Product Added',
          fieldChanged: 'Product',
          newValue: `${prod.name} (${prod.productId})`,
          details: `Product assigned during member creation. Effective: ${formatDisplayDate(prod.anticipatedDate)}.`,
        })
      }

      addToast('success', `Member ${newMember.firstName} ${newMember.lastName} has been created successfully.`)
      navigate(`/members/${newMember.id}`)
    } catch {
      addToast('error', 'Failed to create member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const values = getValues()

  const stepTitles = ['Member Info', 'Group & Coverage', 'Add Products', 'Review & Confirm']

  return (
    <div>
      <PageHeader
        title="Add New Member"
        backLink="/members"
        description={`Step ${step} of 4 — ${stepTitles[step - 1]}`}
      />

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {stepTitles.map((title, i) => {
          const stepNum = i + 1
          const isActive = step === stepNum
          const isComplete = step > stepNum
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-4 w-4 text-gray-300" />}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : isComplete
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isComplete ? <Check className="h-3 w-3" /> : <span>{stepNum}</span>}
                {title}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step 1 — Member Info */}
      {step === 1 && (
        <Card>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Personal Information
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
                      }}
                      error={errors.ssn?.message}
                    />
                  )}
                />
                {watchedSSN && watchedSSN.replace(/\D/g, '').length === 9 && !dupOverride && (
                  <>
                    {dupChecking && (
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                        Checking for duplicates...
                      </div>
                    )}
                    {duplicateMatch && !dupChecking && (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                          <div className="flex-1 space-y-2">
                            <p className="font-medium text-amber-800">Potential duplicate found</p>
                            <p className="text-sm text-amber-700">
                              This SSN matches an existing member:
                            </p>
                            <div className="rounded-lg bg-white p-3 text-sm">
                              <p className="font-medium text-gray-900">
                                {duplicateMatch.firstName} {duplicateMatch.lastName} (ID: {duplicateMatch.memberId})
                              </p>
                              <p className="text-gray-500">
                                Group: {duplicateMatch.groupName} | Status: {duplicateMatch.status}
                              </p>
                              <p className="text-gray-500">
                                DOB: {formatDate(duplicateMatch.dob)} | {duplicateMatch.address.city}, {duplicateMatch.address.state}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Link to={`/members/${duplicateMatch.id}`}>
                                <Button variant="secondary" size="sm" type="button">View Existing Member</Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={() => setDupOverride(true)}
                              >
                                Different Person — Continue Creating
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {!duplicateMatch && !dupChecking && watchedSSN.replace(/\D/g, '').length === 9 && (
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                        <Check className="h-4 w-4 text-green-500" />
                        No duplicate found
                      </div>
                    )}
                  </>
                )}
                {dupOverride && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-medium text-amber-800">Override active — duplicate check bypassed</p>
                    <button
                      type="button"
                      className="mt-1 text-xs text-amber-700 underline"
                      onClick={() => setDupOverride(false)}
                    >
                      Re-enable duplicate check
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Address & Employment
                </h3>
                <Input
                  label="Street"
                  required
                  {...register('address.street')}
                  error={errors.address?.street?.message}
                />
                <div className="grid grid-cols-3 gap-4">
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
                <Input label="Employee ID" {...register('employeeId')} />
                <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleStep1Continue} disabled={!!duplicateMatch && !dupOverride}>
                Continue to Group & Coverage
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 2 — Group & Coverage */}
      {step === 2 && (
        <Card>
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Group & Coverage
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
                <span className="font-medium">{selectedGroup.legalName}</span> selected — {selectedGroup.products.length} products available
              </div>
            )}
            <Controller
              name="coverageEffectiveDate"
              control={control}
              render={({ field }) => (
                <div>
                  <DatePicker
                    label="Coverage Effective Date"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.coverageEffectiveDate?.message}
                  />
                  {effectiveDateWarning && (
                    <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{effectiveDateWarning}</span>
                    </div>
                  )}
                </div>
              )}
            />
            <Controller
              name="planId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Initial Plan / Product"
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
            <Input
              label="Agent ID"
              value={selectedGroup?.agentNumber ?? ''}
              disabled
              readOnly
            />
            <div className="flex justify-between">
              <Button variant="secondary" type="button" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="button" onClick={handleStep2Continue}>
                Continue to Add Products
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3 — Add Products (Optional) */}
      {step === 3 && (
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Add Products (Optional)
              </h3>
              {selectedGroup && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{selectedGroup.legalName}</span> offers the following
                  products in addition to your initial selection. Select any you'd like to assign now
                  — you can always add more later from the member's profile.
                </p>
              )}
            </div>

            {additionalProducts.length === 0 ? (
              <div className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                No additional products available for this group.
              </div>
            ) : (
              <div className="space-y-3">
                {additionalProducts.map((p) => {
                  const isSelected = watchedAdditionalProductIds.includes(p.productId)
                  const dateOverride = values.additionalProductDates?.[p.productId]
                  return (
                    <div
                      key={p.productId}
                      className={`rounded-lg border p-4 transition-colors ${
                        isSelected
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAdditionalProduct(p.productId)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-200"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {p.name} ({p.productId})
                            </span>
                            <span className="text-sm text-gray-500">
                              ${p.monthlyFee.toFixed(2)}/mo
                            </span>
                          </div>
                          {isSelected && (
                            <div className="mt-2">
                              <DatePicker
                                label="Anticipated Date"
                                value={dateOverride || watchedCoverageDate}
                                onChange={(v) => setAdditionalProductDate(p.productId, v)}
                              />
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="secondary" type="button" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-3">
                <Button variant="ghost" type="button" onClick={handleSkipStep3}>
                  Skip this step
                </Button>
                <Button type="button" onClick={handleStep3Continue}>
                  Continue to Review
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4 — Review & Confirm */}
      {step === 4 && (
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {values.firstName} {values.lastName}
              </h2>
              {selectedGroup?.isVBA ? <TypeBadge type="VBA" /> : <TypeBadge type="Non-VBA" />}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryField label="Email" value={values.email || '—'} />
              <SummaryField label="Phone" value={values.phone || '—'} />
              <SummaryField label="Date of Birth" value={formatDisplayDate(values.dob)} />
              <SummaryField label="SSN" value={values.ssn} />
              <SummaryField label="Group" value={selectedGroup?.legalName ?? ''} />
              <SummaryField label="Agent ID" value={selectedGroup?.agentNumber ?? ''} />
              <SummaryField label="Initial Plan" value={planOptions.find((p) => p.value === values.planId)?.label ?? ''} />
              <SummaryField label="Coverage Date" value={formatDisplayDate(values.coverageEffectiveDate)} />
              <SummaryField label="Employee ID" value={values.employeeId || '—'} />
              <SummaryField
                label="Address"
                value={`${values.address.street}, ${values.address.city}, ${values.address.state} ${values.address.zip}`}
              />
              <SummaryField label="Dependents" value={String(values.dependents)} />
              <SummaryField label="Opt In" value={values.optIn ? 'Yes' : 'No'} />
            </div>

            {/* Products summary */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                Products ({1 + (values.additionalProductIds?.length ?? 0)})
              </h3>
              <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {planOptions.find((p) => p.value === values.planId)?.label}
                    </span>
                    <span className="ml-2 text-xs text-primary-600 font-medium">Initial</span>
                  </div>
                  <span className="text-sm text-gray-500">{formatDisplayDate(values.coverageEffectiveDate)}</span>
                </div>
                {(values.additionalProductIds ?? []).map((pid) => {
                  const p = selectedGroup?.products.find((x) => x.productId === pid)
                  const dateOverride = values.additionalProductDates?.[pid]
                  return (
                    <div key={pid} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {p?.name ?? pid} ({pid})
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDisplayDate(dateOverride || values.coverageEffectiveDate)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-primary-50 px-4 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
              <span className="text-sm text-primary-700">
                {selectedGroup?.isVBA
                  ? 'This member will be created in the CHAMP portal and synced to the VBA system.'
                  : 'This member will be created in the CHAMP portal only. No external system sync.'}
              </span>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(3)}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
                Confirm & Add Member
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

const SummaryField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs text-gray-500">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium text-gray-900">{value}</dd>
  </div>
)
