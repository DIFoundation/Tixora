import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Calendar, MapPin, Users } from 'lucide-react'
import { ChainId } from '@/lib/addressAndAbi'
import { useConnection } from 'wagmi'
import { useEventTicketingGetters } from '@/hooks/useEventTicketing'

function FeatureEvents() {
  const router = useRouter()
  const { chain } = useConnection()
  const { useGetTotalTickets } = useEventTicketingGetters()

  const symbol = chain?.id === ChainId.BASE ? "ETH" : "CELO" 

  // Placeholder data - replace with actual data from your contract
  const {} = useEventTicketingGetters
  const featuredEvents = [
    {
      id: 1,
      title: 'Blockchain Conference 2024',
      date: 'April 15, 2024',
      location: 'San Francisco, CA',
      price: `0.1 ${symbol}`,
      category: 'Conference',
      ticketsLeft: 42,
      attendees: 1500,
      image: '/event-placeholder-1.jpg'
    },
    {
      id: 2,
      title: 'NFT Art Exhibition',
      date: 'May 2, 2024',
      location: 'New York, NY',
      price: `0.05 ${symbol}`,
      category: 'Art',
      ticketsLeft: 12,
      attendees: 300,
      image: '/event-placeholder-2.jpg'
    },
    {
      id: 3,
      title: 'Crypto Music Festival',
      date: 'June 10, 2024',
      location: 'Miami, FL',
      price: `0.2 ${symbol}`,
      category: 'Music',
      ticketsLeft: 87,
      attendees: 5000,
      image: '/event-placeholder-3.jpg'
    },
    {
      id: 4,
      title: 'Web3 Workshop',
      date: 'July 5, 2024',
      location: 'Online',
      price: `0.01 ${symbol}`,
      category: 'Workshop',
      ticketsLeft: 23,
      attendees: 200,
      image: '/event-placeholder-4.jpg'
    }
  ]

  return (
    <div className="py-12 px-4 bg-[#0f172b] border-t border-[#1c398e]/30">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredEvents.map((event) => (
            <Card 
              key={event.id}
              className="group overflow-hidden border-[#1c398e]/30 hover:border-[#51a2ff]/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 bg-[#1c398e]/20">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <Badge className="absolute top-3 left-3 bg-[#1c398e] hover:bg-[#1c398e] text-white">
                  {event.category}
                </Badge>
                <Badge className={`absolute top-3 right-3 ${
                  event.ticketsLeft <= 10 ? 'bg-red-500/90' : 'bg-[#1c398e]'
                } hover:bg-opacity-90 text-white`}>
                  {event.ticketsLeft} left
                </Badge>
              </div>

              <CardContent className="p-6 bg-[#0f172b]">
                <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 min-h-14">
                  {event.title}
                </h3>

                <div className="space-y-2 text-sm text-[#a1a1a9] mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#51a2ff] shrink-0" />
                    <span className="truncate">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#51a2ff] shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#51a2ff] shrink-0" />
                    <span>{event.attendees.toLocaleString()} attendees</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#1c398e]/30">
                  <span className="text-lg font-bold text-[#51a2ff]">
                    {event.price}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-[#1c398e] text-[#a1a1a9] hover:bg-[#1c398e]/30 hover:text-white hover:border-[#51a2ff]"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/marketplace')}
            className="px-8 py-6 text-base border-[#1c398e] text-[#a1a1a9] hover:bg-[#1c398e]/30 hover:text-white hover:border-[#51a2ff] transition-colors"
          >
            View All Events <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FeatureEvents;