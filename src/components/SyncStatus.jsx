import { Cloud, CloudOff, RefreshCw } from 'lucide-react'

export function SyncStatus({ error, syncing }) {
  if (error) {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/30 border border-amber-900/40 rounded-full px-2 py-0.5">
        <CloudOff size={11} /> Offline
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded-full px-2 py-0.5">
      <Cloud size={11} /> Railway{syncing ? ' · migrando…' : ''}
    </span>
  )
}

export function LoadingCard({ message = 'Conectando con el servidor…' }) {
  return (
    <div className="card p-12 text-center">
      <RefreshCw size={32} className="mx-auto mb-4 text-obsidian-600 animate-spin" />
      <p className="text-obsidian-400 text-sm">{message}</p>
    </div>
  )
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="flex items-center justify-between gap-2 text-sm text-amber-400 bg-amber-950/20 border border-amber-900/30 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2">
        <CloudOff size={15} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button className="btn-ghost text-xs py-1 px-2" onClick={onRetry}>
          <RefreshCw size={12} className="inline mr-1" />Reintentar
        </button>
      )}
    </div>
  )
}
