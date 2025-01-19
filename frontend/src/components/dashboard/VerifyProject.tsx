import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import axios from "axios";

interface CarbonCreditsDisplayProps {
  walletAddress: string;
}

export function VerifyProject({ walletAddress }: CarbonCreditsDisplayProps) {
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [mintingOpen, setMintingOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [nftImage, setNftImage] = useState<File | null>(null);
  const [nftName, setNftName] = useState("");
  const { toast } = useToast();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "certificate" | "nftImage"
  ) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a JPG or PNG image",
        });
        return;
      }

      if (type === "certificate") {
        setCertificate(selectedFile);
      } else {
        setNftImage(selectedFile);
      }
    }
  };

  const handleVerification = async () => {
    if (!certificate || !nftImage || !nftName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide all required fields.",
      });
      return;
    }

    setIsVerifying(true);

    const formData = new FormData();
    formData.append("certificate", certificate);
    formData.append("companyLogo", nftImage);
    formData.append("name", nftName);
    formData.append("ownerId", walletAddress);

    try {
      const response = await axios.post("/emission", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setIsVerifying(false);
      if (response) {
        toast({
          title: "Verification and Minting Successful",
          description:
            "Your project has been successfully verified and NFT minted.",
        });
      }
      setVerificationOpen(false);
    } catch (error) {
      setIsVerifying(false);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "An error occurred during verification.",
      });
    }
  };

  const handleMinting = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        "/nft/mintNFT",
        {
          ownerId: walletAddress,
          nftName,
        },
        {
          withCredentials: true,
        }
      );
      setIsLoading(false);
      toast({
        title: "Minting Successful",
        description: `100 tons of carbon credits have been minted as NFTs.`,
      });
    } catch (error) {
      console.error("Error minting NFTs:", error);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Minting Failed",
        description: "An error occurred while minting NFTs.",
      });
      return;
    }

    setMintingOpen(false);
    setVerificationOpen(false);
    setNftName("");
    setCertificate(null);
    setNftImage(null);
  };

  return (
    <>
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="border-b bg-muted/50 space-y-1 p-6">
          <CardTitle className="text-xl font-semibold">
            Project Verification
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Get verified as a green project
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Complete verification to access additional features and build trust
            with buyers.
          </p>
          <Button
            variant="default"
            className="w-full group"
            onClick={() => setVerificationOpen(true)}
          >
            Start Verification
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>

      <Dialog open={verificationOpen} onOpenChange={setVerificationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Certificate & NFT Image</DialogTitle>
            <DialogDescription>
              Please upload your certificate and NFT image (JPG/PNG, max 1MB)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="">
                <Label htmlFor="certificate">Certificate Image</Label>
                <p className="text-sm text-muted-foreground">
                  The certificate should include detailed organizational
                  information and verified emission reduction metrics. For
                  reference, please{" "}
                  <a href="https://i.ibb.co/7yT8054/cert.jpg" target="_blank">
                    <span className="underline text-blue-700">CLICK HERE</span>
                  </a>{" "}
                  view our sample certificate.
                </p>
              </div>
              <label
                htmlFor="certificate"
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  {certificate
                    ? certificate.name
                    : "Click to upload or drag and drop"}
                </p>
                <input
                  id="certificate"
                  type="file"
                  className="hidden"
                  accept=".jpeg,.png"
                  onChange={(e) => handleFileChange(e, "certificate")}
                />
              </label>

              <div className="">
                <Label htmlFor="nftImage">NFT Image</Label>
                <p className="text-sm text-muted-foreground">
                  Please upload an image that represents your project, this
                  image will be visible on the NFT
                </p>
              </div>
              <label
                htmlFor="nftImage"
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  {nftImage
                    ? nftImage.name
                    : "Click to upload or drag and drop"}
                </p>
                <input
                  id="nftImage"
                  type="file"
                  className="hidden"
                  accept=".jpeg,.png"
                  onChange={(e) => handleFileChange(e, "nftImage")}
                />
              </label>

              <Label htmlFor="nftName">NFT Name</Label>
              <Input
                id="nftName"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                placeholder="Enter NFT name"
              />

              <Button
                onClick={handleVerification}
                disabled={isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify and Mint"
                )}
              </Button>

              {isVerifying && (
                <div className="w-full space-y-2">
                  <Progress value={66} />
                  <p className="text-sm text-center text-muted-foreground">
                    Verifying certificate and image...
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mintingOpen} onOpenChange={setMintingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mint Carbon Credit NFTs</DialogTitle>
            <DialogDescription>
              Verification Successfully Completed. Click the mint button to mint
              NFTs to your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={handleMinting} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Mint NFTs
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
