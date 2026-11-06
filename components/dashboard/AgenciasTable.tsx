'use client'
import { Eye, Edit2, Trash2, CheckCircle } from 'lucide-react'

// Interfaz estricta, sin 'any'
interface Agencia {
  id_agencia: number
  codigo_agencia: number
  nombre_agencia: string
  direccion: string
  telefono: string
  horario_atencion: string
  estado: 'ACTIVA' | 'INACTIVA'
  id_municipio: number
  id_serie: number
  latitud: number | null
  longitud: number | null
  municipio: { id_municipio: number; nombre_municipio: string }
  serie: { id_serie: number; letra_serie: string }
}

interface Props {
  agencias: Agencia[]
  loading: boolean
  userRole: string
  selectedAgenciaId: number | null
  onSelect: (id: number) => void
  onEdit: (agencia: Agencia) => void
  onDelete: (id: number) => void
  onToggleStatus: (agencia: Agencia) => void
}

export default function AgenciasTable({
  agencias,
  loading,
  userRole,
  selectedAgenciaId,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">Listado de Agencias</h3>
        <span className="text-xs text-slate-500">{agencias.length} registros</span>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
            {loading ? (
              <tr>
                <td className="text-center py-8 text-slate-400">Cargando agencias...</td>
              </tr>
            ) : agencias.length === 0 ? (
              <tr>
                <td className="text-center py-8 text-slate-500">No se encontraron agencias.</td>
              </tr>
            ) : (
              agencias.map((agencia) => (
                <tr
                  key={agencia.id_agencia}
                  className={`hover:bg-slate-50 transition cursor-pointer ${
                    selectedAgenciaId === agencia.id_agencia ? 'bg-blue-50/60' : ''
                  }`}
                  onClick={() => onSelect(agencia.id_agencia)}
                >
                  <td className="px-4 py-4">
                    <div className="font-bold text-[#0033A0] mb-1 flex items-center gap-2">
                      <span>#{agencia.codigo_agencia} - {agencia.nombre_agencia}</span>
                      {agencia.serie?.letra_serie && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                          Serie {agencia.serie.letra_serie}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mb-2">
                      {agencia.direccion}, {agencia.municipio?.nombre_municipio}
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          agencia.estado === 'ACTIVA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {agencia.estado}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelect(agencia.id_agencia)
                          }}
                          className="text-slate-500 hover:text-[#0033A0]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {userRole === 'Administrador' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEdit(agencia)
                              }}
                              className="text-slate-500 hover:text-[#0033A0]"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // Solución al error de expresión no usada (no-unused-expressions)
                                if (agencia.estado === 'ACTIVA') {
                                  onDelete(agencia.id_agencia)
                                } else {
                                  onToggleStatus(agencia)
                                }
                              }}
                              className={`text-slate-500 hover:text-opacity-80 ${
                                agencia.estado === 'ACTIVA' ? 'hover:text-red-600' : 'hover:text-emerald-600'
                              }`}
                            >
                              {agencia.estado === 'ACTIVA' ? (
                                <Trash2 className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}