"use client"

import { Coins, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useConnection } from "wagmi"

type TicketSetup = {
  price: string
  totalSupply: string
}

type TicketSetupStepProps = {
  data: TicketSetup
  onChange: (data: Partial<TicketSetup>) => void
  errors?: Partial<Record<keyof TicketSetup, string>>
  className?: string
}

export function TicketSetupStep({ data, onChange, errors = {}, className }: TicketSetupStepProps) {
  const { chain } = useConnection()
  const handleChange = (field: keyof TicketSetup, value: string) => {
    // Remove any non-numeric characters except decimal point
    if (field === 'price') {
      value = value.replace(/[^0-9.]/g, '')
      // Ensure only one decimal point
      const decimalCount = (value.match(/\./g) || []).length
      if (decimalCount > 1) return
    } else {
      // For totalSupply, only allow whole numbers
      value = value.replace(/\D/g, '')
    }
    
    onChange({ [field]: value })
  }

  const symbol = chain?.name === "Base" ? "ETH" : "CELO"

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[#1c398e]">Ticket Information</h2>
        <p className="text-sm text-[#a1a1a1]">Set up your ticket types and pricing</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-[#ffffff]">Price per ticket ({symbol}) *</Label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
            <Input
              id="price"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className={cn("pl-10 bg-[#0f172b] text-white border-[#a1a1a1] placeholder-[#a1a1a1]", errors.price && "border-destructive")}
              value={data.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <span className="text-[#a1a1a1] text-sm">{symbol}</span>
            </div>
          </div>
          {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
          <p className="text-xs text-[#a1a1a1] mt-1">
            Price is in CELO. 1 CELO = 1.00 {symbol}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalSupply" className="text-[#ffffff]">Number of Tickets *</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
            <Input
              id="totalSupply"
              type="text"
              inputMode="numeric"
              placeholder="100"
              className={cn("pl-10 bg-[#0f172b] text-white border-[#a1a1a1] placeholder-[#a1a1a1]", errors.totalSupply && "border-destructive")}
              value={data.totalSupply}
              onChange={(e) => handleChange('totalSupply', e.target.value)}
            />
          </div>
          {errors.totalSupply && <p className="text-sm text-destructive mt-1">{errors.totalSupply}</p>}
          <p className="text-xs text-[#a1a1a1] mt-1">
            Maximum number of tickets available for this event
          </p>
        </div>
      </div>
    </div>
  )
}
