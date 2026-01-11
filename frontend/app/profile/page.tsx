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
import { usePublicClient } from "wagmi"

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
  const publicClient = usePublicClient()

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
  }, [address, allTickets, eventTicketingAddress, publicClient])

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
        console.log('Fetched transactions:', data.result);

        if (data.status === '1' && Array.isArray(data.result)) {
          const txMap: Record<string, string> = {}
          
          for (const tx of data.result) {
            // Check if this is a transaction to our contract
            if (tx.to?.toLowerCase() !== eventTicketingAddress?.toLowerCase()) continue;

            // Check if this is a register transaction (function selector 0xf207564e)
            if (tx.input.startsWith('0xf207564e')) {
              try {
                // The ticketId is the first parameter after the function selector
                // For function register(uint256 tier), the ticketId is in the first 32 bytes after the selector
                const ticketIdHex = tx.input.slice(10, 74); // 10 = 2 (0x) + 8 (function selector)
                const ticketId = parseInt(ticketIdHex, 16).toString();
                
                // Only add if we have this ticket in our registration map
                if (ticketId && registrationMap[ticketId]) {
                  txMap[ticketId] = tx.hash;
                  console.log(`Mapped ticket ${ticketId} to tx ${tx.hash}`);
                }
              } catch (error) {
                console.error('Error processing transaction:', tx.hash, error);
              }
            }
          }
          
          console.log('Final transaction map:', txMap);
          setTicketTransactions(prev => ({
            ...prev,
            ...txMap
          }));
        }
      } catch (error) {
        console.error('Error fetching ticket tx hashes:', error);
      }
    };
    fetchTicketTxHashes()
  }, [address, eventTicketingAddress, CHAIN_ID, registrationMap, ticketTransactions])

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
  const handleActionWrapper = (action: string, ticket: NFTTicketDisplay) => {
    if (['view', 'transfer', 'qr', 'resale'].includes(action)) {
      handleAction(action as TicketAction, ticket);
    }
  };

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
                  onAction={handleActionWrapper}
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
            ticketId={selectedTicket.id}
            eventName={selectedTicket.eventTitle}
            isActive={true}
            onTransferSuccess={handleCloseModal}
          />

          <QrCodeModal
            isOpen={currentAction === 'qr'}
            onClose={handleCloseModal}
            qrCode={selectedTicket.qrCode}
            eventName={selectedTicket.eventTitle}
          />

          <ListTicketModal
            // tokenId={selectedTicket.tokenId}
            isOpen={currentAction === 'resale'}
            onClose={handleCloseModal}
            // eventName={selectedTicket.eventTitle}
            // onListSuccess={handleCloseModal}
            onList={handleListTicket}
            isLoading={isListing}
          />
        </>
      )}
    </div>
  )
}
