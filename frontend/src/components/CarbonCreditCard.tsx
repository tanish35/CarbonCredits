import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

interface NFT {
  id: string;
  tokenId: string;
  walletAddress: string;
  price: string;
  typeofCredit: string;
  quantity: string;
  certificateURI: string;
  expiryDate: Date;
  isAuction: boolean;
  isDirectSale: boolean;
  createdAt: Date;
  image?: string;
  description?: string;
}

interface CarbonCreditCardProps {
  nft: NFT
  viewMode: 'grid' | 'list'
}



export default function CarbonCreditCard({ nft, viewMode }: CarbonCreditCardProps) {
  const navigate = useNavigate();
  return (
    <Card className={`bg-gray-900 border-gray-800 overflow-hidden hover:border-gray-700 transition-colors ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      <div className={viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : ''}>
        <img 
          src={nft.image} 
          alt={nft.typeofCredit} 
          width={400} 
          height={400} 
          className={`object-cover ${viewMode === 'list' ? 'h-48' : 'h-64'} w-full`}
          onClick={() => navigate(`/nft/${nft.tokenId}`)}
        />
      </div>
      <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center">
            {nft.typeofCredit}
            {/* {credit.verified && (
              <CheckCircle className="h-4 w-4 text-blue-500 ml-2" />
            )} */}
          </h3>
          <span className="text-sm text-gray-400">{nft.tokenId}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Current Price</span>
            <span className="text-white font-medium">{nft.price} AVX</span>
          </div>
          {/* <div className="flex justify-between items-center">
            <span className="text-gray-400">Last Sale</span>
            <span className="text-gray-300">{credit.lastSale} ETH</span>
          </div> */}
        </div>
      </CardContent>
    </Card>
  )
}

