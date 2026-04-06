import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { create } from 'zustand'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (type: ToastType, message: string) => void
  removeToast: (id: string) => void
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

const typeConfig = {
  success: { icon: CheckCircle, bg: 'bg-success-50', border: 'border-success-200', text: 'text-success-700', iconColor: 'text-success-500' },
  error: { icon: XCircle, bg: 'bg-danger-50', border: 'border-danger-200', text: 'text-danger-700', iconColor: 'text-danger-500' },
  info: { icon: Info, bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', iconColor: 'text-primary-500' },
} as const

const ToastEntry = ({ toast }: { toast: ToastItem }) => {
  const { removeToast } = useToast()
  const config = typeConfig[toast.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-card animate-in slide-in-from-right',
        config.bg,
        config.border,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconColor)} />
      <p className={cn('flex-1 text-sm font-medium', config.text)}>{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export const ToastProvider = () => {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <ToastEntry key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  )
}
