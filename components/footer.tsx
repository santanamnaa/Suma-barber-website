import Link from "next/link"
import { Instagram } from "lucide-react"
import { SiTiktok } from 'react-icons/si'
import { ThemeToggle } from "@/components/theme-toggle"

export function Footer() {
  return (
    <footer className="mt-24 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Column 1 */}
          <div>
            <h3 className="text-lg font-semibold">Suma Barber</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium grooming services for the modern gentleman.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-foreground">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-muted-foreground hover:text-foreground">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/locations" className="text-muted-foreground hover:text-foreground">
                  Locations
                </Link>
              </li>
              <li>
                <Link href="http://localhost:8080/" className="text-muted-foreground hover:text-foreground">
                  Our Company Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="text-muted-foreground">
                Phone:{' '}
                <a
                  href="https://wa.me/6287725241193"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  +62 877 2524 1193
                </a>
              </li>
              <li className="text-muted-foreground">
                Email:{' '}
                <a
                  href="mailto:sumabarber@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  sumabarber@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="mt-4 flex space-x-4">
              <a href="https://instagram.com/sumabarber" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://tiktok.com/@sumaofficial_" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <SiTiktok className="h-5 w-5" />
              </a>
            </div>

            {/* Theme Toggle inserted here under social */}
            <div className="mt-6">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Suma Barber. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
