import type React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAccount, useReadContract } from "wagmi";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { abi } from "@/lib/abi";
import { abi_marketplace } from "@/lib/abi_marketplace";
import { SellOptions } from "@/components/SellOptions";
import { AuctionBidComponent } from "@/components/AuctionBidComponent";
import { DirectBuyComponent } from "@/components/DirectBuyComponent";
import { Helmet } from "react-helmet";
import { Loader } from "@/components/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Clock, Coins, User } from "lucide-react";
import { Retire } from "@/components/Retire";
import { formatEther } from "viem";

const NFT_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS;

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

const InfoItem: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
}> = ({ label, value, icon, valueClass }) => (
  <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 border-2">
    <CardContent className="p-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {icon && <span>{icon}</span>}
                {label}
              </div>
              <div className={cn("font-semibold text-base", valueClass)}>
                {value}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {label}: {value}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </CardContent>
  </Card>
);

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
  const [auctionDetails, setAuctionDetails] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const { data: nftOwner, isLoading: isLoadingOwner } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "ownerOf",
    args: [BigInt(TOKEN_ID)],
  });

  const { data: creditData, isLoading: isLoadingCredit } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "getCredit",
    args: [BigInt(TOKEN_ID)],
  }) as { data: Credit; isLoading: boolean };

  const { data: auctionData, isLoading: isLoadingAuction } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: abi_marketplace,
    functionName: "auctions",
    args: [BigInt(TOKEN_ID)],
  });

  const { data: basePriceData, isLoading: isLoadingBasePrice } =
    useReadContract({
      address: NFT_CONTRACT_ADDRESS,
      abi,
      functionName: "getRate",
      args: [BigInt(TOKEN_ID)],
    });

  const isLoading =
    isLoadingOwner ||
    isLoadingCredit ||
    isLoadingAuction ||
    isLoadingBasePrice ||
    loading;
  const hasError = error !== null;

  const fetchIPFSData = async (uri: string) => {
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
    const loadData = async () => {
      try {
        setLoading(true);

        if (!creditData || !nftOwner || !basePriceData) {
          return;
        }
        const { image, description } = await fetchIPFSData(
          creditData.certificateURI
        );

        setCreditDetails({
          ...creditData,
          certificateURI: image || creditData.certificateURI,
          description,
        });

        if (creditData.expiryDate < Date.now() / 1000) {
          setExpired(true);
        }

        setIsOwner(nftOwner === address);

        if (auctionData) {
          setAuctionDetails(auctionData as Auction);
        }

        if (basePriceData) {
          setBasePrice(Number(basePriceData));
        }

        const { data: statusData } = await axios.post("/nft/getNFTStatus", {
          tokenId: TOKEN_ID,
        });

        setIsAuction(statusData.isAuction);
        setIsDirectSelling(statusData.isDirectSale);
        setShowSellOptions(nftOwner === address);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load NFT data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [creditData, nftOwner, auctionData, basePriceData, TOKEN_ID, address]);

  if (isLoading) {
    return <Loader isLoading />;
  }

  if (hasError) {
    return (
      <div className="container mx-auto p-4 text-center">
        <AlertCircle className="mx-auto text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!creditDetails) {
    return <Loader isLoading />;
  }

  return (
    <>
      <Helmet>
        <meta property="og:title" content={`Carbon Credit #${TOKEN_ID}`} />
        <meta
          property="og:description"
          content={
            creditDetails.description ||
            "Check out this amazing Carbon Credit NFT!"
          }
        />
        <meta
          property="og:image"
          content="https://ipfs.io/ipfs/bafybeiakg7ptkmpqjxlboht3x4mkfni72zbigl6znfgje2zavcr5xr7ste"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:url"
          content={`${import.meta.env.VITE_APP_URL}/nft/${TOKEN_ID}`}
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container max-w-7xl mx-auto"
        >
          <Card className="overflow-hidden border-2 shadow-lg backdrop-blur-sm bg-card/95">
            {/* Header */}
            <CardHeader className="space-y-2 border-b bg-muted/10 p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Carbon Credit {TOKEN_ID}
                </CardTitle>
                <div className="flex gap-2">
                  {isAuction && (
                    <Badge className="animate-pulse bg-primary/90">
                      Active Auction
                    </Badge>
                  )}
                  {isDirectSelling && (
                    <Badge variant="secondary">Direct Sale</Badge>
                  )}
                  {!isAuction && !isDirectSelling && (
                    <Badge variant="outline">Not Listed</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Image */}
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
                      src={creditDetails.certificateURI || "/placeholder.svg"}
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

                {/* Right Column - Details */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-8"
                >
                  {/* Credit Details */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-foreground/90">
                      Credit Details
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem
                        label="Credit Type"
                        value={creditDetails.typeofcredit}
                        icon={<AlertCircle className="h-4 w-4" />}
                      />
                      <InfoItem
                        label="Quantity"
                        value={creditDetails.quantity.toString()}
                        icon={<Coins className="h-4 w-4" />}
                      />
                      <InfoItem
                        label="Expiry"
                        value={new Date(
                          Number(creditDetails.expiryDate) * 1000
                        ).toLocaleDateString()}
                        icon={<Clock className="h-4 w-4" />}
                      />
                      <InfoItem
                        label="Status"
                        value={creditDetails.retired ? "Retired" : "Active"}
                        valueClass={
                          creditDetails.retired
                            ? "text-destructive"
                            : "text-green-500"
                        }
                        icon={<User className="h-4 w-4" />}
                      />
                    </div>
                  </div>

                  {/* Auction Details */}
                  {auctionDetails && auctionDetails[5] && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="space-y-6"
                    >
                      <h2 className="text-xl font-semibold text-foreground/90">
                        Auction Details
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <InfoItem
                          label="Current Price"
                          value={`${formatEther(auctionDetails[2])} AVAX`}
                          icon={<Coins className="h-4 w-4" />}
                        />
                        <InfoItem
                          label="Current Bidder"
                          value={
                            auctionDetails[3] ===
                            "0x0000000000000000000000000000000000000000"
                              ? "No bids yet"
                              : `${auctionDetails[3].slice(0, 6)}...${auctionDetails[3].slice(-4)}`
                          }
                          icon={<User className="h-4 w-4" />}
                        />
                        <InfoItem
                          label="Auction Ends"
                          value={new Date(
                            Number(auctionDetails[4]) * 1000
                          ).toLocaleString()}
                          icon={<Clock className="h-4 w-4" />}
                        />
                        <InfoItem
                          label="Base Price"
                          value={`${formatEther(auctionDetails[1])} AVAX`}
                          icon={<Coins className="h-4 w-4" />}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    {/* Sell Options */}
                    {!expired && showSellOptions && (
                      <SellOptions
                        tokenId={TOKEN_ID}
                        onComplete={() => setShowSellOptions(false)}
                        NFT_CONTRACT_ADDRESS={NFT_CONTRACT_ADDRESS}
                        MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                      />
                    )}

                    {/* Auction Bid Component */}
                    {!isOwner && isAuction && auctionDetails?.[5] && (
                      <AuctionBidComponent
                        tokenId={TOKEN_ID}
                        basePrice={basePrice}
                        MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                      />
                    )}

                    {/* Retire Component */}
                    {isOwner && !isAuction && !isDirectSelling && (
                      <Retire
                        tokenId={TOKEN_ID}
                        CONTRACT_ADDRESS={NFT_CONTRACT_ADDRESS}
                      />
                    )}

                    {/* Direct Buy Component */}
                    {!isOwner && isDirectSelling && (
                      <DirectBuyComponent
                        tokenId={TOKEN_ID}
                        basePrice={basePrice}
                        MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                      />
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default NFTPage;
