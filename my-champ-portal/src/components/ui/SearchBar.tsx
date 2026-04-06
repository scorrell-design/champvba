import { Search } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: SearchBarProps) => {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-gray-300 bg-gray-100 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
      />
    </div>
  )
}
