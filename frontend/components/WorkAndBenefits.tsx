import { Card } from "@/components/ui/card"
import { Ticket, Shield, Zap, RefreshCw, Star, Wallet, QrCode } from "lucide-react"
import { motion } from "framer-motion"

export function WorkAndBenefits() {
  const steps = [
    {
      icon: <Wallet className="h-6 w-6 text-white" />,
      title: "Connect Your Wallet",
      description: "Link your preferred Web3 wallet to get started with Tixora. We support all major wallets like MetaMask, Coinbase Wallet, and more.",
      gradient: "from-[#1c398e] to-[#51a2ff]"
    },
    {
      icon: <Ticket className="h-6 w-6 text-white" />,
      title: "Browse & Purchase Tickets",
      description: "Explore upcoming events and purchase NFT tickets directly on the blockchain. Each ticket is a unique digital asset that you truly own.",
      gradient: "from-[#1c398e] to-[#51a2ff]"
    },
    {
      icon: <QrCode className="h-6 w-6 text-white" />,
      title: "Attend Events",
      description: "Present your NFT ticket's QR code at the event for seamless entry. No more paper tickets or screenshots needed!",
      gradient: "from-[#1c398e] to-[#51a2ff]"
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-white" />,
      title: "Trade or Resell",
      description: "Freely transfer or resell your tickets on our marketplace. Set your price or let the market decide with our auction feature.",
      gradient: "from-[#1c398e] to-[#51a2ff]"
    }
  ]

  const benefits = [
    {
      icon: <Shield className="h-8 w-8 text-[#51a2ff]" />,
      title: "100% Secure",
      description: "Blockchain-verified authenticity eliminates all counterfeiting risks"
    },
    {
      icon: <Zap className="h-8 w-8 text-[#51a2ff]" />,
      title: "Zero Fees",
      description: "No platform fees - organizers keep 100% of ticket sales revenue"
    },
    {
      icon: <RefreshCw className="h-8 w-8 text-[#51a2ff]" />,
      title: "Free Trading",
      description: "Transfer and resell tickets freely with transparent pricing"
    },
    {
      icon: <Star className="h-8 w-8 text-[#51a2ff]" />,
      title: "Own Forever",
      description: "Keep your tickets as collectible NFTs with permanent ownership"
    }
  ]

  return (
    <div className="relative overflow-hidden py-16 px-4 bg-[#0f172b]">
      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto mb-24">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-[#1c398e]/30 text-[#51a2ff] mb-4">
              How It Works
            </span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Get Started in Minutes
          </motion.h2>
          
          <motion.p 
            className="text-lg text-[#a1a1a1] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Experience the future of event ticketing with our simple, secure, and transparent platform
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full p-6 bg-[#1c398e]/10 border-[#1c398e]/30 hover:border-[#51a2ff]/50 transition-all duration-300 group-hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center bg-linear-to-br ${step.gradient} shadow-lg`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-[#a1a1a9] text-sm leading-relaxed">
                  {step.description}
                </p>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 -mr-3 w-6 h-0.5 bg-linear-to-r from-[#1c398e]/30 to-[#51a2ff]/30 group-hover:from-[#1c398e] group-hover:to-[#51a2ff] transition-all duration-300"></div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose Tixora?
          </h2>
          <p className="text-lg text-[#a1a1a1] max-w-2xl mx-auto">
            Revolutionary features that make event ticketing better for everyone
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full p-6 bg-[#1c398e]/10 border-[#1c398e]/30 hover:border-[#51a2ff]/50 transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 rounded-xl mb-4 flex items-center justify-center bg-[#1c398e]/20">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-[#a1a1a9] text-sm">
                  {benefit.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}