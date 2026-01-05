"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEventTicketingSetters } from "@/hooks/useEventTicketing"
import { EventFormProgress } from "./EventFormProgress"
import { EventDetailsStep } from "./steps/EventDetailsStep"
import { TicketSetupStep } from "./steps/TicketSetupStep"
import { PricingBreakdownStep } from "./steps/PricingBreakdownStep"
import { ReviewStep } from "./steps/ReviewStep"
import { Button } from "@/components/ui/button"

type FormData = {
  title: string
  description: string
  date: string
  time: string
  location: string
  price: string
  totalSupply: string
}

export function CreateEventForm() {
  const router = useRouter()
  const { createTicket, isPending, isConfirming, isConfirmed, error } = useEventTicketingSetters()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    totalSupply: ""
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const steps = [
    { id: 1, name: 'Event Details', status: 'current' as const },
    { id: 2, name: 'Ticket Setup', status: 'upcoming' as const },
    { id: 3, name: 'Pricing', status: 'upcoming' as const },
    { id: 4, name: 'Review', status: 'upcoming' as const },
  ]

  const updatedSteps = steps.map((step, index) => {
    if (index < currentStep) {
      return { ...step, status: 'complete' as const }
    } else if (index === currentStep) {
      return { ...step, status: 'current' as const }
    } else {
      return { ...step, status: 'upcoming' as const }
    }
  })

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {}
    
    if (step === 0) {
      if (!formData.title.trim()) newErrors.title = "Title is required"
      if (!formData.description.trim()) newErrors.description = "Description is required"
      if (!formData.date) newErrors.date = "Date is required"
      if (!formData.time) newErrors.time = "Time is required"
      if (!formData.location.trim()) newErrors.location = "Location is required"
    } else if (step === 1) {
      const price = parseFloat(formData.price)
      const totalSupply = parseInt(formData.totalSupply)
      
      if (isNaN(price) || price < 0) {
        newErrors.price = "Please enter a valid price greater than 0"
      }
      
      if (isNaN(totalSupply) || totalSupply <= 0) {
        newErrors.totalSupply = "Please enter a valid number of tickets"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (!validateStep(currentStep)) return
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return
    
    try {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`)
      
      await createTicket(
        BigInt(Math.floor(parseFloat(formData.price) * 10 ** 18)),
        formData.title,
        formData.description,
        BigInt(Math.floor(eventDateTime.getTime() / 1000)),
        BigInt(parseInt(formData.totalSupply)),
        JSON.stringify({
          date: formData.date,
          time: formData.time,
          location: formData.location
        }),
        formData.location
      )
      
      // Success handling is done via the isConfirmed effect
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("Failed to create event. Please try again.")
    }
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }))
  }

  // Handle successful creation
  if (isConfirmed) {
    router.push("/profile")
    return null
  }

  return (
    <div className="space-y-8">
      <EventFormProgress steps={updatedSteps} />
      
      <div className="mt-8">
        {currentStep === 0 && (
          <EventDetailsStep 
            data={formData} 
            onChange={updateFormData} 
            errors={errors} 
          />
        )}
        
        {currentStep === 1 && (
          <TicketSetupStep 
            data={formData} 
            onChange={updateFormData} 
            errors={errors} 
          />
        )}
        
        {currentStep === 2 && <PricingBreakdownStep data={formData} />}
        {currentStep === 3 && <ReviewStep data={formData} />}
        
        <div className="mt-10 flex justify-between border-t border-[#a1a1a1]/30 pt-6">
          {currentStep > 0 ? (
            <Button
              type="button"
              onClick={prevStep}
              variant="outline"
              className="border-[#a1a1a1]/30 text-[#51a2ff] hover:bg-[#1c398e]/20 hover:border-[#51a2ff]/50"
              disabled={isPending || isConfirming}
            >
              Back
            </Button>
          ) : (
            <div />
          )}
          
          <div className="space-x-3">
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-[#51a2ff] hover:bg-[#3a8cff] text-white"
                disabled={isPending || isConfirming}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-[#51a2ff] hover:bg-[#3a8cff] text-white"
                disabled={isPending || isConfirming}
              >
                {isPending || isConfirming ? 'Creating Event...' : 'Create Event'}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error.message || 'An error occurred while creating the event. Please try again.'}
        </div>
      )}
      
      {isConfirmed && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 text-sm">
          Event created successfully! Redirecting to your event...
        </div>
      )}
    </div>
  )
}
