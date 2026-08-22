import { Link } from 'react-router-dom'

import { placeImage } from '../api/staticImages'
import { useI18n } from '../i18n/index.jsx'
import { formatNum } from '../utils/nepaliDate.js'
import Media from './Media'

export default function DestinationCard({ destination }) {
  const { t, lang } = useI18n()
  return (
    <Link
      to={`/destinations/${destination.slug}`}
      className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-line"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <Media
          src={placeImage(destination)}
          alt={destination.name}
          label={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-ink group-hover:text-brand-600">
            {destination.name}
          </h3>
          {destination.is_featured && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-tint text-brand-tint-fg font-medium shrink-0">
              {t('cards.featured')}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-muted uppercase tracking-wide">
          {destination.province} · {t('cards.activityCount', { count: formatNum(destination.activity_count, lang) })}
        </p>
      </div>
    </Link>
  )
}
