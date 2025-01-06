import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, Info } from 'lucide-react';
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

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            Your Carbon Credit Portfolio
          </h2>
          <Badge variant="secondary" className="bg-white text-primary">
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-4xl font-bold text-primary mb-2">
            {isLoading ? (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading...
              </motion.div>
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {formatNumber(Number(count))}
              </motion.span>
            )}
          </h3>
          <p className="text-xl text-muted-foreground">
            Tons of CO₂ Equivalent
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
            <Progress value={75} className="h-2" />
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
          <Button className="flex items-center gap-2" onClick={() => {navigator('/marketplace')}}>
            <Leaf className="h-4 w-4" />
            Purchase More Credits
          </Button>
          
        </div>
      </CardFooter>
    </Card>
  );
}
