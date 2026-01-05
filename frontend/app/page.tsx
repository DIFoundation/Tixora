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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVisible(true)
  }, [])

  if (isConnected) {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0f172b] text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-linear-to-br from-[#0f172b] via-[#1c398e]/20 to-[#0f172b]" />

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#51a2ff]/10 rounded-full animate-float blur-sm" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-[#1c398e]/20 rounded-full animate-float animate-delay-200 blur-sm" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-[#51a2ff]/15 rounded-full animate-float animate-delay-400 blur-sm" />
        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-[#1c398e]/20 rounded-full animate-float animate-delay-600 blur-sm" />
        <div className="absolute bottom-40 right-10 w-14 h-14 bg-[#51a2ff]/10 rounded-full animate-float animate-delay-800 blur-sm" />

        <div className="container mx-auto text-center relative z-10 px-4 md:px-8 lg:px-24">
          <div className="max-w-5xl mx-auto">
            <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
                The Future of{' '}
                <span className="text-[#51a2ff]">
                  Event Ticketing
                </span>
              </h1>
            </div>

            <div className={`transition-all duration-1000 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <p className="text-lg text-[#a1a1a1] mb-10 max-w-3xl mx-auto leading-relaxed">
                Secure, transparent, and fraud-proof NFT tickets on the blockchain. Own your tickets, trade freely, and
                never worry about counterfeits again.
              </p>
            </div>

            <div className={`transition-all duration-1000 delay-400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 bg-linear-to-r from-[#51a2ff] to-[#1c398e] hover:from-[#3a8cff] hover:to-[#1c398e] text-white rounded-xl hover:shadow-lg hover:shadow-[#51a2ff]/20 transition-all duration-300"
                  onClick={() => scrollToSection("how-it-works")}
                >
                  <span className="text-lg">Get Started</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 border-[#1c398e] text-[#a1a1a1] hover:bg-[#1c398e]/20 hover:text-white rounded-xl transition-colors"
                  onClick={() => scrollToSection("featured-events")}
                >
                  <span className="text-lg">Explore Events</span>
                </Button>
              </div>
            </div>
          </div>

        </div>
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <ChevronDown
            className="h-8 w-8 text-[#a1a1a1] cursor-pointer hover:text-[#51a2ff] transition-colors animate-bounce"
            onClick={() => scrollToSection("featured-events")}
          />
        </div>
      </section>

      {/* Feature Events Section */}
      <section id="featured-events" className="py-16 px-4 bg-[#0f172b]">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Events</h2>
            <div className="w-20 h-1 bg-linear-to-r from-[#51a2ff] to-[#1c398e] mx-auto rounded-full"></div>
          </div>
          <FeatureEvents />
        </div>
      </section>

      {/* Work & Benefits Section */}
      <section id="how-it-works" className="py-16 px-4 bg-[#0f172b] border-t border-[#1c398e]/30">
        <WorkAndBenefits />
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#1c398e]/30 bg-[#0f172b]">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <Image src="/tixora-logo.png" alt="Tixora" width={40} height={40} className="rounded-lg" />
                <span className="text-2xl font-bold text-[#51a2ff]">
                  Tixora
                </span>
              </div>
              <p className="text-[#a1a1a1] max-w-md leading-relaxed">
                The future of event ticketing is here. Secure, transparent, and decentralized.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="https://github.com/DIFoundation/Tixora/blob/main/README.md"
                target="_blank"
                className="text-[#a1a1a1] hover:text-[#51a2ff] transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/resources"
                className="text-[#a1a1a1] hover:text-[#51a2ff] transition-colors"
              >
                Resources
              </Link>
              <Link
                href="#"
                className="text-[#a1a1a1] hover:text-[#51a2ff] transition-colors"
              >
                Support
              </Link>
              <Link
                href="#"
                className="text-[#a1a1a1] hover:text-[#51a2ff] transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1c398e]/30 text-center">
            <p className="text-xs text-[#a1a1a1]">
              &copy; {new Date().getFullYear()} Tixora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
