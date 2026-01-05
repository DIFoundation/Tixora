"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Send, RefreshCw, QrCode } from "lucide-react"

type TicketAction = "view" | "transfer" | "qr" | "resale"

type TicketActionsProps = {
  isUpcoming: boolean
  onAction: (action: TicketAction) => void
}

export function TicketActions({ isUpcoming, onAction }: TicketActionsProps) {
  const actionItems = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="h-4 w-4 mr-2" />,
      disabled: false,
    },
    {
      id: 'qr',
      label: 'Show QR Code',
      icon: <QrCode className="h-4 w-4 mr-2" />,
      disabled: false,
    },
    {
      id: 'transfer',
      label: 'Transfer Ticket',
      icon: <Send className="h-4 w-4 mr-2" />,
      disabled: !isUpcoming,
    },
    {
      id: 'resale',
      label: 'Sell on Marketplace',
      icon: <RefreshCw className="h-4 w-4 mr-2" />,
      disabled: !isUpcoming,
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 w-9 p-0 border-[#51a2ff]/50 hover:bg-[#51a2ff]/10 hover:border-[#51a2ff] text-[#a1a1a9] hover:text-white"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="bg-[#1c398e] border-[#51a2ff]/20 text-white"
      >
        {actionItems.map((item) => (
          <DropdownMenuItem
            key={item.id}
            disabled={item.disabled}
            onClick={() => onAction(item.id as TicketAction)}
            className={`cursor-pointer focus:bg-[#51a2ff]/20 focus:text-white ${
              item.disabled ? 'opacity-50' : 'hover:bg-[#51a2ff]/10'
            }`}
          >
            {item.icon}
            <span className={item.disabled ? 'text-[#a1a1a9]' : 'text-white'}>{item.label}</span>
            {item.disabled && (
              <span className="ml-2 text-xs text-[#a1a1a9]">
                {!isUpcoming ? 'Event ended' : ''}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
