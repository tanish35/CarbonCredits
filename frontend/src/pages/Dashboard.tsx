"use client";

import { Wallet } from "@/components/dashboard/Wallet";
import { VerifyProject } from "@/components/dashboard/VerifyProject";
import { UserDetails } from "@/components/dashboard/UserDetail";
import { NFTGrid } from "@/components/dashboard/NFTGrid";
import { RewardCard } from "@/components/dashboard/RewardCard";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Loader } from "@/components/Loader";
import { GreenProjectDetail } from "@/components/dashboard/ProjectDetails";

const nfts = [
  {
    id: 1,
    price: "0.5",
    expiresAt: new Date(2080, 12, 12),
    quantity: 10,
    image:
      "https://be-cis.com/wp-content/uploads/2023/12/view-green-forest-trees-with-co2-scaled.webp",
    description: "A beautiful green forest NFT", // New description added
  },
  { id: 2, price: "0.7", expiresAt: new Date(2028, 12, 12), quantity: 20, description: "A serene mountain NFT" },
  { id: 3, price: "0.9", expiresAt: new Date(2028, 12, 12), quantity: 30, description: "A tranquil lake NFT" },
  { id: 4, price: "1.1", expiresAt: new Date(2028), quantity: 40, description: "A vibrant city NFT" },
  { id: 5, price: "1.1", expiresAt: new Date(2028), quantity: 40, description: "A bustling market NFT" },
];

export const Dashboard = () => {
  const [role, setRole] = useState<"buyer" | "seller" | "admin" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRole("seller");
      setIsLoading(false);
    }, 3000);
  }, []);

  return (
    <>
      {isLoading && <Loader isLoading />}
      {role === "buyer" && <BuyerDashboard />}
      {role === "seller" && <SellerDashboard />}
      {role === "admin" && <AdminDashboard />}
    </>
  );
};

const BuyerDashboard = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Elon's Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your green projects and NFTs
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <UserDetails />
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

const SellerDashboard = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Elon's Dashboard</h1>
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
            <UserDetails />
            <NFTGrid nfts={nfts} />
          </div>
        </div>
      </Card>
    </div>
  );
};

const AdminDashboard = () => {
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
            <UserDetails />
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
