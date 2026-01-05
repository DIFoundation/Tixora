"use client"

import { useConnection } from 'wagmi'
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { CreateEventForm } from "@/components/events/CreateEventForm"

export default function CreateEvent() {
  const { isConnected } = useConnection()
  const router = useRouter()

  // Redirect if not connected
  if (!isConnected) {
    if (typeof window !== 'undefined') {
      router.push("/")
    }
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/marketplace" 
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>
        
        <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
          <CreateEventForm />
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Having trouble? Contact our support team for assistance.</p>
        </div>
      </div>
    </div>
  )
}
