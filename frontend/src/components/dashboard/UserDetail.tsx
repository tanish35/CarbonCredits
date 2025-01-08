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
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
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
  const joinedDate = format(new Date(user.createdAt), "MMMM dd, yyyy");

  const {toast} = useToast();
  const navigate = useNavigate();
  const handleLogout = async() => {
    try {
      const response = await api.post("/user/signout");
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Logged out successfully",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to logout",
      });
    }
  };
  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full shadow-xl rounded-xl overflow-hidden border-0">
        <CardHeader className="border-b bg-muted/50 space-y-1 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-3xl bg-clip-text">
              User Details
            </CardTitle>
            <p className="text-sm text-muted-foreground/80 mt-2">
              View and manage your personal information
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant={"outline"}
                className="p-3 bg-background/90 backdrop-blur-sm hover:bg-background/95 transition-all duration-300"
              >
                <User2 className="h-6 w-6 text-primary" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>User Profile</TooltipContent>
          </Tooltip>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center space-x-4 p-4 rounded-xl border bg-background/50 hover:bg-muted/30 hover:border-primary/20 transition-all duration-300">
              <Tooltip>
                <TooltipTrigger>
                  <User className="h-5 w-5 text-primary" />
                </TooltipTrigger>
                <TooltipContent>User Name</TooltipContent>
              </Tooltip>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p className="text-base">{name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-xl border bg-background/50 hover:bg-muted/30 hover:border-primary/20 transition-all duration-300">
              <Tooltip>
                <TooltipTrigger>
                  <Mail className="h-5 w-5 text-primary" />
                </TooltipTrigger>
                <TooltipContent>User Email</TooltipContent>
              </Tooltip>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-base">{email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-xl border bg-background/50 hover:bg-muted/30 hover:border-primary/20 transition-all duration-300">
              <Tooltip>
                <TooltipTrigger>
                  <Phone className="h-5 w-5 text-primary" />
                </TooltipTrigger>
                <TooltipContent>User Phone</TooltipContent>
              </Tooltip>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Phone
                </p>
                <p className="text-base">{phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-xl border bg-background/50 hover:bg-muted/30 hover:border-primary/20 transition-all duration-300">
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
          <div className="flex items-center space-x-4 border-t pt-6 pb-4">
            <Calendar className="h-5 w-5 text-primary/70" />
            <p className="text-sm text-muted-foreground/80">
              Joined on {joinedDate}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size="lg"
                  className="w-80 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all duration-300"
                >
                  <Edit2 className="mr-2 h-5 w-5" />
                  Edit Profile
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Profile</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleLogout}
                  className="hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all duration-300"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
              </TooltipTrigger>
              <TooltipContent>Logout</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
