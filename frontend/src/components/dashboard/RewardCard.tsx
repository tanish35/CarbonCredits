import { motion } from "framer-motion";
import { Award, Gift, Leaf, Droplets, Wind, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Reward {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const rewards: Reward[] = [
  {
    id: "1",
    name: "Green Pioneer",
    description:
      "Achieved significant reduction in carbon footprint. This award recognizes individuals or organizations that have made substantial efforts to minimize their carbon emissions through innovative practices and technologies.",
    icon: <Leaf className="h-6 w-6" />,
  },
  {
    id: "2",
    name: "Water Saver",
    description:
      "Successfully implemented water conservation measures. This award honors those who have effectively reduced water usage and promoted sustainable water management practices.",
    icon: <Droplets className="h-6 w-6" />,
  },
  {
    id: "3",
    name: "Energy Expert",
    description:
      "Demonstrated excellence in energy efficiency. This award is given to those who have excelled in optimizing energy use and integrating renewable energy sources.",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: "4",
    name: "Air Champion",
    description:
      "Contributed to improving air quality standards. This award acknowledges efforts in reducing air pollution and enhancing air quality through various initiatives.",
    icon: <Wind className="h-6 w-6" />,
  },
];

export function RewardCard() {
  const companyName = "EcoTech Solutions";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="w-full max-w-3xl mx-auto backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold flex items-center gap-3 text-primary">
                <Award className="h-7 w-7 text-primary" />
                <span className="tracking-tight">
                  {companyName}'s Achievements
                </span>
              </CardTitle>
              <div className="flex flex-col items-center gap-3 relative">
                <Badge variant="outline" className="px-3 py-1">
                  Eco-Champion
                </Badge>
                <div className="relative group">
                  <Button variant="outline" size="sm" className="p-4">
                    <Gift className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                  <div
                    className="absolute bottom-full mb-2 hidden w-max px-3 py-2 rounded-lg bg-gray-800 text-white text-sm shadow-lg group-hover:block"
                    role="tooltip"
                  >
                    We don't support it currently
                  </div>
                </div>
              </div>
            </div>
            <CardDescription className="text-muted-foreground text-base">
              Celebrating environmental excellence and sustainability
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="1" className="space-y-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-center h-20 px-4">
              {rewards.map((reward) => (
                <TabsTrigger
                  key={reward.id}
                  value={reward.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 text-xs"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 py-2"
                  >
                    {reward.icon}
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
                  className="p-6 rounded-lg border"
                >
                  <h4 className="text-xl font-semibold text-primary mb-3 flex items-center gap-3">
                    {reward.icon}
                    {reward.name}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {reward.description}
                  </p>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
