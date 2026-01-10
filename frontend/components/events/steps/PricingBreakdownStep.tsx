"use client"

import { DollarSign, Percent, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useConnection } from "wagmi"

type PricingBreakdownData = {
  price: string
  totalSupply: string
}

type PricingBreakdownStepProps = {
  data: PricingBreakdownData
  className?: string
}

export function PricingBreakdownStep({ data, className }: PricingBreakdownStepProps) {
  const PLATFORM_FEE_PERCENTAGE = 2.5 // 2.5% platform fee
  
  const price = parseFloat(data.price) || 0
  const totalSupply = parseInt(data.totalSupply) || 0
  const totalRevenue = price * totalSupply
  const platformFee = (totalRevenue * PLATFORM_FEE_PERCENTAGE) / 100
  const organizerEarnings = totalRevenue - platformFee

  const { chain } = useConnection()
  const symbol = chain?.name === 'Base' ? 'ETH' : 'CELO'

  return (
    <div className={cn("space-y-8", className)}>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#51a2ff]">Pricing Breakdown</h2>
        <p className="text-[#a1a1a1]">Review the financial details of your event</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#0f172b] rounded-lg p-6 space-y-6 border border-[#a1a1a1]">
          <div className="space-y-4">
            <h3 className="font-medium text-white">Ticket Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1c398e]/10 p-4 rounded-lg border border-[#a1a1a1]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#a1a1a1]">Price per ticket</span>
                  <span className="font-medium text-white">{price.toFixed(2)} {symbol}</span>
                </div>
              </div>
              <div className="bg-[#1c398e]/10 p-4 rounded-lg border border-[#a1a1a1]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#a1a1a1]">Number of tickets</span>
                  <span className="font-medium text-white">{totalSupply}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-white">Revenue Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#a1a1a1]" />
                  <span className="text-white">Total Revenue</span>
                </div>
                <span className="font-medium text-white">{totalRevenue.toFixed(2)} {symbol}</span>
              </div>
              
              <div className="flex items-center justify-between text-[#a1a1a1]">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-[#a1a1a1]" />
                  <span>Platform Fee ({PLATFORM_FEE_PERCENTAGE}%)</span>
                </div>
                <span className="font-medium text-white">-{platformFee.toFixed(2)} {symbol}</span>
              </div>
              
              <div className="h-px bg-[#a1a1a1] my-2" />
              
              <div className="flex items-center justify-between text-green-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#51a2ff]" />
                  <span className="text-white">Your Earnings</span>
                </div>
                <span className="font-medium text-white">{organizerEarnings.toFixed(2)} {symbol}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1c398e]/10 p-4 rounded-lg border border-[#a1a1a1]">
            <p className="text-sm text-[#a1a1a1]">
              The platform fee of {PLATFORM_FEE_PERCENTAGE}% covers payment processing, security, and platform maintenance.
              The remaining amount goes directly to you as the event organizer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
