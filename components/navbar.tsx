"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="text-lg md:text-xl font-bold">
            SUMA BARBER
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/" className="text-sm md:text-base hover:text-primary transition-colors">HOME</Link>
            <Link href="/maintenance" className="text-sm md:text-base hover:text-primary transition-colors">BOOKING</Link>
            <Link href="/locations" className="text-sm md:text-base hover:text-primary transition-colors">LOCATIONS</Link>
            <Link href="/work-with-us" className="text-sm md:text-base hover:text-primary transition-colors">WORK WITH US</Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`
            md:hidden 
            absolute left-0 right-0 
            bg-background/95 backdrop-blur-sm
            border-b
            transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
          `}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-sm py-2 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                HOME
              </Link>
              <Link
                href="/maintenance"
                className="text-sm py-2 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                BOOKING
              </Link>
              <Link
                href="/locations"
                className="text-sm py-2 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                LOCATIONS
              </Link>
              <Link
                href="/work-with-us"
                className="text-sm py-2 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                WORK WITH US
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}