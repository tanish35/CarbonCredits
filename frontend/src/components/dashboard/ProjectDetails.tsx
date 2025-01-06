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
import { Leaf, TrendingUp, Info, CircleSlash, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [totalCredits, setTotalCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [count,setCount] = useState('0');
  const navigator = useNavigate();
  async function getOwnedNFTs(walletAddress: string) {
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
    } catch (error) {
      console.error("Error fetching owned NFTs:", error);
    }
  }
  useEffect(() => {
    // Simulating an API call to fetch total credits
    setTimeout(() => {
      getOwnedNFTs(walletAddress);
      setIsLoading(false);
    }, 1500);
  }, []);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="border-b bg-muted/50 space-y-1">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="text-center">
            <Skeleton className="h-12 w-[150px] mx-auto mb-2" />
            <Skeleton className="h-6 w-[200px] mx-auto" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const creditStatus = Number(count) === 0 ? 'none' : Number(count) < 100 ? 'low' : 'good';

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden hover:shadow-lg transition-all duration-300">
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
          <Badge variant="outline" className="text-primary">
            <Leaf className="h-6 w-6" />
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center relative"
        >
          <h3 className="text-4xl font-bold mb-2">
            <span className={`${creditStatus === 'good' ? 'text-green-500' : creditStatus === 'low' ? 'text-amber-500' : 'text-gray-500'}`}>
              {formatNumber(Number(count))}
            </span>
          </h3>
          <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
            Tons of CO₂ Equivalent
            {creditStatus === 'none' && (
              <CircleSlash className="h-5 w-5 text-gray-500" />
            )}
            {creditStatus === 'low' && (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
          </p>
        </motion.div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Portfolio Growth</span>
            <span className="text-sm font-bold text-primary">+15% YTD</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Progress 
              value={75} 
              className="h-2 bg-gradient-to-r from-muted to-muted/50"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <h4 className="text-sm font-medium text-muted-foreground">Monthly Average</h4>
            <p className="text-2xl font-bold text-primary">{formatNumber(Math.floor(Number(count) / 12))}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <h4 className="text-sm font-medium text-muted-foreground">Target Achievement</h4>
            <p className="text-2xl font-bold text-primary">{Math.min(Math.floor((Number(count) / 1000) * 100), 100)}%</p>
          </div>
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
          <Button
            className="flex items-center gap-2 hover:scale-105 transition-transform"
            onClick={() => {
              navigator("/marketplace");
            }}
          >
            <Leaf className="h-4 w-4" />
            Purchase More Credits
          </Button>
          <Button
            variant="outline"
            className="hover:scale-105 transition-transform"
            onClick={() => navigator("/history")}
          >
            View History
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
