import { Wallet } from "@/components/dashboard/Wallet";
import { VerifyProject } from "@/components/dashboard/VerifyProject";
import { UserDetails } from "@/components/dashboard/UserDetail";
import { NFTGrid } from "@/components/dashboard/NFTGrid";
import { RewardCard } from "@/components/dashboard/RewardCard";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Loader } from "@/components/Loader";
import { CarbonCreditsDisplay } from "@/components/dashboard/ProjectDetails";
import axios from "axios";
import { useUser } from "@/hooks/useUser";
import { Navigate } from "react-router-dom";

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
  const [isLoading, setIsLoading] = useState(false);
  const [nftMetaDataArray, setNftMetaDataArray] = useState<NFTMetadata[]>([]);
  const [user, setUser] = useState<User | null>({
    id: "404 Not Found",
    email: "404 Not Found",
    password: "404 Not Found",
    name: "404 Not Found",
    address: "404 Not Found",
    phone: "404 Not Found",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const { loadingUser, userDetails } = useUser();

  useEffect(() => {
    // Fetch user details on load
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const fetchedUser = await getUser();
        setUser(fetchedUser);
        setRole("seller"); // Default role for demo purposes
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  useEffect(() => {
    // Fetch NFTs when walletAddress changes
    if (!walletAddress) {
      setNftMetaDataArray([]);
      return;
    }

    const fetchNFTs = async () => {
      setIsLoading(true);
      try {
        const nfts = await getOwnedNFTs(walletAddress);
        setNftMetaDataArray(nfts);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNFTs();
  }, [walletAddress]);

  const getOwnedNFTs = async (
    walletAddress: string
  ): Promise<NFTMetadata[]> => {
    try {
      const response = await axios.get("/nft/getOwnedNFTs", {
        withCredentials: true,
      });
      return response.data.wallets
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
    } catch (error) {
      console.error("Error fetching owned NFTs:", error);
      return [];
    }
  };

  const getUser = async (): Promise<User> => {
    try {
      const response = await axios.get("/user/details", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  };

  if (loadingUser) {
    return <Loader isLoading />;
  }

  if (!userDetails) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="p-6">
      {isLoading && <Loader isLoading />}
      {user && (
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {user.name}'s Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your sales and NFTs</p>
        </div>
      )}
      <Wallet onWalletChange={setWalletAddress} />
      {!isLoading && role === "buyer" && user && (
        <BuyerDashboard user={user} nfts={nftMetaDataArray} />
      )}
      {!isLoading && role === "seller" && user && (
        <SellerDashboard
          user={user}
          nfts={nftMetaDataArray}
          wallet={walletAddress!}
        />
      )}
      {!isLoading && role === "admin" && (
        <AdminDashboard nfts={nftMetaDataArray} wallet={walletAddress!} />
      )}
    </div>
  );
};

const BuyerDashboard = ({
  user,
  nfts,
}: {
  user: User;
  nfts: NFTMetadata[];
}) => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <UserDetails user={user} />
      </div>
      <NFTGrid nfts={nfts} />
    </div>
  </div>
);

const SellerDashboard = ({
  nfts,
  wallet,
}: {
  user: User;
  nfts: NFTMetadata[];
  wallet: string;
}) => (
  <div className="space-y-6">
    <Card className="p-6 space-y-5">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <CarbonCreditsDisplay walletAddress={wallet} />
          <VerifyProject walletAddress={wallet} />
          <RewardCard />
        </div>
        <div className="flex flex-col gap-6">
          {/* <UserDetails user={user} /> */}
          {/* Fix this user details stuff */}
          <NFTGrid nfts={nfts} />
        </div>
      </div>
    </Card>
  </div>
);

const AdminDashboard = ({
  nfts,
  wallet,
}: {
  nfts: NFTMetadata[];
  wallet: string;
}) => {
  const adminUser: User = {
    id: "1",
    email: "admin@ecox.com",
    password: "123456",
    name: "ECOX Admin",
    address: "ECOX, India",
    phone: "+123456789",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the platform and users</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <UserDetails user={adminUser} />
          <CarbonCreditsDisplay walletAddress={wallet} />
        </div>
        <NFTGrid nfts={nfts} />
      </div>
    </div>
  );
};
