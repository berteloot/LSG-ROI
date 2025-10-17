export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

// Import LSG Brand System
import '@/brand/theme.css'
import '@/brand/fonts.css'
import '@/brand/motion.css'

export const metadata: Metadata = {
  title: 'ROI Calculator - Lean Solutions Group',
  description: 'Calculate Return on Investment for your projects with our modern web application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-forma">
        <Navigation />
        <div className="min-h-screen bg-paper-offwhite">
          {children}
        </div>
      </body>
    </html>
  )
}
