'use client'
import { Building2, ShieldCheck, LogOut } from 'lucide-react'

interface Props {
  userRole: string;
  onLogout: () => void;
}

export default function DashboardHeader({ userRole, onLogout }: Props) {
  return (
    <header className="bg-[#0033A0] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <Building2 className="w-7 h-7 text-[#82BC00]" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide">COOPERATIVA COBÁN</h1>
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
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}