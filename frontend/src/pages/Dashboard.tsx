import { Wallet } from "@/components/dashboard/Wallet";
import { VerifyProject } from "@/components/dashboard/VerifyProject";
import { UserDetails } from "@/components/dashboard/UserDetail";
import { NFTGrid } from "@/components/dashboard/NFTGrid";
import { RewardCard } from "@/components/dashboard/RewardCard";
import { useState, useEffect } from "react";
import { Loader } from "@/components/Loader";
import { CarbonCreditsDisplay } from "@/components/dashboard/ProjectDetails";
import axios from "axios";
import { useUser } from "@/hooks/useUser";
import { Navigate } from "react-router-dom";
import { User } from "@/lib/interface";

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



export const Dashboard = () => {
  const [role, setRole] = useState<"buyer" | "seller" | "admin" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nftMetaDataArray, setNftMetaDataArray] = useState<NFTMetadata[]>([]);
  const [user, setUser] = useState<User | null>({
    id: "12334578",
    email: "user@email.com",
    password: "123456",
    name: "user",
    address: "user address",
    phone: "12345678",
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
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
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

      {!isLoading && role === "buyer" && user && (
        <BuyerDashboard
          user={user}
          nfts={nftMetaDataArray}
          onWalletChange={setWalletAddress}
        />
      )}
      {!isLoading && role === "seller" && user && (
        <SellerDashboard
          user={user}
          nfts={nftMetaDataArray}
          wallet={walletAddress!}
          onWalletChange={setWalletAddress}
        />
      )}
      {!isLoading && role === "admin" && (
        <AdminDashboard
          nfts={nftMetaDataArray}
          wallet={walletAddress!}
          onWalletChange={setWalletAddress}
        />
      )}
    </div>
  );
};

const BuyerDashboard = ({
  user,
  nfts,
  onWalletChange,
}: {
  user: User;
  nfts: NFTMetadata[];
  onWalletChange: (wallet: any) => void;
}) => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Wallet onWalletChange={onWalletChange} />
        <UserDetails user={user} />
      </div>
      <NFTGrid nfts={nfts} />
    </div>
  </div>
);

const SellerDashboard = ({
  user,
  nfts,
  wallet,
  onWalletChange,
}: {
  user: User;
  nfts: NFTMetadata[];
  wallet: string;
  onWalletChange: (wallet: any) => void;
}) => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Wallet onWalletChange={onWalletChange} />
        <CarbonCreditsDisplay walletAddress={wallet} />
        <RewardCard user={user} />
      </div>
      <div className="flex flex-col gap-6">
        <UserDetails user={user} />
        <VerifyProject walletAddress={wallet} />
        <NFTGrid nfts={nfts} />
      </div>
    </div>
  </div>
);

const AdminDashboard = ({
  nfts,
  wallet,
  onWalletChange,
}: {
  nfts: NFTMetadata[];
  wallet: string;
  onWalletChange: (wallet: any) => void;
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
          <Wallet onWalletChange={onWalletChange} />
          <UserDetails user={adminUser} />
          <CarbonCreditsDisplay walletAddress={wallet} />
        </div>
        <NFTGrid nfts={nfts} />
      </div>
    </div>
  );
};
