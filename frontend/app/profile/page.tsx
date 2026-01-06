"use client"

import { useState, useEffect, useMemo } from "react"
import { useConnection } from 'wagmi'
import { formatEther } from 'viem'
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
import { parseAbiItem } from 'viem'
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
  
  const { useGetRecentTickets } = useEventTicketingGetters()
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
          allTickets.map((t: any) =>
            publicClient.readContract({
              address: eventTicketingAddress as `0x${string}`,
              abi: eventTicketingAbi as any,
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

  // Filter tickets to only include those registered by the user
  const userTickets = useMemo(() => {
    if (!allTickets) return []

    return allTickets
      .filter((ticket: any) => registrationMap[ticket.id.toString()] === true)
      .map((ticket: any) => {
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
          purchaseDate: new Date(Number(ticket.eventTimestamp) * 1000).toISOString(),
          txHash: ticketTransactions[ticket.id.toString()] || null,
        } satisfies NFTTicketDisplay
      })
  }, [allTickets, registrationMap, ticketTransactions, symbol])

  // Fetch transaction hashes for registered tickets
  useEffect(() => {
    const fetchTransactionHashes = async () => {
      if (!allTickets || !publicClient || !address || !eventTicketingAddress) {
        return
      }

      const registeredTickets = allTickets.filter((t: any) => registrationMap[t.id.toString()] === true)
      const txHashes: Record<string, string> = {}
      
      for (const ticket of registeredTickets) {
        try {
          // const logs = await publicClient.getLogs({
          //   address: eventTicketingAddress as `0x${string}`,
          //   event: {
          //     type: 'event',
          //     name: 'Registered',
          //     inputs: [
          //       { type: 'uint256', indexed: true, name: 'ticketId' },
          //       { type: 'address', indexed: true, name: 'registrant' },
          //       { type: 'uint256', indexed: false, name: 'nftTokenId' }
          //     ]
          //   },
          //   args: {
          //     ticketId: BigInt(ticket.id),
          //     registrant: address as `0x${string}`
          //   },
          //   fromBlock: 'earliest',
          //   toBlock: 'latest'
          // })

          const logs = await publicClient.getLogs({
            address: eventTicketingAddress as `0x${string}`,
            event: { 
              type: 'event',
              name: 'Registered', 
              inputs: [
                { type: 'uint256', indexed: true, name: 'ticketId' },
                { type: 'address', indexed: true, name: 'registrant' },
                { type: 'uint256', indexed: false, name: 'nftTokenId' }
              ] 
            },
            args: {
              ticketId: BigInt(ticket.id),
              registrant: address as `0x${string}`
            },
            fromBlock: 'earliest',
            toBlock: 'latest'
          })
          
          if (logs.length > 0) {
            const latestLog = logs[logs.length - 1]
            txHashes[ticket.id.toString()] = latestLog.transactionHash
          } else {
            const mockTxHash = `0x${ticket.id.toString().padStart(64, '0')}`
            txHashes[ticket.id.toString()] = mockTxHash
          }
        } catch (error) {
          console.error(`Failed to fetch transaction for ticket ${ticket.id}:`, error)
          const mockTxHash = `0x${ticket.id.toString().padStart(64, '0')}`
          txHashes[ticket.id.toString()] = mockTxHash
        }
      }
      
      setTicketTransactions(txHashes)
    }

    fetchTransactionHashes()
  }, [allTickets, registrationMap, address, eventTicketingAddress])

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
                  My Tickets 11111111111111
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
