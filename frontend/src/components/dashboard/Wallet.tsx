import React, { useEffect } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Copy, Power, Wallet as WalletIcon, CircleDollarSign } from "lucide-react";
import { formatAddress } from "@/lib/utils";

interface WalletProps {
  onWalletChange: (address: string | null) => void;
}

export const Wallet: React.FC<WalletProps> = ({ onWalletChange }) => {
  const { toast } = useToast();
  const { isConnected, address } = useAccount();
  const { data: balance, isError, isLoading } = useBalance({ address });
  const { disconnect } = useDisconnect();

  const truncatedAddress = address ? formatAddress(address) : '';

  async function updateWallet(address: String) {
    await api.put("/user/walletUpdate", {
      wallet_address: address,
    });
  }

  const handleDisconnect = () => {
    disconnect();
    onWalletChange(null);
    toast({
      title: "Wallet Disconnected",
      variant: "destructive",
    });
  };

  useEffect(() => {
    if (isConnected && address) {
      onWalletChange(address);
      updateWallet(address);
    } else {
      onWalletChange(null);
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
        <Card className="w-full h-full bg-gradient-to-br from-muted/5 to-muted/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center h-48 gap-4">
            <WalletIcon className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground text-lg">Connect your wallet to continue</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full h-full hover:shadow-lg transition-all duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-muted/30 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5 text-primary/80" />
              <CardTitle className="text-xl font-medium">
                Wallet Information
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDisconnect}
              className="text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
            >
              <Power className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl hover:shadow-sm transition-all">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Connected Address</p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg">{truncatedAddress}</span>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(address!)}
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy Address</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Network</p>
                  <p className="font-medium text-primary mt-1">Avalanche</p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl hover:shadow-sm transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <CircleDollarSign className="h-5 w-5 text-primary/80" />
                  <p className="text-sm font-medium text-muted-foreground">Balance</p>
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : isError ? (
                  <div className="text-red-500 flex items-center gap-2">
                    <span className="rounded-full bg-red-500/10 p-1">
                      <Power className="h-4 w-4" />
                    </span>
                    Failed to load balance
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-primary/90">
                    {balance?.formatted} <span className="text-xl">{balance?.symbol}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
