import { forwardRef, type InputHTMLAttributes } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  label?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, value, onChange, error, required, className, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-0.5 text-danger-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="date"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              'block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 pl-10 text-sm text-gray-900 transition-colors',
              'focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-100',
              className,
            )}
            {...props}
          />
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
      </div>
    )
  },
)

DatePicker.displayName = 'DatePicker'
