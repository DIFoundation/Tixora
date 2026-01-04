'use client'
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useEffect, useState } from "react"
import FeatureEvents from "../components/FeatureEvents"
import Link from "next/link"
import Image from "next/image"
import { WorkAndBenefits } from "@/components/WorkAndBenefits"
import { useRouter } from "next/navigation"
import { useConnection } from "wagmi"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter();
  const { isConnected } = useConnection();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setIsVisible(true)
  }, [])

  if (isConnected) {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172b] via-[#1c398e] to-[#0f172b] text-foreground overflow-hidden">
      <section className="py-20 px-4 relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172b]/30 via-[#1c398e]/20 to-[#0f172b]/30 animate-gradient" />

        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#51a2ff]/10 rounded-full animate-float blur-sm" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-[#1c398e]/20 rounded-full animate-float animate-delay-200 blur-sm" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-[#51a2ff]/15 rounded-full animate-float animate-delay-400 blur-sm" />
        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-[#1c398e]/20 rounded-full animate-float animate-delay-600 blur-sm" />
        <div className="absolute bottom-40 right-10 w-14 h-14 bg-[#51a2ff]/10 rounded-full animate-float animate-delay-800 blur-sm" />

        <div className="container mx-auto text-center relative z-10 px-10 md:px-20 lg:px-24">
          <div className="max-w-5xl mx-auto">
            <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-8 leading-tight text-white">
                The Future of{' '} <br className="mb-5" />
                <span className="text-3xl md:text-4xl lg:text-6xl bg-gradient-to-r from-[#51a2ff] to-[#1c398e] bg-clip-text text-transparent">
                  Event Ticketing
                </span>
              </h1>
            </div>

            <div className={`transition-all duration-1000 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <p className="text-base md:text-lg lg:text-xl text-[#a1a1a1] mb-10 max-w-4xl mx-auto leading-relaxed">
                Secure, transparent, and fraud-proof NFT tickets on the blockchain. Own your tickets, trade freely, and
                never worry about counterfeits again.
              </p>
            </div>

            <div className={`transition-all duration-1000 delay-400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto min-w-[300px] text-lg px-8 py-4 bg-[#51a2ff] hover:bg-[#3a8cff] text-white h-14 rounded-full border-2 border-[#51a2ff] hover:border-[#3a8cff] hover:scale-105 transition-all duration-300"
                  onClick={() => scrollToSection("how-it-works")}
                >
                  Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown
              className="h-8 w-8 text-[#a1a1a1] cursor-pointer hover:text-white transition-colors"
              onClick={() => scrollToSection("featured-events")}
            />
          </div>
        </div>
      </section>

      <FeatureEvents />

      <WorkAndBenefits />

      <footer className="py-4 px-4 border-t border-[#1c398e] bg-[#0f172b]/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between text-center mb-2">
            <div>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Image src="/tixora-logo.png" alt="Tixora" width={40} height={40} className="rounded-lg" />
                <span className="text-2xl font-bold bg-gradient-to-r from-[#51a2ff] to-[#1c398e] bg-clip-text text-transparent">
                  Tixora
                </span>
              </div>
              <p className="text-[#a1a1a1] mb-4 max-w-lg mx-auto leading-relaxed">
                The future of event ticketing is here. Secure, transparent, and decentralized.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-[#a1a1a1]">
              <Link href="https://github.com/DIFoundation/Tixora/blob/main/README.md" target="_blank" className="hover:text-[#51a2ff] transition-colors hover:underline">
                Documentation
              </Link>
              <Link href="/resources" className="hover:text-[#51a2ff] transition-colors hover:underline">
                Resources
              </Link>
              <Link href="#" className="hover:text-[#51a2ff] transition-colors hover:underline">
                Support
              </Link>
              <Link href="#" className="hover:text-[#51a2ff] transition-colors hover:underline">
                Privacy
              </Link>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-[#1c398e]">
            <p className="text-xs text-[#a1a1a1]">
              &copy; {new Date().getFullYear()} Tixora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
