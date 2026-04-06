import { Menu } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface TopBarProps {
  onMenuClick: () => void
  className?: string
}

export const TopBar = ({ onMenuClick, className }: TopBarProps) => {
  return (
    <header
      className={cn(
        'flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden',
        className,
      )}
    >
      <button
        onClick={onMenuClick}
        className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <span className="text-lg font-bold text-primary-500">CHAMP</span>

      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
        SC
      </div>
    </header>
  )
}
