"use client"

import { useState, useEffect, useMemo } from "react"
import { useConnection } from 'wagmi'
import { formatEther, keccak256, toBytes } from 'viem'
import { toast } from "sonner"
import { useEventTicketingGetters } from "@/hooks/useEventTicketing"
import { useResaleMarketSetters } from "@/hooks/useResaleMarket"
import { getContractAddresses, ChainId, eventTicketingAbi } from "@/lib/addressAndAbi"
import { ListTicketModal } from "@/components/list-ticket-modal"
import { TransferTicketModal } from "@/components/transfer-ticket-modal"
import {
  ProfileHeader,
  TicketList,
  TicketDetailsModal,
  QrCodeModal,
} from "@/components/profile"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { createPublicClient, http } from 'viem'
import { base, celo } from 'viem/chains'

export const publicClient = createPublicClient({

  chain: base || celo,
  transport: http("https://base-mainnet.g.alchemy.com/v2/3v_hKHYxum5Uzvp0j1Zwy")
})

export type NFTTicketDisplay = {
  id: string
  tokenId: bigint
  eventTitle: string
  eventTimestamp: number
  location: string
  status: 'upcoming' | 'past'
  qrCode: string
  price: string
  purchaseDate: string
  txHash: string | null
}

type TicketAction = "view" | "transfer" | "qr" | "resale"

