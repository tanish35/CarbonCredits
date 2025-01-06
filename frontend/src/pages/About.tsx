import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Zap, Globe, BarChart } from 'lucide-react'

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold mb-6 text-center"
        {...fadeIn}
      >
        About Us
      </motion.h1>

      <motion.section className="mb-12" {...fadeIn}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-lg mb-4">
              Welcome to our innovative Web3 platform, where technology meets sustainability! At the heart of our mission is a groundbreaking approach to combating climate change by leveraging blockchain technology. We are transforming the way carbon credits are managed, traded, and utilized by NFTizing carbon footprints—bringing transparency, security, and efficiency to an otherwise complex process.
            </p>
          </CardContent>
        </Card>
      </motion.section>

      <motion.h2 
        className="text-3xl font-semibold mb-6"
        {...fadeIn}
      >
        What We Do
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-500" />
                NFTizing Carbon Footprints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>We tokenize verified carbon credits as NFTs, creating a unique, traceable, and immutable record of carbon offsets. This ensures every credit can be easily tracked and traded, empowering individuals and organizations to participate in sustainable practices with confidence.</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-6 w-6 text-blue-500" />
                Decentralized Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Our platform serves as a dynamic marketplace for buying and selling carbon credits. Whether you're an eco-conscious individual or a business aiming for net-zero emissions, you can seamlessly trade verified credits in a secure and decentralized environment.</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-500" />
                Automated Smart Contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>By integrating Chainlink automation, we have streamlined the management of smart contracts. This ensures the seamless execution of transactions, accurate distribution of assets, and reduced manual intervention, making sustainability efforts more efficient and reliable.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.h2 
        className="text-3xl font-semibold mb-6"
        {...fadeIn}
      >
        Why Choose Us?
      </motion.h2>

      <motion.ul className="list-disc pl-6 mb-12 space-y-2" {...fadeIn}>
        <li><strong>Transparency and Trust:</strong> With blockchain technology, all transactions and credit verifications are fully transparent and immutable, building trust in every step of the process.</li>
        <li><strong>Empowering Sustainability:</strong> We provide tools for individuals, businesses, and governments to actively contribute to a sustainable future.</li>
        <li><strong>Cutting-Edge Technology:</strong> By combining NFTs, smart contracts, and Chainlink automation, we redefine how carbon credits are managed and traded.</li>
        <li><strong>Global Impact:</strong> Our vision is to create a decentralized ecosystem that accelerates the world's transition to a greener, more sustainable economy.</li>
      </motion.ul>

      <motion.section className="mb-12" {...fadeIn}>
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
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Badge variant="outline" className="text-lg py-2 px-4">
          Welcome to the future of sustainability—powered by Web3!
        </Badge>
      </motion.div>
    </div>
  )
}
