import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Lock, ArrowLeftRight } from 'lucide-react'
import { SlideOver } from '../../../components/ui/SlideOver'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { DatePicker } from '../../../components/forms/DatePicker'
import { useToast } from '../../../components/feedback/Toast'
import { useMemberStore } from '../../../stores/member-store'
import { useAuditStore } from '../../../stores/audit-store'
import { cn } from '../../../utils/cn'
import { US_STATES } from '../../../utils/constants'
import { normalizeSSN } from '../../../utils/ssn'
import { serializeDate } from '../../../utils/dates'
import type { Member } from '../../../types/member'

const editSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  dob: z.string().min(1),
  ssn: z.string().min(1),
  gender: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().min(5),
  coverageEffectiveDate: z.string().min(1),
})

type EditFormData = z.infer<typeof editSchema>

interface EditMemberSlideOverProps {
  open: boolean
  onClose: () => void
  member: Member
}

const STATE_OPTIONS = US_STATES.map((s) => ({ value: s, label: s }))
const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
]

export const EditMemberSlideOver = ({ open, onClose, member }: EditMemberSlideOverProps) => {
  const updateMember = useMemberStore((s) => s.updateMember)
  const [isSaving, setIsSaving] = useState(false)
  const addToast = useToast((s) => s.addToast)

  const defaults: EditFormData = useMemo(
    () => ({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      dob: member.dob,
      ssn: member.ssn,
      gender: member.gender,
      street: member.address.street,
      city: member.address.city,
      state: member.address.state,
      zip: member.address.zip,
      coverageEffectiveDate: member.coverageEffectiveDate,
    }),
    [member],
  )

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    if (open) reset(defaults)
  }, [open, defaults, reset])

  const current = watch()

  const changedFields = useMemo(() => {
    const changed: string[] = []
    for (const key of Object.keys(defaults) as (keyof EditFormData)[]) {
      if (String(current[key]) !== String(defaults[key])) {
        changed.push(key)
      }
    }
    return changed
  }, [current, defaults])

  const logFieldChange = useAuditStore((s) => s.logFieldChange)

  const onSubmit = (data: EditFormData) => {
    setIsSaving(true)
    try {
      const updates: Partial<Member> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dob: serializeDate(data.dob),
        ssn: normalizeSSN(data.ssn),
        gender: data.gender,
        address: { street: data.street, city: data.city, state: data.state, zip: data.zip },
        coverageEffectiveDate: serializeDate(data.coverageEffectiveDate),
      }
      updateMember(member.id, updates)

      const memberName = `${member.firstName} ${member.lastName}`
      const labelMap: Partial<Record<keyof EditFormData, string>> = {
        firstName: 'First Name', lastName: 'Last Name', email: 'Email', phone: 'Phone',
        dob: 'DOB', ssn: 'SSN', gender: 'Gender',
        street: 'Address', city: 'City', state: 'State', zip: 'ZIP',
        coverageEffectiveDate: 'Coverage Effective Date',
      }
      for (const field of changedFields) {
        const label = labelMap[field as keyof EditFormData] ?? field
        logFieldChange({
          entityType: 'Member',
          entityId: member.id,
          entityName: memberName,
          fieldChanged: label,
          oldValue: String(defaults[field as keyof EditFormData] ?? ''),
          newValue: String(data[field as keyof EditFormData] ?? ''),
        })
      }
      addToast('success', `${member.firstName} ${member.lastName} updated.`)
      onClose()
    } catch {
      addToast('error', 'Failed to update member')
    } finally {
      setIsSaving(false)
    }
  }

  const isChanged = (field: keyof EditFormData) => changedFields.includes(field)

  return (
    <SlideOver open={open} onClose={onClose} title="Edit Member" wide>
      <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
        <div className="flex-1 space-y-6">
          <Section title="Identity">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Lock className="h-3 w-3 text-gray-400" />
                  Member ID
                </span>
                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">{member.memberId}</div>
              </div>
              <div>
                <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Lock className="h-3 w-3 text-gray-400" />
                  Employee ID
                </span>
                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">{member.employeeId}</div>
              </div>
            </div>
          </Section>

          <Section title="Personal">
            <div className="grid grid-cols-2 gap-4">
              <FieldWrapper label="First Name" changed={isChanged('firstName')} vba={member.vbaEligible}>
                <Input {...register('firstName')} error={errors.firstName?.message} />
              </FieldWrapper>
              <FieldWrapper label="Last Name" changed={isChanged('lastName')} vba={member.vbaEligible}>
                <Input {...register('lastName')} error={errors.lastName?.message} />
              </FieldWrapper>
              <FieldWrapper label="Email" changed={isChanged('email')} vba={member.vbaEligible}>
                <Input {...register('email')} type="email" error={errors.email?.message} />
              </FieldWrapper>
              <FieldWrapper label="Phone" changed={isChanged('phone')} vba={member.vbaEligible}>
                <Input {...register('phone')} error={errors.phone?.message} />
              </FieldWrapper>
              <FieldWrapper label="Date of Birth" changed={isChanged('dob')} vba={member.vbaEligible}>
                <Controller
                  name="dob"
                  control={control}
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={field.onChange} error={errors.dob?.message} />
                  )}
                />
              </FieldWrapper>
              <FieldWrapper label="SSN" changed={isChanged('ssn')} vba={member.vbaEligible}>
                <Input {...register('ssn')} placeholder="###-##-####" error={errors.ssn?.message} />
              </FieldWrapper>
              <FieldWrapper label="Gender" changed={isChanged('gender')} vba={member.vbaEligible}>
                <Select {...register('gender')} options={GENDER_OPTIONS} error={errors.gender?.message} />
              </FieldWrapper>
            </div>
          </Section>

          <Section title="Address">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FieldWrapper label="Street" changed={isChanged('street')} vba={member.vbaEligible}>
                  <Input {...register('street')} error={errors.street?.message} />
                </FieldWrapper>
              </div>
              <FieldWrapper label="City" changed={isChanged('city')} vba={member.vbaEligible}>
                <Input {...register('city')} error={errors.city?.message} />
              </FieldWrapper>
              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="State" changed={isChanged('state')} vba={member.vbaEligible}>
                  <Select {...register('state')} options={STATE_OPTIONS} error={errors.state?.message} />
                </FieldWrapper>
                <FieldWrapper label="ZIP" changed={isChanged('zip')} vba={member.vbaEligible}>
                  <Input {...register('zip')} error={errors.zip?.message} />
                </FieldWrapper>
              </div>
            </div>
          </Section>

          <Section title="Coverage">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-500">Group</span>
                <Link
                  to={`/groups/${member.groupId}`}
                  className="mt-0.5 block text-sm font-medium text-primary-600 hover:underline"
                >
                  {member.groupName}
                </Link>
                <Link
                  to={`/members/${member.id}/reassign`}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 hover:underline"
                  onClick={onClose}
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  Reassign to a different group
                </Link>
              </div>
              <FieldWrapper
                label="Coverage Date"
                changed={isChanged('coverageEffectiveDate')}
                vba={member.vbaEligible}
              >
                <Controller
                  name="coverageEffectiveDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={field.onChange} />
                  )}
                />
              </FieldWrapper>
            </div>
          </Section>

          <Section title="Tags">
            <p className="mb-2 text-xs text-gray-500">Member-level tags (custom tags coming soon)</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={member.isAppUser}
                  disabled
                  className="h-4 w-4 rounded border-gray-300 text-primary-500"
                />
                App User
              </label>
            </div>
          </Section>
        </div>

        {/* Bottom bar */}
        <div className="sticky bottom-0 -mx-6 border-t border-gray-200 bg-white px-6 py-4 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {changedFields.length > 0
                ? `You have ${changedFields.length} unsaved change${changedFields.length > 1 ? 's' : ''}`
                : 'No changes'}
            </span>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving} disabled={changedFields.length === 0}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </form>
    </SlideOver>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
    {children}
  </div>
)

const FieldWrapper = ({
  label,
  changed,
  vba,
  children,
}: {
  label: string
  changed: boolean
  vba: boolean
  children: React.ReactNode
}) => (
  <div className="relative">
    <div className="mb-1.5 flex items-center gap-1.5">
      {changed && (
        <span
          className="h-2 w-2 rounded-full bg-warning-500"
          title={`${label} has been changed`}
        />
      )}
      <span className={cn('text-sm font-medium text-gray-700', changed && 'text-warning-600')}>
        {label}
      </span>
      {changed && (
        <Badge variant={vba ? 'purple' : 'gray'} className="ml-auto text-[10px]">
          {vba ? 'VBA sync' : 'Local only'}
        </Badge>
      )}
    </div>
    {children}
  </div>
)
