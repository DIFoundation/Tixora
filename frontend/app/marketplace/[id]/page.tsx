"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useConnection } from "wagmi"
import { getContractAddresses, ChainId } from "@/lib/addressAndAbi"
import { formatEther, parseEther } from "viem"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Ticket, Loader2, ArrowLeft, Shield, Clock, Copy, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-toastify"
import { useEventTicketingSetters, useEventTicketingGetters  } from "@/hooks/useEventTicketing"

interface EventData {
  id: number
  creator: string
  price: string
  eventName: string
  description: string
  date: string
  location: string
  closed: boolean
  canceled: boolean
  status: 'upcoming' | 'canceled' | 'closed' | 'passed' | 'sold_out' | 'active' | 'registered'
  image: string
  maxSupply: number
  sold: number
  ticketsLeft: number
  eventTimestamp?: number
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected, address, chainId, chain } = useConnection()
  const [isLoading, setIsLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [ checkingRegistration, setCheckingRegistration] = useState(false)
  const [events, setEvents] = useState<EventData | null>(null)
  const { register, hash, isPending, isConfirming, isConfirmed, error: writeError } = useEventTicketingSetters()
  const { useTickets, useIsRegistered } = useEventTicketingGetters()
  const safeChainId = typeof chain?.id === 'number' ? chain.id : ChainId.BASE
  const { eventTicketing } = getContractAddresses(safeChainId)
  const isRegisteredQuery = useIsRegistered(BigInt(params.id as string), address)
  const isRegistered = Boolean(isRegisteredQuery?.data)


  useEffect(() => {
    setCheckingRegistration(true)
    
  }, [])

  // Reflect hook loading state in local UI state
  useEffect(() => {
    setCheckingRegistration(Boolean(isRegisteredQuery?.isLoading))
  }, [isRegisteredQuery?.isLoading])

  // Fetch event data
  const { data: eventData, error: contractError } = useTickets(BigInt(params.id as string || '0'))

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const formatTimeRemaining = (timestamp: number) => {
    const eventDate = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = eventDate.getTime() - now.getTime()
    
    if (diffMs < 0) return "Event has passed"
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`
    } else {
      return "Starting soon"
    }
  }

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
      return
    }

    const processEventData = async () => {
      console.log('Raw eventData:', eventData)  
      console.log('Type of eventData:', typeof eventData)  
      
      if (!eventData) {
        console.log('No event data received from contract')
        setIsLoading(false)
        return
      }
      
      try {
        // Check if eventData is an object with the expected properties
        if (typeof eventData === 'object' && eventData !== null) {
          const tuple = eventData as unknown as [
            bigint,         // id
            string,         // creator
            bigint,         // price
            string,         // eventName
            string,         // description
            bigint,         // eventTimestamp
            string,         // location
            boolean,        // closed
            boolean,        // canceled
            string,         // metadata
            bigint,         // maxSupply
            bigint,         // sold
            bigint,         // totalCollected
            bigint,         // totalRefunded
            boolean         // proceedsWithdrawn
          ]
          const [
            id,
            creator,
            price,
            eventName,
            description,
            eventTimestamp,
            location,
            closed,
            canceled,
            metadata,
            maxSupply,
            sold,
            totalCollected,
            totalRefunded,
            proceedsWithdrawn
          ] = tuple

          // Handle bigint conversion properly
          const maxSupplyNum = maxSupply ? Number(maxSupply) : 0
          const soldNum = sold ? Number(sold) : 0

          console.log('Parsed event data:', {
            id,
            creator,
            eventName,
            eventTimestamp: Number(eventTimestamp),
            location,
            closed,
            canceled,
            metadata,
            maxSupply: maxSupplyNum,
            sold: soldNum,
            totalCollected: Number(totalCollected),
            totalRefunded: Number(totalRefunded),
            proceedsWithdrawn
          })

          if (!eventName) {
            throw new Error('Event data is incomplete or invalid')
          }

          // Convert timestamp to milliseconds and create Date object
          const timestampMs = Number(eventTimestamp) * 1000
          const eventDate = new Date(timestampMs)
          const now = new Date()
          
          // Calculate status conditions
          const isPassed = eventDate < now
          
          const ticketsLeft = Math.max(0, maxSupplyNum - soldNum)
          
          console.log('Final calculations:', {
            maxSupplyNum,
            soldNum,
            ticketsLeft,
            isPassed
          })
          
          // Format the date for display
          let formattedDate = 'Date not available'
          try {
            if (!isNaN(eventDate.getTime())) {
              formattedDate = format(eventDate, 'PPPppp')
            }
          } catch (err) {
            console.log('Error formatting date:', err)
          }

          // Debug logs
          console.log('Event Status Debug:', {
            currentTime: now.toISOString(),
            eventTime: eventDate.toISOString(),
            timestamp: timestampMs,
            isPassed,
            closed,
            canceled,
            ticketsLeft,
            maxSupply: Number(maxSupply),
            sold: Number(sold)
          })

          // Determine status
          let status: EventData['status'] = 'upcoming'
          if (canceled) status = 'canceled'
          else if (closed) status = 'closed'
          else if (isPassed) status = 'passed'
          else if (ticketsLeft <= 0) status = 'sold_out'
          else if (checkingRegistration && isRegistered) status = 'registered'
          else status = 'active'

          console.log('Final Status:', status)

          setEvents({
            id: Number(id),
            creator,
            price: formatEther(price),
            eventName,
            description,
            date: formattedDate,
            location,
            closed,
            canceled,
            status,
            image: "/metaverse-fashion-show.png",
            maxSupply: maxSupplyNum,
            sold: soldNum,
            ticketsLeft,
            eventTimestamp: Number(eventTimestamp)
          })
        } else {
          console.error('Invalid event data structure:', eventData)
        }
      } catch (err) {
        console.error("Error parsing event data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    processEventData()
  }, [eventData, isConnected, router, params.id, checkingRegistration, isRegistered])

  const handleBuyTicket = async () => {
    if (!events) {
      toast.error("❗ Event data not available")
      return
    }

    if (!isConnected) {
      toast.error("🔗 Please connect your wallet first")
      return
    }

    // Check network
    if (![ChainId.BASE, ChainId.CELO].includes(chainId as number)) {
      toast.error("⚠️ Please switch to Celo or Base network")
      return
    }

    setPurchasing(true)

    try {    
      // Convert price from ETH to Wei for the contract call
      const priceInWei = parseEther(events.price)
      
      toast.info(`💰 Purchasing ticket for "${events.eventName}" - Please confirm the transaction in your wallet. Ticket price: ${events.price} ${chainId === ChainId.BASE ? "ETH" : "CELO"}`)
      
      register(BigInt(events.id), priceInWei)
    } catch (error) {
      console.error("Purchase error:", error)
      toast.error("❌ Transaction failed. Please check your wallet and try again.")
      setPurchasing(false)
    }
  }

  // Handle transaction states with toast notifications
  useEffect(() => {
    if (isConfirming) {
      toast.info("⏳ Transaction confirmed! Processing on the blockchain...")
    }
  }, [isConfirming])

  useEffect(() => {
    if (isConfirmed && purchasing) {
      setPurchasing(false)
      toast.success("🎉 Ticket purchased successfully! Your NFT ticket has been minted.")
      // Refresh the page to show updated data after a short delay
      setTimeout(() => {
        router.push("/tickets")
      }, 2000)
    }
  }, [isConfirmed, purchasing, router])

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      toast.error(`❗ Failed to load event data: ${contractError.message}`)
      console.error('Contract error:', contractError)
    }
  }, [contractError])

  useEffect(() => {
    if (!writeError) return;

    console.error("Write contract error:", writeError);
    setPurchasing(false);

    // Check for specific error types with enhanced messages
    if (writeError.message.includes("insufficient funds")) {
      toast.error("💰 Insufficient funds for transaction. Please check your balance.");
    } else if (writeError.message.includes("rejected")) {
      toast.error("❌ Transaction was rejected by user.");
    } else if (writeError.message.includes("network")) {
      toast.error("🌐 Network error. Please check your connection.");
    } else if (writeError.message.includes("reverted")) {
      toast.error("⚠️ Transaction failed: Execution reverted.");
    } else if (writeError.message.includes("RPC")) {
      toast.error("🔄 Transaction failed: Internal JSON-RPC error. Please try again.");
    } else {
      toast.error(`❗ Transaction failed: ${writeError.message.slice(0, 100)}...`);
    }
  }, [writeError]);

  const isProcessing = purchasing || isPending || isConfirming
  const isCorrectNetwork = chainId === ChainId.BASE || chainId === ChainId.CELO

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading event details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button 
          onClick={() => router.back()}
          variant="ghost" 
          className="mb-6 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative overflow-hidden rounded-xl">
              <Image
                src={imageError ? '/metaverse-fashion-show.png' : events?.image || '/metaverse-fashion-show.png'}
                alt={events?.eventName || 'Event Image'}
                width={800}
                height={450}
                className="w-full h-64 md:h-80 object-cover transition-transform duration-300 hover:scale-105"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
              
              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {events?.status === 'canceled' && (
                  <Badge className="bg-red-500/90 text-white backdrop-blur-sm">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Canceled
                  </Badge>
                )}
                {events?.status === 'closed' && (
                  <Badge className="bg-gray-500/90 text-white backdrop-blur-sm">
                    Closed
                  </Badge>
                )}
                {events?.status === 'sold_out' && (
                  <Badge className="bg-orange-500/90 text-white backdrop-blur-sm">
                    Sold Out
                  </Badge>
                )}
                {events?.status === 'passed' && (
                  <Badge className="bg-gray-500/90 text-white backdrop-blur-sm">
                    Event Ended
                  </Badge>
                )}
                {events?.status === 'active' && events?.ticketsLeft > 0 && (
                  <Badge className={`backdrop-blur-sm ${events?.ticketsLeft <= 10 ? 'bg-red-500/90 animate-pulse' : 'bg-purple-500/90'} text-white`}>
                    {events?.ticketsLeft} {events?.ticketsLeft === 1 ? 'ticket' : 'tickets'} left
                  </Badge>
                )}
              </div>

              {/* Time remaining indicator */}
              {events?.eventTimestamp && events.status === 'active' && (
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-green-500/90 text-white backdrop-blur-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeRemaining(events.eventTimestamp)}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {events?.eventName}
                </h1>

                <div className="flex flex-wrap gap-4 text-slate-300">
                  <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-3 py-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">{events?.date}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-3 py-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">{events?.location}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-3 py-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{events?.sold} attending</span>
                  </div>
                </div>
              </div>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-purple-400" />
                    About this event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed text-base">
                    {events?.description || "No description available for this event."}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Event Organizer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg">
                    <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {events?.creator?.slice(2, 4).toUpperCase() || '??'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">Event Creator</p>
                      <div className="relative w-full">
                        <p className="text-sm text-slate-400 font-mono truncate max-w-[180px] md:max-w-[220px] lg:max-w-[280px] xl:max-w-[320px]" title={events?.creator || 'Unknown creator'}>
                          {events?.creator || 'Unknown creator'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Ticket Purchase */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-400" />
                  Get Your Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <p className="text-slate-300 text-sm">Price per ticket</p>
                      <p className="text-2xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        {events?.price} {chainId === ChainId.BASE ? "ETH" : "CELO"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300 text-sm">Available</p>
                      <p className="text-white font-medium text-lg">
                        {events?.ticketsLeft ?? 0} / {events?.maxSupply ?? 0}
                      </p>
                      <div className="w-16 h-2 bg-slate-700 rounded-full mt-1">
                        <div 
                          className="h-full bg-linear-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${events?.maxSupply && events?.maxSupply > 0 ? Math.min(100, (events.sold / events.maxSupply) * 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {!isCorrectNetwork && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Please switch to Celo or Base network
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-700">
                    <Button 
                      onClick={handleBuyTicket}
                      className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
                      disabled={!isCorrectNetwork || events?.status === 'canceled' || events?.status === 'closed' || (events?.ticketsLeft ?? 0) <= 0 || events?.status === 'passed' || events?.status === 'registered' || isProcessing || checkingRegistration || isRegistered }
                    >
                      {checkingRegistration ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking registration...
                        </>
                      ) : isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isPending ? 'Confirming...' : 
                           isConfirming ? 'Processing...' :
                           purchasing ? 'Preparing...' : 'Processing...'}
                        </>
                      ) : (
                        events?.status === 'registered' || isRegistered ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Already Registered
                          </>
                        ) :
                        events?.status === 'canceled' ? 'Event Canceled' : 
                        events?.status === 'closed' ? 'Sales Ended' :
                        events?.status === 'sold_out' ? 'Sold Out' : 
                        events?.status === 'passed' ? 'Event Ended' : 
                        events?.status === 'active' ? (
                          <>
                            <Ticket className="w-4 h-4 mr-2" />
                            Buy Ticket Now
                          </>
                        ) : 'Event Canceled'
                      )}
                    </Button>
                    
                    {events?.ticketsLeft !== undefined && events.ticketsLeft < 10 && events.ticketsLeft > 0 && events.status === 'active' && (
                      <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-sm text-amber-400 text-center flex items-center justify-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Only {events.ticketsLeft} {events.ticketsLeft === 1 ? 'ticket' : 'tickets'} left!
                        </p>
                      </div>
                    )}

                    {/* Transaction Status Indicator */}
                    {isProcessing && (
                      <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin text-purple-400 shrink-0" />
                          <div className="flex-1">
                            <p className="text-slate-300 text-sm font-medium">
                              {isPending ? 'Waiting for wallet confirmation...' : 
                               isConfirming ? 'Transaction confirmed! Processing on blockchain...' : 
                               purchasing ? 'Preparing transaction...' : 'Processing...'}
                            </p>
                            {hash && (
                              <p className="text-xs text-slate-400 mt-1 font-mono">
                                Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-blue-400" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Event ID</p>
                  <p className="text-white font-mono">{events?.id}</p>
                </div>
                <div>
                  <div className="flex items-center">
                  <p className="text-slate-400 text-sm mb-1">Contract Address</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(eventTicketing, 'Contract Address')}
                      className="p-1 h-auto text-slate-400 hover:text-white"
                    >
                      {copiedField === 'Contract Address' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                    <p className="text-white font-mono text-sm break-all flex-1">
                      {eventTicketing}
                    </p>
                </div>
                {events?.creator && (
                  <div>
                    <div className="flex items-center">
                    <p className="text-slate-400 text-sm mb-1">Creator Address</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(events.creator, 'Creator Address')}
                        className="p-1 h-auto text-slate-400 hover:text-white"
                      >
                        {copiedField === 'Creator Address' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                      <p className="text-white font-mono text-sm break-all flex-1">
                        {events.creator}
                      </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}