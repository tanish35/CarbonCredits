import { motion } from "framer-motion";
import {
  Award,
  Trophy,
  Upload,
  Loader2,
  Leaf,
  Droplets,
  Wind,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { User } from "@/lib/interface";

interface Reward {
  id: string;
  name: string;
  description: string;
  progress: number;
  level: number;
  points: number;
  icon: JSX.Element;
  dateAchieved?: string;
}

interface Achievement {
  id: string;
  createdAt: string;
  description: string;
  points: number;
  type: string;
  userId: string;
}

const RewardContent = ({ reward }: { reward: Reward }) => (
  <TabsContent value={reward.name}>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="p-6 rounded-lg border bg-gradient-to-br from-background/80 to-muted/50 
        backdrop-blur-sm shadow-lg hover:shadow-primary/20 transition-all duration-300 
        space-y-4 hover:border-primary/50"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">{reward.icon}</div>
          <div className="flex flex-col">
            <span
              className="font-semibold text-lg
              bg-clip-text  text-black dark:text-white"
            >
              {reward.name}
            </span>
            <span className="text-xs  text-black dark:text-white">
              Level {reward.level}
            </span>
          </div>
        </div>
        <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
          <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
          {reward.points} pts
        </Badge>
      </div>
      <p className=" text-sm leading-relaxed font-medium  text-black dark:text-white">
        {reward.description}
      </p>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{reward.progress}%</span>
        </div>
        <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${reward.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-primary/80 
              shadow-[0_0_10px] shadow-primary/30"
          />
        </div>
      </div>
      {reward.dateAchieved && (
        <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
          Achieved: {new Date(reward.dateAchieved).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  </TabsContent>
);

export function RewardCard({ user }: { user: User }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [greenPioneer, setGreenPioneer] = useState<Achievement[]>([]);
  const [waterWarrior, setWaterWarrior] = useState<Achievement[]>([]);
  const [energyExpert, setEnergyExpert] = useState<Achievement[]>([]);
  const [airAdvocate, setAirAdvocate] = useState<Achievement[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const getAchievements = async () => {
      try {
        const response = await api.get("/user/achievements");
        // setAchievements(response.data);

        // Categorize achievements
        setGreenPioneer(
          response.data.filter((a: Achievement) => a.type === "Green_Pioneer")
        );
        setWaterWarrior(
          response.data.filter((a: Achievement) => a.type === "Water_Warrior")
        );
        setEnergyExpert(
          response.data.filter((a: Achievement) => a.type === "Energy_Expert")
        );
        setAirAdvocate(
          response.data.filter((a: Achievement) => a.type === "Air_Advocate")
        );
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get achievements",
        });
      }
    };
    getAchievements();
  }, []);

  const calculateProgress = (achievements: Achievement[]) => {
    // Example: Each achievement contributes 25% progress, max 100%
    return Math.min(achievements.length * 25, 100);
  };

  const calculatePoints = (achievements: Achievement[]) => {
    return achievements.reduce(
      (sum, achievement) => sum + achievement.points,
      0
    );
  };

  const getLatestDate = (achievements: Achievement[]) => {
    if (achievements.length === 0) return undefined;
    return achievements.reduce((latest, achievement) => {
      return new Date(achievement.createdAt) > new Date(latest)
        ? achievement.createdAt
        : latest;
    }, achievements[0].createdAt);
  };

  const getLatestDescription = (achievements: Achievement[]) => {
    if (achievements.length === 0) return undefined;
    return achievements[achievements.length - 1].description;
  };

  const updatedRewards = [
    {
      id: "1",
      name: "Green Pioneer",
      icon: <Leaf className="h-6 w-6" />,
      description:
        getLatestDescription(greenPioneer) ||
        "Achieved significant reduction in carbon footprint.",
      progress: calculateProgress(greenPioneer),
      level: Math.floor(greenPioneer.length / 3) + 1,
      points: calculatePoints(greenPioneer),
      dateAchieved: getLatestDate(greenPioneer),
    },
    {
      id: "2",
      name: "Water Warrior",
      icon: <Droplets className="h-6 w-6" />,
      description:
        getLatestDescription(waterWarrior) ||
        "Successfully implemented water conservation measures.",
      progress: calculateProgress(waterWarrior),
      level: Math.floor(waterWarrior.length / 3) + 1,
      points: calculatePoints(waterWarrior),
      dateAchieved: getLatestDate(waterWarrior),
    },
    {
      id: "3",
      name: "Energy Expert",
      icon: <Zap className="h-6 w-6" />,
      description:
        getLatestDescription(energyExpert) ||
        "Demonstrated excellence in energy efficiency.",
      progress: calculateProgress(energyExpert),
      level: Math.floor(energyExpert.length / 3) + 1,
      points: calculatePoints(energyExpert),
      dateAchieved: getLatestDate(energyExpert),
    },
    {
      id: "4",
      name: "Air Advocate",
      icon: <Wind className="h-6 w-6" />,
      description:
        getLatestDescription(airAdvocate) ||
        "Contributed to improving air quality standards.",
      progress: calculateProgress(airAdvocate),
      level: Math.floor(airAdvocate.length / 3) + 1,
      points: calculatePoints(airAdvocate),
      dateAchieved: getLatestDate(airAdvocate),
    },
  ];

  const handleSubmit = async (file: File) => {
    if (!file) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("achievement", file);

      await api.post("/emission/achievements", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast({
        title: "Success",
        description: "Achievement verified successfully",
      });
      setDialogOpen(false);

      //console.log(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Certificate Verification failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card
        className="w-full max-w-3xl mx-auto overflow-hidden
        bg-gradient-to-br from-background via-background/95 to-muted/50
        backdrop-blur-sm border-primary/20 shadow-lg"
      >
        <CardHeader className="border-b bg-muted/50 space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-medium flex flex-col gap-1">
              <span
                className="tracking-tight bg-gradient-to-r from-primary to-primary/80 
                bg-clip-text "
              >
                {user.name}'s Achievements
              </span>
              <span className="text-sm text-muted-foreground">
                Celebrating sustainable development
              </span>
            </CardTitle>
            <Badge
              variant="outline"
              className="p-2 bg-background/80 backdrop-blur-sm"
            >
              <Award className="h-5 w-5" />
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <Tabs defaultValue={updatedRewards[0].name} className="space-y-2">
            <TabsList className="grid grid-cols-4 gap-2 bg-muted/50">
              {updatedRewards.map((reward) => (
                <TabsTrigger
                  key={reward.id}
                  value={reward.name}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary 
                    data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground 
                    transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2"
                  >
                    {reward.icon}
                  </motion.div>
                </TabsTrigger>
              ))}
            </TabsList>
            {updatedRewards.map((reward) => (
              <RewardContent key={reward.id} reward={reward} />
            ))}
          </Tabs>

          <Button
            variant="default"
            className="w-full mt-6 bg-gradient-to-r from-primary to-primary/80 
              hover:from-primary/90 hover:to-primary group"
            onClick={() => setDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
            Add Achievement
          </Button>
        </CardContent>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-lg font-semibold">
                  Upload Achievement Certificate
                </Label>
                <p className="text-sm text-muted-foreground">
                  Upload your verification document in JPEG or PNG format
                </p>
              </div>
              <div
                className="border-2 border-dashed border-primary/20 rounded-lg p-6 
                hover:border-primary/40 transition-colors"
              >
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground text-center">
                    Click to upload or drag and drop
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleSubmit(file);
                      }
                    }}
                    disabled={isLoading}
                  />
                </label>
              </div>
              {isLoading && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
}
