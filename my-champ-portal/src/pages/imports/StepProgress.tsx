import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

const steps = ['Upload', 'Validation', 'Mapping', 'Results'] as const

export function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const stepNum = i + 1
        const isComplete = stepNum < current
        const isActive = stepNum === current
        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={cn(
                  'h-0.5 w-8 rounded-full sm:w-12',
                  isComplete ? 'bg-primary-500' : 'bg-gray-200',
                )}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  isComplete && 'bg-primary-500 text-white',
                  isActive && 'bg-primary-500 text-white ring-4 ring-primary-100',
                  !isComplete && !isActive && 'bg-gray-200 text-gray-500',
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:inline',
                  isActive ? 'text-primary-600' : 'text-gray-500',
                )}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
