"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useConnection, useReadContract } from 'wagmi'
import { Search, TrendingUp, Clock, Calendar, Users, Sparkles, AlertCircle } from "lucide-react"
import { ChainId, eventTicketingAbi, getContractAddresses } from "@/lib/addressAndAbi"
import { Address, formatEther } from "viem"
import { EventCard } from "@/components/event-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const { isConnected, chain } = useConnection()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("trending")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [events, setEvents] = useState<MarketplaceEvent[]>([])
  const [loading, setLoading] = useState(true)
  const chainId = chain?.id;

  console.log('chain:', chain)
  
  // Get contract addresses only if chainId is available
  const contractAddresses = chainId ? getContractAddresses(chainId) : null;
  const eventTicketing = contractAddresses?.eventTicketing;
  
  // Check if user is on the correct network
  // const isCorrectNetwork = chainId === ChainId.BASE || chainId === ChainId.CELO;
  const isCorrectNetwork = chainId === 8453 || chainId === 42220;

  console.info('chainId: ', chainId)
  // Read contract data
  const { data: totalTickets, error: totalTicketsError } = useReadContract({
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

  const renderConnectWalletPrompt = () => (
    <div className="text-center py-12">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <svg
          className="h-6 w-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">Connect your wallet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Connect your wallet to create events or purchase tickets
      </p>
      <div className="mt-6">
        <Button
          onClick={() => router.push('/')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Connect Wallet
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900/10 to-slate-900 text-foreground px-20">
      <div className="pb-16 px-4 pt-8">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">
              Event{" "}
              <span className="bg-linear-to-r text-5xl from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
            <p className="text-base text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Discover amazing events and secure your NFT tickets on the blockchain. 
              All transactions are verified, fraud-proof, and powered by smart contracts.
            </p>
          </div>

          {/* Network Warning */}
          {!isCorrectNetwork && (
            <div className="mb-4">
              <Card className="bg-linear-to-r from-orange-900/30 to-red-900/30 border-orange-500/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-54w-4 text-orange-400 shrink-0" />
                    <div>
                      <p className="text-orange-200 font-medium text-base">{!isConnected ? `Connect Wallet` : `Wrong Network`}</p>
                      <p className="text-orange-300 text-xs">{!isConnected ? `Connect your wallet to interact with events.` : `Please switch to Celo or Base to interact with events.`}</p>
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
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-slate-400 w-4 h-4 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    placeholder="Search events by name, location, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-10 text-xs font-mono bg-slate-800/50 border-slate-600 focus:border-purple-400 focus:ring-purple-400/20 text-white backdrop-blur-sm"
                  />
                  {searchTerm && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Badge variant="secondary" className="text-sm font-mono bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {filteredEvents.length} results
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
                  className={`h-10 transition-all duration-200 ${
                    sortBy === "trending"
                      ? "bg-purple-600 hover:bg-purple-500 hover:shadow-lg"
                      : "border-slate-600 text-slate-300 hover:border-purple-500 hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Trending
                </Button>
                <Button
                  variant={sortBy === "recent" ? "default" : "outline"}
                  onClick={() => setSortBy("recent")}
                  className={`h-10 transition-all duration-200 ${
                    sortBy === "recent"
                      ? "bg-cyan-600 hover:bg-cyan-500 hover:shadow-lg"
                      : "border-slate-600 text-slate-300 hover:border-blue-500 hover:text-white"
                  }`}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Recent
                </Button>
              </div>
            </div>
          </div>

          {/* Event Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-2 border border-slate-600/50 shadow-xl">
              <div className="flex flex-wrap gap-1">
                {[
                  { key: "upcoming", label: "Upcoming", color: "purple" },
                  { key: "passed", label: "Passed", color: "green" },
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
                      className={`h-8 px-6 transition-all duration-200 ${
                        isActive
                          ? `bg-linear-to-r ${
                              tab.color === "purple" ? "from-purple-800 to-purple-700" :
                              tab.color === "green" ? "from-green-800 to-green-700" :
                              tab.color === "red" ? "from-red-800 to-red-700" :
                              "from-gray-800 to-gray-700"
                            } shadow-lg text-white`
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      {tab.label}
                      {count > 0 && (
                        <Badge 
                          variant="secondary" 
                          className={`ml-2 text-xs ${
                            isActive 
                              ? "bg-white/20 text-white" 
                              : "bg-slate-600/50 text-slate-300"
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
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm max-w-md mx-auto">
                <CardContent className="p-4">
                  <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-white mb-1">Loading Events</h3>
                  <p className="text-slate-300">Fetching latest events from the blockchain...</p>
                </CardContent>
              </Card>
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
                    <span className="text-purple-400 ml-2">
                      matching &quot;{searchTerm}&quot;
                    </span>
                  )}
                </h2>
                <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} onViewDetails={() => router.push(`/marketplace/${event.id}`)} onPurchase={() => {
                    if (!isConnected) {
                      toast.info('Please connect your wallet to purchase tickets');
                      return;
                    }
                    router.push(`/marketplace/${event.id}`);
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <div className="mb-8">
                <div className="w-20 h-20 rounded-full bg-linear-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">No Events Found</h3>
                <p className="text-base text-slate-400 max-w-md mx-auto">
                  {searchTerm 
                    ? `No events match your search for "${searchTerm}"`
                    : `No ${activeTab} events are currently available`
                  }
                </p>
              </div>
              
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  Clear Search
                </Button>
              )}
              
              {!searchTerm && events.length === 0 && (
                <Card className="bg-slate-800/30 border-slate-600/50 max-w-lg mx-auto mt-8">
                  <CardContent className="p-6">
                    <p className="text-slate-400 mb-4">Be the first to create an event!</p>
                    {isConnected ? (
                      <Button
                        onClick={() => router.push("/create-event")}
                        className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                      >
                        Create Event
                      </Button>
                    ) : (
                      renderConnectWalletPrompt()
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Platform Stats */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-slate-600/50 pt-8">
              <Card className="bg-slate-800/80 border-slate-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/30 transition-colors">
                    <Calendar className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {totalTickets ? Number(totalTickets) : 0}
                  </div>
                  <div className="text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">Total Events Created</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 border-slate-700 hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500/30 transition-colors">
                    <TrendingUp className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors">
                    {events.filter(e => e.status === "upcoming").length}
                  </div>
                  <div className="text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">Active Events</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/30 transition-colors">
                    <Users className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {events.reduce((sum, e) => sum + e.attendees, 0).toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">Total Capacity</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 border-slate-700 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-yellow-500/30 transition-colors">
                    <Sparkles className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                    Zero
                  </div>
                  <div className="text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">Fraud Cases</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}