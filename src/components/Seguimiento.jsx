import React, { useState, useMemo } from 'react'
import {
  MessageCircle, Clock, CheckCheck, Plus, X, Check,
  ChevronDown, ChevronUp, Bell, Send, Trash2, Star,
  AlertTriangle, Filter, Phone
} from 'lucide-react'
import { generateId, formatCurrency, formatDate } from '../utils/helpers'

// ── Plantillas de mensajes ──────────────────────────────────────────────
const PLANTILLAS = [
  {
    id: 'bienvenida',
    label: 'Bienvenida post-compra',
    emoji: '🌟',
    texto: (nombre, perfume) =>
      `Hola ${nombre}! 🌟 Gracias por tu compra de *${perfume}* en Epic Scent Club Parfum. Esperamos que lo disfrutes muchísimo. Cualquier consulta, acá estamos. ✨`,
  },
  {
    id: 'seguimiento',
    label: 'Seguimiento a los 30 días',
    emoji: '💬',
    texto: (nombre, perfume) =>
      `Hola ${nombre}! 👋 Hace un mes te llevaste el *${perfume}*. ¿Cómo te está yendo con la fragancia? Si querés renovar o probar algo nuevo, tenemos novedades 🌿`,
  },
  {
    id: 'reposicion',
    label: 'Aviso de reposición',
    emoji: '📦',
    texto: (nombre, perfume) =>
      `Hola ${nombre}! 📦 ¡Buenas noticias! Repusimos stock de *${perfume}* y otros títulos que te pueden interesar. ¿Te mandamos el catálogo actualizado?`,
  },
  {
    id: 'oferta',
    label: 'Oferta especial',
    emoji: '🔥',
    texto: (nombre, _perfume) =>
      `Hola ${nombre}! 🔥 Tenemos una oferta especial esta semana solo para clientes frecuentes. ¿Querés que te cuente los detalles? 💎`,
  },
  {
    id: 'pago_pendiente',
    label: 'Recordatorio de pago',
    emoji: '💳',
    texto: (nombre, _perfume) =>
      `Hola ${nombre}! Te recuerdo que tenemos pendiente el pago de tu última compra. Cuando puedas coordinar, avisame 🙏`,
  },
  {
    id: 'cumple',
    label: 'Saludo de cumpleaños',
    emoji: '🎂',
    texto: (nombre, _perfume) =>
      `Hola ${nombre}! 🎂 ¡Feliz cumpleaños! Desde Epic Scent Club te deseamos un día increíble. Tenemos un regalo especial para vos, escribinos 🎁`,
  },
]

