"use client"

import { DollarSign, Percent, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChainId } from "@/lib/addressAndAbi"
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
  const symbol = chain?.name === 'BASE' ? 'ETH' : 'CELO'

  return (
    <div className={cn("space-y-8", className)}>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Pricing Breakdown</h2>
        <p className="text-muted-foreground">Review the financial details of your event</p>
      </div>

      <div className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Ticket Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price per ticket</span>
                  <span className="font-medium">{price.toFixed(2)} {chain?.name}</span>
                </div>
              </div>
              <div className="bg-background p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Number of tickets</span>
                  <span className="font-medium">{totalSupply}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Revenue Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Total Revenue</span>
                </div>
                <span className="font-medium">{totalRevenue.toFixed(2)} CELO</span>
              </div>
              
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  <span>Platform Fee ({PLATFORM_FEE_PERCENTAGE}%)</span>
                </div>
                <span>-{platformFee.toFixed(2)} CELO</span>
              </div>
              
              <div className="h-px bg-border my-2" />
              
              <div className="flex items-center justify-between text-green-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Your Earnings</span>
                </div>
                <span>{organizerEarnings.toFixed(2)} CELO</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            The platform fee of {PLATFORM_FEE_PERCENTAGE}% covers payment processing, security, and platform maintenance.
            The remaining amount goes directly to you as the event organizer.
          </p>
        </div>
      </div>
    </div>
  )
}
