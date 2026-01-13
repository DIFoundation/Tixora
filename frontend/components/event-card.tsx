import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Ticket, Loader2, Clock } from "lucide-react"
import Image from "next/image"
import { useWriteContract, useWaitForTransactionReceipt, useConnection, useBalance } from 'wagmi'
import { ChainId, eventTicketingAbi, getContractAddresses } from "@/lib/addressAndAbi"
import { useEventTicketingGetters } from "@/hooks/useEventTicketing"
import { toast } from "react-toastify"
// import dynamic from 'next/dynamic'
import SelfVerification from '@/components/SelfVerification'

// Lazy load the SelfVerification component to avoid SSR issues
// const SelfVerification = dynamic(
//   () => import('@/components/SelfVerification').then((mod) => mod.default),
//   { ssr: false }
// )

interface MarketplaceEvent {
  id: number | bigint
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

interface EventCardProps {
  event: MarketplaceEvent
  onViewDetails: () => void
  onPurchase: () => void
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter()
  const { writeContract, isPending, data: hash, error: writeError } = useWriteContract()
  const [purchasing, setPurchasing] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)
  // const [imageError, setImageError] = useState(false)
  const { address, isConnected, chain } = useConnection()
  const chainId = chain?.id || ChainId.CELO || ChainId.BASE;
  const { eventTicketing } = getContractAddresses(chainId)
  const { useIsRegistered } = useEventTicketingGetters()
  const { data: currentBalance } = useBalance()
  
