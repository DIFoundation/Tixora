"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useConnection, useReadContract } from 'wagmi'
import { 
  Search, 
  TrendingUp, 
  Clock, 
  AlertCircle 
} from "lucide-react"
import { ChainId, eventTicketingAbi, getContractAddresses } from "@/lib/addressAndAbi"
import { Address, formatEther } from "viem"
import { EventCard } from "@/components/event-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

interface TicketData {
  id: number
  creator: string
  price: bigint
  eventName: string
  description: string
  eventTimestamp: bigint
  location: string
  closed: boolean
  canceled: boolean
  metadata: string
  maxSupply: bigint
  sold: bigint
  totalCollected: bigint
  totalRefunded: bigint
  proceedsWithdrawn: boolean
}

interface MarketplaceEvent {
  id: number
  eventTitle: string
  price: string
  date: string
  location: string
  image: string
  attendees: number
  ticketsLeft: number
  status: string
  category: string
  trending: boolean
  createdAt: string
  originalPrice: bigint
}

export default function Marketplace() {
  // const router = useRouter()
  const { isConnected, chain } = useConnection()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("trending")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [events, setEvents] = useState<MarketplaceEvent[]>([])
  const [loading, setLoading] = useState(true)
  const chainId = chain?.id;

  // console.log('chain:', chain)
  
  // Get contract addresses only if chainId is available
  const contractAddresses = chainId ? getContractAddresses(chainId) : null;
  const eventTicketing = contractAddresses?.eventTicketing;
  
  // Check if user is on the correct network
  // const isCorrectNetwork = chainId === ChainId.BASE || chainId === ChainId.CELO;
  const isCorrectNetwork = chainId === 8453 || chainId === 42220;

  console.info('chainId: ', chainId)
  // Read contract data
  const { 
    // data: totalTickets, 
    error: totalTicketsError 
  } = useReadContract({
    address: eventTicketing as Address,
    abi: eventTicketingAbi,
    functionName: 'getTotalTickets',
  })

  const { data: recentTickets } = useReadContract({
    address: eventTicketing as Address,
    abi: eventTicketingAbi,
    functionName: 'getRecentTickets', 
  })

  // Handle contract errors
  useEffect(() => {
    if (totalTicketsError) {
      toast.error(`Failed to load tickets: ${totalTicketsError.message}`)
      console.error('Total tickets error:', totalTicketsError)
    }
  }, [totalTicketsError])

  // Transform blockchain data to marketplace format
  useEffect(() => {
    if (recentTickets && Array.isArray(recentTickets)) {
      const transformedEvents: MarketplaceEvent[] = recentTickets.map((ticket: TicketData) => {
        const eventDate = new Date(Number(ticket.eventTimestamp) * 1000)
        const now = new Date()
        // const isUpcoming = eventDate > now
        const isPassed = eventDate < now
        const isCanceled = ticket.canceled
        const isClosed = ticket.closed
        const ticketsLeft = Number(ticket.maxSupply - ticket.sold)
        
        let status = "upcoming"
        if (isCanceled) status = "canceled"
        else if (isClosed) status = "closed"
        else if (isPassed) status = "passed"
        else if (ticketsLeft === 0) status = "sold_out"

        // Parse metadata for additional info
        let category = "Event"
        let image = "/placeholder.svg"
        try {
          if (ticket.metadata) {
            const metadata = JSON.parse(ticket.metadata)
            category = metadata.category || "Event"
            image = metadata.image || "/placeholder.svg"
          }
        } catch (e) {
          console.log("Could not parse metadata", e)
        }

        return {
          id: Number(ticket.id),
          eventTitle: ticket.eventName,
          price: `${formatEther(ticket.price)} ${chainId === ChainId.CELO ? "CELO" : "ETH"}`,
          date: eventDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          location: ticket.location,
          image: image,
          attendees: Number(ticket.maxSupply),
          ticketsLeft: ticketsLeft,
          status: status,
          category: category,
          trending: ticket.sold > (ticket.maxSupply * BigInt(7)) / BigInt(10), // Trending if 70% sold
          createdAt: eventDate.toISOString(),
          originalPrice: ticket.price,
        }
      })

      setEvents(transformedEvents)
      setLoading(false)
    }
  }, [chainId, recentTickets])

  const getEventsByTab = () => {
    let filteredEvents = events

    switch (activeTab) {
      case "upcoming":
        filteredEvents = events.filter(event => event.status === "upcoming")
        break
      case "passed":
        filteredEvents = events.filter(event => event.status === "passed")
        break
      case "canceled":
        filteredEvents = events.filter(event => event.status === "canceled")
        break
      case "closed":
        filteredEvents = events.filter(event => event.status === "closed" || event.status === "sold_out")
        break
      default:
        filteredEvents = events.filter(event => event.status === "upcoming")
    }

    // Apply search filter
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    if (sortBy === "recent") {
      filteredEvents = [...filteredEvents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === "trending") {
      filteredEvents = [...filteredEvents].sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0))
    }

    return filteredEvents
  }

  const getTabCount = (tab: string) => {
    switch (tab) {
      case "upcoming":
        return events.filter(event => event.status === "upcoming").length
      case "passed":
        return events.filter(event => event.status === "passed").length
      case "canceled":
        return events.filter(event => event.status === "canceled").length
      case "closed":
        return events.filter(event => event.status === "closed" || event.status === "sold_out").length
      default:
        return 0
    }
  }

  const filteredEvents = getEventsByTab()

  // const renderConnectWalletPrompt = () => (
  //   <div className="text-center py-12">
  //     <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1c398e]/30 mb-4">
  //       <svg
  //         className="h-8 w-8 text-[#51a2ff]"
  //         fill="none"
  //         viewBox="0 0 24 24"
  //         stroke="currentColor"
  //       >
  //         <path
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //           strokeWidth={2}
  //           d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
  //         />
  //       </svg>
  //     </div>
  //     <h3 className="text-lg font-medium text-white">Connect your wallet</h3>
  //     <p className="mt-2 text-[#a1a1a9]">
  //       Connect your wallet to create events or purchase tickets
  //     </p>
  //     <div className="mt-6">
  //       <Button
  //         onClick={() => router.push('/')}
  //         className="bg-linear-to-r from-[#1c398e] to-[#51a2ff] hover:from-[#1c398e]/90 hover:to-[#51a2ff]/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#51a2ff]/20"
  //       >
  //         Connect Wallet
  //       </Button>
  //     </div>
  //   </div>
  // )

  return (
    <div className="min-h-screen bg-[#0f172b] text-white">
      <div className="pb-16 px-4 pt-8">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Event{" "}
              <span className="text-[#51a2ff]">Marketplace</span>
            </h1>
            <p className="text-base text-[#a1a1a9] max-w-4xl mx-auto leading-relaxed">
              Discover amazing events and secure your NFT tickets on the blockchain. 
              All transactions are verified, fraud-proof, and powered by smart contracts.
            </p>
          </div>

          {/* Network Warning */}
          {!isCorrectNetwork && (
            <div className="mb-6">
              <Card className="bg-[#1c398e]/20 border-[#1c398e]/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-[#51a2ff] shrink-0" />
                    <div>
                      <p className="text-white font-medium">
                        {!isConnected ? `Connect Wallet` : `Wrong Network`}
                      </p>
                      <p className="text-[#a1a1a9] text-sm">
                        {!isConnected 
                          ? `Connect your wallet to interact with events.` 
                          : `Please switch to Celo or Base to interact with events.`
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col xl:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 w-full">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-[#a1a1a9] w-4 h-4 group-focus-within:text-[#51a2ff] transition-colors" />
                  <Input
                    placeholder="Search events by name, location, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-sm bg-[#1c398e]/10 border-[#1c398e]/30 focus:border-[#51a2ff] focus:ring-[#51a2ff]/20 text-white placeholder-[#a1a1a9] backdrop-blur-sm rounded-lg"
                  />
                  {searchTerm && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Badge className="bg-[#1c398e] hover:bg-[#1c398e]/90 text-[#51a2ff] border-[#1c398e]/50">
                        {filteredEvents.length} {filteredEvents.length === 1 ? 'result' : 'results'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Sort Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={sortBy === "trending" ? "default" : "outline"}
                  onClick={() => setSortBy("trending")}
                  className={`h-12 px-6 transition-all duration-200 rounded-lg ${
                    sortBy === "trending"
                      ? "bg-linear-to-r from-[#1c398e] to-[#51a2ff] text-white hover:shadow-lg hover:shadow-[#51a2ff]/20"
                      : "border-[#1c398e]/50 text-[#a1a1a9] hover:border-[#51a2ff] hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </Button>
                <Button
                  variant={sortBy === "recent" ? "default" : "outline"}
                  onClick={() => setSortBy("recent")}
                  className={`h-12 px-6 transition-all duration-200 rounded-lg ${
                    sortBy === "recent"
                      ? "bg-linear-to-r from-[#1c398e] to-[#51a2ff] text-white hover:shadow-lg hover:shadow-[#51a2ff]/20"
                      : "border-[#1c398e]/50 text-[#a1a1a9] hover:border-[#51a2ff] hover:text-white"
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Recent
                </Button>
              </div>
            </div>
          </div>

          {/* Event Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#1c398e]/10 backdrop-blur-sm rounded-xl p-1 border border-[#1c398e]/30">
              <div className="flex flex-wrap gap-1">
                {[
                  { key: "upcoming", label: "Upcoming", color: "blue" },
                  { key: "passed", label: "Passed", color: "gray" },
                  { key: "canceled", label: "Canceled", color: "red" },
                  { key: "closed", label: "Closed", color: "gray" }
                ].map((tab) => {
                  const count = getTabCount(tab.key)
                  const isActive = activeTab === tab.key
                  return (
                    <Button
                      key={tab.key}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => setActiveTab(tab.key)}
                      className={`h-10 px-6 transition-all duration-200 rounded-lg ${
                        isActive
                          ? `bg-[#1c398e] text-white hover:bg-[#1c398e]/90`
                          : "text-[#a1a1a9] hover:bg-[#1c398e]/20 hover:text-white"
                      }`}
                    >
                      {tab.label}
                      {count > 0 && (
                        <Badge 
                          className={`ml-2 text-xs ${
                            isActive 
                              ? "bg-white/20 text-white" 
                              : "bg-[#1c398e]/30 text-[#a1a1a9]"
                          }`}
                        >
                          {count}
                        </Badge>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center p-12">
              <Card className="bg-[#1c398e]/10 border-[#1c398e]/30 backdrop-blur-sm max-w-md mx-auto">
                <CardContent className="p-6">
                  <div className="w-10 h-10 border-4 border-[#51a2ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-white mb-2">Loading Events</h3>
                  <p className="text-[#a1a1a9]">Fetching latest events from the blockchain...</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* No Results */}
          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-[#1c398e]/20 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-[#51a2ff]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
              <p className="text-[#a1a1a9] max-w-md mx-auto">
                {searchTerm 
                  ? `No events match your search for "${searchTerm}". Try different keywords.`
                  : `There are currently no ${activeTab} events. Check back later!`
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4 border-[#1c398e] text-[#a1a1a9] hover:bg-[#1c398e]/20 hover:border-[#51a2ff] hover:text-white"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}

          {/* Events Grid */}
          {!loading && filteredEvents.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {activeTab === "upcoming" && "Upcoming Events"}
                  {activeTab === "passed" && "Past Events"} 
                  {activeTab === "canceled" && "Canceled Events"}
                  {activeTab === "closed" && "Closed Events"}
                  {searchTerm && (
                    <span className="text-[#51a2ff] ml-2">
                      matching &quot;{searchTerm}&quot;
                    </span>
                  )}
                </h2>
                <p className="text-sm text-[#a1a1a9]">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onViewDetails={function (): void {
                      throw new Error("Function not implemented.")
                    } } onPurchase={function (): void {
                      throw new Error("Function not implemented.")
                    } }
                    // id={event.id}
                    // title={event.eventTitle}
                    // price={event.price}
                    // date={event.date}
                    // location={event.location}
                    // image={event.image}
                    // attendees={event.attendees}
                    // ticketsLeft={event.ticketsLeft}
                    // status={event.status}
                    // category={event.category}
                    // trending={event.trending}
                    // onClick={() => router.push(`/event/${event.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}