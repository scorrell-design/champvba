import { cn } from '../../utils/cn'

export interface SkeletonProps {
  className?: string
  lines?: number
}

export const Skeleton = ({ className, lines = 1 }: SkeletonProps) => {
  if (lines === 1) {
    return (
      <div className={cn('h-4 animate-pulse rounded bg-gray-200', className)} />
    )
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 animate-pulse rounded bg-gray-200',
            i === lines - 1 && 'w-3/4',
            className,
          )}
        />
      ))}
    </div>
  )
}
