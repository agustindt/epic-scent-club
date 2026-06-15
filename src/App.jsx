import React, { useState } from 'react'
import { LayoutDashboard, Package, Users, ShoppingBag, MessageCircle, AlertTriangle, Database } from 'lucide-react'
import { useClientes } from './hooks/useClientes'
import { usePerfumes } from './hooks/usePerfumes'
import { useVentas } from './hooks/useVentas'
import { useSeguimientos } from './hooks/useSeguimientos'
import { bulkCreateClientes } from './api/clientes'
import { bulkCreatePerfumes } from './api/perfumes'
import { bulkCreateVentas } from './api/ventas'
import { bulkCreateSeguimientos } from './api/seguimientos'
import Dashboard from './components/Dashboard'
import Inventario from './components/Inventario'
import Clientes from './components/Clientes'
import Ventas from './components/Ventas'
import Seguimiento from './components/Seguimiento'
import DataBackup from './components/DataBackup'

const TABS = [
  { id: 'dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
  { id: 'inventario',  label: 'Inventario',  Icon: Package },
  { id: 'clientes',    label: 'Clientes',    Icon: Users },
  { id: 'ventas',      label: 'Ventas',      Icon: ShoppingBag },
  { id: 'seguimiento', label: 'Seguimiento', Icon: MessageCircle },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showBackup, setShowBackup] = useState(false)

  const clientesHook = useClientes()
  const perfumesHook = usePerfumes()
  const ventasHook = useVentas()
  const seguimientosHook = useSeguimientos()

  const { clientes } = clientesHook
  const { perfumes } = perfumesHook
  const { ventas } = ventasHook
  const { seguimientos } = seguimientosHook

  const handleImportBackup = async (data) => {
    const tasks = []
    if (data.esc_clientes?.length) tasks.push(bulkCreateClientes(data.esc_clientes).then(() => clientesHook.reload()))
    if (data.esc_perfumes?.length) tasks.push(bulkCreatePerfumes(data.esc_perfumes).then(() => perfumesHook.reload()))
    if (data.esc_ventas?.length) tasks.push(bulkCreateVentas(data.esc_ventas).then(() => ventasHook.reload()))
    if (data.esc_seguimientos?.length) tasks.push(bulkCreateSeguimientos(data.esc_seguimientos).then(() => seguimientosHook.reload()))
    await Promise.allSettled(tasks)
  }

  const handleVenta = async (data) => {
    await ventasHook.addVenta(data)
    await perfumesHook.reload()
  }

  const pendientesCount  = ventas.filter(v => v.estadoPago === 'pendiente').length
  const lowStockCount    = perfumes.filter(p => p.stock > 0 && p.stock < 2).length
  const alertBadgeTotal  = pendientesCount + lowStockCount

  const segPendientes = seguimientos.filter(s => s.estado === 'pendiente').length
  const segVencidos   = seguimientos.filter(s => {
    if (s.estado !== 'pendiente' || !s.fechaRecordatorio) return false
    const diff = Math.floor((Date.now() - new Date(s.fechaRecordatorio).getTime()) / 86400000)
    return diff > 0
  }).length

  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col">
      <header className="border-b border-obsidian-800 bg-obsidian-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-obsidian-950 font-bold text-xs">E</span>
              </div>
              <div>
                <h1 className="shimmer-gold font-display text-lg font-light tracking-[0.15em] leading-none">
                  EPIC SCENT CLUB
                </h1>
                <p className="text-obsidian-600 text-[9px] tracking-[0.3em] uppercase leading-none mt-0.5">Parfum</p>
              </div>
            </div>

            {alertBadgeTotal > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/30 border border-amber-900/40 rounded-full px-3 py-1">
                <AlertTriangle size={12} />
                <span>{alertBadgeTotal} alerta{alertBadgeTotal !== 1 ? 's' : ''}</span>
              </div>
            )}

            <button
              onClick={() => setShowBackup(v => !v)}
              className={`p-2 rounded-lg transition-colors ${showBackup ? 'text-gold-400 bg-gold-950/30' : 'text-obsidian-500 hover:text-gold-400 hover:bg-obsidian-800'}`}
              title="Respaldo de datos"
              aria-label="Respaldo de datos"
            >
              <Database size={18} />
            </button>
          </div>

          <nav className="flex gap-1 overflow-x-auto pb-px" role="tablist" aria-label="Navegación principal">
            {TABS.map(({ id, label, Icon }) => {
              const isActive = activeTab === id
              let badge = 0
              let badgeColor = 'bg-amber-500 text-obsidian-950'
              if (id === 'ventas')      { badge = pendientesCount }
              if (id === 'inventario')  { badge = lowStockCount;  badgeColor = 'bg-red-600 text-white' }
              if (id === 'seguimiento') {
                badge = segVencidos > 0 ? segVencidos : segPendientes
                badgeColor = segVencidos > 0 ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
              }

              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-150
                    ${isActive ? 'tab-active' : 'tab-inactive'}`}
                >
                  <Icon size={15} />
                  {label}
                  {badge > 0 && (
                    <span className={`text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${badgeColor}`}>
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {showBackup && (
          <div className="mb-6">
            <DataBackup
              onImport={handleImportBackup}
              onClose={() => setShowBackup(false)}
              data={{ clientes, perfumes, ventas, seguimientos }}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard perfumes={perfumes} ventas={ventas} clientes={clientes} />
        )}
        {activeTab === 'inventario' && (
          <Inventario {...perfumesHook} />
        )}
        {activeTab === 'clientes' && (
          <Clientes
            {...clientesHook}
            ventas={ventas}
            togglePago={ventasHook.togglePago}
          />
        )}
        {activeTab === 'ventas' && (
          <Ventas
            {...ventasHook}
            perfumes={perfumes}
            clientes={clientes}
            onVenta={handleVenta}
            reloadPerfumes={perfumesHook.reload}
          />
        )}
        {activeTab === 'seguimiento' && (
          <Seguimiento
            {...seguimientosHook}
            clientes={clientes}
            ventas={ventas}
          />
        )}
      </main>

      <footer className="border-t border-obsidian-900 py-4">
        <p className="text-center text-xs text-obsidian-700 tracking-wider">
          EPIC SCENT CLUB PARFUM · Sistema de Gestión
        </p>
      </footer>
    </div>
  )
}
