import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Edit2, Phone, MapPin, User2, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";

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
  const joinedDate = format(new Date(user.createdAt), 'MMMM dd, yyyy');

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-muted/30 space-y-1 flex flex-row justify-between items-center p-6">
        <div>
          <CardTitle className="text-2xl font-semibold">
            User Details
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal information
          </p>
        </div>
        <Badge variant={"outline"} className="p-2 bg-background/80 backdrop-blur-sm">
          <User2 className="h-5 w-5" />
        </Badge>
      </CardHeader>
      <CardContent className="p-6 space-y-2">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <User className="h-5 w-5 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-base">{name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Mail className="h-5 w-5 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Phone className="h-5 w-5 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-base">{phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <MapPin className="h-5 w-5 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-base">{address}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 border-t pt-2 pb-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Joined on {joinedDate}</p>
        </div>
        <Button size="lg" className="w-full mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
}