export default function ProfilePage() {
  const [ticketTransactions, setTicketTransactions] = useState<Record<string, string>>({})
  const [selectedTicket, setSelectedTicket] = useState<NFTTicketDisplay | null>(null)
  const [currentAction, setCurrentAction] = useState<TicketAction | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { address } = useConnection()
  // const publicClient = usePublicClient()

  const {
    useGetRecentTickets,
    // useGetRegistrants, 
    // useGetStatus, 
    // useTicketsLeft 
  } = useEventTicketingGetters()
  const { listTicket, isPending: isListing, isConfirmed: isListingConfirmed } = useResaleMarketSetters()

  // Fetch all recent tickets
  const { data: allTickets = [], isLoading: isLoadingTickets } = useGetRecentTickets()

  // Get the current chain from the connected wallet
  const { chain: connectedChain } = useConnection()

  const { eventTicketing: eventTicketingAddress } = useMemo(() => {
    // Use the connected chain ID, default to CELO if not connected
    const chainId = connectedChain?.id || ChainId.CELO
    return getContractAddresses(chainId)
  }, [connectedChain?.id])

  // Registration status map for quick lookup
  const [registrationMap, setRegistrationMap] = useState<Record<string, boolean>>({})

  // Fetch registration status for all tickets for the connected user
  useEffect(() => {
    const fetchRegistrationStatuses = async () => {
      if (!publicClient || !address || !allTickets?.length || !eventTicketingAddress) return

      try {
        const results = await Promise.allSettled(
          allTickets.map((t) =>
            publicClient.readContract({
              address: eventTicketingAddress as `0x${string}`,
              abi: eventTicketingAbi,
              functionName: 'isRegistered',
              args: [BigInt(t.id), address as `0x${string}`],
            })
          )
        )

        const map: Record<string, boolean> = {}
        results.forEach((res, idx) => {
          const id = allTickets[idx].id.toString()
          map[id] = res.status === 'fulfilled' ? Boolean(res.value) : false
        })
        setRegistrationMap(map)
      } catch (e) {
        console.error('Failed to fetch registration statuses', e)
        setRegistrationMap({})
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegistrationStatuses()
  }, [address, allTickets, eventTicketingAddress])

  const symbol = connectedChain?.id === ChainId.BASE ? 'ETH' : 'CELO'

  const ETHERSCAN_API = "https://api.etherscan.io/v2/api"
  const CHAIN_ID = connectedChain?.id === ChainId.BASE ? 8453 : 42220

  useEffect(() => {
    if (!address || !eventTicketingAddress) return

    const fetchTicketTxHashes = async () => {
      try {
        const options = { method: 'GET' };
        const res = await fetch(
          `${ETHERSCAN_API}?apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}&chainid=${CHAIN_ID}&module=account&action=txlist&address=${eventTicketingAddress}`,
          options
        )

        const data = await res.json()

        console.log('data:', data.result);

        if (data.status === '1' && Array.isArray(data.result)) {
          // Create a map of ticket IDs to transaction hashes
          const txMap: Record<string, string> = {}
          data.result.forEach((tx: any) => {
            // Assuming the ticket ID is in the input data or you can extract it from the transaction
            // You might need to adjust this based on how your contract emits events
            if (tx.to?.toLowerCase() === eventTicketingAddress?.toLowerCase()) {
              // This is a simplified example - you'll need to extract the actual ticket ID from the transaction
              // For now, we'll just use the transaction hash for the first ticket as an example
              const ticketId = Object.keys(registrationMap)[0] // This is just an example
              if (ticketId) {
                txMap[ticketId] = tx.hash
              }
            }
          })
          setTicketTransactions(txMap)
        }


      } catch (error) {
        console.error('Error fetching ticket tx hashes:', error)
      }
    }
    fetchTicketTxHashes()
  }, [address, eventTicketingAddress, CHAIN_ID, registrationMap])

  // ====================================

  // Filter tickets to only include those registered by the user
  const userTickets = useMemo(() => {
    if (!allTickets) return []

    return allTickets
      .filter((ticket) => registrationMap[ticket.id.toString()] === true)
      .map((ticket) => {
        const now = Math.floor(Date.now() / 1000)
        const isPast = Number(ticket.eventTimestamp) < now

        return {
          id: ticket.id.toString(),
          tokenId: BigInt(ticket.id),
          eventTitle: ticket.eventName,
          eventTimestamp: Number(ticket.eventTimestamp),
          location: ticket.location,
          status: isPast ? "past" as const : "upcoming" as const,
          qrCode: ticket.id.toString(),
          price: formatEther(ticket.price) + " " + symbol,
          purchaseDate: new Date(Number(ticket.eventTimestamp) * 1000).toLocaleDateString(),
          txHash: ticketTransactions[ticket.id.toString()] || null
        }
      })
  }, [allTickets, registrationMap, symbol, ticketTransactions])


  // ====================================

  // Handle listing confirmation
  useEffect(() => {
    if (isListingConfirmed) {
      toast.success('Ticket listed for resale!')
    }
  }, [isListingConfirmed])

  const handleAction = (action: TicketAction, ticket: NFTTicketDisplay) => {
    setSelectedTicket(ticket)
    setCurrentAction(action)
  }

  const handleCloseModal = () => {
    setSelectedTicket(null)
    setCurrentAction(null)
  }

  const handleListTicket = async (price: bigint) => {
    if (!selectedTicket) return

    try {
      await listTicket(selectedTicket.tokenId, price)
      toast.success('Ticket listed for resale successfully!')
    } catch (error) {
      console.error('Failed to list ticket:', error)
      toast.error('Failed to list ticket for resale')
    } finally {
      handleCloseModal()
    }
  }

  const stats = useMemo(() => ({
    totalTickets: userTickets.length,
    upcomingEvents: userTickets.filter(t => t.status === 'upcoming').length,
    pastEvents: userTickets.filter(t => t.status === 'past').length,
  }), [userTickets])

  return (
    <div className="min-h-screen bg-[#0f172b] text-foreground pt-12 px-4 md:px-8 lg:px-20">
      <div className="pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <ProfileHeader
            stats={stats}
            isLoading={isLoading || isLoadingTickets}
            className="mb-10"
          />

          <div className="px-2">
            <Card className="bg-[#1c398e]/10 border-[#1c398e]/30">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">
                  My Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TicketList
                  tickets={userTickets}
                  onAction={handleAction}
                  isLoading={isLoading || isLoadingTickets}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedTicket && (
        <>
          <TicketDetailsModal
            isOpen={currentAction === 'view'}
            onClose={handleCloseModal}
            ticket={selectedTicket}
          />

          <TransferTicketModal
            isOpen={currentAction === 'transfer'}
            onClose={handleCloseModal}
            ticketId={selectedTicket.tokenId}
          />

          <QrCodeModal
            isOpen={currentAction === 'qr'}
            onClose={handleCloseModal}
            qrCode={selectedTicket.qrCode}
            eventName={selectedTicket.eventTitle}
          />

          <ListTicketModal
            isOpen={currentAction === 'resale'}
            onClose={handleCloseModal}
            onList={handleListTicket}
            isLoading={isListing}
          />
        </>
      )}
    </div>
  )
}
