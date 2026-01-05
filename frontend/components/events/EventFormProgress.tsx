"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = {
  id: number
  name: string
  status: 'complete' | 'current' | 'upcoming'
}

type EventFormProgressProps = {
  steps: Step[]
  currentStep: number
  className?: string
}

export function EventFormProgress({ steps, currentStep, className }: EventFormProgressProps) {
  return (
    <nav className={cn("w-full", className)} aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li 
            key={step.name} 
            className={cn(
              stepIdx !== steps.length - 1 ? 'flex-1' : '',
              'relative',
              'group'
            )}
          >
            {step.status === 'complete' ? (
              <>
                <div className="absolute left-0 top-0 flex h-10 w-full items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-[#51a2ff]" />
                </div>
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#51a2ff] group-hover:bg-[#3a8cff] transition-colors">
                  <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </div>
                <div className="mt-2 text-center">
                  <span className="text-sm font-medium text-white">{step.name}</span>
                </div>
              </>
            ) : step.status === 'current' ? (
              <>
                <div className="absolute left-0 top-0 flex h-10 w-full items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-[#1c398e]/30" />
                </div>
                <div 
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#51a2ff] bg-[#0f172b]"
                  aria-current="step"
                >
                  <span className="text-[#51a2ff]">{step.id}</span>
                  <span className="sr-only">{step.name}</span>
                </div>
                <div className="mt-2 text-center">
                  <span className="text-sm font-medium text-white">{step.name}</span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute left-0 top-0 flex h-10 w-full items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-[#1c398e]/30" />
                </div>
                <div className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#1c398e]/30 bg-[#0f172b] group-hover:border-[#1c398e]/50 transition-colors">
                  <span className="text-[#a1a1a1] group-hover:text-white">{step.id}</span>
                  <span className="sr-only">{step.name}</span>
                </div>
                <div className="mt-2 text-center">
                  <span className="text-sm font-medium text-[#a1a1a1] group-hover:text-white transition-colors">
                    {step.name}
                  </span>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export const STEPS = [
  {
    id: 1,
    name: 'Event Details',
    status: 'upcoming'
  },
  {
    id: 2,
    name: 'Ticket Setup',
    status: 'upcoming'
  },
  {
    id: 3,
    name: 'Review & Create',
    status: 'upcoming'
  },
]
