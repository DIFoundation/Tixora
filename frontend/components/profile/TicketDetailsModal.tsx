"use client"

import { Calendar, MapPin, ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { toast } from "sonner"
import type { NFTTicketDisplay } from "@/app/profile/page"

type TicketDetailsModalProps = {
  ticket: NFTTicketDisplay | null
  isOpen: boolean
  onClose: () => void
}

export function TicketDetailsModal({ ticket, isOpen, onClose }: TicketDetailsModalProps) {
  if (!ticket) return null

  const eventDate = new Date(ticket.eventTimestamp * 1000)
  const isUpcoming = ticket.status === 'upcoming'

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl">Ticket Details</DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 bg-muted/50 rounded-lg flex items-center justify-center p-8">
              <div className="text-6xl font-bold text-muted-foreground/30">
                {ticket.eventTitle.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{ticket.eventTitle}</h3>
                <div className="flex items-center mt-1">
                  <Badge variant={isUpcoming ? "default" : "secondary"} className="mr-2">
                    {isUpcoming ? 'Upcoming' : 'Past'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Ticket ID: {ticket.id}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {format(eventDate, 'EEEE, MMMM d, yyyy')} • {format(eventDate, 'h:mm a')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{ticket.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-5 w-5 flex items-center justify-center mr-3">
                    <span className="text-muted-foreground">$</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">{ticket.price}</p>
                  </div>
                </div>
              </div>
              
              {ticket.txHash && (
                <div className="pt-4 mt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Transaction</p>
                  <div className="flex items-center justify-between bg-muted/50 rounded-md p-2 text-sm">
                    <code className="font-mono text-xs truncate">
                      {ticket.txHash}
                    </code>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleCopy(ticket.txHash!)}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy transaction hash</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        asChild
                      >
                        <a 
                          href={`https://explorer.celo.org/tx/${ticket.txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View on explorer</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
