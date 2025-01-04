"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Leaf, ExternalLink } from "lucide-react";

export function GreenProjectDetail() {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => setIsVerifying(false), 2000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            Solar Power Plant Project
          </h2>
          <Badge variant="secondary">Active</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          A large-scale solar power installation generating clean energy for
          over 10,000 homes.
        </p>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Project Completion</span>
            <span className="text-sm font-bold text-primary">75%</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-medium">125,000 kg CO₂ Saved</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Reputation: High
          </span>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Button onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify Project"}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            View on Explorer
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
