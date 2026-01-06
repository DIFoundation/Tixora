"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicketCard } from "./TicketCard"
import type { NFTTicketDisplay } from "@/app/profile/page"

type TicketListProps = {
  tickets: NFTTicketDisplay[]
  isLoading?: boolean
  onAction: (action: string, ticket: NFTTicketDisplay) => void
}

export function TicketList({ tickets, isLoading = false, onAction }: TicketListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Filter by search query
      const matchesSearch = ticket.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Filter by tab
      const matchesTab = activeTab === "all" || 
                        (activeTab === "upcoming" && ticket.status === "upcoming") ||
                        (activeTab === "past" && ticket.status === "past")
      
      return matchesSearch && matchesTab
    })
  }, [tickets, searchQuery, activeTab])

  // const stats = {
  //   totalTickets: tickets.length,
  //   upcomingEvents: tickets.filter(t => t.status === 'upcoming').length,
  //   pastEvents: tickets.filter(t => t.status === 'past').length,
  // }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TicketCard 
              key={i} 
              ticket={{} as NFTTicketDisplay} 
              onAction={() => {}}
              isLoading
            />
          ))}
        </div>
      ) : filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onAction={onAction}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No tickets found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery 
              ? "Try adjusting your search or filter criteria."
              : activeTab === "upcoming" 
                ? "You don't have any upcoming events."
                : "You haven't attended any events yet."
            }
          </p>
        </div>
      )}
    </div>
  )
}
