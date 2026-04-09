import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import type { MemberStatus, MemberType } from '../../utils/constants'

const variantStyles = {
  success: 'bg-success-50 text-success-700',
  danger: 'bg-danger-50 text-danger-700',
  warning: 'bg-warning-50 text-warning-600',
  info: 'bg-primary-50 text-primary-700',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-50 text-purple-700',
  teal: 'bg-teal-50 text-teal-700',
} as const

const dotColors = {
  success: 'bg-success-500',
  danger: 'bg-danger-500',
  warning: 'bg-warning-500',
  info: 'bg-primary-500',
  gray: 'bg-gray-400',
  purple: 'bg-purple-500',
  teal: 'bg-teal-500',
} as const

export type BadgeVariant = keyof typeof variantStyles

export interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
  dot?: boolean
}

export const Badge = ({ variant = 'gray', children, className, dot }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}

const statusMap: Record<MemberStatus, BadgeVariant> = {
  Active: 'success',
  Inactive: 'gray',
  Terminated: 'danger',
  'On Hold': 'purple',
}

export interface StatusBadgeProps {
  status: MemberStatus
  className?: string
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <Badge variant={statusMap[status]} dot className={className}>
      {status}
    </Badge>
  )
}

const typeOutlineStyles: Record<MemberType, string> = {
  VBA: 'border-primary-300 text-primary-700 bg-primary-50',
  'Non-VBA': 'border-gray-300 text-gray-600 bg-gray-50',
}

export interface TypeBadgeProps {
  type: MemberType
  className?: string
}

export const TypeBadge = ({ type, className }: TypeBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        typeOutlineStyles[type],
        className,
      )}
    >
      {type}
    </span>
  )
}

export type TagType = 'VBA' | 'HSA' | 'First Stop' | 'Open Enrollment' | 'App User'

const tagStyles: Record<TagType, string> = {
  VBA: 'bg-primary-50 text-primary-700 border-primary-200',
  HSA: 'bg-success-50 text-success-700 border-success-200',
  'First Stop': 'bg-purple-50 text-purple-700 border-purple-200',
  'Open Enrollment': 'bg-warning-50 text-warning-600 border-warning-200',
  'App User': 'bg-teal-50 text-teal-700 border-teal-200',
}

export const TagBadge = ({ tag, className }: { tag: TagType; className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
      tagStyles[tag],
      className,
    )}
  >
    {tag}
  </span>
)

export const GroupTags = ({ isVBA, hasHSA, hasFirstStopHealth, isOpenEnrollment, className }: {
  isVBA: boolean
  hasHSA: boolean
  hasFirstStopHealth: boolean
  isOpenEnrollment?: boolean
  className?: string
}) => {
  const tags: TagType[] = []
  if (isVBA) tags.push('VBA')
  if (hasHSA) tags.push('HSA')
  if (hasFirstStopHealth) tags.push('First Stop')
  if (isOpenEnrollment) tags.push('Open Enrollment')
  if (tags.length === 0) return null
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {tags.map((t) => <TagBadge key={t} tag={t} />)}
    </div>
  )
}

export const MemberTags = ({ isVBA, hasHSA, hasFirstStopHealth, isOpenEnrollment, isAppUser, relationship, className }: {
  isVBA: boolean
  hasHSA: boolean
  hasFirstStopHealth: boolean
  isOpenEnrollment?: boolean
  isAppUser?: boolean
  relationship?: string
  className?: string
}) => {
  const tags: TagType[] = []
  if (isVBA) tags.push('VBA')
  if (hasHSA) tags.push('HSA')
  if (hasFirstStopHealth) tags.push('First Stop')
  if (isOpenEnrollment) tags.push('Open Enrollment')
  if (isAppUser) tags.push('App User')
  if (tags.length === 0 && (!relationship || relationship === 'Primary')) return null
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {relationship && relationship !== 'Primary' && (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 border-gray-200">
          Dependent
        </span>
      )}
      {tags.map((t) => <TagBadge key={t} tag={t} />)}
    </div>
  )
}
