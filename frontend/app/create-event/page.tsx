"use client"

import { useConnection } from 'wagmi'
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
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
    <div className="min-h-screen bg-[#0f172b] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/marketplace" 
            className="inline-flex items-center text-sm font-medium text-[#a1a1a1] hover:text-[#51a2ff] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>
        
        <div className="bg-[#1c398e]/10 border border-[#a1a1a1] rounded-xl p-6 md:p-8">
          <CreateEventForm />
        </div>
        
        <div className="mt-8 text-center text-sm text-[#a1a1a1]">
          <p>Having trouble? Contact our support team for assistance.</p>
        </div>
      </div>
    </div>
  )
}
