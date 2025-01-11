import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Edit2,
  Phone,
  MapPin,
  User2,
  Calendar,
  LogOut,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

  const joinedDate = user.createdAt
    ? format(new Date(user.createdAt), "MMMM dd, yyyy")
    : "Unknown date";

  const navigate = useNavigate();
  async function handleSignOut() {
    try {
      await axios.post("/user/signout", {}, { withCredentials: true });
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  }
  return (
    <Card className="w-full shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-muted/30 space-y-1 flex flex-row justify-between items-center p-6">
        <div>
          <CardTitle className="text-2xl font-semibold">User Details</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal information
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant={"outline"}
              className="p-2 bg-background/80 backdrop-blur-sm"
            >
              <User2 className="h-5 w-5" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>User Profile</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Tooltip>
              <TooltipTrigger>
                <User className="h-5 w-5 text-primary" />
              </TooltipTrigger>
              <TooltipContent>User Name</TooltipContent>
            </Tooltip>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-base">{name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Tooltip>
              <TooltipTrigger>
                <Mail className="h-5 w-5 text-primary" />
              </TooltipTrigger>
              <TooltipContent>User Email</TooltipContent>
            </Tooltip>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">
                {email.length > 20 ? email.slice(0, 20) + "..." : email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Tooltip>
              <TooltipTrigger>
                <Phone className="h-5 w-5 text-primary" />
              </TooltipTrigger>
              <TooltipContent>User Phone</TooltipContent>
            </Tooltip>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-base">{phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Tooltip>
              <TooltipTrigger>
                <MapPin className="h-5 w-5 text-primary" />
              </TooltipTrigger>
              <TooltipContent>User Address</TooltipContent>
            </Tooltip>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Address
              </p>
              <p className="text-base">{address}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 border-t pt-4 pb-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Joined on {joinedDate}
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate("/edit-profile")}
          className="w-full mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/80 hover:to-primary/80 transition-transform transform hover:scale-105"
        >
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
        <Button
          size="lg"
          variant="destructive"
          onClick={() => handleSignOut()}
          className="w-full mt-6 bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/80 hover:to-destructive/80 transition-transform transform hover:scale-105"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}
