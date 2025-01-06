import React, { useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import { api } from "@/lib/api";

interface WalletProps {
  onWalletChange: (address: string | null) => void;
}

export const Wallet: React.FC<WalletProps> = ({ onWalletChange }) => {
  const { toast } = useToast();
  const { isConnected, address } = useAccount();
  const { data: balance, isError, isLoading } = useBalance({ address });
  async function updateWallet(address: String) {
    const wallet = await api.put("/user/walletUpdate", {
      wallet_address: address,
    });
    console.log(wallet);
  }
  // Notify parent about wallet changes
  useEffect(() => {
    if (isConnected && address) {
      onWalletChange(address); // Pass the wallet address to parent
      updateWallet(address);
    } else {
      onWalletChange(null); // Notify parent that no wallet is connected
    }
  }, [isConnected, address, onWalletChange]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `Wallet address ${text} copied to clipboard`,
    });
  };

  return (
    <div className="container">
      {!isConnected ? (
        <p className="text-muted">No wallet connected</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Wallet Information</CardTitle>
          </CardHeader>
          <Separator className="mb-4" />
          <CardContent>
            <div className="flex items-center">
              <p>Wallet Connected: {address}</p>
              <button
                onClick={() => handleCopy(address!)}
                className="ml-2 px-2 py-1 text-sm text-blue-500 border border-blue-500 rounded"
              >
                Copy
              </button>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium">Balance:</h3>
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : isError ? (
                <p className="text-red-500">Error fetching balance</p>
              ) : (
                <p className="text-xl font-bold">
                  {balance?.formatted} {balance?.symbol}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
