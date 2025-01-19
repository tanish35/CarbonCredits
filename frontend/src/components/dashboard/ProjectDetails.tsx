import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, Info, CircleSlash, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import axios from "axios";
interface NFTMetadata {
  id: string;
  tokenId: string;
  walletAddress: string;
  price: string;
  typeofCredit: string;
  quantity: string;
  certificateURI: string;
  expiryDate: Date;
  createdAt: Date;
  image?: string;
  description?: string;
}
interface CarbonCreditsDisplayProps {
  walletAddress: string;
}

export function CarbonCreditsDisplay({ walletAddress }: CarbonCreditsDisplayProps) {
  //const [totalCredits, setTotalCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [count,setCount] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const navigator = useNavigate();

  const getOwnedNFTs = async(walletAddress: string) =>{
    try {
      const response = await axios.get("/nft/getOwnedNFTs", {
        withCredentials: true,
      });

      // Filter NFTs based on the wallet address
      const ownedNFTs = response.data.wallets
        .flatMap((wallet: any) =>
          wallet.nfts.map((nft: NFTMetadata) => ({
            ...nft,
            image: nft.certificateURI,
            description: nft.description || "NFT Description unavailable",
          }))
        )
        .filter(
          (nft: NFTMetadata) =>
            nft.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        );

      let count = 0;
      ownedNFTs.forEach((nft : any) => {
        count += parseInt(nft.quantity);
      });
      setCount(count.toString());
      setError(null);
    } catch (error) {
      console.error("Error fetching owned NFTs:", error);
      setError("Failed to fetch owned NFTs. Please try again later.");
    }
  }
  useEffect(() => {
    // Simulating an API call to fetch total credits
    setTimeout(() => {
      getOwnedNFTs(walletAddress);
      setIsLoading(false);
    }, 1500);
  }, [walletAddress]);

  const handleRefresh = () => {
    setIsLoading(true);
    getOwnedNFTs(walletAddress).finally(() => setIsLoading(false));
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Loading state with spinning animation
  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading your carbon credits...</p>
        </CardContent>
      </Card>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto overflow-hidden border-red-200">
        <CardHeader className="border-b bg-red-50/50 space-y-1">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 text-red-600"
          >
            <AlertCircle className="h-5 w-5" />
            <h3 className="text-xl font-medium">Error Loading Data</h3>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
        <CardFooter className="border-t bg-red-50/30">
          <Button 
            onClick={handleRefresh} 
            className="mx-auto group hover:shadow-lg transition-all duration-300"
            variant="destructive"
          >
            <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const creditStatus = Number(count) === 0 ? 'none' : Number(count) < 100 ? 'low' : 'good';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto overflow-hidden hover:shadow-xl transition-all duration-300">
        <CardHeader className="border-b bg-muted/50 space-y-1">
          <div className="flex items-center justify-between">
            <div className="">
              <CardTitle className="text-xl flex items-center gap-3  font-medium">
                <span className="tracking-tight">Carbon Credit Portfolio</span>
              </CardTitle>
              <h3 className="text-md font-medium text-muted-foreground">
                Overview
              </h3>
            </div>
            <Badge
              variant="outline"
              className="p-2 bg-background/80 backdrop-blur-sm"
            >
              <Leaf className="h-5 w-5" />
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center relative group"
          >
            <h3 className="text-5xl font-bold mb-2 transition-all duration-300 group-hover:scale-110">
              <span
                className={`
                ${
                  creditStatus === "good"
                    ? "text-green-500 group-hover:text-green-600"
                    : creditStatus === "low"
                      ? "text-amber-500 group-hover:text-amber-600"
                      : "text-gray-500 group-hover:text-gray-600"
                }
              `}
              >
                {formatNumber(Number(count))}
              </span>
            </h3>
            <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
              Tons of CO₂ Equivalent
              {creditStatus === "none" && (
                <CircleSlash className="h-5 w-5 text-gray-500" />
              )}
              {creditStatus === "low" && (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
            </p>
          </motion.div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Portfolio Growth</span>
              <motion.span
                className="text-sm font-bold text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                +15% YTD
              </motion.span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Progress
                value={75}
                className="h-2 bg-gradient-to-r from-muted to-muted/50 transition-all duration-300 hover:h-3"
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-muted/30 hover:bg-primary/10 transition-all duration-300"
            >
              <h4 className="text-sm font-medium text-muted-foreground">
                Monthly Average
              </h4>
              <p className="text-2xl font-bold text-primary">
                {formatNumber(Math.floor(Number(count) / 12))}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-muted/30 hover:bg-primary/10 transition-all duration-300"
            >
              <h4 className="text-sm font-medium text-muted-foreground">
                Target Achievement
              </h4>
              <p className="text-2xl font-bold text-primary">
                {Math.min(Math.floor((Number(count) / 1000) * 100), 100)}%
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="font-medium">15% Increase This Quarter</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">Carbon credit info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your carbon credits are verified and tradable assets</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </CardContent>

        <CardFooter className="border-t">
          <div className="flex flex-wrap items-center gap-4 pt-4 w-full justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="flex items-center gap-2 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                    onClick={() => {
                      navigator("/marketplace");
                    }}
                  >
                    <Leaf className="h-4 w-4" />
                    Purchase More Credits
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Buy more carbon credits to offset your carbon footprint</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              className="hover:scale-105 transition-transform"
              onClick={() => navigator("/history")}
            >
              View History
            </Button>
            <Button
              variant="ghost"
              className="hover:scale-105 transition-transform flex items-center gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
