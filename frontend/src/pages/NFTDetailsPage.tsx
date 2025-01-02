import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";

interface NFTDetailsProps {
  id: string;
  typeofcredit: string;
  quantity: string;
  expiryDate: number;
  retired: boolean;
  certificateURI: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

const contractAddress = "0xe2dc0a8D8AAD4A177cE3285c65b71E042987184D";
const operatorAddress = "0xf2eAcB364AD62cA6aaCEcF207aBf93FA7de4E03B";
const abi = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "bool", name: "approved", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "operator", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const NFTDetailsPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const location = useLocation();
  const nftDetails = location.state as NFTDetailsProps;

  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const { data: isApprovedForAllData } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "isApprovedForAll",
    args: [address, operatorAddress],
  });

  const { data: hash, error, writeContract } = useWriteContract();

  // Waiting for the transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isApprovedForAllData !== undefined) {
      setIsApproved(Boolean(isApprovedForAllData));
    }
  }, [isApprovedForAllData]);

  const handleApprovalToggle = async () => {
    if (nftDetails && address) {
      try {
        writeContract({
          address: contractAddress,
          abi,
          functionName: "setApprovalForAll",
          args: [operatorAddress, true],
        });

        setIsApproved(true);
      } catch (error) {
        console.error("Error setting approval:", error);
      }
    }
  };

  const handleRemoveFromSale = async () => {
    if (nftDetails && address) {
      try {
        writeContract({
          address: contractAddress,
          abi,
          functionName: "setApprovalForAll",
          args: [operatorAddress, false],
        });

        setIsApproved(false);
      } catch (error) {
        console.error("Error removing from sale:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Link
        to="/my-nft"
        className="text-blue-500 hover:underline mb-4 inline-block"
      >
        &larr; Back to Wallet
      </Link>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{nftDetails.metadata.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src={`https://${nftDetails.metadata.image.replace(/^ipfs:\/\//, "")}.ipfs.dweb.link/`}
                alt={nftDetails.metadata.name}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-4">
              <p className="text-lg">{nftDetails.metadata.description}</p>
              <div>
                <h3 className="text-xl font-semibold mb-2">Details</h3>
                <ul className="space-y-2">
                  <li>
                    <strong>ID:</strong> {parseInt(nftDetails.id).toString()}
                  </li>
                  <li>
                    <strong>Type of Credit:</strong> {nftDetails.typeofcredit}
                  </li>
                  <li>
                    <strong>Quantity:</strong>{" "}
                    {parseInt(nftDetails.quantity).toString()}
                  </li>
                  <li>
                    <strong>Expiry Date:</strong>{" "}
                    {new Date(
                      nftDetails.expiryDate * 1000
                    ).toLocaleDateString()}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Attributes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {nftDetails.metadata.attributes.map((attr, index) => (
                    <Badge key={index} variant="outline" className="p-2">
                      <span className="font-semibold">{attr.trait_type}:</span>{" "}
                      {attr.value}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={
                  isApproved ? handleRemoveFromSale : handleApprovalToggle
                }
                disabled={isConfirming}
              >
                {isApproved
                  ? isConfirming
                    ? "Removing from Sale..."
                    : "Remove from Sale"
                  : isConfirming
                    ? "Listing for Sale..."
                    : "List for Sale"}
              </Button>
              {isConfirming && (
                <p className="mt-2 text-gray-500">
                  Transaction is being confirmed...
                </p>
              )}
              {isConfirmed && (
                <p className="mt-2 text-green-500">Transaction Confirmed!</p>
              )}
              {error && (
                <p className="mt-2 text-red-500">Error: {error.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTDetailsPage;
