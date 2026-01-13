"use client"

import { useState, useEffect } from "react"
import { Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import QRCode from 'qrcode'
import Image from 'next/image'

type QrCodeModalProps = {
  ticket: {
    id: string
    eventTitle: string
    qrCode: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export function QrCodeModal({ ticket, isOpen, onClose }: QrCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!ticket) return
    
    const generateQrCode = async () => {
      try {
        setIsLoading(true)
        const dataUrl = await QRCode.toDataURL(ticket.qrCode, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        })
        setQrCodeDataUrl(dataUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
        toast.error('Failed to generate QR code')
      } finally {
        setIsLoading(false)
      }
    }

    generateQrCode()
  }, [ticket])

  const handleCopyLink = () => {
    if (!ticket) return
    
    navigator.clipboard.writeText(ticket.qrCode)
    setCopied(true)
    toast.success('Ticket code copied to clipboard')
    
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!qrCodeDataUrl) return
    
    const link = document.createElement('a')
    link.download = `ticket-${ticket?.id || 'qr'}.png`
    link.href = qrCodeDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!ticket) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Your Ticket</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="text-center">
            <h3 className="text-lg font-medium">{ticket.eventTitle}</h3>
            <p className="text-sm text-muted-foreground">Ticket ID: {ticket.id}</p>
          </div>
          
          <div className="relative p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 w-64 h-64 flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            ) : qrCodeDataUrl ? (
              <Image 
                src={qrCodeDataUrl} 
                alt="Ticket QR Code" 
                width={240}
                height={240}
                className="object-contain"
                priority
              />
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                Failed to generate QR code
              </div>
            )}
          </div>
          
          <div className="w-full space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                value={ticket?.qrCode || ''} 
                readOnly 
                className="flex-1" 
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={handleCopyLink}
                disabled={!ticket?.qrCode}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy link</span>
              </Button>
            </div>
            <Button 
              type="button" 
              className="w-full"
              onClick={handleDownload}
              disabled={isLoading || !qrCodeDataUrl}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center pt-2">
            <p>Present this QR code at the event entrance for verification.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
