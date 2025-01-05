import React from "react";

import { useAccount, useBalance } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";

export const Wallet: React.FC = () => {
  const { toast } = useToast();
  const { isConnected: accountConnected, address } = useAccount();
  const { data: balance, isError, isLoading } = useBalance({ address });

  //@ts-ignore
  const handleCopy = (text: string, e: any) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `Wallet address ${text} copied to clipboard`,
    });
  };

  return (
    <div className="container">
      {!accountConnected ? (
        <div></div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
            </CardHeader>
            <Separator className="mb-4" />
            <CardContent>
              <div className="flex items-center">
                <p className="flex flex-wrap">Wallet Connected: {address}</p>
                {/* <Button
                  onClick={(e: any) => handleCopy(address!.toString(), e)}
                  className="mt-4 mr-5 h-8 w-8"
                >
                  <Clipboard />
                </Button> */}
              </div>
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
