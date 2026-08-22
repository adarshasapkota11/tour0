import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/index.jsx'

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{children}</p>
    </section>
  )
}

export default function Privacy() {
  const { t } = useI18n()
  usePageTitle(t('privacy.title'))
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink">{t('privacy.title')}</h1>
      <p className="mt-1 text-ink-muted">{t('privacy.subtitle')}</p>
      <p className="mt-2 text-xs text-ink-faint">
        {t('privacy.lastUpdated')}: {new Date().toLocaleDateString()}
      </p>

      <p className="mt-8 text-sm leading-relaxed text-ink-muted">{t('privacy.intro')}</p>

      <div className="mt-6 space-y-6">
        <Section title={t('privacy.dataWeCollect')}>{t('privacy.dataWeCollectText')}</Section>
        <Section title={t('privacy.howWeUse')}>{t('privacy.howWeUseText')}</Section>
        <Section title={t('privacy.sharing')}>{t('privacy.sharingText')}</Section>
        <Section title={t('privacy.security')}>{t('privacy.securityText')}</Section>
        <Section title={t('privacy.yourRights')}>{t('privacy.yourRightsText')}</Section>
        <Section title={t('privacy.contact')}>{t('privacy.contactText')}</Section>
      </div>
    </div>
  )
}
