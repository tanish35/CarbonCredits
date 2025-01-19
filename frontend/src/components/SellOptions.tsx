import { useState, useEffect, useRef } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { abi } from "@/lib/abi";
import { abi_marketplace } from "@/lib/abi_marketplace";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface SellOptionsProps {
  tokenId: number;
  onComplete: () => void;
  NFT_CONTRACT_ADDRESS: `0x${string}`;
  MARKETPLACE_ADDRESS: `0x${string}`;
}

export const SellOptions: React.FC<SellOptionsProps> = ({
  tokenId,
  onComplete,
  NFT_CONTRACT_ADDRESS,
  MARKETPLACE_ADDRESS,
}) => {
  const [sellType, setSellType] = useState<"auction" | "directSell" | null>(
    null
  );
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  const [isApprovedForSale, setIsApprovedForSale] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address } = useAccount();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isResellApproved, setIsResellApproved] = useState(false);
  const [emission, setEmission] = useState("");
  const { writeContract } = useWriteContract();

  const { data: isApproved } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "isApprovedForAll",
    args: [address, MARKETPLACE_ADDRESS],
  });

  const { data: owner } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  }) as { data: string };

  const { data: auctionData } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: abi_marketplace,
    functionName: "auctions",
    args: [BigInt(tokenId)],
  });

  useEffect(() => {
    console.log(auctionData);
  }, [auctionData]);

  useEffect(() => {
    const checkApproval = async () => {
      try {
        const response = await axios.post(
          "/resell/getResellApproval",
          {
            token_id: tokenId,
          },
          { withCredentials: true }
        );
        setIsApprovedForSale(response.data.isAllowedToSell);
      } catch (error) {
        console.error("Error checking approval:", error);
      }
    };
    checkApproval();
  }, [tokenId]);

  //@ts-ignore
  const isAuctionActive = auctionData && auctionData[5];
  const isOwner =
    address && owner && owner.toLowerCase() === address.toLowerCase();

  const handleChooseSellOption = async (type: "auction" | "directSell") => {
    setSellType(type);
    try {
      await axios.post("/nft/setNFTStatus", {
        tokenId: tokenId.toString(),
        type,
      });
      if (type === "directSell") {
        toast({
          title: "Direct Sell",
          description: "You have selected direct sell option",
        });
        navigate(`/marketplace`);
      }
    } catch (error) {
      console.error("Error setting sell type:", error);
    }
  };

  const handleSetPrice = async () => {
    if (!price) return;

    const priceInWei = BigInt(parseFloat(price) * 1e18);

    try {
      if (sellType === "auction") {
        const durationInSeconds = BigInt(parseFloat(duration) * 60 * 60);
        writeContract({
          address: MARKETPLACE_ADDRESS,
          abi: abi_marketplace,
          functionName: "createAuction",
          args: [
            BigInt(tokenId),
            BigInt(priceInWei),
            BigInt(durationInSeconds),
          ],
        });
      }
      onComplete();
    } catch (error) {
      console.error("Error setting price:", error);
    }
  };

  const handleApproval = async () => {
    if (!address) return;

    try {
      writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi,
        functionName: "setApprovalForAll",
        args: [MARKETPLACE_ADDRESS, true],
      });
    } catch (error) {
      console.error("Error setting approval:", error);
    }
  };

  const handleCancelAuction = async () => {
    try {
      writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: abi_marketplace,
        functionName: "cancelAuction",
        args: [BigInt(tokenId)],
      });
      onComplete();
    } catch (error) {
      console.error("Error cancelling auction:", error);
    }
  };

  const handleUploadCertificate = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("certificate2", file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post("/resell/getEmissionData", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 100)
          );
          setUploadProgress(percentCompleted);
        },
      });
      setIsUploading(false);
      setIsProcessing(true);

      const { emission } = response.data;
      setEmission(emission);
      // console.log(emission);

      writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi,
        functionName: "reduceQuantity",
        args: [BigInt(tokenId), BigInt(emission)],
      });

      setIsResellApproved(true);

      setIsApprovedForSale(true);
      setShowCertificateDialog(false);
      setIsProcessing(false);
      toast({
        title: "Certificate Uploaded",
        description: "Your NFT is now approved for sale.",
      });
    } catch (error) {
      console.error("Error uploading certificate:", error);
      setIsUploading(false);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to upload certificate and process data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const setApproval = async () => {
      if (isResellApproved) {
        try {
          await axios.post(
            "/resell/setApproval",
            {
              token_id: tokenId,
              quantity: Number(emission),
            },
            { withCredentials: true }
          );
          window.location.reload();
        } catch (error) {
          console.error("Error setting approval:", error);
        }
      }
    };
    setApproval();
  }, [isResellApproved]);

  return (
    <>
      {!isApprovedForSale ? (
        <Button
          onClick={() => setShowCertificateDialog(true)}
          className="w-full"
        >
          Upload Certificate
        </Button>
      ) : !isApproved ? (
        <Button onClick={handleApproval} className="w-full">
          Approve NFT for Marketplace
        </Button>
      ) : isAuctionActive && isOwner ? (
        <div className="space-y-4">
          <Button
            onClick={handleCancelAuction}
            variant="destructive"
            className="w-full"
          >
            Cancel Auction
          </Button>
        </div>
      ) : !sellType ? (
        <div className="space-y-4">
          <Button
            onClick={() => handleChooseSellOption("auction")}
            className="w-full"
          >
            Create Auction
          </Button>
          <Button
            onClick={() => handleChooseSellOption("directSell")}
            className="w-full"
          >
            Set Direct Sell Price
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sellType === "auction" && (
            <>
              <div>
                <Label htmlFor="price">Price (ETH)</Label>
                <Input
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.1"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="24"
                />
              </div>
            </>
          )}
          <Button onClick={handleSetPrice} className="w-full">
            {sellType === "auction" ? "Start Auction" : "Set Price"}
          </Button>
        </div>
      )}

      <Dialog
        open={showCertificateDialog}
        onOpenChange={(open) => setShowCertificateDialog(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Please upload your certificate to approve the NFT for sale.</p>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleUploadCertificate}
              className="hidden"
            />
            {isUploading && (
              <div className="space-y-2">
                <p>Uploading certificate...</p>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
            {isProcessing && (
              <div className="space-y-2">
                <p>Processing certificate data...</p>
                <Progress value={100} className="w-full" />
              </div>
            )}
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={isUploading || isProcessing}
            >
              {isUploading || isProcessing
                ? "Processing..."
                : "Select Certificate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
