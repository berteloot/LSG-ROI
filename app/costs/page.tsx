import CostCalculator from '@/components/CostCalculator'
import { TrendingUp, MapPin } from 'lucide-react'
import Icon from '@/components/Icon'

export default function CostsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center text-white mb-12">
        <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <Icon name="calculator" className="w-12 h-12" size={48} />
          Cost Calculator
        </h1>
        <p className="text-xl opacity-90">
          Calculate employer costs by state and category with interactive toggles
        </p>
      </header>

      {/* Main Content */}
      <main>
        <CostCalculator />
      </main>

      {/* Footer */}
      <footer className="text-center text-white/80 mt-16">
        <p>&copy; 2024 Cost Calculator. Built for employer cost analysis.</p>
      </footer>
    </div>
  )
}
