import { motion } from "framer-motion";
import { Award, Gift, Leaf, Droplets, Wind, Zap, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Reward {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number; // Add progress property
  level: number;
  dateAchieved?: string;
  totalPoints: number;
}

const rewards: Reward[] = [
  {
    id: "1",
    name: "Green Pioneer",
    description:
      "Achieved significant reduction in carbon footprint. This award recognizes individuals or organizations that have made substantial efforts to minimize their carbon emissions through innovative practices and technologies.",
    icon: <Leaf className="h-6 w-6" />,
    progress: 75, // Add progress values
    level: 3,
    dateAchieved: "2023-12-01",
    totalPoints: 1250,
  },
  {
    id: "2",
    name: "Water Saver",
    description:
      "Successfully implemented water conservation measures. This award honors those who have effectively reduced water usage and promoted sustainable water management practices.",
    icon: <Droplets className="h-6 w-6" />,
    progress: 60, // Add progress values
    level: 2,
    dateAchieved: "2023-11-15",
    totalPoints: 900,
  },
  {
    id: "3",
    name: "Energy Expert",
    description:
      "Demonstrated excellence in energy efficiency. This award is given to those who have excelled in optimizing energy use and integrating renewable energy sources.",
    icon: <Zap className="h-6 w-6" />,
    progress: 85, // Add progress values
    level: 4,
    dateAchieved: "2023-10-20",
    totalPoints: 1500,
  },
  {
    id: "4",
    name: "Air Champion",
    description:
      "Contributed to improving air quality standards. This award acknowledges efforts in reducing air pollution and enhancing air quality through various initiatives.",
    icon: <Wind className="h-6 w-6" />,
    progress: 50, // Add progress values
    level: 1,
    dateAchieved: "2023-09-10",
    totalPoints: 600,
  },
];

export function RewardCard() {
  const companyName = "EcoTech Solutions";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      <Card className="w-full max-w-3xl mx-auto backdrop-blur-sm shadow-lg bg-gradient-to-br from-background to-muted/50">
        <CardHeader className="border-b bg-muted/50 space-y-1">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-medium flex  flex-col gap-1">
                <span className="tracking-tight">
                  {companyName}'s Achievements
                </span>
                <span className="text-sm text-muted-foreground">
                  Celebrating sustainable development
                </span>
              </CardTitle>
              <Badge
                variant="outline"
                className="px-3 py-1 flex-col bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Award className="h-7 w-7 text-primary" />
                <span className="font-medium">Eco-Champion</span>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="1" className="space-y-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-center h-24 px-4">
              {rewards.map((reward) => (
                <TabsTrigger
                  key={reward.id}
                  value={reward.id}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-300 text-xs relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-1"
                  >
                    {reward.icon}
                    <span className="text-[10px] font-medium">{reward.name}</span>
                  </motion.div>
                </TabsTrigger>
              ))}
            </TabsList>

            {rewards.map((reward) => (
              <TabsContent key={reward.id} value={reward.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-lg border hover:border-primary/50 transition-colors space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-xl font-semibold text-primary flex items-center gap-3">
                      {reward.icon}
                      {reward.name}
                    </h4>
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{reward.totalPoints} pts</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {reward.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{reward.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${reward.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_10px] shadow-primary/50"
                      />
                    </div>
                  </div>

                  {reward.dateAchieved && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Achieved on: {new Date(reward.dateAchieved).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>

          <motion.div
            className="relative group mt-6 flex justify-end"
            whileHover={{ scale: 1.02 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="p-4 w-full sm:w-auto hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Gift className="mr-2 h-4 w-4" />
              View All Achievements
            </Button>
            <div
              className="absolute bottom-full mb-2 hidden w-max px-3 py-2 rounded-lg bg-gray-800 text-white text-sm shadow-lg group-hover:block"
              role="tooltip"
            >
              We don't support it currently
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
