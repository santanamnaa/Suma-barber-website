'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

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
          <h3 className="text-lg font-semibold mb-3">Syarat & Ketentuan Pemesanan</h3>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Harap datang dalam waktu <strong>15 menit</strong> dari waktu pemesanan Anda, atau reservasi akan dibatalkan.</li>
            <li>Perubahan atau pembatalan harus dilakukan setidaknya <strong>1 jam</strong> sebelumnya.</li>
            <li>Lakukan check-in dengan kasir saat kedatangan untuk memvalidasi pemesanan Anda.</li>
            <li>Keterlambatan layanan mungkin terjadi tergantung pada kondisi saat itu.</li>
            <li>
              Jika jadwal di website sudah penuh, hubungi customer service untuk memastikan ketersediaan lainnya:&nbsp;
              <a
                href="https://linktr.ee/sumabarberofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                klik di sini
              </a>
            </li>
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
          className="text-sm font-medium leading-none"
        >
          Saya menerima syarat dan ketentuan booking
        </label>
      </div>
    </Card>
  )
}
