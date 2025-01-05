import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Edit2, Phone, MapPin } from "lucide-react";

interface UserProps {
  user: {
    id: string;
    email: string;
    password: string;
    name?: string;
    address?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function UserDetails({ user }: UserProps) {
  const name = user.name || "Not provided";
  const email = user.email || "Not provided";
  const phone = user.phone || "Not provided";
  const address = user.address || "Not provided";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/50 space-y-1">
        <CardTitle className="text-lg font-medium">User Details</CardTitle>
        <p className="text-sm text-muted-foreground">Your personal information</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Address</p>
              <p className="text-sm text-muted-foreground">{address}</p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
}
