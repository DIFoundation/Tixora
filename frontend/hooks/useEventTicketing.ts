import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useConnection } from 'wagmi';
import { Address } from 'viem';
import { getContractAddresses, ChainId, eventTicketingAbi } from '@/lib/addressAndAbi';

// Types
interface Ticket {
  id: bigint;
  creator: Address;
  price: bigint;
  eventName: string;
  description: string;
  eventTimestamp: bigint;
  location: string;
  closed: boolean;
  canceled: boolean;
  metadata: string;
  maxSupply: bigint;
  sold: bigint;
  totalCollected: bigint;
  totalRefunded: bigint;
  proceedsWithdrawn: boolean;
}

enum Status {
  OPEN,
  CLOSED,
  CANCELED,
  SOLDOUT
}

export function useEventTicketingGetters() {
  const { chain } = useConnection()
  const chainId = chain?.id === ChainId.BASE ? ChainId.BASE : ChainId.CELO;
  
  const { eventTicketing } = getContractAddresses(chainId);

  // Get fee recipient
  const useFeeRecipient = () => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'feeRecipient',
      chainId,
    });
  };

  // Get recent tickets
  const useGetRecentTickets = () => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'getRecentTickets',
      chainId,
    }) as ReturnType<typeof useReadContract> & { data?: Ticket[] };
  };

  // Get registrants for a ticket
  const useGetRegistrants = (ticketId?: bigint) => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'getRegistrants',
      args: ticketId !== undefined ? [ticketId] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined,
      },
    }) as ReturnType<typeof useReadContract> & { data?: Address[] };
  };

  // Get ticket status
  const useGetStatus = (ticketId?: bigint) => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'getStatus',
      args: ticketId !== undefined ? [ticketId] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined,
      },
    }) as ReturnType<typeof useReadContract> & { data?: Status };
  };

  // Get total tickets count
  const useGetTotalTickets = () => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'getTotalTickets',
      chainId,
    });
  };

  // Check if ticket is available
  const useIsAvailable = (ticketId?: bigint) => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'isAvailable',
      args: ticketId !== undefined ? [ticketId] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined,
      },
    });
  };

  // Check if user is registered for ticket
  const useIsRegistered = (ticketId?: bigint, user?: Address) => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'isRegistered',
      args: ticketId !== undefined && user ? [ticketId, user] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined && !!user,
      },
    });
  };

  // Get contract owner
  const useOwner = () => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'owner',
      chainId,
    });
  };

  // Get paid amount by user for ticket
  const usePaidAmount = (ticketId?: bigint, user?: Address) => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'paidAmount',
      args: ticketId !== undefined && user ? [ticketId, user] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined && !!user,
      },
    });
  };

  // Get platform fee basis points
  const usePlatformFeeBps = () => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'platformFeeBps',
      chainId,
    });
  };

  // Get ticket NFT contract address
  const useTicketNft = () => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'ticketNft',
      chainId,
    });
  };

  // Get ticket details by ID
  const useTickets = (ticketId?: bigint) => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'tickets',
      args: ticketId !== undefined ? [ticketId] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined,
      },
    }) as ReturnType<typeof useReadContract> & { data?: Ticket };
  };

  // Get tickets left for a ticket ID
  const useTicketsLeft = (ticketId?: bigint) => {
    return useReadContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'ticketsLeft',
      args: ticketId !== undefined ? [ticketId] : undefined,
      chainId,
      query: {
        enabled: ticketId !== undefined,
      },
    });
  };

  return {
    useFeeRecipient,
    useGetRecentTickets,
    useGetRegistrants,
    useGetStatus,
    useGetTotalTickets,
    useIsAvailable,
    useIsRegistered,
    useOwner,
    usePaidAmount,
    usePlatformFeeBps,
    useTicketNft,
    useTickets,
    useTicketsLeft,
  };
}

export function useEventTicketingSetters() {
  const { chain } = useConnection()
  const chainId = chain?.id === ChainId.BASE ? ChainId.BASE : ChainId.CELO;
  
  const { eventTicketing } = getContractAddresses(chainId);

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    chainId,
  });

  // Cancel ticket
  const cancelTicket = (ticketId: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'cancelTicket',
      args: [ticketId],
      chainId,
    });
  };

  // Claim refund
  const claimRefund = (ticketId: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'claimRefund',
      args: [ticketId],
      chainId,
    });
  };

  // Close ticket
  const closeTicket = (ticketId: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'closeTicket',
      args: [ticketId],
      chainId,
    });
  };

  // Create ticket
  const createTicket = (
    price: bigint,
    eventName: string,
    description: string,
    eventTimestamp: bigint,
    maxSupply: bigint,
    metadata: string,
    location: string
  ) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'createTicket',
      args: [price, eventName, description, eventTimestamp, maxSupply, metadata, location],
      chainId,
    });
  };

  // Finalize event
  const finalizeEvent = (ticketId: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'finalizeEvent',
      args: [ticketId],
      chainId,
    });
  };

  // Register for event (payable)
  const register = (ticketId: bigint, value?: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'register',
      args: [ticketId],
      value,
      chainId,
    });
  };

  // Renounce ownership
  const renounceOwnership = () => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'renounceOwnership',
      chainId,
    });
  };

  // Set fee recipient
  const setFeeRecipient = (newRecipient: Address) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'setFeeRecipient',
      args: [newRecipient],
      chainId,
    });
  };

  // Set service fee
  const setServiceFee = (feeBps: number) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'setServiceFee',
      args: [feeBps],
      chainId,
    });
  };

  // Set ticket NFT address
  const setTicketNft = (ticketNftAddress: Address) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'setTicketNft',
      args: [ticketNftAddress],
      chainId,
    });
  };

  // Transfer ownership
  const transferOwnership = (newOwner: Address) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'transferOwnership',
      args: [newOwner],
      chainId,
    });
  };

  // Update max supply
  const updateMaxSupply = (ticketId: bigint, newMaxSupply: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'updateMaxSupply',
      args: [ticketId, newMaxSupply],
      chainId,
    });
  };

  // Update ticket
  const updateTicket = (
    ticketId: bigint,
    newPrice: bigint,
    newLocation: string,
    newEventTimestamp: bigint
  ) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'updateTicket',
      args: [ticketId, newPrice, newLocation, newEventTimestamp],
      chainId,
    });
  };

  // Withdraw proceeds
  const withdrawProceeds = (ticketId: bigint) => {
    writeContract({
      address: eventTicketing as Address,
      abi: eventTicketingAbi,
      functionName: 'withdrawProceeds',
      args: [ticketId],
      chainId,
    });
  };

  return {
    // Transaction state
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,

    // Write functions
    cancelTicket,
    claimRefund,
    closeTicket,
    createTicket,
    finalizeEvent,
    register,
    renounceOwnership,
    setFeeRecipient,
    setServiceFee,
    setTicketNft,
    transferOwnership,
    updateMaxSupply,
    updateTicket,
    withdrawProceeds,
  };
}
