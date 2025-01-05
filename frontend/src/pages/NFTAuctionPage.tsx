import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { abi } from "../pages/abi";
import { abi_marketplace } from "../lib/abi_marketplace";
import axios from "axios";

const NFT_CONTRACT_ADDRESS = "0xb525D4F4EDB03eb4cAc9b2E5110D136486cE1fdd";
const MARKETPLACE_ADDRESS = "0x336AF71Ec2b362560b35307B2193eD45ac8C64a8"; 
const TOKEN_ID = 1;

interface Credit {
  id: number;
  typeofcredit: string;
  quantity: number;
  certificateURI: string;
  expiryDate: number;
  retired: boolean;
}

interface CreditData {
  id: string;
  typeofcredit: string;
  quantity: string;
  certificateURI: string;
  expiryDate: bigint;
  retired: boolean;
}

type Auction = [bigint, bigint, bigint, string, bigint, boolean];


const AuctionPage = () => {
  const { address } = useAccount();
  const [creditDetails, setCreditDetails] = useState<Credit | null>(null);
  const [auctionDetails, setAuctionDetails] = useState<Auction | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [showCreateAuctionModal, setShowCreateAuctionModal] = useState(false);
  const [auctionBasePrice, setAuctionBasePrice] = useState("");
  const [auctionDuration, setAuctionDuration] = useState("");

  const { data: nftOwner } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "ownerOf",
    args: [BigInt(TOKEN_ID)]
  });

  const { data: creditData } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "getCredit",
    args: [BigInt(TOKEN_ID)]
  });

  const { data: auctionData } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: abi_marketplace,
    functionName: "auctions",
    args: [BigInt(TOKEN_ID)]
  });

  const { data: hash, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
  const fetchData = async () => {
    if (creditData) {
      const typedCreditData = creditData as CreditData;
      const parsedCredit: Credit = {
        id: Number(typedCreditData.id),
        typeofcredit: typedCreditData.typeofcredit,
        quantity: Number(typedCreditData.quantity),
        certificateURI: typedCreditData.certificateURI,
        expiryDate: Number(typedCreditData.expiryDate),
        retired: typedCreditData.retired,
      };
      try {
        const certificateURI = `https://${typedCreditData.certificateURI.replace(
          /^ipfs:\/\//,
          ""
        )}.ipfs.dweb.link/`;
        const response = await axios.get(certificateURI, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const imageURI = response.data?.image;

        if (imageURI) {
          const updatedCertificateURI = `https://${imageURI.replace(
            /^ipfs:\/\//,
            ""
          )}.ipfs.dweb.link/`;
          parsedCredit.certificateURI = updatedCertificateURI;
        }
      } catch (error) {
        console.error("Error fetching certificate metadata:", error);
      }

      setCreditDetails(parsedCredit);
    }

    // Check ownership status
    setIsOwner(nftOwner === address);

    // Set auction details if available
    if (auctionData) {
      setAuctionDetails(auctionData as Auction);
    }
  };

  fetchData();
}, [creditData, nftOwner, address, auctionData]);


  const handleCreateAuction = async () => {
    if (!address || !isOwner) {
      console.log("Not the owner or not connected");
      return;
    }

    try {
      const basePriceInWei = BigInt(parseFloat(auctionBasePrice) * 1e18);
      const durationInSeconds = BigInt(parseFloat(auctionDuration) * 60 * 60);
      
      const tx = writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: abi_marketplace,
        functionName: "createAuction",
        args: [BigInt(TOKEN_ID), basePriceInWei, durationInSeconds]
      });

      console.log("Auction creation transaction sent:", tx);
      setShowCreateAuctionModal(false);
    } catch (error) {
      console.error("Error creating auction:", error);
    }
  };

  const handlePlaceBid = async () => {
    if (!address || isOwner || !auctionDetails?.[5]) {
      console.log("Cannot place bid");
      return;
    }

    try {
      const bidAmountInWei = BigInt(parseFloat(bidAmount) * 1e18);
      
      const tx = await writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: abi_marketplace,
        functionName: "placeBid",
        args: [BigInt(TOKEN_ID)],
        value: bidAmountInWei
      });

      console.log("Bid placed transaction sent:", tx);
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Carbon Credit NFT Auction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
          src={creditDetails?.certificateURI}
          alt="Certificate"
          className="w-full h-auto" 
        />
            </div>
            <div className="space-y-4">
              {creditDetails && (
                <div className="space-y-2">
                  <p><strong>Credit Type:</strong> {creditDetails.typeofcredit}</p>
                  <p><strong>Quantity:</strong> {creditDetails.quantity}</p>
                  <p><strong>Certificate URI:</strong> {creditDetails.certificateURI}</p>
                  <p><strong>Expiry Date:</strong> {new Date(creditDetails.expiryDate * 1000).toLocaleDateString()}</p>
                  <p><strong>Retired:</strong> {creditDetails.retired ? "Yes" : "No"}</p>
                </div>
              )}
              
              {auctionDetails && auctionDetails[5] && (
                <div className="space-y-2">
                  <p><strong>Current Price:</strong> {Number(auctionDetails[2]) / 1e18} ETH</p>
                  <p><strong>Current Bidder:</strong> {auctionDetails[3]}</p>
                  <p><strong>Auction Ends:</strong> {new Date(Number(auctionDetails[4]) * 1000).toLocaleString()}</p>
                </div>
              )}
              
              {isConfirming && (
                <Alert className="bg-blue-50">
                  <AlertDescription>
                    Transaction pending... Please wait for confirmation.
                  </AlertDescription>
                </Alert>
              )}
              
              {isConfirmed && (
                <Alert className="bg-green-50">
                  <AlertDescription>
                    Transaction successful!
                  </AlertDescription>
                </Alert>
              )}
              
              {isOwner && (!auctionDetails || !auctionDetails[5]) && (
                <Dialog open={showCreateAuctionModal} onOpenChange={setShowCreateAuctionModal}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">Create Auction</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Auction</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="basePrice">Base Price (ETH)</Label>
                        <Input
                          id="basePrice"
                          value={auctionBasePrice}
                          onChange={(e) => setAuctionBasePrice(e.target.value)}
                          placeholder="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (hours)</Label>
                        <Input
                          id="duration"
                          value={auctionDuration}
                          onChange={(e) => setAuctionDuration(e.target.value)}
                          placeholder="24"
                        />
                      </div>
                      <Button onClick={handleCreateAuction}>Start Auction</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {!isOwner && auctionDetails && auctionDetails[5] && (
                <div className="space-y-2">
                  <Input
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Bid amount in ETH"
                  />
                  <Button
                    className="w-full"
                    onClick={handlePlaceBid}
                    disabled={isConfirming}
                  >
                    Place Bid
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuctionPage;

