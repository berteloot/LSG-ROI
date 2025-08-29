import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ROI Calculator - Investment Analysis Tool',
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
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
          {children}
        </div>
      </body>
    </html>
  )
}
