import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Upload, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export function VerifyProject() {
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [mintingOpen, setMintingOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [carbonTons, setCarbonTons] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      if (selectedFile.size > 1048576) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file smaller than 1MB",
        });
        return;
      }

      if (selectedFile.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF file",
        });
        return;
      }

      setFile(selectedFile);
      // setVerificationResult({ status: null, message: "" });
    }
  };

  // Handle the "Verify Certificate" button click
  const handleVerification = () => {
    setIsVerifying(true);

    // Simulate the verification process with a delay
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationOpen(false);  // Close verification dialog
      setMintingOpen(true);  // Open minting dialog
    }, 2000);  // Simulate a 2-second verification delay
  };

  const handleMinting = () => {
    if (!carbonTons || isNaN(Number(carbonTons)) || Number(carbonTons) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please enter a valid number of carbon tons to mint.",
      });
      return;
    }
    
    toast({
      title: "Minting Successful",
      description: `${carbonTons} tons of carbon credits have been minted as NFTs.`,
    });

    setMintingOpen(false);
    setVerificationOpen(false);
    setCarbonTons("");
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/50 space-y-1">
          <CardTitle className="text-lg font-medium">Project Verification</CardTitle>
          <p className="text-sm text-muted-foreground">Get verified as a green project</p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Complete verification to get minting access
          </p>
          <Button className="w-full group" onClick={() => setVerificationOpen(true)}>
            Start Verification
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>

      <Dialog open={verificationOpen} onOpenChange={setVerificationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Government Certificate</DialogTitle>
            <DialogDescription>
              Please upload your government-verified certificate (PDF, max 1MB)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <label
                htmlFor="certificate"
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <input
                  id="certificate"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>

              {/* Loader button */}
              <Button onClick={handleVerification} disabled={isVerifying} className="w-full">
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Certificate"
                )}
              </Button>

              {isVerifying && (
                <div className="w-full space-y-2">
                  <Progress value={66} />
                  <p className="text-sm text-center text-muted-foreground">Analyzing certificate...</p>
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
              Enter the amount of carbon credits (in tons) you want to mint as NFTs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="carbon-tons">Tons of Carbon Credits</Label>
              <Input
                id="carbon-tons"
                type="number"
                placeholder="Enter amount in tons"
                value={carbonTons}
                onChange={(e) => setCarbonTons(e.target.value)}
              />
            </div>
            <Button onClick={handleMinting} className="w-full">
              Mint NFTs
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
