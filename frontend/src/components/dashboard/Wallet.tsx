import React, { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { Button } from "../ui/button";
import { Power, WalletIcon, CircleDollarSign } from "lucide-react";
import { formatAddress } from "@/lib/utils";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface WalletProps {
  onWalletChange: (address: string | null) => void;
}

export const Wallet: React.FC<WalletProps> = ({ onWalletChange }) => {
  const { isConnected, address } = useAccount();
  const { data: balance, isError, isLoading } = useBalance({ address });
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const truncatedAddress = address ? formatAddress(address) : "";

  async function updateWallet(address: String) {
    try {
      setIsUpdating(true);
      await api.put("/user/walletUpdate", {
        wallet_address: address,
      });
      toast({
        title: "Wallet Updated",
        description: "Your wallet has been successfully connected",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wallet",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const addFujiCChainToMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xa869",
              chainName: "Avalanche Fuji Testnet",
              nativeCurrency: {
                name: "Avalanche",
                symbol: "AVAX",
                decimals: 18,
              },
              rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
              blockExplorerUrls: ["https://testnet.snowtrace.io/"],
            },
          ],
        });
        toast({
          title: "Success",
          description: "Fuji C-Chain has been added to MetaMask",
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to add Fuji C-Chain to MetaMask",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "MetaMask is not installed",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      onWalletChange(address);
      updateWallet(address);
    } else {
      onWalletChange(null);
    }
  }, [isConnected, address, onWalletChange]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container"
    >
      {!isConnected ? (
        <Card className="w-full h-full bg-gradient-to-br from-muted/5 to-muted/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center h-48 gap-4">
            <WalletIcon className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground text-lg">
              Connect your wallet to continue
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="relative overflow-hidden">
          {isUpdating && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="loading-spinner" />
            </div>
          )}
          <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-muted/30 space-y-1 flex flex-row justify-between items-center p-6">
            <div>
              <CardTitle className="text-2xl font-semibold">
                Wallet Information
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your wallet details
              </p>
            </div>
            <Badge
              variant={"outline"}
              className="p-2 bg-background/80 backdrop-blur-sm"
            >
              <WalletIcon className="h-5 w-5" />
            </Badge>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-6">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Connected Address
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg select-all">
                      {truncatedAddress}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(address!)}
                          className="px-2 py-1 h-auto text-xs hover:bg-muted/80"
                        >
                          Copy
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy Address</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    Network
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <p className="font-medium text-primary mt-1">Avalanche</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CircleDollarSign className="h-5 w-5 text-primary/80" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Balance
                  </p>
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
                    {balance?.formatted}{" "}
                    <span className="text-xl">{balance?.symbol}</span>
                  </div>
                )}
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl hover:shadow-md transition-all"
              >
                <Button
                  onClick={addFujiCChainToMetaMask}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                    alt="MetaMask Icon"
                    className="h-5 w-5"
                  />
                  Add Fuji C-Chain to MetaMask
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
