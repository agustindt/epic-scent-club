import React, { useRef, useState } from 'react'
import { Download, Upload, Database, Check, AlertTriangle, X } from 'lucide-react'

export default function DataBackup({ onImport, onClose, data = {} }) {
  const fileRef = useRef()
  const [status, setStatus] = useState(null)

  const handleExport = () => {
    const exportData = {
      esc_clientes: data.clientes || [],
      esc_perfumes: data.perfumes || [],
      esc_ventas: data.ventas || [],
      esc_seguimientos: data.seguimientos || [],
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `epic-scent-club-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus({ type: 'success', message: 'Respaldo descargado correctamente.' })
  }

  const handleImport = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        const imported = {}
        ;['esc_clientes', 'esc_perfumes', 'esc_ventas', 'esc_seguimientos'].forEach(key => {
          if (Array.isArray(parsed[key])) imported[key] = parsed[key]
        })

        if (Object.keys(imported).length === 0) {
          setStatus({ type: 'error', message: 'El archivo no contiene datos válidos.' })
          return
        }

        if (!confirm('¿Importar respaldo? Esto agregará los datos al servidor.')) return

        await onImport(imported)
        setStatus({ type: 'success', message: 'Datos importados correctamente.' })
      } catch {
        setStatus({ type: 'error', message: 'Archivo JSON inválido.' })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="card p-5 fade-up space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-gold-400" />
          <h3 className="font-display text-xl font-light text-obsidian-100">Respaldo de Datos</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-obsidian-500 hover:text-obsidian-200 transition-colors" aria-label="Cerrar">
            <X size={18} />
          </button>
        )}
      </div>

      <p className="text-sm text-obsidian-400">
        Exportá o importá todos tus datos desde Railway (inventario, clientes, ventas y seguimientos).
      </p>

      {status && (
        <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 border
          ${status.type === 'success'
            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
            : 'bg-red-950/20 border-red-900/40 text-red-400'
          }`}>
          {status.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
          {status.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button className="btn-gold flex items-center justify-center gap-2 flex-1" onClick={handleExport}>
          <Download size={15} /> Exportar JSON
        </button>
        <button
          className="btn-ghost flex items-center justify-center gap-2 flex-1"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={15} /> Importar JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={e => handleImport(e.target.files[0])}
        />
      </div>
    </div>
  )
}
