import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface NFT {
  id: string;
  tokenId: string;
  walletAddress: string;
  price: string;
  typeofCredit: string;
  quantity: string;
  certificateURI: string;
  expiryDate: Date;
  createdAt: Date;
  image?: string; // To store the fetched image from IPFS
  description?: string; // To store the fetched description from IPFS
}

const isExpired = (date: string | Date) => {
  return new Date() > new Date(date);
};

const fetchIPFSData = async (uri: string): Promise<{ image?: string; description?: string }> => {
  try {
    const ipfsURL = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    const response = await fetch(ipfsURL);

    if (!response.ok) {
      console.error(`Failed to fetch IPFS data from: ${ipfsURL}`);
      return {};
    }

    const metadata = await response.json();
    return {
      image: metadata.image ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/") : undefined,
      description: metadata.description || undefined,
    };
  } catch (error) {
    console.error("Error fetching IPFS data:", error);
    return {};
  }
};
const formatAVAX = (wei: string) => {
  const num = parseFloat(wei) / 10 ** 18;
  
  return num.toFixed(3).toString();
};

const formatQuantity = (quantity: string) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true
  }).format(parseInt(quantity));
};

export function NFTGrid({ nfts }: { nfts: NFT[] }) {
  const [updatedNFTs, setUpdatedNFTs] = useState<NFT[]>([]);
  const navigator = useNavigate();
  useEffect(() => {
    const fetchNFTData = async () => {
      const updated = await Promise.all(
        nfts.map(async (nft) => {
          if (nft.certificateURI) {
            const { image, description } = await fetchIPFSData(nft.certificateURI);
            return { ...nft, image, description };
          }
          return nft;
        })
      );
      setUpdatedNFTs(updated);
    };

    fetchNFTData();
  }, [nfts]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/50 space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">NFTs Owned</CardTitle>
          <Badge variant="secondary">{updatedNFTs.length} Total</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Your collection of green NFTs</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {updatedNFTs.map((nft) => (
            <div
              key={nft.tokenId}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
              onClick={() => navigator(`/nft/${nft.tokenId}`)}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: nft.image ? `url(${nft.image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-4 z-10">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-black/50 backdrop-blur-sm border-primary/50 text-white">
                    #{nft.tokenId}
                  </Badge>
                  <Badge
                    variant={isExpired(nft.expiryDate) ? "destructive" : "secondary"}
                    className="backdrop-blur-sm"
                  >
                    {isExpired(nft.expiryDate) ? "Expired" : "Valid"}
                  </Badge>
                </div>

                <div className="space-y-3 rounded-lg bg-black/50 p-4 backdrop-blur-sm border border-primary/20">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {formatAVAX(nft.price)}
                      </span>
                      <span className="text-sm font-medium text-primary/80">AVAX</span>
                    </div>
                    {nft.quantity && (
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-semibold text-white">
                          {formatQuantity(nft.quantity)}
                        </span>
                        <span className="text-sm font-medium text-white/80">Tons</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
