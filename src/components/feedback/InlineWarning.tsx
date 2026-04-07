import { type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'

export interface InlineWarningProps {
  message: string
  onDismiss?: () => void
  dismissLabel?: string
  onConfirm?: () => void
  confirmLabel?: string
  children?: ReactNode
  className?: string
}

export const InlineWarning = ({
  message,
  onDismiss,
  dismissLabel = 'Dismiss',
  onConfirm,
  confirmLabel = 'Confirm',
  children,
  className,
}: InlineWarningProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border-l-4 border-warning-500 bg-warning-50 p-4',
        className,
      )}
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-warning-600">{message}</p>
          {children && <div className="mt-2 text-sm text-warning-600">{children}</div>}
          {(onDismiss || onConfirm) && (
            <div className="mt-3 flex gap-2">
              {onConfirm && (
                <Button size="sm" variant="primary" onClick={onConfirm}>
                  {confirmLabel}
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  {dismissLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
