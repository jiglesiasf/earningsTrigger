import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'
import ClientNav from '@/components/ClientNav'

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
        <I18nProvider>
          <ClientNav />
          <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  )
}
