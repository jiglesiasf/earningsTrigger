'use client'

import { useTranslation } from '@/lib/i18n'

export default function ClientNav() {
  const { t, locale, setLocale } = useTranslation()

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 10, 15, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <a href="/earningsTrigger/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'white',
            }}>E</div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {t('nav.brand')}
            </span>
          </div>
        </a>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <a href="/earningsTrigger/" style={{
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '500',
          }}>{t('nav.dashboard')}</a>
          <a href="/earningsTrigger/earnings/" style={{
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '500',
          }}>{t('nav.calendar')}</a>
          <div style={{
            marginLeft: '8px',
            display: 'flex',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            <button
              onClick={() => setLocale('en')}
              style={{
                padding: '6px 10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                background: locale === 'en' ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: locale === 'en' ? '#3b82f6' : 'var(--text-muted)',
              }}
            >EN</button>
            <button
              onClick={() => setLocale('es')}
              style={{
                padding: '6px 10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                background: locale === 'es' ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: locale === 'es' ? '#3b82f6' : 'var(--text-muted)',
              }}
            >ES</button>
          </div>
        </div>
      </div>
    </nav>
  )
}
