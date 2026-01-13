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
  // currentStep: number
  className?: string
}

export function EventFormProgress({ 
  steps,
  // currentStep,
  className }: EventFormProgressProps) {
  return (
    <nav className={cn("w-full", className)} aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li 
            key={step.name} 
            className={cn(
              stepIdx !== steps.length - 1 ? 'flex-1' : '',
              'relative',
              'group',
              'flex flex-col items-center'
            )}
          >
            {step.status === 'complete' ? (
              <>
                <div className="absolute left-0 top-5 w-full h-0.5 bg-[#51a2ff]" aria-hidden="true" />
                <div className="relative flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#51a2ff] group-hover:bg-[#3a8cff] transition-colors">
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </div>
                  <span className="mt-2 text-sm font-medium text-white">{step.name}</span>
                </div>
              </>
            ) : step.status === 'current' ? (
              <>
                <div className="absolute left-0 top-5 w-full h-0.5 bg-[#1c398e]/30" aria-hidden="true" />
                <div className="relative flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#51a2ff] bg-[#0f172b]">
                    <span className="text-[#51a2ff]">{step.id}</span>
                    <span className="sr-only">{step.name}</span>
                  </div>
                  <span className="mt-2 text-sm font-medium text-white">{step.name}</span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute left-0 top-5 w-full h-0.5 bg-[#1c398e]/30" aria-hidden="true" />
                <div className="relative flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#1c398e]/30 bg-[#0f172b] group-hover:border-[#1c398e]/50 transition-colors">
                    <span className="text-[#a1a1a1] group-hover:text-white">{step.id}</span>
                    <span className="sr-only">{step.name}</span>
                  </div>
                  <span className="mt-2 text-sm font-medium text-[#a1a1a1] group-hover:text-white transition-colors">
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
