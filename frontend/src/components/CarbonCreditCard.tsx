import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

interface CarbonCredit {
  id: number
  name: string
  tokenId: string
  price: number
  lastSale: number
  image: string
  verified: boolean
}

interface CarbonCreditCardProps {
  credit: CarbonCredit
  viewMode: 'grid' | 'list'
}

export default function CarbonCreditCard({ credit, viewMode }: CarbonCreditCardProps) {
  return (
    <Card className={`bg-gray-900 border-gray-800 overflow-hidden hover:border-gray-700 transition-colors ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      <div className={viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : ''}>
        <img 
          src={credit.image} 
          alt={credit.name} 
          width={400} 
          height={400} 
          className={`object-cover ${viewMode === 'list' ? 'h-48' : 'h-64'} w-full`}
        />
      </div>
      <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center">
            {credit.name}
            {credit.verified && (
              <CheckCircle className="h-4 w-4 text-blue-500 ml-2" />
            )}
          </h3>
          <span className="text-sm text-gray-400">{credit.tokenId}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Current Price</span>
            <span className="text-white font-medium">{credit.price} ETH</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Last Sale</span>
            <span className="text-gray-300">{credit.lastSale} ETH</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

