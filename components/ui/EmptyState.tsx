import { LucideIcon } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-200/60 shadow-sm max-w-xl mx-auto my-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-blue-50/30">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed max-w-sm mb-8">{description}</p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200 px-6 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
