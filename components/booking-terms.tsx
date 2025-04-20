"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface BookingTermsProps {
  onAccept: (accepted: boolean) => void
}

export function BookingTerms({ onAccept }: BookingTermsProps) {
  const [accepted, setAccepted] = useState(false)

  const handleAcceptChange = (checked: boolean) => {
    setAccepted(checked)
    onAccept(checked)
  }

  return (
    <Card className="p-6 bg-muted/5">
      <div className="flex items-start gap-4 mb-6">
        <AlertCircle className="h-5 w-5 text-primary mt-1" />
        <div>
          <h3 className="font-semibold mb-2">Booking Terms & Conditions</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Arrive within 15 minutes of your booking time or your reservation may be forfeited</li>
            <li>• Changes or cancellations must be made at least 1 hour in advance</li>
            <li>• Check in with the cashier upon arrival to validate your booking</li>
            <li>• Service delays may occur based on real-time conditions</li>
            <li>• Contact customer service if online schedule is fully booked</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="terms" 
          checked={accepted}
          onCheckedChange={handleAcceptChange}
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I accept the booking terms and conditions
        </label>
      </div>
    </Card>
  )
}