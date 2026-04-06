import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  Upload,
  ClipboardList,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Groups/Clients', icon: Building2, to: '/groups' },
  { label: 'Members', icon: Users, to: '/members' },
  { label: 'Import Files', icon: Upload, to: '/imports' },
  { label: 'Audit Log', icon: ClipboardList, to: '/audit-log' },
] as const

const bottomItems = [
  { label: 'Settings', icon: Settings, to: '/settings' },
] as const

const NavItem = ({ item, onClick }: { item: (typeof navItems)[number] | (typeof bottomItems)[number]; onClick?: () => void }) => {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-500'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {item.label}
    </NavLink>
  )
}

export interface SidebarProps {
  className?: string
}

export const Sidebar = ({ className }: SidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg bg-white p-2 shadow-card lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-sidebar-bg transition-transform duration-300 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-6">
          <div>
            <span className="text-xl font-bold text-primary-500">CHAMP</span>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} onClick={() => setMobileOpen(false)} />
          ))}

          <div className="my-4 border-t border-gray-200" />

          {bottomItems.map((item) => (
            <NavItem key={item.to} item={item} onClick={() => setMobileOpen(false)} />
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              SC
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">Stephanie C.</p>
              <p className="truncate text-xs text-gray-500">CBS Staff</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
