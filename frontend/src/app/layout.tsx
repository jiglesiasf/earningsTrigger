import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Earnings Trigger',
  description: 'Automated earnings trading analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
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
                  Earnings Trigger
                </span>
              </div>
            </a>
            <div style={{ display: 'flex', gap: '4px' }}>
              <a href="/earningsTrigger/" style={{
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.15s',
              }}>Dashboard</a>
              <a href="/earningsTrigger/earnings/" style={{
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.15s',
              }}>Calendar</a>
            </div>
          </div>
        </nav>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
