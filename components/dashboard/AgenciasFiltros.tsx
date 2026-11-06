'use client'
import { Search, Filter, Plus } from 'lucide-react'

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedMunicipio: string;
  setSelectedMunicipio: (v: string) => void;
  selectedEstado: string;
  setSelectedEstado: (v: string) => void;
  municipios: { id_municipio: number; nombre_municipio: string }[];
  userRole: string;
  onNewAgencia: () => void;
}

export default function AgenciasFiltros({
  searchTerm, setSearchTerm, selectedMunicipio, setSelectedMunicipio,
  selectedEstado, setSelectedEstado, municipios, userRole, onNewAgencia
}: Props) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar agencia o dirección..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800"
        />
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedMunicipio}
            onChange={(e) => setSelectedMunicipio(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800 bg-white"
          >
            <option value="">Todos</option>
            {municipios.map((m) => (
              <option key={m.id_municipio} value={m.id_municipio}>{m.nombre_municipio}</option>
            ))}
          </select>
        </div>
        <div className="relative flex-1">
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0033A0] outline-none text-slate-800 bg-white font-medium"
          >
            <option value="TODAS">Todos</option>
            <option value="ACTIVA">Activas</option>
            <option value="INACTIVA">Inactivas</option>
          </select>
        </div>
      </div>
      {userRole === 'Administrador' && (
        <button
          onClick={onNewAgencia}
          className="w-full bg-[#0033A0] hover:bg-[#002266] text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#82BC00]" />
          <span>Nueva Agencia</span>
        </button>
      )}
    </div>
  )
}