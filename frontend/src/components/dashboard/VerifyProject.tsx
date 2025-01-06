import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export function VerifyProject() {
  return (
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
      <Button variant="default" className="w-full group">
        Start Verification
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
      </CardContent>
    </Card>
  );
}
