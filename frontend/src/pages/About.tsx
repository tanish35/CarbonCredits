import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Zap, Globe, BarChart } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-grid-pattern relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background pointer-events-none" />
        
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="relative space-y-12 md:space-y-16"
        >
          <motion.h1 
            variants={fadeIn}
            className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >
            About Us
          </motion.h1>

          <motion.section variants={fadeIn}>
            <Card className="transform transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <p className="text-lg mb-4">
                  Welcome to our innovative Web3 platform, where technology meets sustainability! At the heart of our mission is a groundbreaking approach to combating climate change by leveraging blockchain technology. We are transforming the way carbon credits are managed, traded, and utilized by NFTizing carbon footprints—bringing transparency, security, and efficiency to an otherwise complex process.
                </p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.h2 
            variants={fadeIn}
            className="text-2xl sm:text-3xl font-semibold text-center"
          >
            What We Do
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: <Leaf className="h-6 w-6 text-green-500" />,
                title: "NFTizing Carbon Footprints",
                content: "We tokenize verified carbon credits as NFTs, creating a unique, traceable, and immutable record of carbon offsets."
              },
              {
                icon: <BarChart className="h-6 w-6 text-blue-500" />,
                title: "Decentralized Marketplace",
                content: "Our platform serves as a dynamic marketplace for buying and selling carbon credits."
              },
              {
                icon: <Zap className="h-6 w-6 text-yellow-500" />,
                title: "Automated Smart Contracts",
                content: "By integrating Chainlink automation, we have streamlined the management of smart contracts."
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={fadeIn}
                whileHover={{ scale: 1.03 }}
                className="h-full"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {item.icon}
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{item.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.h2 
            variants={fadeIn}
            className="text-3xl font-semibold mb-6"
          >
            Why Choose Us?
          </motion.h2>
           
          <motion.ul 
            variants={fadeIn}
            className="list-disc pl-6 mb-12 space-y-2"
          >
            <li><strong>Transparency and Trust:</strong> With blockchain technology, all transactions and credit verifications are fully transparent and immutable, building trust in every step of the process.</li>
            <li><strong>Empowering Sustainability:</strong> We provide tools for individuals, businesses, and governments to actively contribute to a sustainable future.</li>
            <li><strong>Cutting-Edge Technology:</strong> By combining NFTs, smart contracts, and Chainlink automation, we redefine how carbon credits are managed and traded.</li>
            <li><strong>Global Impact:</strong> Our vision is to create a decentralized ecosystem that accelerates the world's transition to a greener, more sustainable economy.</li>
          </motion.ul>

          <motion.section variants={fadeIn} className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">We aim to bridge the gap between climate action and emerging technologies by creating a decentralized platform where sustainability becomes a shared responsibility. By empowering users to take control of their carbon footprints and actively participate in reducing emissions, we envision a future where every action contributes to a healthier planet.</p>
                <p>Join us in making sustainability not just a goal but a way of life. Together, we can revolutionize the carbon credit market and leave a lasting, positive impact on the world.</p>
              </CardContent>
            </Card>
          </motion.section>

          <motion.div 
            variants={fadeIn}
            className="text-center space-y-8"
          >
            <Badge variant="outline" className="text-base sm:text-lg py-2 px-4 animate-pulse">
              Welcome to the future of sustainability—powered by Web3!
            </Badge>

            <div className="pt-8">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 transform transition-all duration-300 hover:scale-105"
              >
                Join Our Mission
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
  )
}
