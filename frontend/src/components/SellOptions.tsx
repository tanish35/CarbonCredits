import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { abi } from "@/lib/abi";
import { abi_marketplace } from "@/lib/abi_marketplace";

interface SellOptionsProps {
  tokenId: number;
  onComplete: () => void;
  NFT_CONTRACT_ADDRESS: `0x${string}`;
  MARKETPLACE_ADDRESS: `0x${string}`;
}

interface AuctionData {
  active: boolean;
  currentBidder: `0x${string}`;
}

export const SellOptions: React.FC<SellOptionsProps> = ({
  tokenId,
  onComplete,
  NFT_CONTRACT_ADDRESS,
  MARKETPLACE_ADDRESS,
}) => {
  const [sellType, setSellType] = useState<"auction" | "directSell" | null>(
    null
  );
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const { address } = useAccount();

  const { writeContract } = useWriteContract();

  const { data: isApproved } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "isApprovedForAll",
    args: [address, MARKETPLACE_ADDRESS],
  });

  const { data: owner } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  }) as { data: string };

  const { data: auctionData } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: abi_marketplace,
    functionName: "auctions",
    args: [BigInt(tokenId)],
  });
  useEffect(() => {
    console.log(auctionData);
  }, [auctionData]);

  //@ts-ignore
  const isAuctionActive = auctionData && auctionData[5];
  const isOwner =
    address && owner && owner.toLowerCase() === address.toLowerCase();

  const handleChooseSellOption = async (type: "auction" | "directSell") => {
    setSellType(type);
    try {
      await axios.post("/nft/setNFTStatus", {
        tokenId: tokenId.toString(),
        type,
      });
    } catch (error) {
      console.error("Error setting sell type:", error);
    }
  };

  const handleSetPrice = async () => {
    if (!price) return;

    const priceInWei = BigInt(parseFloat(price) * 1e18);

    try {
      if (sellType === "auction") {
        const durationInSeconds = BigInt(parseFloat(duration) * 60 * 60);
        writeContract({
          address: MARKETPLACE_ADDRESS,
          abi: abi_marketplace,
          functionName: "createAuction",
          args: [
            BigInt(tokenId),
            BigInt(priceInWei),
            BigInt(durationInSeconds),
          ],
        });
      }
      onComplete();
    } catch (error) {
      console.error("Error setting price:", error);
    }
  };

  const handleApproval = async () => {
    if (!address) return;

    try {
      writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi,
        functionName: "setApprovalForAll",
        args: [MARKETPLACE_ADDRESS, true],
      });
    } catch (error) {
      console.error("Error setting approval:", error);
    }
  };

  const handleCancelAuction = async () => {
    try {
      writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: abi_marketplace,
        functionName: "cancelAuction",
        args: [BigInt(tokenId)],
      });
      onComplete();
    } catch (error) {
      console.error("Error cancelling auction:", error);
    }
  };

  if (!isApproved) {
    return (
      <Button onClick={handleApproval} className="w-full">
        Approve NFT for Marketplace
      </Button>
    );
  }

  if (isAuctionActive && isOwner) {
    return (
      <div className="space-y-4">
        <Button
          onClick={handleCancelAuction}
          variant="destructive"
          className="w-full"
        >
          Cancel Auction
        </Button>
      </div>
    );
  }

  if (!sellType) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => handleChooseSellOption("auction")}
          className="w-full"
        >
          Create Auction
        </Button>
        <Button
          onClick={() => handleChooseSellOption("directSell")}
          className="w-full"
        >
          Set Direct Sell Price
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="price">Price (ETH)</Label>
        <Input
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.1"
        />
      </div>
      {sellType === "auction" && (
        <div>
          <Label htmlFor="duration">Duration (hours)</Label>
          <Input
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="24"
          />
        </div>
      )}
      <Button onClick={handleSetPrice} className="w-full">
        {sellType === "auction" ? "Start Auction" : "Set Price"}
      </Button>
    </div>
  );
};
