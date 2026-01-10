"use client"

import { Calendar, MapPin, FileText, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type EventDetails = {
  title: string
  description: string
  date: string
  time: string
  location: string
}

type EventDetailsStepProps = {
  data: EventDetails
  onChange: (data: Partial<EventDetails>) => void
  errors?: Partial<Record<keyof EventDetails, string>>
  className?: string
}

export function EventDetailsStep({ data, onChange, errors = {}, className }: EventDetailsStepProps) {
  const handleChange = (field: keyof EventDetails, value: string) => {
    onChange({ [field]: value })
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[#51a2ff]">Event Information</h2>
        <p className="text-sm text-[#a1a1a1]">Tell us about your event</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-[#ffffff]">Event Title *</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#51a2ff]" />
            <Input
              id="title"
              placeholder="Enter event title"
              className={cn("pl-10 bg-[#0f172b] text-white border-[#a1a1a1] placeholder-[#a1a1a1]", errors.title && "border-destructive")}
              value={data.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-[#ffffff]">Description *</Label>
          <Textarea
            id="description"
            placeholder="Tell people what your event is about..."
            className={cn("min-h-[120px] bg-[#0f172b] text-white", errors.description && "border-destructive")}
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-[#ffffff]">Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#51a2ff]" />
              <Input
                id="date"
                type="date"
                className={cn("pl-10 bg-[#0f172b] text-white border-[#a1a1a1] placeholder-[#a1a1a1]", errors.date && "border-destructive")}
                value={data.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
            {errors.date && <p className="text-sm text-destructive mt-1">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="text-[#ffffff]">Time *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#51a2ff]" />
              <Input
                id="time"
                type="time"
                className={cn("pl-10 bg-[#0f172b] text-white border-[#a1a1a1] placeholder-[#a1a1a1]", errors.time && "border-destructive")}
                value={data.time}
                onChange={(e) => handleChange('time', e.target.value)}
              />
            </div>
            {errors.time && <p className="text-sm text-destructive mt-1">{errors.time}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-[#ffffff]">Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#51a2ff]" />
            <Input
              id="location"
              placeholder="Where is your event?"
              className={cn("pl-10 bg-[#0f172b] text-white border-[#a1a1a1] placeholder-[#a1a1a1]", errors.location && "border-destructive")}
              value={data.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>
          {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
        </div>
      </div>
    </div>
  )
}