  const { 
    // isLoading: checkingRegistration, 
    data: isRegistered 
  } = useIsRegistered(BigInt(event.id), address)
  
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  })

  const price = chainId === ChainId.BASE ? "BASE" : "CELO"

  const getStatusBadge = (event: MarketplaceEvent) => {
    if (event.status === "passed") {
      return <Badge className="bg-[#a1a1a9] text-[#0f172b] hover:bg-[#a1a1a9]/90">Passed</Badge>
    }
    if (event.status === "canceled") {
      return <Badge className="bg-red-500/90 text-white hover:bg-red-600">Canceled</Badge>
    }
    if (event.status === "closed" || event.status === "sold_out") {
      return <Badge className="bg-[#1c398e]/90 text-white hover:bg-[#1c398e]">Sold Out</Badge>
    }
    
    // Add urgency indicator for low ticket counts
    if (event.ticketsLeft <= 5) {
      return <Badge className="bg-red-500/90 text-white animate-pulse hover:bg-red-600">{event.ticketsLeft} left</Badge>
    }
    
    return <Badge className="bg-[#1c398e]/90 text-white hover:bg-[#1c398e]">{event.ticketsLeft} left</Badge>
  }

  const handleVerificationSuccess = () => {
    setVerificationComplete(true)
    setShowVerification(false)
    // Proceed with ticket purchase after successful verification
    proceedWithTicketPurchase()
  }

  // const handleVerificationError = () => {
  //   toast.error("Identity verification failed. Please try again.")
  //   setPurchasing(false)
  // }

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (event.ticketsLeft === 0) {
      toast.error("Sorry, this event is sold out!")
      return
    }

    if (isRegistered) {
      toast.info("You are already registered for this event!")
      return
    }

    // Check if verification is required and not yet completed
    if (process.env.NEXT_PUBLIC_ENABLE_SELF_VERIFICATION === 'true' && !verificationComplete) {
      setShowVerification(true)
      } else {
        proceedWithTicketPurchase()
      }
    }

  const proceedWithTicketPurchase = () => {
    setPurchasing(true)
    
    try {
      // Check if user has enough balance
      const balance = currentBalance
      const requiredAmount = event.originalPrice
      const userBalance = Number(balance?.value)
      
      if (userBalance < requiredAmount) {
        toast.error("Insufficient balance for this purchase")
        setPurchasing(false)
        return
      }

      // Proceed with ticket purchase
      writeContract({
        address: eventTicketing as `0x${string}`,
        abi: eventTicketingAbi,
          functionName: 'register',
        args: [BigInt(event.id)],
          value: event.originalPrice,
      })
    } catch (error) {
      console.error("Error purchasing ticket:", error)
      toast.error("Failed to process ticket purchase")
      setPurchasing(false)
    }
  }

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && purchasing) {
      setPurchasing(false)
      toast.success("Ticket purchased successfully! Welcome to the event!")
      // Small delay before refresh to show success message
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }, [isSuccess, purchasing])

  // Handle write contract errors
  useEffect(() => {
    if (writeError) {
      console.error("Write contract error:", writeError)
      setPurchasing(false)
      
      // Check for specific error types
      if (writeError.message.includes("insufficient funds")) {
        toast.error("Insufficient funds for transaction. Please check your balance.")
      } else if (writeError.message.includes("rejected")) {
        toast.error("Transaction was rejected by user.")
      } else if (writeError.message.includes("network")) {
        toast.error("Network error. Please check your connection.")
      } else if (writeError.message.includes("reverted")) {
        toast.error("Transaction failed: Execution reverted.")
      } else if (writeError.message.includes("RPC")) {
        toast.error("Transaction failed: Internal JSON-RPC error. Please try again.")
      } else {
        toast.error(`Transaction failed: ${writeError.message.slice(0, 100)}...`)
      }
    }
  }, [writeError])

  // Handle transaction receipt errors
  useEffect(() => {
    if (receiptError) {
      console.error("Transaction receipt error:", receiptError)
      setPurchasing(false)
      toast.error(`Transaction failed: ${receiptError.message}`)
    }
  }, [receiptError])

  // Check if user is on the correct network
  // const isCorrectNetwork = chainId === ChainId.BASE || ChainId.CELO

  const isProcessing = purchasing || isPending || isConfirming

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on the button or its children
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
      return;
    }
    router.push(`/marketplace/${event.id}`)
  }

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#51a2ff]/10 border-[#1c398e]/50 bg-[#060910] hover:border-[#51a2ff]/50"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={event.image || "/web3-music-festival-lights.png"}
          alt={event.eventTitle}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0f172b]/90 via-transparent to-transparent" />
        
        <div className="absolute top-3 right-3 z-10">
          {getStatusBadge(event)}
        </div>
        
        {event.category && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-[#1c398e] text-white hover:bg-[#1c398e]/90">
              {event.category}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-white text-lg line-clamp-2 h-14">
            {event.eventTitle}
          </h3>
          <div className="flex items-center text-[#a1a1a9] text-sm mt-1">
            <Clock className="w-4 h-4 mr-1" />
            <span>{new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
        
        <div className="flex items-center text-[#a1a1a9] text-sm">
          <MapPin className="w-4 h-4 mr-1 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        
        <div className="flex items-center text-[#a1a1a9] text-sm">
          <Users className="w-4 h-4 mr-1" />
          <span>{event.attendees.toLocaleString()} attendees</span>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-[#1c398e]/50">
          <div className="flex flex-col">
            <span className="text-sm text-[#a1a1a9]">Price</span>
            <span className="font-bold text-white">{event.price} {price}</span>
          </div>
          
          <Button
            onClick={(e) => {
              e.stopPropagation()
              handlePurchaseClick(e)
            }}
            disabled={isProcessing || event.status !== 'upcoming' || event.ticketsLeft === 0}
            className={`bg-linear-to-r from-[#1c398e] to-[#51a2ff] hover:from-[#1c398e]/90 hover:to-[#51a2ff]/90 text-white px-4 py-2 rounded-lg transition-all duration-300 ${
              (isProcessing || event.status !== 'upcoming' || event.ticketsLeft === 0) 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:shadow-lg hover:shadow-[#51a2ff]/20'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : event.status !== 'upcoming' ? (
              'Event ' + event.status
            ) : event.ticketsLeft === 0 ? (
              'Sold Out'
            ) : (
              <>
                <Ticket /> Get Ticket
              </>
            )}
          </Button>
        </div>
      </CardContent>
      
      {showVerification && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172b] border border-[#1c398e]/50 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Verify Your Identity</h3>
            <p className="text-[#a1a1a9] mb-6">
              To prevent fraud, we require identity verification before purchasing tickets.
            </p>
            <SelfVerification 
              open={showVerification} 
              onOpenChange={setShowVerification} 
              onVerificationSuccess={handleVerificationSuccess} 
              // onVerificationError={handleVerificationError} 
            />
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                setShowVerification(false)
                setPurchasing(false)
              }}
              className="mt-4 w-full border-[#1c398e] text-[#a1a1a9] hover:bg-[#1c398e]/20 hover:border-[#51a2ff] hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}