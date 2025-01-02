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
const operatorAddress = "0xB76c4D0BDc1B1508b66A36BE5fdc362Cc79988b3";
const abi = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
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

  const [approvedAddress, setApprovedAddress] = useState<string | null>(null);
  const { data: approvedAddressData } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "getApproved",
    args: [parseInt(nftDetails.id)],
  });

  const { data: hash, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (
      //@ts-ignore
      parseInt(approvedAddressData) &&
      typeof approvedAddressData === "string"
    ) {
      setApprovedAddress(approvedAddressData);
    } else {
      setApprovedAddress(null);
    }
  }, [approvedAddressData]);

  const handleApproval = async () => {
    if (nftDetails && address) {
      try {
        writeContract({
          address: contractAddress,
          abi,
          functionName: "approve",
          args: [operatorAddress, parseInt(nftDetails.id)],
        });

        setApprovedAddress(operatorAddress);
      } catch (error) {
        console.error("Error setting approval:", error);
      }
    }
  };

  const handleRemoveApproval = async () => {
    if (nftDetails && address) {
      try {
        // Set the approval to the zero address (removes approval for the operator)
        writeContract({
          address: contractAddress,
          abi,
          functionName: "approve",
          args: [address, parseInt(nftDetails.id)], // Removes the operator by approving the owner's address
        });

        setApprovedAddress(null); // Removes operator address
      } catch (error) {
        console.error("Error removing approval:", error);
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
                  approvedAddress ? handleRemoveApproval : handleApproval
                }
                disabled={isConfirming}
              >
                {approvedAddress
                  ? isConfirming
                    ? "Removing Approval..."
                    : "Remove Approval"
                  : isConfirming
                    ? "Listing for Sale..."
                    : "Approve for Sale"}
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
