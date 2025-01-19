import { useState, useEffect } from "react";
import { Search, Grid, List } from "lucide-react";
import { Loader } from "@/components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import CarbonCreditCard from "@/components/CarbonCreditCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";

interface NFT {
  id: string;
  tokenId: string;
  walletAddress: string;
  price: string;
  typeofCredit: string;
  quantity: string;
  certificateURI: string;
  expiryDate: Date;
  isAuction: boolean;
  isDirectSale: boolean;
  createdAt: Date;
  image?: string;
  description?: string;
}

const fetchIPFSData = async (
  uri: string
): Promise<{ image?: string; description?: string }> => {
  try {
    const ipfsURL = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    const response = await fetch(ipfsURL);

    if (!response.ok) {
      throw new Error(`Failed to fetch IPFS data from: ${ipfsURL}`);
    }

    const metadata = await response.json();
    return {
      image: metadata.image
        ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
        : undefined,
      description: metadata.description || undefined,
    };
  } catch (error) {
    console.error("Error fetching IPFS data:", error);
    return {};
  }
};

export default function MarketplacePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [saleNfts, setSaleNfts] = useState<NFT[]>([]);
  const [type, setType] = useState<"auction" | "sale">("sale");
  const [searchTerm, setSearchTerm] = useState("");
  const { loadingUser, userDetails } = useUser();

  useEffect(() => {
    getAllNFTs();
  }, []);

  async function getAllNFTs() {
    try {
      const response = await axios.get("/nft/getAllNFTs", {
        withCredentials: true,
      });
      const allNfts: NFT[] = response.data;

      const [auctionNfts, sellNfts] = [
        allNfts.filter((n) => n.isAuction),
        allNfts.filter((n) => n.isDirectSale),
      ];

      const updatedAuctionNfts = await Promise.all(
        auctionNfts.map(async (nft) => ({
          ...nft,
          ...(await fetchIPFSData(nft.certificateURI)),
        }))
      );

      const updatedSaleNfts = await Promise.all(
        sellNfts.map(async (nft) => ({
          ...nft,
          ...(await fetchIPFSData(nft.certificateURI)),
        }))
      );

      setNfts(updatedAuctionNfts);
      setSaleNfts(updatedSaleNfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  }

  const filteredNFTs = (type === "auction" ? nfts : saleNfts).filter((nft) =>
    nft.typeofCredit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingUser) {
    return <Loader isLoading={loadingUser} />;
  }

  if (!userDetails) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        className="absolute w-full h-full object-cover opacity-10"
      >
        <source src="/nft-background.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4"
          >
            <div className="flex items-center flex-1 max-w-2xl w-full ">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by credit type"
                  className="pl-10 border-muted text-foreground w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={type}
                onValueChange={(value) => setType(value as "auction" | "sale")}
              >
                <SelectTrigger className="w-[180px] bg-muted/50 border-muted text-foreground">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auction">Auction</SelectItem>
                  <SelectItem value="sale">Direct Sale</SelectItem>
                </SelectContent>
              </Select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-secondary" : "hover:bg-primary"}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-5 w-5 text-black" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-secondary" : "hover:bg-primary"}`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-5 w-5 text-black" />
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence>
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`grid ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                  : "grid-cols-1"
              } gap-6`}
            >
              {filteredNFTs.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground">
                  No items listed
                </div>
              ) : (
                filteredNFTs.map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <CarbonCreditCard nft={nft} viewMode={viewMode} />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
