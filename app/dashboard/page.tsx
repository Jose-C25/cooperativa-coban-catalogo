'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Building2,
  Plus,
  Search,
  LogOut,
  MapPin,
  Phone,
  Clock,
  Edit2,
  Trash2,
  X,
  ShieldCheck,
  Filter,
  Eye,
  CheckCircle,
} from 'lucide-react'
import DashboardMetrics from '@/components/DashboardMetrics'

const DynamicMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 font-medium">
      Cargando Mapa de Agencias...
    </div>
  ),
})

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

interface Catalogos {
  departamentos: { id_departamento: number; nombre_departamento: string }[]
  municipios: { id_municipio: number; nombre_municipio: string }[]
  series: { id_serie: number; letra_serie: string }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [agencias, setAgencias] = useState<Agencia[]>([])
  const [catalogos, setCatalogos] = useState<Catalogos>({ departamentos: [], municipios: [], series: [] })
  const [loading, setLoading] = useState(true)
  
  // Estado para el rol del usuario (por defecto Consulta para proteger la UI)
  const [userRole, setUserRole] = useState<string>('Consulta')

  // Filtros y Selección
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMunicipio, setSelectedMunicipio] = useState('')
  const [selectedEstado, setSelectedEstado] = useState('TODAS')
  const [selectedAgenciaId, setSelectedAgenciaId] = useState<number | null>(null)

  // Modal CRUD
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAgencia, setEditingAgencia] = useState<Agencia | null>(null)
  const [formData, setFormData] = useState({
    nombre_agencia: '',
    codigo_agencia: '',
    direccion: '',
    telefono: '',
    horario_atencion: '8:00 AM - 5:00 PM',
    id_municipio: '',
    id_serie: '',
    latitud: '15.4708',
    longitud: '-90.3708',
    estado: 'ACTIVA',
  })
  const [errorModal, setErrorModal] = useState('')

  // Cargar rol del usuario autenticado
  useEffect(() => {
    let active = true
    async function loadUserRole() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok && active) {
          const data = await res.json()
          if (data.rol) setUserRole(data.rol)
        }
      } catch (err) {
        console.error('Error cargando rol del usuario:', err)
      }
    }
    loadUserRole()
    return () => { active = false }
  }, [])

  // Cargar catálogos
  useEffect(() => {
    let active = true
    async function loadCatalogos() {
      try {
        const catRes = await fetch('/api/catalogos')
        if (catRes.ok && active) {
          const catData = await catRes.json()
          setCatalogos(catData)
        }
      } catch (err) {
        console.error('Error cargando catálogos:', err)
      }
    }
    loadCatalogos()
    return () => { active = false }
  }, [])

  // Cargar agencias según filtros
  useEffect(() => {
    let active = true

    async function getAgencias() {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedMunicipio) params.append('id_municipio', selectedMunicipio)

      try {
        const res = await fetch(`/api/agencias?${params.toString()}`)
        if (res.status === 401) {
          router.push('/login')
          return
        }
        const data = await res.json()
        if (active && Array.isArray(data)) {
          const filtered = data.filter((a) => {
            if (selectedEstado === 'TODAS') return true
            return a.estado === selectedEstado
          })
          setAgencias(filtered)
        }
      } catch (err) {
        console.error('Error al cargar agencias:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    getAgencias()

    return () => { active = false }
  }, [searchTerm, selectedMunicipio, selectedEstado, router])

  const reloadAgencias = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedMunicipio) params.append('id_municipio', selectedMunicipio)

      const res = await fetch(`/api/agencias?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          const filtered = data.filter((a) => {
            if (selectedEstado === 'TODAS') return true
            return a.estado === selectedEstado
          })
          setAgencias(filtered)
        }
      }
    } catch (err) {
      console.error('Error al recargar agencias:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const handleOpenModal = (agencia?: Agencia) => {
    setErrorModal('')
    if (agencia) {
      setEditingAgencia(agencia)
      setFormData({
        nombre_agencia: agencia.nombre_agencia,
        codigo_agencia: agencia.codigo_agencia.toString(),
        direccion: agencia.direccion,
        telefono: agencia.telefono,
        horario_atencion: agencia.horario_atencion,
        id_municipio: agencia.id_municipio.toString(),
        id_serie: agencia.id_serie.toString(),
        latitud: agencia.latitud ? agencia.latitud.toString() : '15.4708',
        longitud: agencia.longitud ? agencia.longitud.toString() : '-90.3708',
        estado: agencia.estado,
      })
    } else {
      setEditingAgencia(null)
      setFormData({
        nombre_agencia: '',
        codigo_agencia: '',
        direccion: '',
        telefono: '',
        horario_atencion: 'Lunes a Viernes, 08:00 a 17:00',
        id_municipio: catalogos.municipios[0]?.id_municipio.toString() || '1',
        id_serie: catalogos.series[0]?.id_serie.toString() || '1',
        latitud: '15.4708',
        longitud: '-90.3708',
        estado: 'ACTIVA',
      })
    }
    setModalOpen(true)
  }

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorModal('')

    const url = editingAgencia ? `/api/agencias/${editingAgencia.id_agencia}` : '/api/agencias'
    const method = editingAgencia ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al procesar la solicitud')
      }

      setModalOpen(false)
      reloadAgencias()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorModal(err.message)
      } else {
        setErrorModal('Error al guardar registro')
      }
    }
  }

  const handleDeleteAgencia = async (id: number) => {
    if (!confirm('¿Está seguro de que desea inactivar esta agencia?')) return

    try {
      const res = await fetch(`/api/agencias/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Error al inactivar agencia')
        return
      }
      reloadAgencias()
    } catch (err) {
      console.error('Error al inactivar:', err)
    }
  }

  const handleToggleEstado = async (agencia: Agencia) => {
    const nuevoEstado = agencia.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA'
    const confirmMessage = `¿Desea cambiar el estado de la agencia a ${nuevoEstado}?`

    if (!confirm(confirmMessage)) return

    try {
      const res = await fetch(`/api/agencias/${agencia.id_agencia}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...agencia,
          estado: nuevoEstado,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Error al actualizar el estado')
        return
      }

      reloadAgencias()
    } catch (err) {
      console.error('Error al cambiar estado:', err)
    }
  }

  const agenciaDetalle = agencias.find((a) => a.id_agencia === selectedAgenciaId)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-[#0033A0] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Building2 className="w-7 h-7 text-[#82BC00]" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-wide">
                COOPERATIVA COBÁN
              </h1>
              <p className="text-xs text-emerald-300 font-semibold tracking-wider uppercase">
                Catálogo de Agencias — es Mi Coope
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs">
              <ShieldCheck className="w-4 h-4 text-[#82BC00]" />
              <span className="font-medium">Panel de {userRole}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <DashboardMetrics agencias={agencias} userRole={userRole} />
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por agencia o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800"
              />
            </div>

            <div className="relative min-w-[180px]">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedMunicipio}
                onChange={(e) => setSelectedMunicipio(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800 appearance-none bg-white"
              >
                <option value="">Todos los Municipios</option>
                {catalogos.municipios.map((m) => (
                  <option key={m.id_municipio} value={m.id_municipio}>
                    {m.nombre_municipio}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative min-w-[150px]">
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800 bg-white font-medium"
              >
                <option value="TODAS">Todos los Estados</option>
                <option value="ACTIVA">Solo Activas</option>
                <option value="INACTIVA">Solo Inactivas</option>
              </select>
            </div>
          </div>

          {userRole === 'Administrador' && (
            <button
              onClick={() => handleOpenModal()}
              className="w-full md:w-auto bg-[#0033A0] hover:bg-[#002266] text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#82BC00]" />
              <span>Nueva Agencia</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0033A0]" />
              Ubicación Geográfica de Agencias
            </h2>
            {selectedAgenciaId && (
              <button
                onClick={() => setSelectedAgenciaId(null)}
                className="text-xs text-[#0033A0] hover:underline font-semibold"
              >
                Resetear Zoom del Mapa
              </button>
            )}
          </div>

          <DynamicMap
            agencias={agencias}
            selectedAgenciaId={selectedAgenciaId}
            onSelectAgencia={(id) => setSelectedAgenciaId(id)}
          />
        </div>

        {agenciaDetalle && (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl shadow-sm relative">
            <button
              onClick={() => setSelectedAgenciaId(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-[#0033A0] font-bold text-lg mb-2">
              <Building2 className="w-6 h-6 text-[#82BC00]" />
              <span>{agenciaDetalle.nombre_agencia}</span>
              <span className="text-xs bg-[#0033A0] text-white px-2 py-0.5 rounded-md font-normal">
                Código #{agenciaDetalle.codigo_agencia}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span><strong>Dirección:</strong> {agenciaDetalle.direccion}, {agenciaDetalle.municipio?.nombre_municipio}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span><strong>Teléfono:</strong> {agenciaDetalle.telefono}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span><strong>Días y Horarios:</strong> {agenciaDetalle.horario_atencion}</span>
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Listado de Agencias Registradas
            </h3>
            <span className="text-xs text-slate-500">
              Mostrando {agencias.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-3">Código</th>
                  <th className="px-6 py-3">Agencia</th>
                  <th className="px-6 py-3">Ubicación</th>
                  <th className="px-6 py-3">Contacto / Horario</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Cargando agencias...
                    </td>
                  </tr>
                ) : agencias.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No se encontraron agencias con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  agencias.map((agencia) => (
                    <tr
                      key={agencia.id_agencia}
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        selectedAgenciaId === agencia.id_agencia ? 'bg-blue-50/60' : ''
                      }`}
                      onClick={() => setSelectedAgenciaId(agencia.id_agencia)}
                    >
                      <td className="px-6 py-4 font-bold text-[#0033A0]">
                        #{agencia.codigo_agencia}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{agencia.nombre_agencia}</div>
                        <div className="text-[11px] text-slate-500">Serie {agencia.serie?.letra_serie}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{agencia.direccion}</div>
                        <div className="text-[11px] text-slate-500">{agencia.municipio?.nombre_municipio}</div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{agencia.telefono}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{agencia.horario_atencion}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            if (userRole === 'Administrador') {
                              e.stopPropagation()
                              handleToggleEstado(agencia)
                            } else {
                              e.stopPropagation()
                            }
                          }}
                          disabled={userRole !== 'Administrador'}
                          title="Estado"
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                            userRole === 'Administrador' ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                          } ${
                            agencia.estado === 'ACTIVA'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {agencia.estado === 'ACTIVA' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          {agencia.estado}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedAgenciaId(agencia.id_agencia)}
                          className="p-1.5 text-slate-600 hover:text-[#0033A0] hover:bg-slate-100 rounded-lg transition"
                          title="Ver en Mapa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {userRole === 'Administrador' && (
                          <>
                            <button
                              onClick={() => handleOpenModal(agencia)}
                              className="p-1.5 text-slate-600 hover:text-[#0033A0] hover:bg-slate-100 rounded-lg transition"
                              title="Editar Agencia"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {agencia.estado === 'ACTIVA' ? (
                              <button
                                onClick={() => handleDeleteAgencia(agencia.id_agencia)}
                                className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                                title="Inactivar Agencia"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleEstado(agencia)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                                title="Reactivar Agencia"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {modalOpen && userRole === 'Administrador' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="bg-[#0033A0] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#82BC00]" />
                {editingAgencia ? 'Editar Agencia' : 'Registrar Nueva Agencia'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 space-y-4">
              {errorModal && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {errorModal}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Código *
                  </label>
                  <input
                    type="number"
                    required
                    disabled={!!editingAgencia}
                    value={formData.codigo_agencia}
                    onChange={(e) => setFormData({ ...formData, codigo_agencia: e.target.value })}
                    placeholder="1003"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Serie *
                  </label>
                  <select
                    value={formData.id_serie}
                    onChange={(e) => setFormData({ ...formData, id_serie: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800"
                  >
                    {catalogos.series.map((s) => (
                      <option key={s.id_serie} value={s.id_serie}>
                        Serie {s.letra_serie}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre de Agencia *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre_agencia}
                  onChange={(e) => setFormData({ ...formData, nombre_agencia: e.target.value })}
                  placeholder="Ej. Agencia San Juan Chamelco"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Municipio *
                </label>
                <select
                  value={formData.id_municipio}
                  onChange={(e) => setFormData({ ...formData, id_municipio: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800"
                >
                  {catalogos.municipios.map((m) => (
                    <option key={m.id_municipio} value={m.id_municipio}>
                      {m.nombre_municipio}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  required
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Ej. 2a Calle 3-12 Zona 1"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Ubicación en el Mapa (Haz clic para seleccionar)
                </label>
                <DynamicMap
                  isPickerMode={true}
                  pickerCoords={{
                    lat: parseFloat(formData.latitud) || 15.4708,
                    lng: parseFloat(formData.longitud) || -90.3708,
                  }}
                  onPickCoords={(lat, lng) => {
                    setFormData({
                      ...formData,
                      latitud: lat.toFixed(6),
                      longitud: lng.toFixed(6),
                    })
                  }}
                />
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono pt-1">
                  <div>Lat: {formData.latitud}</div>
                  <div>Lng: {formData.longitud}</div>
                </div>
              </div>

             <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="77900000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Días y Horarios *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.horario_atencion}
                    onChange={(e) => setFormData({ ...formData, horario_atencion: e.target.value })}
                    placeholder="Ej: L-V, 08:00 a 17:00"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800"
                >
                  <option value="ACTIVA">ACTIVA</option>
                  <option value="INACTIVA">INACTIVA</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#0033A0] hover:bg-[#002266] text-white rounded-lg shadow transition"
                >
                  {editingAgencia ? 'Guardar Cambios' : 'Crear Agencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}