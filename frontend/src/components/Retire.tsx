import React, { useState } from "react";
import { useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { abi } from "@/lib/abi";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RetireProps {
  tokenId: number;
  CONTRACT_ADDRESS: string;
}

export const Retire: React.FC<RetireProps> = ({ tokenId, CONTRACT_ADDRESS }) => {
  const { writeContract } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);


  const handleRetire = async () => {
    setIsLoading(true);
    try {
      // Await the transaction response properly
      const tx = await writeContract({
        // @ts-ignore
        address: CONTRACT_ADDRESS,
        abi: abi,
        functionName: "retire",
        args: [BigInt(tokenId)],
      });

      console.log("Retire transaction sent:", tx);

      toast({
        title: "Retire Transaction Sent",
        description: "Your retire transaction has been sent successfully",
      });

    } catch (error) {
      console.error("Error retiring:", error);
      toast({
        title: "Error",
        description: "Failed to retire the credit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleRetire} className="w-full" variant="destructive" disabled={isLoading}>
        {isLoading ? "Processing..." : "Retire"}
      </Button>
      {isLoading && (
        <div className="flex items-center mt-2">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Retiring the credit... Please wait.
        </div>
      )}
    </div>
  );
};
