'use client'

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FaLinkedin } from "react-icons/fa";


const teamMembers = [
  {
    name: "Tanish Majumdar",
    bio: "",
    image: "https://i.ibb.co/41C7DM8/Screenshot-2025-01-06-at-8-31-46-PM.png",
    linkedin: "https://linkedin.com/in/tanish34",
  },
  {
    name: "Akash Das",
    bio: "",
    image: "https://avatars.githubusercontent.com/u/151846726?v=4",
    linkedin: "https://linkedin.com/in/dasakash26",
  },
  {
    name: "Asmit Deb",
    bio: "",
    image: "https://avatars.githubusercontent.com/u/47671715?v=4",
    linkedin: "https://www.linkedin.com/in/asmit-deb-bba35b201/",
  },
  {
    name: "Somnath Chattaraj",
    bio: "",
    image: "https://avatars.githubusercontent.com/u/135858837?s=400&u=bbf94d2428e3bb79275a9a13120252d4ecf50663&v=4",
    linkedin: "https://linkedin.com/in/somanth-chattaraj",
  }
];

export default function TeamPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-center text-4xl font-bold text-gray-800 mb-12">
        Meet Our Team
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="transition-transform"
          >
            <Card className="flex flex-col items-center text-center p-6 bg-white border border-gray-200 shadow-md rounded-lg hover:shadow-xl">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={member.image} alt={member.name} />
                <AvatarFallback>
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-semibold text-gray-800 mb-1">
                {member.name}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {member.bio}
              </p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="transition-colors"
                >
                  <FaLinkedin className="h-6 w-6" />
                </Button>
              </a>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
