"use client"

import { useConnection } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ShoppingBag, TicketIcon, Activity } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { Address, formatEther } from "viem"
import { ChainId, eventTicketingAbi, getContractAddresses } from "@/lib/addressAndAbi"
import { useReadContract } from "wagmi"
import Statistics from "@/components/Statistics"

export default function Dashboard() {
  const { address, chain } = useConnection()

  const chainId = chain?.id || ChainId.BASE;
  const { eventTicketing } = getContractAddresses(chainId)

  // Get recent tickets data
  const { data: recentTicketsData } = useReadContract({
    address: eventTicketing as Address,
    abi: eventTicketingAbi,
    functionName: 'getRecentTickets',
  })

  // Generate recent activity from tickets data
  const recentActivity = useMemo(() => {
    if (!recentTicketsData || !address) return []
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tickets = recentTicketsData as any[]

    const price = chainId === ChainId.BASE ? "BASE" : "CELO"
    
    return tickets
      .filter(ticket => ticket.creator.toLowerCase() === address.toLowerCase())
      .sort((a, b) => Number(b.eventTimestamp) - Number(a.eventTimestamp)) // Sort by timestamp in descending order
      .slice(0, 5)
      .map((ticket) => ({
        id: Number(ticket.id),
        action: ticket.canceled ? `Canceled ${ticket.eventName}` : `Created ${ticket.eventName}`,
        timestamp: Number(ticket.eventTimestamp), // Keep timestamp for reference
        time: new Date(Number(ticket.eventTimestamp) * 1000).toLocaleDateString(),
        amount: `${formatEther(ticket.price)} ${price}`,
        type: ticket.canceled ? "cancel" : "create",
        status: ticket.closed ? "Closed" : ticket.canceled ? "Canceled" : "Active",
        sold: Number(ticket.sold),
        maxSupply: Number(ticket.maxSupply)
      }))
  }, [recentTicketsData, address, chainId])

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  const quickActions = [
    {
      title: "Marketplace",
      description: "Browse and purchase event tickets",
      icon: ShoppingBag,
      href: "/marketplace",
      gradient: "from-[#1c398e] to-[#1c398e]/80",
    },
    {
      title: "My Tickets",
      description: "View and manage your NFT tickets",
      icon: TicketIcon,
      href: "/tickets",
      gradient: "from-[#1c398e] to-[#1c398e]/80",
    },
    {
      title: "Create Event",
      description: "Launch your own ticketed event",
      icon: Plus,
      href: "/create-event",
      gradient: "from-[#51a2ff] to-[#1c398e]",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f172b] text-foreground pt-12 px-4 md:px-8 lg:px-20">
      <div className="pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-10 p-6 bg-[#1c398e]/20 backdrop-blur-sm rounded-xl border border-[#1c398e]/30">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
              Welcome back,{' '}
              <span className="text-[#51a2ff]">
                {shortAddress}
              </span>
            </h1>
            <p className="text-[#a1a1a1] text-base">Manage your events and tickets on the decentralized web</p>
          </div>

          <Statistics />

          {/* Quick Action Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-white">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-3 gap-6 px-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <Card className="group cursor-pointer bg-[#1c398e]/10 border-[#1c398e]/30 overflow-hidden relative hover:border-[#51a2ff]/50 transition-all duration-300 h-full">
                      <div className={`absolute inset-0 bg-linear-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      <CardContent className="p-6 text-center relative z-10 h-full flex flex-col">
                        <div
                          className={`w-14 h-14 rounded-full bg-linear-to-br ${action.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">{action.title}</h3>
                        <p className="text-[#a1a1a1] text-sm mt-auto">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="px-2">
            <Card className="bg-[#1c398e]/10 border-[#1c398e]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <Activity className="h-6 w-6 text-[#51a2ff]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between py-4 px-6 bg-[#1c398e]/10 rounded-xl border border-[#1c398e]/30 hover:border-[#51a2ff]/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            activity.type === 'cancel' ? 'bg-red-400' : 'bg-[#51a2ff]'
                          }`} />
                          <div>
                            <p className="text-white font-medium text-md">{activity.action}</p>
                            <p className="text-[#a1a1a1] text-sm">{activity.time}</p>
                            <p className="text-[#a1a1a1]/70 text-xs">
                              {activity.sold}/{activity.maxSupply} tickets sold
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant="outline"
                            className={`px-2 py-1 text-xs ${
                              activity.status === 'Active' 
                                ? 'text-green-300 bg-green-500/10 border-green-500/50'
                                : activity.status === 'Canceled'
                                ? 'text-red-300 bg-red-500/10 border-red-500/50'
                                : 'text-[#a1a1a1] bg-[#1c398e]/20 border-[#1c398e]/50'
                            }`}
                          >
                            {activity.status}
                          </Badge>
                          <span className="text-[#51a2ff] font-mono text-xs">
                            {activity.amount}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#a1a1a1]">No recent activity. Create your first event to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}