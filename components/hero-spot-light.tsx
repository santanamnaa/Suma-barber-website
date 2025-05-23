// components/HeroSpotlight.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

export function HeroSpotlight() {
  const [hover, setHover] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPos({ x, y })
  }

  return (
    <div
      className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl"
      onMouseEnter={() => setHover(true)}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setHover(false)}
    >
      {/* Base image */}
      <Image
        src="/images/places/geger-1.webp"
        alt="Suma Barber Front"
        fill
        className="object-cover"
      />

      {/* Dim overlay + spotlight hole */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          hover ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(
            circle at ${pos.x}% ${pos.y}%,
            transparent 0%,
            transparent 20%,
            rgba(0,0,0,0.85) 60%,
            rgba(0,0,0,0.85) 100%
          )`,
        }}
      />
    </div>
  )
}
