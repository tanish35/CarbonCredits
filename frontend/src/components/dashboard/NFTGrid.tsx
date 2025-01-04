import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NFT {
  id: number;
  price: string;
  image?: string;
  expiresAt: string | Date; 
  quantity?: number;
  description?: string; // New property added
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString();
};

const isExpired = (date: string | Date) => {
  return new Date() > new Date(date);
};

export function NFTGrid({ nfts }: { nfts: NFT[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/50 space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">NFTs Owned</CardTitle>
          <Badge variant="secondary">{nfts.length} Total</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Your collection of green NFTs
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className={`group relative aspect-square rounded-lg border-primary bg-muted/50 p-2 transition-colors hover:bg-muted ${
                nft.image ? "bg-cover bg-center bg-no-repeat" : ""
              }`}
              style={{ backgroundImage: nft.image ? `url(${nft.image})` : "none" }}
            >
              <div className="flex h-full flex-col justify-between rounded p-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-background">
                    #{nft.id}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`bg-background ${
                      isExpired(nft.expiresAt) ? "bg-red-500" : "bg-green-500"
                    }`}
                  >
                    {isExpired(nft.expiresAt) ? "Expired" : "Valid"}
                  </Badge>
                </div>
                <div className="space-y-1 bg-secondary/50 rounded p-2">
                  <p className="text-xs font-medium text-secondary-foreground-600">Details</p>
                  <p className="text-sm font-semibold">{nft.price} AVAX</p>
                  {nft.quantity && (
                    <p className="text-sm font-semibold">{nft.quantity} Tons</p>
                  )}
                  <p className="text-sm font-semibold">
                    {formatDate(nft.expiresAt)}
                  </p>
                  {nft.description && (
                    <p className="text-sm">{nft.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
