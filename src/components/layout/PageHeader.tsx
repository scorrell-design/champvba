import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface PageHeaderProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
  backLink?: string
  className?: string
}

export const PageHeader = ({ title, description, actions, backLink, className }: PageHeaderProps) => {
  return (
    <div className={cn('mb-6', className)}>
      {backLink && (
        <Link
          to={backLink}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title text-gray-900">{title}</h1>
          {description && <div className="mt-1 text-sm text-gray-500">{description}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
