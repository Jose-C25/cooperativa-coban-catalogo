'use client'

import { Building2, CheckCircle2, XCircle, MapPin } from 'lucide-react'

interface Agencia {
  id_agencia: number
  estado: string
  municipio: { nombre_municipio: string }
}

interface DashboardMetricsProps {
  agencias: Agencia[]
  userRole: string // 'Administrador' o 'Consulta'
}

export default function DashboardMetrics({ agencias, userRole }: DashboardMetricsProps) {
  // Regla de seguridad visual: Si no es Admin, no mostramos el dashboard
  if (userRole !== 'Administrador') return null

  // Cálculos de métricas
  const totalAgencias = agencias.length
  const activas = agencias.filter((a) => a.estado === 'ACTIVA').length
  const inactivas = agencias.filter((a) => a.estado === 'INACTIVA').length

  // Agrupación por municipio
  const metricasMunicipio = agencias.reduce((acc, agencia) => {
    const muni = agencia.municipio?.nombre_municipio || 'Sin Asignar'
    if (!acc[muni]) {
      acc[muni] = { activas: 0, inactivas: 0 }
    }
    if (agencia.estado === 'ACTIVA') {
      acc[muni].activas += 1
    } else {
      acc[muni].inactivas += 1
    }
    return acc
  }, {} as Record<string, { activas: number; inactivas: number }>)

  return (
    <div className="mb-8 space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Panel de Métricas Administrativas</h2>
      
      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Agencias</p>
            <p className="text-2xl font-bold text-slate-800">{totalAgencias}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Agencias Activas</p>
            <p className="text-2xl font-bold text-emerald-600">{activas}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Agencias Inactivas</p>
            <p className="text-2xl font-bold text-rose-600">{inactivas}</p>
          </div>
        </div>
      </div>

      {/* Tarjeta de Distribución por Municipio */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <MapPin size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-700 text-sm">Distribución por Municipio</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(metricasMunicipio).map(([municipio, counts]) => (
              <div key={municipio} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="font-semibold text-slate-700 text-sm mb-2">{municipio}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-600 font-medium">Activas: {counts.activas}</span>
                  <span className="text-rose-600 font-medium">Inactivas: {counts.inactivas}</span>
                </div>
              </div>
            ))}
            {Object.keys(metricasMunicipio).length === 0 && (
              <p className="text-sm text-slate-500 col-span-full">No hay datos de municipios disponibles.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}