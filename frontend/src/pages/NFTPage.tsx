import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAccount, useReadContract } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { abi } from "@/lib/abi";
import { abi_marketplace } from "@/lib/abi_marketplace";
import { SellOptions } from "@/components/SellOptions";
import { AuctionBidComponent } from "@/components/AuctionBidComponent";
import { DirectBuyComponent } from "@/components/DirectBuyComponent";
import { Loader } from "@/components/Loader";

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
  const { id } = useParams<{ id: string }>();
  const TOKEN_ID = Number(id);
  const { address } = useAccount();
  const [creditDetails, setCreditDetails] = useState<Credit | null>(null);
  const [isAuction, setIsAuction] = useState(false);
  const [isDirectSelling, setIsDirectSelling] = useState(false);
  const [showSellOptions, setShowSellOptions] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [basePrice, setBasePrice] = useState(0);
  const [auctionDetails, setAuctionDetails] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);

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

  const fetchIPFSData = async (uri: string): Promise<{ image?: string; description?: string }> => {
    try {
      const ipfsURL = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const response = await axios.get(ipfsURL);

      if (response.status === 200) {
        const metadata = response.data;
        return {
          image: metadata.image ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/") : undefined,
          description: metadata.description || undefined,
        };
      }
    } catch (error) {
      console.error("Error fetching IPFS data:", error);
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
          const { typeofcredit, quantity, expiryDate, retired, certificateURI } = creditData;
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [creditData, nftOwner, address, auctionData]);

  if (loading) {
    return <Loader isLoading />;
  }

  if (!creditDetails) {
    return <div>Error loading NFT data</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>
            {isAuction
              ? "Carbon Credit NFT Auction"
              : isDirectSelling
              ? "Carbon Credit NFT Direct Sale"
              : "Carbon Credit NFT"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src={creditDetails.certificateURI}
                alt="Certificate"
                className="w-full h-auto"
              />
              {creditDetails.description && (
                <p className="mt-2 italic">{creditDetails.description}</p>
              )}
            </div>
            <div className="space-y-4">
              <p>
                <strong>Credit Type:</strong> {creditDetails.typeofcredit}
              </p>
              <p>
                <strong>Quantity:</strong> {creditDetails.quantity.toString()}
              </p>
              <p>
                <strong>Expiry Date:</strong>{" "}
                {new Date(
                  Number(creditDetails.expiryDate) * 1000
                ).toLocaleDateString()}
              </p>
              <p>
                <strong>Retired:</strong>{" "}
                {creditDetails.retired ? "Yes" : "No"}
              </p>
              {basePrice && (
                <p>
                  <strong>Base Price:</strong> {Number(basePrice) / 1e18} ETH
                </p>
              )}
              {auctionDetails && auctionDetails[5] && (
                <>
                  <p>
                    <strong>Current Price:</strong>{" "}
                    {Number(auctionDetails[2]) / 1e18} ETH
                  </p>
                  <p>
                    <strong>Current Bidder:</strong> {auctionDetails[3]}
                  </p>
                  <p>
                    <strong>Auction Ends:</strong>{" "}
                    {new Date(
                      Number(auctionDetails[4]) * 1000
                    ).toLocaleString()}
                  </p>
                </>
              )}

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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTPage;
