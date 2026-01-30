"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useConnection, useReadContract } from 'wagmi'
import { Search, TrendingUp, Filter, RefreshCw, Ticket, AlertCircle, Loader2 } from "lucide-react"
import { ChainId, ticketNftAbi, getContractAddresses } from "@/lib/addressAndAbi"
import { Address } from "viem"
import { ResaleTicketCard } from "@/components/resale-ticket-card"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "react-toastify"
import { useResaleMarketGetters } from "@/hooks/useResaleMarket"

// interface TicketData {
//   id: number
//   creator: string
//   price: bigint
//   eventName: string
//   description: string
//   eventTimestamp: bigint
//   location: string
//   closed: boolean
//   canceled: boolean
//   metadata: string
//   maxSupply: bigint
//   sold: bigint
//   totalCollected: bigint
//   totalRefunded: bigint
//   proceedsWithdrawn: boolean
// }

interface ResaleTicket {
  tokenId: bigint
  ticketId: bigint
  seller: Address
  price: bigint
  active: boolean
  eventName: string
  eventDate: string
  location: string
  image: string
  originalPrice: bigint
}

export default function ResaleMarketPage() {
  const { address, isConnected, chain } = useConnection()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [listings, setListings] = useState<ResaleTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const chainId = chain?.id || ChainId.BASE || ChainId.CELO
  const { 
    // eventTicketing,
    ticketNft,
  } = getContractAddresses(chainId)
  
  const { useTicketNft, useEventTicketing } = useResaleMarketGetters()
  
  // Get contract addresses from resale market
  const {
    // data: ticketNftAddress,
  } = useTicketNft()
  const {
    // data: eventTicketingAddress,
  } = useEventTicketing()

  // Check if user is on the correct network
  const isCorrectNetwork = chainId === ChainId.BASE || chainId === ChainId.CELO

  // Get total supply of NFTs to iterate through
  const { data: totalSupply } = useReadContract({
    address: ticketNft as Address,
    abi: ticketNftAbi,
    functionName: 'totalSupply',
    chainId,
  })

  // Fetch all active listings
  const fetchListings = useCallback(async () => {
    if (!totalSupply) return

    setRefreshing(true)
    const activeListings: ResaleTicket[] = []

    try {
      // Iterate through all possible token IDs
      const total = Number(totalSupply)
      
      for (let tokenId = 0; tokenId < total; tokenId++) {
        try {
          // Get listing data for this token ID
          const listingData = await fetch(`/api/resale-listing/${tokenId}`)
          
          if (listingData.ok) {
            const listing = await listingData.json()
            
            if (listing.active) {
              // Get ticket data
              const ticketData = await fetch(`/api/ticket/${listing.ticketId}`)
              
              if (ticketData.ok) {
                const ticket = await ticketData.json()
                
                activeListings.push({
                  tokenId: BigInt(tokenId),
                  ticketId: listing.ticketId,
                  seller: listing.seller,
                  price: listing.price,
                  active: listing.active,
                  eventName: ticket.eventName,
                  eventDate: new Date(Number(ticket.eventTimestamp) * 1000).toLocaleDateString(),
                  location: ticket.location,
                  image: ticket.metadata || "/placeholder-event.jpg",
                  originalPrice: ticket.price,
                })
              }
            }
          }
        } catch {
          // Skip this token ID if there's an error
          console.log(`No listing for token ${tokenId}`)
        }
      }

      setListings(activeListings)
    } catch (error) {
      console.error("Error fetching listings:", error)
      toast.error("Failed to load resale listings")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [totalSupply])

  // Initial load
  useEffect(() => {
    if (totalSupply !== undefined) {
      fetchListings()
    }
  }, [totalSupply, fetchListings])

  // Filter and sort listings
  const filteredListings = listings
    .filter(listing => {
      if (!searchTerm) return true
      const search = searchTerm.toLowerCase()
      return (
        listing.eventName.toLowerCase().includes(search) ||
        listing.location.toLowerCase().includes(search) ||
        listing.seller.toLowerCase().includes(search)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Number(a.price) - Number(b.price)
        case "price-high":
          return Number(b.price) - Number(a.price)
        case "newest":
        default:
          return Number(b.tokenId) - Number(a.tokenId)
      }
    })

  const handleRefresh = () => {
    fetchListings()
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto bg-slate-800/50 border-purple-500/20">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Wallet Not Connected</h2>
              <p className="text-slate-400 mb-4">
                Please connect your wallet to view the resale market
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto bg-slate-800/50 border-red-500/20">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Wrong Network</h2>
              <p className="text-slate-400 mb-4">
                Please switch to Celo Sepolia or Base Sepolia testnet
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ticket Resale Market
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Buy and sell event tickets securely on the blockchain
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search by event, location, or seller..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* Sort */}
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>

                    {/* Refresh Button */}
                    <Button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <Ticket className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{listings.length}</div>
                <div className="text-sm text-slate-400">Active Listings</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {listings.filter(l => l.seller.toLowerCase() === address?.toLowerCase()).length}
                </div>
                <div className="text-sm text-slate-400">Your Listings</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <Filter className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{filteredListings.length}</div>
                <div className="text-sm text-slate-400">Filtered Results</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
              <p className="text-slate-400">Loading resale listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <Card className="max-w-md mx-auto bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-8 text-center">
                <Ticket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Listings Found</h3>
                <p className="text-slate-400">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "There are currently no tickets listed for resale"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <ResaleTicketCard
                  key={listing.tokenId.toString()}
                  ticket={listing}
                  onPurchaseSuccess={handleRefresh}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
