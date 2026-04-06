import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  required?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required, className, id, ...props }, ref) => {
    const textareaId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-0.5 text-danger-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors',
            'focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-100',
            className,
          )}
          rows={4}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
