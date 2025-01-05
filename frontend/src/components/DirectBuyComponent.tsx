import React from "react";
import { useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { abi_marketplace } from "@/lib/abi_marketplace";

interface DirectBuyComponentProps {
  tokenId: number;
  basePrice: number;
  MARKETPLACE_ADDRESS: `0x${string}`;
}

export const DirectBuyComponent: React.FC<DirectBuyComponentProps> = ({
  tokenId,
  basePrice,
  MARKETPLACE_ADDRESS,
}) => {
  const { writeContract } = useWriteContract();

  const handleDirectBuy = async () => {
    try {
      const tx = writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: abi_marketplace,
        functionName: "purchaseToken",
        args: [BigInt(tokenId), BigInt(basePrice)],
        value: BigInt(basePrice),
      });

      console.log("Purchase transaction sent:", tx);
    } catch (error) {
      console.error("Error purchasing NFT:", error);
    }
  };

  return (
    <Button className="w-full mt-4" onClick={handleDirectBuy}>
      Buy Now for {(Number(basePrice) / 1e18).toFixed(4)} ETH
    </Button>
  );
};
