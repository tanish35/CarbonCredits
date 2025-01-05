import { Wallet } from "@/components/dashboard/Wallet";
import { VerifyProject } from "@/components/dashboard/VerifyProject";
import { UserDetails } from "@/components/dashboard/UserDetail";
import { NFTGrid } from "@/components/dashboard/NFTGrid";
import { RewardCard } from "@/components/dashboard/RewardCard";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Loader } from "@/components/Loader";
import { GreenProjectDetail } from "@/components/dashboard/ProjectDetails";
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

interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Dashboard = () => {
  const [role, setRole] = useState<"buyer" | "seller" | "admin" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nftMetaDataArray, setNftMetaDataArray] = useState<NFTMetadata[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getUser(), getOwnedNFTs()])
      .then(([user]) => {
        setUser(user);
        setRole("seller"); // Assume role is fetched dynamically; here set to seller for example
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setIsLoading(false));
  }, []);

  async function getOwnedNFTs() {
    try {
      const response = await axios.get("/api/nft/getOwnedNFTs", {
        withCredentials: true,
      });
      const ownedNFTs = response.data.wallets.flatMap((wallet: any) =>
        wallet.nfts.map((nft: NFTMetadata) => ({
          ...nft,
          image: nft.certificateURI, // Use IPFS URI if available
          description: nft.description || "NFT Description unavailable",
        }))
      );
      setNftMetaDataArray(ownedNFTs);
    } catch (error) {
      console.error("Error fetching owned NFTs:", error);
    }
  }

  async function getUser(): Promise<User> {
    try {
      const response = await axios.get("/api/user/me", { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }

  return (
    <>
      {isLoading && <Loader isLoading />} {/* Show loader while data is being fetched */}
      {!isLoading && role === "buyer" && user && <BuyerDashboard user={user} nfts={nftMetaDataArray} />}
      {!isLoading && role === "seller" && user && <SellerDashboard user={user} nfts={nftMetaDataArray} />}
      {!isLoading && role === "admin" && <AdminDashboard nfts={nftMetaDataArray} />}
    </>
  );
};

const BuyerDashboard = ({ user, nfts }: { user: User; nfts: NFTMetadata[] }) => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{user.name}'s Dashboard</h1>
        <p className="text-muted-foreground">Manage your green projects and NFTs</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <UserDetails user={user} />
          <Card className="p-6">
            <Wallet />
          </Card>
          <VerifyProject />
        </div>
        <NFTGrid nfts={nfts} />
      </div>
    </div>
  );
};

const SellerDashboard = ({ user, nfts }: { user: User; nfts: NFTMetadata[] }) => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{user.name}'s Dashboard</h1>
        <p className="text-muted-foreground">Manage your sales and NFTs</p>
      </div>
      <Card className="p-6 space-y-5">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Wallet />
            <GreenProjectDetail />
            <RewardCard />
          </div>
          <div className="flex flex-col gap-6">
            <UserDetails user={user} />
            <NFTGrid nfts={nfts} />
          </div>
        </div>
      </Card>
    </div>
  );
};

const AdminDashboard = ({ nfts }: { nfts: NFTMetadata[] }) => {
  const user = {
    id: "1",
    email: "ECOX@ECOX.com",
    password: "123456",
    name: "ECOX Admin",
    address: "ECOX,India",
    phone: "+123456789",
    createdAt: new Date(),
    updatedAt: new Date()
  }
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the platform and users</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <Wallet />
          </Card>
          <Card className="p-6">
            <UserDetails user={user}/>
          </Card>
          <GreenProjectDetail />
        </div>
        <Card className="p-6">
          <NFTGrid nfts={nfts} />
        </Card>
      </div>
    </div>
  );
};
