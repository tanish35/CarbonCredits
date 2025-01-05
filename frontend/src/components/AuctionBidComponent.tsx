import React, { useState } from "react";
import { useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { abi_marketplace } from "@/lib/abi_marketplace";

interface AuctionBidComponentProps {
  tokenId: number;
  basePrice: number;
  MARKETPLACE_ADDRESS: string;
}

export const AuctionBidComponent: React.FC<AuctionBidComponentProps> = ({
  tokenId,
  basePrice,
  MARKETPLACE_ADDRESS,
}) => {
  const [bidAmount, setBidAmount] = useState("");
  const { writeContract } = useWriteContract();

  const handlePlaceBid = async () => {
    if (!bidAmount) return;

    const bidAmountInWei = parseFloat(bidAmount) * 1e18;

    if (bidAmountInWei <= basePrice) {
      alert("Bid amount must be higher than the current price");
      return;
    }

    try {
      const tx = writeContract({
        //@ts-ignore
        address: MARKETPLACE_ADDRESS,
        abi: abi_marketplace,
        functionName: "placeBid",
        args: [BigInt(tokenId)],
        value: BigInt(bidAmountInWei),
      });

      console.log("Bid placed transaction sent:", tx);
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="number"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        placeholder="Enter bid amount in ETH"
      />
      <Button className="w-full" onClick={handlePlaceBid}>
        Place Bid
      </Button>
    </div>
  );
};
