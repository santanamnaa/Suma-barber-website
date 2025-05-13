// app/discover/layout.tsx
import Link from 'next/link'
import { User, Droplet, Scissors, Heart } from 'lucide-react'

export const metadata = {
  title: 'Discover Hair Education • Suma Barber',
}

const navItems = [
  { 
    slug: 'face-shape', 
    title: 'Face Shape', 
    icon: User 
  },
  { 
    slug: 'hair-type', 
    title: 'Hair Type', 
    icon: Droplet 
  },
  { 
    slug: 'hairstyle', 
    title: 'Hair Style', 
    icon: Scissors 
  },
  { 
    slug: 'maintenance', 
    title: 'Maintenance', 
    icon: Heart 
  },
]

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-12 text-center tracking-tight">
          Discover Hair Education
        </h1>
        
        <nav className="flex mb-16 gap-3 md:gap-4 overflow-x-auto md:overflow-visible px-1 -mx-1 md:mx-0 scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.slug}
              href={`/discover/${item.slug}`}
              className="group flex items-center gap-2 px-3 py-2 md:px-4 rounded-xl min-w-fit whitespace-nowrap bg-card hover:bg-primary/10 border border-border transition-all duration-300 hover:shadow-lg"
            >
              <item.icon 
                className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" 
              />
              <span className="font-medium group-hover:text-primary transition-colors">
                {item.title}
              </span>
            </Link>
          ))}
        </nav>
        
        <div className="animate-fade-in">{children}</div>
      </div>
    </section>
  )
}