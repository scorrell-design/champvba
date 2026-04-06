import { type ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface CardProps {
  className?: string
  children: ReactNode
  padding?: boolean
}

export const Card = ({ className, children, padding = true }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-card',
        padding && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

const trendConfig = {
  up: { icon: TrendingUp, color: 'text-success-600' },
  down: { icon: TrendingDown, color: 'text-danger-600' },
  neutral: { icon: Minus, color: 'text-gray-400' },
} as const

export interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export const StatCard = ({ label, value, hint, icon: Icon, trend, className }: StatCardProps) => {
  const TrendIcon = trend ? trendConfig[trend].icon : null
  const trendColor = trend ? trendConfig[trend].color : ''

  return (
    <Card className={cn('flex items-start gap-4', className)}>
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
          <Icon className="h-5 w-5 text-primary-500" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-stat-value text-gray-800">{value}</p>
        {(hint || trend) && (
          <div className="mt-1 flex items-center gap-1">
            {TrendIcon && <TrendIcon className={cn('h-3.5 w-3.5', trendColor)} />}
            {hint && <span className={cn('text-xs', trendColor || 'text-gray-500')}>{hint}</span>}
          </div>
        )}
      </div>
    </Card>
  )
}
