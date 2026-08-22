import L from 'leaflet'
import { GeoJSON, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'

import nepalBoundary from '../data/nepal-boundary.json'
import { useTheme } from '../context/ThemeContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import 'leaflet/dist/leaflet.css'

const pinHtml = (name, featured, selected) => `
  <div class="flex flex-col items-center" style="min-width:60px">
    <div class="relative w-5 h-5">
      <span class="absolute inset-0 rounded-full ${selected ? 'bg-green-400' : 'bg-blue-300'} opacity-70 ${featured ? 'animate-ping' : ''}"></span>
      <span class="absolute inset-0 rounded-full ${selected ? 'bg-green-600 border-white' : 'bg-blue-600 border-white'} border-2 shadow-lg ${selected ? 'ring-2 ring-white/60' : ''}"></span>
    </div>
    <span class="mt-0.5 text-[10px] font-semibold leading-none text-center whitespace-nowrap ${selected ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'} drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">${name}</span>
  </div>
`

const NEPAL_BOUNDS = L.latLngBounds([26.35, 80.05], [30.45, 88.2])

const fitOptions = { padding: [30, 30], maxZoom: 9 }

function ResetView() {
  const map = useMap()
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={() => map.fitBounds(NEPAL_BOUNDS, fitOptions)}
      className="absolute top-4 right-4 z-[1000] flex items-center gap-2 px-3 py-2 bg-card text-ink text-sm font-semibold rounded-full shadow-lg hover:bg-subtle transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      </svg>
      {t('map.reset')}
    </button>
  )
}

function DestinationMarker({ destination, featured, selected, onSelect }) {
  const icon = L.divIcon({
    className: '',
    html: pinHtml(destination.name, featured, selected),
    iconSize: [80, 40],
    iconAnchor: [40, 20],
  })

  return (
    <Marker
      position={[Number(destination.latitude), Number(destination.longitude)]}
      icon={icon}
      eventHandlers={{ click: () => onSelect?.(destination) }}
    />
  )
}

export default function NepalMap({ destinations = [], onSelect, selectedSlug }) {
  const { isDark } = useTheme()
  const placed = destinations.filter((d) => d.latitude && d.longitude)
  const tileSet = isDark ? 'dark_all' : 'voyager'

  return (
    <MapContainer
      center={[28.3, 84.5]}
      zoom={7}
      minZoom={6}
      maxZoom={12}
      scrollWheelZoom={false}
      className="h-full w-full z-0 touch-none"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={`https://{s}.basemaps.cartocdn.com/rastertiles/${tileSet}/{z}/{x}/{y}{r}.png`}
        maxZoom={19}
      />
      {!isDark && (
        <GeoJSON
          key={`halo-${isDark}`}
          data={nepalBoundary}
          pathOptions={{ color: '#ffffff', weight: 5, opacity: 0.9, fill: false }}
        />
      )}
      <GeoJSON key={`border-${isDark}`} data={nepalBoundary} pathOptions={{ color: '#16a34a', weight: 2, fill: false }} />
      {placed.map((destination) => (
        <DestinationMarker
          key={destination.id}
          destination={destination}
          featured={destination.is_featured}
          selected={selectedSlug === destination.slug}
          onSelect={onSelect}
        />
      ))}
      <ResetView />
    </MapContainer>
  )
}
