"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed w-full z-50 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            SUMA BARBER
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/" className="hover:opacity-60">HOME</Link>
            <Link href="/services" className="hover:opacity-60">SERVICES</Link>
            <Link href="/locations" className="hover:opacity-60">LOCATIONS</Link>
            {/* <Link href="/work-with-us" className="hover:opacity-60">WORK WITH US</Link> */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-20 bg-background border-t p-4 md:hidden">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="hover:opacity-60"
                onClick={() => setIsOpen(false)}
              >
                HOME
              </Link>
              <Link
                href="/services"
                className="hover:opacity-60"
                onClick={() => setIsOpen(false)}
              >
                SERVICES
              </Link>
              <Link
                href="/locations"
                className="hover:opacity-60"
                onClick={() => setIsOpen(false)}
              >
                LOCATIONS
              </Link>
              <Link
                href="/work-with-us"
                className="hover:opacity-60"
                onClick={() => setIsOpen(false)}
              >
                WORK WITH US
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}