// ── Prioridades de seguimiento ─────────────────────────────────────────
const PRIORIDADES = [
  { id: 'alta',  label: 'Alta',  color: 'text-red-400',   bg: 'bg-red-950/40 border-red-900/50' },
  { id: 'media', label: 'Media', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-900/50' },
  { id: 'baja',  label: 'Baja',  color: 'text-blue-400',  bg: 'bg-blue-950/40 border-blue-900/50' },
]

// ── Helpers ────────────────────────────────────────────────────────────
function buildWaLink(telefono, mensaje) {
  const num = telefono.replace(/\D/g, '')
  const encoded = encodeURIComponent(mensaje)
  return `https://wa.me/${num}?text=${encoded}`
}

function diasDesde(isoDate) {
  if (!isoDate) return null
  const diff = Date.now() - new Date(isoDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function NuevoRecordatorio({ clientes, ventas, onSave, onCancel }) {
  const [form, setForm] = useState({
    clienteId: '',
    plantillaId: PLANTILLAS[0].id,
    prioridad: 'media',
    fecha: '',
    nota: '',
    mensajeCustom: '',
  })
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const cliente = clientes.find(c => c.id === form.clienteId)
  const ultimaVenta = cliente
    ? [...ventas].filter(v => v.clienteId === cliente.id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
    : null
  const plantilla = PLANTILLAS.find(p => p.id === form.plantillaId)
  const mensajePreview = plantilla && cliente
    ? plantilla.texto(cliente.nombre, ultimaVenta?.perfumeNombre || '[perfume]')
    : ''

  const handleSave = () => {
    if (!form.clienteId) return
    onSave({
      clienteId: form.clienteId,
      clienteNombre: cliente.nombre,
      clienteTelefono: cliente.telefono || '',
      plantillaId: form.plantillaId,
      prioridad: form.prioridad,
      fechaRecordatorio: form.fecha,
      nota: form.nota.trim(),
      mensajeCustom: form.mensajeCustom.trim() || mensajePreview,
      estado: 'pendiente',
      historial: [],
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-xl font-light text-obsidian-100">Nuevo Seguimiento</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Cliente *</label>
          <select className="input-field" value={form.clienteId} onChange={e => set('clienteId', e.target.value)} required>
            <option value="">Seleccioná un cliente…</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}{c.telefono ? ` · ${c.telefono}` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Plantilla de mensaje</label>
          <select className="input-field" value={form.plantillaId} onChange={e => set('plantillaId', e.target.value)}>
            {PLANTILLAS.map(p => (
              <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Prioridad</label>
          <div className="flex gap-2 mt-1">
            {PRIORIDADES.map(p => (
              <button
                key={p.id} type="button"
                onClick={() => set('prioridad', p.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all
                  ${form.prioridad === p.id ? `${p.bg} ${p.color}` : 'bg-obsidian-800 border-obsidian-600 text-obsidian-500'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Fecha de recordatorio</label>
          <input
            type="date" className="input-field"
            value={form.fecha} onChange={e => set('fecha', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Nota interna (solo vos la ves)</label>
          <input className="input-field" placeholder="Ej: le gusta más la línea Dior…" value={form.nota} onChange={e => set('nota', e.target.value)} />
        </div>
      </div>

      {/* Preview del mensaje */}
      {mensajePreview && (
        <div className="bg-obsidian-800 rounded-xl p-4 border border-obsidian-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-obsidian-500 uppercase tracking-wider">Preview del mensaje</span>
            <span className="text-xs text-obsidian-600">{mensajePreview.length} caracteres</span>
          </div>
          <p className="text-sm text-obsidian-200 leading-relaxed whitespace-pre-wrap">{mensajePreview}</p>
          <p className="text-xs text-obsidian-500">Podés editarlo antes de enviarlo desde la ficha del seguimiento.</p>
        </div>
      )}

      <div className="flex gap-3">
        <button className="btn-gold flex items-center gap-2" onClick={handleSave} disabled={!form.clienteId}>
          <Check size={15} /> Crear Seguimiento
        </button>
        <button className="btn-ghost flex items-center gap-2" onClick={onCancel}>
          <X size={15} /> Cancelar
        </button>
      </div>
    </div>
  )
}

function SeguimientoCard({ seg, ventas, onDelete, onMarcarEnviado, onToggleEstado }) {
  const [expanded, setExpanded] = useState(false)
  const [msgEdit, setMsgEdit] = useState(seg.mensajeCustom)
  const [editingMsg, setEditingMsg] = useState(false)

  const prioData = PRIORIDADES.find(p => p.id === seg.prioridad) || PRIORIDADES[1]
  const plantilla = PLANTILLAS.find(p => p.id === seg.plantillaId)

  const ultimaVenta = [...ventas]
    .filter(v => v.clienteId === seg.clienteId)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]

  const diasUltimaVenta = ultimaVenta ? diasDesde(ultimaVenta.fecha) : null
  const diasRecordatorio = seg.fechaRecordatorio ? diasDesde(seg.fechaRecordatorio) : null
  const recordatorioVencido = diasRecordatorio !== null && diasRecordatorio > 0
  const recordatorioHoy = diasRecordatorio !== null && diasRecordatorio === 0

  const waLink = seg.clienteTelefono
    ? buildWaLink(seg.clienteTelefono, msgEdit || seg.mensajeCustom)
    : null

  const handleEnviar = () => {
    if (waLink) {
      window.open(waLink, '_blank')
      onMarcarEnviado(seg.id, msgEdit || seg.mensajeCustom)
    }
  }

  return (
    <div className={`card-hover overflow-hidden
      ${seg.estado === 'completado' ? 'opacity-60' : ''}
      ${recordatorioVencido && seg.estado === 'pendiente' ? 'border-red-900/50' : ''}
      ${recordatorioHoy && seg.estado === 'pendiente' ? 'border-amber-800/60' : ''}
    `}>
      <div className="p-4 flex items-center gap-3 cursor-pointer select-none" onClick={() => setExpanded(v => !v)}>
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-obsidian-800 flex items-center justify-center text-sm font-semibold text-gold-500 flex-shrink-0">
          {seg.clienteNombre.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-obsidian-100">{seg.clienteNombre}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${prioData.bg} ${prioData.color}`}>
              {prioData.label}
            </span>
            {seg.estado === 'completado' && (
              <span className="badge-paid"><CheckCheck size={10} /> Completado</span>
            )}
            {recordatorioVencido && seg.estado === 'pendiente' && (
              <span className="badge-low-stock"><AlertTriangle size={10} /> Vencido</span>
            )}
            {recordatorioHoy && seg.estado === 'pendiente' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-900/50 text-amber-400">Hoy</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-obsidian-500">{plantilla?.emoji} {plantilla?.label}</span>
            {seg.fechaRecordatorio && (
              <span className="text-xs text-obsidian-600">· 📅 {formatDate(seg.fechaRecordatorio)}</span>
            )}
            {diasUltimaVenta !== null && (
              <span className="text-xs text-obsidian-600">· Última compra hace {diasUltimaVenta}d</span>
            )}
          </div>
        </div>

        {/* Quick send */}
        {waLink && seg.estado === 'pendiente' && (
          <button
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/60 transition-colors flex-shrink-0"
            onClick={e => { e.stopPropagation(); handleEnviar() }}
          >
            <MessageCircle size={13} /> WhatsApp
          </button>
        )}

        <div className="text-obsidian-500 flex-shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-obsidian-800 px-4 py-4 bg-obsidian-950/30 fade-up space-y-4">
          {/* Info cliente */}
          {(seg.clienteTelefono || ultimaVenta) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {seg.clienteTelefono && (
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-obsidian-500" />
                  <span className="text-xs text-obsidian-300">{seg.clienteTelefono}</span>
                </div>
              )}
              {ultimaVenta && (
                <div>
                  <p className="text-xs text-obsidian-500">Última compra</p>
                  <p className="text-xs text-obsidian-300">{ultimaVenta.perfumeNombre} · {formatCurrency(ultimaVenta.precioVenta)}</p>
                </div>
              )}
            </div>
          )}

          {/* Nota interna */}
          {seg.nota && (
            <div className="bg-obsidian-800 rounded-lg px-3 py-2 border border-obsidian-700">
              <p className="text-xs text-obsidian-500 mb-0.5">Nota interna</p>
              <p className="text-xs text-obsidian-300">{seg.nota}</p>
            </div>
          )}

          {/* Mensaje editable */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label">Mensaje a enviar</label>
              <button
                className="text-xs text-gold-500 hover:text-gold-400 transition-colors"
                onClick={() => setEditingMsg(v => !v)}
              >
                {editingMsg ? 'Cerrar edición' : 'Editar'}
              </button>
            </div>
            {editingMsg ? (
              <textarea
                className="input-field resize-none h-28 text-xs leading-relaxed"
                value={msgEdit}
                onChange={e => setMsgEdit(e.target.value)}
              />
            ) : (
              <div className="bg-obsidian-800 rounded-lg px-3 py-2.5 border border-obsidian-700">
                <p className="text-xs text-obsidian-300 leading-relaxed whitespace-pre-wrap">{msgEdit}</p>
              </div>
            )}
          </div>

          {/* Historial de envíos */}
          {seg.historial && seg.historial.length > 0 && (
            <div>
              <p className="label mb-2">Historial de mensajes</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {seg.historial.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCheck size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-obsidian-500">{formatDate(h.fecha)} — </span>
                      <span className="text-obsidian-400">{h.mensaje.slice(0, 60)}{h.mensaje.length > 60 ? '…' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-2">
            {waLink && seg.estado === 'pendiente' && (
              <button
                className="btn-gold flex items-center gap-2"
                onClick={handleEnviar}
              >
                <MessageCircle size={14} /> Abrir WhatsApp
              </button>
            )}
            {!seg.clienteTelefono && (
              <p className="text-xs text-obsidian-500 flex items-center gap-1">
                <Phone size={11} /> Sin teléfono registrado
              </p>
            )}
            <button
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all
                ${seg.estado === 'completado'
                  ? 'border-obsidian-600 text-obsidian-400 hover:text-obsidian-200'
                  : 'border-emerald-900/50 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40'}`}
              onClick={() => onToggleEstado(seg.id)}
            >
              <Check size={12} />
              {seg.estado === 'completado' ? 'Reabrir' : 'Marcar completado'}
            </button>
            <button className="btn-danger flex items-center gap-1.5" onClick={() => onDelete(seg.id)}>
              <Trash2 size={12} /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Seguimiento({ clientes, ventas, seguimientos, setSeguimientos }) {
  const [showForm, setShowForm] = useState(false)
  const [filtro, setFiltro] = useState('pendiente')
  const [search, setSearch] = useState('')

  const handleCrear = (data) => {
    setSeguimientos(prev => [...prev, { id: generateId(), creadoEn: new Date().toISOString(), ...data }])
    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este seguimiento?')) {
      setSeguimientos(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleMarcarEnviado = (id, mensaje) => {
    setSeguimientos(prev => prev.map(s =>
      s.id === id
        ? {
            ...s,
            historial: [...(s.historial || []), { fecha: new Date().toISOString(), mensaje }],
          }
        : s
    ))
  }

  const handleToggleEstado = (id) => {
    setSeguimientos(prev => prev.map(s =>
      s.id === id
        ? { ...s, estado: s.estado === 'completado' ? 'pendiente' : 'completado' }
        : s
    ))
  }

  const filtered = seguimientos
    .filter(s => {
      if (filtro === 'pendiente') return s.estado === 'pendiente'
      if (filtro === 'completado') return s.estado === 'completado'
      if (filtro === 'vencido') {
        const d = s.fechaRecordatorio ? diasDesde(s.fechaRecordatorio) : null
        return s.estado === 'pendiente' && d !== null && d > 0
      }
      return true
    })
    .filter(s =>
      s.clienteNombre.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Vencidos primero, luego por prioridad, luego por fecha
      const prioOrder = { alta: 0, media: 1, baja: 2 }
      const aDias = a.fechaRecordatorio ? diasDesde(a.fechaRecordatorio) : -99
      const bDias = b.fechaRecordatorio ? diasDesde(b.fechaRecordatorio) : -99
      if (aDias > 0 && bDias <= 0) return -1
      if (bDias > 0 && aDias <= 0) return 1
      return (prioOrder[a.prioridad] || 1) - (prioOrder[b.prioridad] || 1)
    })

  const pendientesCount = seguimientos.filter(s => s.estado === 'pendiente').length
  const vencidosCount = seguimientos.filter(s => {
    const d = s.fechaRecordatorio ? diasDesde(s.fechaRecordatorio) : null
    return s.estado === 'pendiente' && d !== null && d > 0
  }).length
  const hoyCount = seguimientos.filter(s => {
    const d = s.fechaRecordatorio ? diasDesde(s.fechaRecordatorio) : null
    return s.estado === 'pendiente' && d === 0
  }).length

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="section-title">Seguimiento WhatsApp</h2>
          <p className="text-sm text-obsidian-500 mt-0.5">
            {pendientesCount} pendiente{pendientesCount !== 1 ? 's' : ''}
            {vencidosCount > 0 && <span className="text-red-400"> · {vencidosCount} vencido{vencidosCount !== 1 ? 's' : ''}</span>}
            {hoyCount > 0 && <span className="text-amber-400"> · {hoyCount} para hoy</span>}
          </p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setShowForm(v => !v)}>
          <Plus size={15} /> Nuevo Seguimiento
        </button>
      </div>

      {/* Alerta de clientes sin teléfono */}
      {clientes.some(c => !c.telefono) && (
        <div className="flex items-start gap-2.5 text-sm text-amber-400 bg-amber-950/20 border border-amber-900/30 rounded-lg px-4 py-3">
          <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
          <span>
            {clientes.filter(c => !c.telefono).length} cliente{clientes.filter(c => !c.telefono).length !== 1 ? 's' : ''} sin teléfono registrado. Agregalo desde la pestaña Clientes para poder enviar mensajes.
          </span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-5 fade-up">
          {clientes.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-obsidian-400 text-sm">Primero debés registrar clientes en la pestaña Clientes.</p>
            </div>
          ) : (
            <NuevoRecordatorio
              clientes={clientes}
              ventas={ventas}
              onSave={handleCrear}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      )}

      {/* Plantillas rápidas info */}
      {!showForm && seguimientos.length === 0 && (
        <div className="card p-5">
          <p className="text-xs text-obsidian-500 uppercase tracking-wider mb-3">Plantillas disponibles</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {PLANTILLAS.map(p => (
              <div key={p.id} className="flex items-center gap-2 text-sm text-obsidian-400">
                <span>{p.emoji}</span>
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      {seguimientos.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input-field max-w-xs"
            placeholder="Buscar cliente…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'pendiente', label: 'Pendientes' },
              { id: 'vencido', label: `Vencidos${vencidosCount > 0 ? ` (${vencidosCount})` : ''}` },
              { id: 'completado', label: 'Completados' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border
                  ${filtro === f.id
                    ? f.id === 'vencido'
                      ? 'bg-red-950/30 border-red-900/50 text-red-400'
                      : 'bg-gold-600/20 border-gold-700/50 text-gold-400'
                    : 'border-obsidian-700 text-obsidian-500 hover:border-obsidian-600 hover:text-obsidian-300'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageCircle size={40} className="mx-auto mb-4 text-obsidian-700" />
          <p className="text-obsidian-400 font-display text-xl font-light">
            {seguimientos.length === 0 ? 'Sin seguimientos activos' : 'Sin resultados'}
          </p>
          <p className="text-obsidian-600 text-sm mt-2">
            {seguimientos.length === 0
              ? 'Creá tu primer recordatorio de seguimiento para un cliente.'
              : 'Probá con otro filtro.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <SeguimientoCard
              key={s.id}
              seg={s}
              ventas={ventas}
              onDelete={handleDelete}
              onMarcarEnviado={handleMarcarEnviado}
              onToggleEstado={handleToggleEstado}
            />
          ))}
        </div>
      )}
    </div>
  )
}
