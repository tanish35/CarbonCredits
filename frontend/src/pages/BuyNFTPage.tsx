import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { abi } from "../pages/abi";
import { abi_marketplace } from "../lib/abi_marketplace";

const NFT_CONTRACT_ADDRESS = "0x0d388696b31522Cd45776190783072b10E8e2776";
const MARKETPLACE_ADDRESS = "0x276F9bEAa4E3aAC344613468cff5Cf6B5210161B";
const TOKEN_ID = 7;
const TOKEN_PRICE = "0.01";
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

const BuyPage = () => {
  const { address } = useAccount();
  const [creditDetails, setCreditDetails] = useState<Credit | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  const { data: nftOwner } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "ownerOf",
    args: [BigInt(TOKEN_ID)],
  });

  const { data: creditData } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "getCredit",
    args: [BigInt(TOKEN_ID)],
  });

  const { data: currentApprovedAddress } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "getApproved",
    args: [BigInt(TOKEN_ID)],
  });

  const { data: hash, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
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
      setCreditDetails(parsedCredit);
    }

    setIsApproved(nftOwner === address);
  }, [creditData, nftOwner, address]);

  const handleBuyNFT = async () => {
    if (!address || !nftOwner || nftOwner === address) {
      console.log("Not the owner or not connected");
      return;
    }

    console.log("Checking approval...");
    if (currentApprovedAddress !== MARKETPLACE_ADDRESS) {
      console.log("Marketplace not approved. Cancelling purchase.");
      return;
    }

    try {
      console.log("Proceeding with NFT purchase...");

      const priceInWei = BigInt(parseFloat(TOKEN_PRICE) * 1e18);
      const tx = writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: abi_marketplace,
        functionName: "purchaseToken",
        args: [BigInt(TOKEN_ID), priceInWei],
        value: priceInWei,
      });

      console.log("Transaction sent:", tx);
    } catch (error) {
      console.error("Error during purchase:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Carbon Credit NFT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src="/placeholder.jpg"
                alt="Carbon Credit NFT"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-4">
              {creditDetails && (
                <div className="space-y-2">
                  <p>
                    <strong>Credit Type:</strong> {creditDetails.typeofcredit}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {creditDetails.quantity}
                  </p>
                  <p>
                    <strong>Certificate URI:</strong>{" "}
                    {creditDetails.certificateURI}
                  </p>
                  <p>
                    <strong>Expiry Date:</strong>{" "}
                    {new Date(
                      creditDetails.expiryDate * 1000
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Retired:</strong>{" "}
                    {creditDetails.retired ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Price:</strong> {TOKEN_PRICE} ETH
                  </p>
                </div>
              )}

              {isConfirming && (
                <Alert className="bg-blue-50">
                  <AlertDescription>
                    Purchase pending... Please wait for confirmation.
                  </AlertDescription>
                </Alert>
              )}

              {isConfirmed && (
                <Alert className="bg-green-50">
                  <AlertDescription>
                    Purchase successful! NFT has been transferred.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full mt-4"
                onClick={handleBuyNFT}
                disabled={isApproved || isConfirming}
              >
                {isApproved
                  ? "NFT Owned"
                  : isConfirming
                    ? "Purchase Pending..."
                    : `Buy for ${TOKEN_PRICE} ETH`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyPage;
