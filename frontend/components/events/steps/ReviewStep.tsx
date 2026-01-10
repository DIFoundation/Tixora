"use client"

import { Calendar, MapPin, FileText, Coins, Users, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useConnection } from "wagmi"

type ReviewData = {
  title: string
  description: string
  date: string
  time: string
  location: string
  price: string
  totalSupply: string
}

type ReviewStepProps = {
  data: ReviewData
  className?: string
}

export function ReviewStep({ data, className }: ReviewStepProps) {
  const { chain } = useConnection()
  const formatDate = (dateString: string, timeString: string) => {
    try {
      const date = new Date(`${dateString}T${timeString}`)
      return format(date, "MMMM d, yyyy 'at' h:mm a")
    } catch (e) {
      return `Date not specified ${e}`
    }
  }

  const symbol = chain?.name === 'Base' ? "ETH" : "CELO"

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-[#51a2ff]">
          Review Your Event
        </h2>
        <p className="text-[#a1a1a1]">
          Please review all the details before creating your event
        </p>
      </div>

      <div className="space-y-6">
        {/* Event Card */}
        <div className="bg-[#0f172b] rounded-xl border border-[#a1a1a1] shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Event Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#51a2ff]">{data.title}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#51a2ff]/10 text-[#51a2ff]">
                  Draft
                </span>
              </div>
              <p className="text-[#a1a1a1]">{data.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Details */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2 text-sm text-[#a1a1a1]">
                  <FileText className="h-4 w-4" />
                  Event Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-0.5 text-[#51a2ff] shrink-0" />
                    <div>
                      <p className="font-medium text-white">Date & Time</p>
                      <p className="text-sm text-[#a1a1a1]">
                        {formatDate(data.date, data.time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 text-[#51a2ff] shrink-0" />
                    <div>
                      <p className="font-medium text-white">Location</p>
                      <p className="text-sm text-[#a1a1a1]">
                        {data.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2 text-sm text-[#a1a1a1]">
                  <Coins className="h-4 w-4" />
                  Ticket Information
                </h4>
                <div className="bg-[#1c398e]/10 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#51a2ff]/10 p-1.5 rounded-md">
                        <Coins className="h-4 w-4 text-[#51a2ff]" />
                      </div>
                      <span className="text-white text-sm">Price per ticket</span>
                    </div>
                    <span className="font-medium text-white">{parseFloat(data.price).toFixed(2)} {symbol}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#51a2ff]/10 p-1.5 rounded-md">
                        <Users className="h-4 w-4 text-[#51a2ff]" />
                      </div>
                      <span className="text-white text-sm">Total Tickets</span>
                    </div>
                    <span className="font-medium text-white">{data.totalSupply} tickets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#1c398e]/10 px-6 py-3 border-t border-[#a1a1a1] flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[#a1a1a1]">
                <CheckCircle className="h-4 w-4 text-[#51a2ff]" />
                <span>All details look good</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
