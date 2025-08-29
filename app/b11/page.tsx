import B11Calculator from '@/components/B11Calculator'
import { Calculator, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'

export default function B11Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center text-white mb-12">
        <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <Calculator className="w-12 h-12" />
          B11 Calculator
        </h1>
        <p className="text-xl opacity-90">
          Calculate total employer costs including taxes, benefits, and overhead
        </p>
      </header>

      {/* Main Content */}
      <main>
        <B11Calculator />
      </main>

      {/* Footer */}
      <footer className="text-center text-white/80 mt-16">
        <p>&copy; 2024 B11 Calculator. Built for employer cost analysis.</p>
      </footer>
    </div>
  )
}
