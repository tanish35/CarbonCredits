import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useConnect,
  useDisconnect,
  useAccount,
  useBalance,
  useReadContract,
} from "wagmi";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
if (!contractAddress) {
  throw new Error("Contract address is not defined");
}
const abi = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "getCreditByOwner",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "typeofcredit", type: "string" },
          { internalType: "uint256", name: "quantity", type: "uint256" },
          { internalType: "string", name: "certificateURI", type: "string" },
          { internalType: "uint256", name: "expiryDate", type: "uint256" },
          { internalType: "bool", name: "retired", type: "bool" },
        ],
        internalType: "struct Credit[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const MyNFTPage: React.FC = () => {
  const navigate = useNavigate();
  const { connect, connectors: availableConnectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected: accountConnected, address } = useAccount();
  const { data: balance, isError, isLoading } = useBalance({ address });

  const {
    data: creditsData,
    isLoading: isCreditLoading,
    isError: isCreditError,
  } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "getCreditByOwner",
    args: [address],
  });

  const [credits, setCredits] = useState<any[]>([]);

  useEffect(() => {
    if (creditsData && Array.isArray(creditsData)) {
      const fetchData = async () => {
        const creditData: any[] = await Promise.all(
          creditsData.map(async (credit) => {
            const certificateURI = `https://${credit.certificateURI.replace(
              /^ipfs:\/\//,
              ""
            )}.ipfs.dweb.link/`;

            try {
              const response = await axios.get(certificateURI, {
                headers: {
                  "Content-Type": "application/json",
                },
              });

              const imageURI = response.data?.image;
              const updatedCertificateURI = `https://${imageURI.replace(
                /^ipfs:\/\//,
                ""
              )}.ipfs.dweb.link/`;

              return {
                ...credit,
                expiryDate: parseInt(credit.expiryDate),
                certificateURI: updatedCertificateURI,
                metadata: response.data,
              };
            } catch (error) {
              console.error("Error fetching data:", error);
              return {
                ...credit,
                expiryDate: parseInt(credit.expiryDate),
                certificateURI,
                metadata: null,
              };
            }
          })
        );

        setCredits(creditData);
      };

      fetchData();
    }
  }, [creditsData]);

  const handleCardClick = (credit: any) => {
    navigate(`/nft/${credit.id}`, { state: credit });
  };

  return (
    <div className="container mx-auto p-4">
      {!accountConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please connect your wallet to proceed.</p>
            <div className="flex flex-wrap gap-4">
              {availableConnectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  variant="outline"
                >
                  Connect with {connector.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">Wallet Connected: {address}</p>
              <div className="mt-4">
                <h3 className="text-lg font-medium">Balance:</h3>
                {isLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : isError ? (
                  <p className="text-red-500">Error fetching balance</p>
                ) : (
                  <p className="text-xl font-bold">
                    {balance?.formatted} {balance?.symbol}
                  </p>
                )}
              </div>
              <Button
                className="mt-4"
                variant="destructive"
                onClick={() => disconnect()}
              >
                Disconnect Wallet
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Credits</CardTitle>
            </CardHeader>
            <CardContent>
              {isCreditLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : isCreditError ? (
                <p className="text-red-500">Error fetching credits</p>
              ) : credits.length === 0 ? (
                <p>No credits owned</p>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {credits.map((credit, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleCardClick(credit)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold">
                                Credit #{credit.id.toString()}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {credit.typeofcredit}
                              </p>
                              <p className="mt-2">
                                Quantity: {credit.quantity.toString()}
                              </p>
                              <p className="mt-1">
                                Expiry Date:{" "}
                                {new Date(
                                  credit.expiryDate * 1000
                                ).toLocaleDateString()}
                              </p>
                              {credit.retired && (
                                <Badge variant="destructive" className="mt-2">
                                  Retired
                                </Badge>
                              )}
                            </div>
                            {credit.certificateURI && (
                              <img
                                src={credit.certificateURI}
                                alt={`Credit #${credit.id.toString()}`}
                                className="w-24 h-24 object-cover rounded-md"
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MyNFTPage;
