import Link from "next/link"
import { Instagram, BookOpen as TiktokIcon } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-24 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">Suma Barber</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium grooming services for the modern gentleman.
            </p>
          </div>
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
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="text-muted-foreground">123 Barber Street</li>
              <li className="text-muted-foreground">City, State 12345</li>
              <li className="text-muted-foreground">Phone: (555) 123-4567</li>
              <li className="text-muted-foreground">Email: info@sumabarber.com</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="mt-4 flex space-x-4">
              <a href="https://instagram.com/sumabarber" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://tiktok.com/@sumaofficial_" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <TiktokIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Suma Barber. All rights reserved.
        </div>
      </div>
    </footer>
  )
}