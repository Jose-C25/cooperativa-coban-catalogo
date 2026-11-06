'use client'

import { useEffect, useRef, memo } from 'react'
import L from 'leaflet'

const iconAgencia = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface Agencia {
  id_agencia: number
  nombre_agencia: string
  direccion: string
  telefono: string
  horario_atencion: string
  latitud: number | null
  longitud: number | null
  municipio: { nombre_municipio: string }
}

interface MapProps {
  agencias?: Agencia[]
  selectedAgenciaId?: number | null
  onSelectAgencia?: (id: number) => void
  isPickerMode?: boolean
  pickerCoords?: { lat: number; lng: number } | null
  onPickCoords?: (lat: number, lng: number) => void
}

const Map = ({
  agencias = [],
  selectedAgenciaId = null,
  onSelectAgencia,
  isPickerMode = false,
  pickerCoords = null,
  onPickCoords,
}: MapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const node = container as HTMLDivElement & { _leaflet_id?: unknown }
    
    if (node._leaflet_id) {
      delete node._leaflet_id
    }
    container.innerHTML = ''

    const mapDiv = document.createElement('div')
    mapDiv.style.width = '100%'
    mapDiv.style.height = '100%'
    container.appendChild(mapDiv)

    const defaultCenter: [number, number] = [15.4708, -90.3708]
    const initialCenter = isPickerMode && pickerCoords
      ? [pickerCoords.lat, pickerCoords.lng]
      : defaultCenter

    const map = L.map(mapDiv, {
      center: initialCenter as L.LatLngExpression,
      zoom: isPickerMode ? 13 : 11,
      scrollWheelZoom: isPickerMode,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    if (isPickerMode) {
      if (pickerCoords) {
        L.marker([pickerCoords.lat, pickerCoords.lng], { icon: iconAgencia })
          .bindPopup('Ubicación seleccionada')
          .addTo(map)
      }
      if (onPickCoords) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onPickCoords(e.latlng.lat, e.latlng.lng)
        })
      }
    } else {
      const validAgencias = agencias.filter((a) => a.latitud !== null && a.longitud !== null)
      let targetCoords: [number, number] | null = null

      validAgencias.forEach((agencia) => {
        const isSelected = agencia.id_agencia === selectedAgenciaId
        const lat = Number(agencia.latitud)
        const lng = Number(agencia.longitud)

        if (isSelected) targetCoords = [lat, lng]

        const marker = L.marker([lat, lng], { icon: iconAgencia })
          .bindPopup(`
            <div style="min-width: 190px; font-family: sans-serif;">
              <div style="font-weight: bold; color: #0033A0; font-size: 13px; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
                ${agencia.nombre_agencia}
              </div>
              <div style="font-size: 11px; color: #475569; line-height: 1.5;">
                <div><strong>Dir:</strong> ${agencia.direccion}, ${agencia.municipio?.nombre_municipio || ''}</div>
                <div><strong>Tel:</strong> ${agencia.telefono}</div>
                <div><strong>Días y Horarios:</strong> ${agencia.horario_atencion}</div>
              </div>
            </div>
          `)
          .on('click', () => {
            if (onSelectAgencia) onSelectAgencia(agencia.id_agencia)
          })
          .addTo(map)

        if (isSelected) marker.openPopup()
      })

      if (targetCoords) {
        map.flyTo(targetCoords, 15, { duration: 1.2 })
      }
    }

    return () => {
      map.remove()
      if (container.contains(mapDiv)) {
        container.removeChild(mapDiv)
      }
    }
  }, [agencias, selectedAgenciaId, isPickerMode, pickerCoords, onPickCoords, onSelectAgencia])

  return (
    <div className="w-full h-full relative isolate z-0">
      <div
        ref={containerRef}
        className={`w-full ${isPickerMode ? 'h-[250px]' : 'h-[450px]'} rounded-xl border border-slate-200 shadow-sm overflow-hidden`}
      />
      {isPickerMode && (
        <p className="text-[11px] text-slate-500 bg-amber-50 p-1.5 border-t border-amber-200 text-center font-medium rounded-b-xl">
          Nota: Haz clic sobre cualquier punto del mapa para establecer las coordenadas.
        </p>
      )}
    </div>
  )
}

// Validación de renderizado: Ignora cambios de texto en el padre,
// redibuja solo si cambian las coordenadas, el ID seleccionado o la lista de agencias.
export default memo(Map, (prevProps, nextProps) => {
  if (prevProps.selectedAgenciaId !== nextProps.selectedAgenciaId) return false
  if (prevProps.isPickerMode !== nextProps.isPickerMode) return false
  if (prevProps.pickerCoords?.lat !== nextProps.pickerCoords?.lat) return false
  if (prevProps.pickerCoords?.lng !== nextProps.pickerCoords?.lng) return false
  
  const prevIds = prevProps.agencias?.map(a => a.id_agencia).join(',')
  const nextIds = nextProps.agencias?.map(a => a.id_agencia).join(',')
  if (prevIds !== nextIds) return false

  return true
})