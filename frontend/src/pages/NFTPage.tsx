import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAccount, useReadContract } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { abi } from "@/lib/abi";
import { abi_marketplace } from "@/lib/abi_marketplace";
import { SellOptions } from "@/components/SellOptions";
import { AuctionBidComponent } from "@/components/AuctionBidComponent";
import { DirectBuyComponent } from "@/components/DirectBuyComponent";
import { Loader } from "@/components/Loader";
import { cn } from "@/lib/utils";

const NFT_CONTRACT_ADDRESS = "0x1A33A6F1A7D001A5767Cd9303831Eb3B9b916AEA";
const MARKETPLACE_ADDRESS = "0x79298aF4e4F51c746dEeE692a40a3141C9b142ef";

interface Credit {
  id: number;
  typeofcredit: string;
  quantity: bigint;
  certificateURI: string;
  expiryDate: bigint;
  retired: boolean;
  description?: string;
}

type Auction = [bigint, bigint, bigint, string, bigint, boolean];

const NFTPage: React.FC = () => {
  const params = useParams();
  const TOKEN_ID = Number(params.id);
  const { address } = useAccount();
  const [creditDetails, setCreditDetails] = useState<Credit | null>(null);
  const [isAuction, setIsAuction] = useState(false);
  const [isDirectSelling, setIsDirectSelling] = useState(false);
  const [showSellOptions, setShowSellOptions] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [basePrice, setBasePrice] = useState(0);
  const [basePriceAvax, setBasePriceAvax] = useState(0);
  const [auctionDetails, setAuctionDetails] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const { data: nftOwner } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "ownerOf",
    args: [BigInt(TOKEN_ID)],
  });

  const { data: creditData } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "getCredit",
    args: [BigInt(TOKEN_ID)],
  }) as { data: Credit };

  const { data: auctionData } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: abi_marketplace,
    functionName: "auctions",
    args: [BigInt(TOKEN_ID)],
  });

  const { data: basePrice1 } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "getRate",
    args: [BigInt(TOKEN_ID)],
  });

  const fetchIPFSData = async (
    uri: string
  ): Promise<{ image?: string; description?: string }> => {
    try {
      const ipfsURL = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const response = await axios.get(ipfsURL);

      if (response.status === 200) {
        const metadata = response.data;
        return {
          image: metadata.image
            ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
            : undefined,
          description: metadata.description || undefined,
        };
      }
    } catch (error) {
      console.error("Error fetching IPFS data:", error);
      setError("Failed to fetch NFT metadata");
    }
    return {};
  };

  useEffect(() => {
    if (basePrice1) {
      const basePriceEth = Number(basePrice1) / 10 ** 18;
      setBasePrice(basePriceEth);
      setBasePriceAvax(basePriceEth);
    }
  }, [basePrice1]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (creditData) {
          const {
            typeofcredit,
            quantity,
            expiryDate,
            retired,
            certificateURI,
          } = creditData;
          const { image, description } = await fetchIPFSData(certificateURI);

          setCreditDetails({
            id: TOKEN_ID,
            typeofcredit: typeofcredit as string,
            quantity: BigInt(quantity),
            certificateURI: image || certificateURI,
            expiryDate: BigInt(expiryDate),
            retired: retired as boolean,
            description,
          });
          if (BigInt(expiryDate) < Date.now() / 1000) {
            setExpired(true);
          }
          setLoading(false);
        }

        if (nftOwner) setIsOwner(nftOwner === address);

        if (auctionData) setAuctionDetails(auctionData as Auction);

        const statusResponse = await axios.post("/nft/getNFTStatus", {
          tokenId: TOKEN_ID,
        });

        setIsAuction(statusResponse.data.isAuction);
        setIsDirectSelling(statusResponse.data.isDirectSale);
        setShowSellOptions(nftOwner === address);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load NFT data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [creditData, nftOwner, address, auctionData, TOKEN_ID]);

  if (loading) return <Loader isLoading />;
  if (error) {
    return (
      <Card className="mx-auto max-w-md p-6 text-center">
        <CardContent>
          <AlertCircle className="mx-auto text-destructive w-16 h-16 mb-4" />
          <CardTitle className="mb-2">Error</CardTitle>
          <CardDescription>
            {error || "Failed to load NFT data"}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }
  if (!creditDetails) return <Loader isLoading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-7xl mx-auto"
      >
        <Card className="overflow-hidden border-2 shadow-lg backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-2 border-b bg-muted/10 p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Carbon Credit #{TOKEN_ID}
              </CardTitle>
              <div className="flex gap-2">
                {isAuction ? (
                  <Badge className="animate-pulse bg-primary/90">
                    Active Auction
                  </Badge>
                ) : isDirectSelling ? (
                  <Badge variant="secondary" className="bg-secondary/90">
                    Direct Sale
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-2">
                    Not Listed
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Image Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <AspectRatio
                  ratio={1}
                  className="overflow-hidden rounded-2xl border-2"
                >
                  <img
                    src={creditDetails.certificateURI}
                    alt="Carbon Credit Certificate"
                    className="object-cover h-full w-full transition-transform duration-500 hover:scale-105"
                  />
                </AspectRatio>
                {creditDetails.description && (
                  <Card className="bg-muted/30 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {creditDetails.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>

              {/* Details Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground/90">
                    Credit Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailCard
                      label="Credit Type"
                      value={creditDetails.typeofcredit}
                      className="hover:border-primary/50 transition-colors duration-300"
                    />
                    <DetailCard
                      label="Quantity"
                      value={creditDetails.quantity.toString()}
                    />
                    <DetailCard
                      label="Expiry"
                      value={new Date(
                        Number(creditDetails.expiryDate) * 1000
                      ).toLocaleDateString()}
                      icon={<Clock className="h-4 w-4" />}
                    />
                    <DetailCard
                      label="Status"
                      value={creditDetails.retired ? "Retired" : "Active"}
                      variant={
                        creditDetails.retired ? "destructive" : "default"
                      }
                    />
                  </div>
                </div>

                {/* Price Card with enhanced styling */}
                {basePrice && (
                  <Card className="bg-gradient-to-br from-primary/80 via-primary to-primary/90 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <h3 className="text-primary-foreground/90 font-medium mb-2">
                        Current Price
                      </h3>
                      <p className="text-4xl font-bold text-primary-foreground">
                        {basePriceAvax} AVAX
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons with enhanced animations */}
                <AnimatePresence>
                  {!expired && showSellOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <SellOptions
                        tokenId={TOKEN_ID}
                        onComplete={() => setShowSellOptions(false)}
                        NFT_CONTRACT_ADDRESS={NFT_CONTRACT_ADDRESS}
                        MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                      />
                    </motion.div>
                  )}

                  {!isOwner && (isAuction || isDirectSelling) && basePrice && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {isAuction && (
                        <AuctionBidComponent
                          tokenId={TOKEN_ID}
                          basePrice={basePrice}
                          MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                        />
                      )}
                      {isDirectSelling && (
                        <DirectBuyComponent
                          tokenId={TOKEN_ID}
                          basePrice={basePrice}
                          MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Enhanced DetailCard component
interface DetailCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

const DetailCard: React.FC<DetailCardProps> = ({
  label,
  value,
  icon,
  variant = "default",
  className,
}) => (
  <Card
    className={cn(
      "bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300",
      "border-2 hover:shadow-md",
      className
    )}
  >
    <CardContent className="p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "font-semibold text-base",
          variant === "destructive" && "text-destructive",
          variant === "default" && "text-card-foreground"
        )}
      >
        {value}
      </div>
    </CardContent>
  </Card>
);

export default NFTPage;
