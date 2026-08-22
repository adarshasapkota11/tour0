import { Link } from 'react-router-dom'

import { activityImage } from '../api/staticImages'
import { useI18n } from '../i18n/index.jsx'
import { formatPrice } from '../utils/nepaliDate.js'
import Media from './Media'

const difficultyStyles = {
  easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  moderate: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  challenging: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

export default function ActivityCard({ activity }) {
  const { t, lang } = useI18n()
  const difficultyLabels = {
    easy: t('difficulty.easy'),
    moderate: t('difficulty.moderate'),
    challenging: t('difficulty.challenging'),
  }
  const difficultyLabel = difficultyLabels[activity.difficulty] || activity.difficulty
  return (
    <Link
      to={`/activities/${activity.slug}`}
      className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-line flex flex-col"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <Media
          src={activityImage(activity)}
          alt={activity.name}
          label={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink group-hover:text-brand-600 leading-snug">
            {activity.name}
          </h3>
          <span className="text-sm font-bold text-brand-600 shrink-0">
            {formatPrice(activity.price, lang)}
          </span>
        </div>
        <p className="text-sm text-ink-muted">
          {activity.destination_name} · {activity.duration}
        </p>
        <div className="mt-auto pt-2 flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
              difficultyStyles[activity.difficulty] || 'bg-subtle text-ink-muted'
            }`}
          >
            {difficultyLabel}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-subtle text-ink-muted">
            {activity.category_name}
          </span>
        </div>
      </div>
    </Link>
  )
}
