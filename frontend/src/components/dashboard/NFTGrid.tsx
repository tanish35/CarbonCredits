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

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString();
};

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
      <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[calc(100vh-100px)]">
  {updatedNFTs.map((nft) => (
    <div
      key={nft.tokenId}
      className={`group relative aspect-square rounded-lg border-primary bg-muted/50 p-2 transition-colors hover:bg-muted ${
        nft.image ? "bg-cover bg-center bg-no-repeat" : ""
      }`}
      style={{
        backgroundImage: nft.image ? `url(${nft.image})` : "none",
      }}
      onClick={() => navigator(`/nft/${nft.tokenId}`)}
    >
      <div className="flex h-full flex-col justify-between rounded p-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-background">
            #{nft.tokenId}
          </Badge>
          <Badge
            variant="outline"
            className={`bg-background ${
              isExpired(nft.expiryDate) ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {isExpired(nft.expiryDate) ? "Expired" : "Valid"}
          </Badge>
        </div>
        <div className="space-y-1 bg-secondary/50 rounded p-2">
          <p className="text-sm font-semibold">{nft.price} AVAX</p>
          {nft.quantity && <p className="text-sm font-semibold">{nft.quantity} Tons</p>}
        </div>
      </div>
    </div>
  ))}
</div>

      </CardContent>
    </Card>
  );
}
