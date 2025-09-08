import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

// Import LSG Brand System
import '@/brand/theme.css'
import '@/brand/fonts.css'
import '@/brand/motion.css'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <Navigation />
        <div className="min-h-screen bg-paper-offwhite">
          {children}
        </div>
      </body>
    </html>
  )
}
