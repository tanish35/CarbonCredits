import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAccount, useReadContract } from "wagmi";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { abi } from "@/lib/abi";
import { abi_marketplace } from "@/lib/abi_marketplace";
import { SellOptions } from "@/components/SellOptions";
import { AuctionBidComponent } from "@/components/AuctionBidComponent";
import { DirectBuyComponent } from "@/components/DirectBuyComponent";
import { Loader } from "@/components/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Clock, Coins, User } from "lucide-react";
import { formatEther } from "viem";

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
  const [auctionDetails, setAuctionDetails] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (basePrice1) setBasePrice(Number(basePrice1));
  }, [basePrice1]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  if (loading) {
    return <Loader isLoading />;
  }

  if (error || !creditDetails) {
    return (
      <div className="container mx-auto p-4 text-center">
        <AlertCircle className="mx-auto text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p>{error || "Failed to load NFT data"}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mt-4 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="text-2xl md:text-3xl">
              {isAuction
                ? "Carbon Credit NFT Auction"
                : isDirectSelling
                  ? "Carbon Credit NFT Direct Sale"
                  : "Carbon Credit NFT"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={creditDetails.certificateURI}
                  alt="Certificate"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                {creditDetails.description && (
                  <p className="mt-4 italic text-gray-600 bg-gray-100 p-4 rounded-md">
                    {creditDetails.description}
                  </p>
                )}
              </motion.div>
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-xl font-semibold mb-4">NFT Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      label="Credit Type"
                      value={creditDetails.typeofcredit}
                    />
                    <InfoItem
                      label="Quantity"
                      value={creditDetails.quantity.toString()}
                    />
                    <InfoItem
                      label="Expiry Date"
                      value={new Date(
                        Number(creditDetails.expiryDate) * 1000
                      ).toLocaleDateString()}
                      icon={<Clock className="w-4 h-4" />}
                    />
                    <InfoItem
                      label="Retired"
                      value={creditDetails.retired ? "Yes" : "No"}
                      valueClass={
                        creditDetails.retired
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    />
                  </div>
                </motion.div>

                {basePrice && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h3 className="text-xl font-semibold mb-4">Pricing</h3>
                    <InfoItem
                      label="Base Price"
                      value={`${formatEther(BigInt(basePrice))} ETH`}
                      icon={<Coins className="w-4 h-4" />}
                    />
                  </motion.div>
                )}

                {auctionDetails && auctionDetails[5] && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <h3 className="text-xl font-semibold mb-4">
                      Auction Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem
                        label="Current Price"
                        value={`${formatEther(auctionDetails[2])} ETH`}
                        icon={<Coins className="w-4 h-4" />}
                      />
                      <InfoItem
                        label="Current Bidder"
                        value={
                          auctionDetails[3] ===
                          "0x0000000000000000000000000000000000000000"
                            ? "No bids yet"
                            : `${auctionDetails[3].slice(0, 6)}...${auctionDetails[3].slice(-4)}`
                        }
                        icon={<User className="w-4 h-4" />}
                      />
                      <InfoItem
                        label="Auction Ends"
                        value={new Date(
                          Number(auctionDetails[4]) * 1000
                        ).toLocaleString()}
                        icon={<Clock className="w-4 h-4" />}
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  {showSellOptions && (
                    <SellOptions
                      tokenId={TOKEN_ID}
                      onComplete={() => setShowSellOptions(false)}
                      NFT_CONTRACT_ADDRESS={NFT_CONTRACT_ADDRESS}
                      MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                    />
                  )}

                  {!isOwner && isAuction && basePrice && (
                    <AuctionBidComponent
                      tokenId={TOKEN_ID}
                      basePrice={basePrice}
                      MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                    />
                  )}

                  {!isOwner && isDirectSelling && basePrice && (
                    <DirectBuyComponent
                      tokenId={TOKEN_ID}
                      basePrice={basePrice}
                      MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                    />
                  )}
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const InfoItem: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
}> = ({ label, value, icon, valueClass }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center space-x-2">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="font-medium">{label}:</span>
          <span className={`${valueClass || "text-gray-700"}`}>{value}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {label}: {value}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default NFTPage;
