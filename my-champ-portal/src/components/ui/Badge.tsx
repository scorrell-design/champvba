import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import type { MemberStatus, SystemBadge as SystemBadgeType, MemberType } from '../../types'

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

const systemMap: Record<SystemBadgeType, { variant: BadgeVariant; className?: string }> = {
  CBS: { variant: 'info' },
  VBA: { variant: 'purple' },
  Kintone: { variant: 'teal' },
  Admin123: { variant: 'warning' },
  Local: { variant: 'gray' },
}

export interface SystemBadgeProps {
  system: SystemBadgeType
  className?: string
}

export const SystemBadge = ({ system, className }: SystemBadgeProps) => {
  const config = systemMap[system]
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {system}
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
