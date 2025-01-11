'use client'

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FaLinkedin } from "react-icons/fa";

const teamMembers = [
  {
    name: "Tanish Majumdar",
    role: "Full Stack Developer",
    bio: "Expert in blockchain development and smart contracts.",
    image: "https://i.ibb.co/41C7DM8/Screenshot-2025-01-06-at-8-31-46-PM.png",
    linkedin: "https://linkedin.com/in/tanish34",
  },
  {
    name: "Akash Das",
    role: "Front-End Developer",
    bio: "Focused on intuitive front-end interfaces and seamless full-stack integration.",
    image: "https://avatars.githubusercontent.com/u/151846726?v=4",
    linkedin: "https://linkedin.com/in/dasakash26",
  },
  {
    name: "Asmit Deb",
    role: "Backend Developer",
    bio: "Specialist in database optimization and API design.",
    image: "https://avatars.githubusercontent.com/u/47671715?v=4",
    linkedin: "https://www.linkedin.com/in/asmit-deb-bba35b201/",
  },
  {
    name: "Somnath Chattaraj",
    role: "Blockchain Developer",
    bio: "Experienced in smart contracts and Web3 integration.",
    image:
      "https://avatars.githubusercontent.com/u/135858837?s=400&u=bbf94d2428e3bb79275a9a13120252d4ecf50663&v=4",
    linkedin: "https://linkedin.com/in/somanth-chattaraj",
  },
];




export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Meet Our Team
          </h2>
          <p className="text-lg text-muted-foreground">
            Our talented team of developers and blockchain enthusiasts working together to revolutionize carbon credits
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="transition-all duration-300"
            >
              <Card className="relative overflow-hidden group h-full bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="p-8 flex flex-col items-center text-center h-full relative z-10">
                  <Avatar className="w-32 h-32 mb-6 ring-4 ring-background shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={member.image} alt={member.name} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium mb-3 tracking-wide text-sm uppercase">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                    {member.bio}
                  </p>
                  <div className="mt-auto pt-4">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full"
                    >
                      <Button
                        variant="outline"
                        className="w-full bg-background hover:bg-muted border-border hover:border-muted transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        <FaLinkedin className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Connect</span>
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
