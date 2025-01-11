import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom';

// Add utility functions
const formatPrice = (price: string) => {
  const num = parseFloat(price);
  if (isNaN(num)) return '0';
  // Convert from wei to AVX (assuming 18 decimals)
  return (num / 1e18).toFixed(6);
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

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
    <Card 
      className={`group bg-card border-border hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl overflow-hidden ${
        viewMode === 'list' ? 'flex' : ''
      }`}
      onClick={() => navigate(`/nft/${nft.tokenId}`)}
    >
      <div 
        className={`relative ${
          viewMode === 'list' ? 'w-56 h-56 flex-shrink-0' : ''
        }`}
      >
        <img 
          src={nft.image} 
          alt={nft.typeofCredit} 
          width={400} 
          height={400} 
          className={`object-cover w-full transition-transform duration-300 group-hover:scale-105 ${
            viewMode === 'list' ? 'h-56' : 'h-72'
          }`}
        />
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
          <p className="text-xs font-medium">#{nft.tokenId}</p>
        </div>
      </div>
      <CardContent className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight truncate">
              {nft.typeofCredit}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                Carbon Credit
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Price</span>
              <div className="text-right">
                <span className="text-xl font-semibold text-foreground">
                  {formatPrice(nft.price)}
                </span>
                <span className="ml-1 text-sm text-primary font-medium">AVX</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 mt-3 pt-3">
              <span>Quantity: {nft.quantity}</span>
              <span>Expires: {formatDate(nft.expiryDate)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

