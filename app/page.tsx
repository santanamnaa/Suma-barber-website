"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Instagram, BookOpen as TiktokIcon, Scissors, Clock, Award, Users } from "lucide-react"
import { SocialFeed } from "@/components/social-feed"
import { Testimonials } from "@/components/testimonials"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [particles, setParticles] = useState<Array<{ position: number }>>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        position: Math.random() * 100
      }))
    )
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const hero = document.querySelector('.hero-section')
      if (!hero) return

      const rect = hero.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const team = [
    {
      name: "Master Kim",
      role: "Senior Barber",
      specialty: "Korean Style Expert",
      image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80",
      certifications: ["London School of Barbering", "JUNO Academy Korea"]
    },
    {
      name: "James Wilson",
      role: "Senior Barber",
      specialty: "Classic Cuts Specialist",
      image: "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&q=80",
      certifications: ["Menspire Academy London"]
    },
    {
      name: "Alex Thompson",
      role: "Style Director",
      specialty: "Color & Styling",
      image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80",
      certifications: ["Vidal Sassoon Academy"]
    }
  ]

  const services = [
    { name: "Korean Style Cut", price: "250K", duration: "60 mins" },
    { name: "Classic Haircut", price: "200K", duration: "45 mins" },
    { name: "Beard Trim", price: "150K", duration: "30 mins" },
    { name: "Hair Color", price: "500K", duration: "120 mins" },
    { name: "Hair Treatment", price: "350K", duration: "60 mins" },
    { name: "Scalp Treatment", price: "300K", duration: "45 mins" }
  ]

  const whyUs = [
    {
      icon: <Scissors className="h-6 w-6" />,
      title: "Expert Barbers",
      description: "Internationally certified barbers with expertise in both UK and Korean styles"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Premium Experience",
      description: "Relaxing atmosphere and personalized service for every client"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Quality Products",
      description: "We use only the finest professional hair care products"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Satisfied Clients",
      description: "Join our community of happy, returning customers"
    }
  ]

  const featuredGallery = [
    {
      url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80",
      caption: "Classic Fade Cut"
    },
    {
      url: "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&q=80",
      caption: "Modern Pompadour"
    },
    {
      url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80",
      caption: "Textured Crop"
    },
    {
      url: "https://images.unsplash.com/photo-1593702295094-ac9a262f7c36?auto=format&fit=crop&q=80",
      caption: "Clean Fade"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div 
            className="hero-section relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 cursor-pointer transform transition-transform duration-500 hover:scale-[1.02]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              '--mouse-x': `${mousePosition.x}%`,
              '--mouse-y': `${mousePosition.y}%`,
            } as React.CSSProperties}
          >
            {/* Dynamic gradient overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-teal-500/20 animate-gradient-shift mix-blend-overlay"
              style={{
                transform: isHovering ? `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px)` : 'none'
              }}
            />
            
            {/* Interactive particles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="particles-container">
                {particles.map((particle, i) => (
                  <div
                    key={i}
                    className={`particle ${isHovering ? 'particle-hover' : ''}`}
                    style={{
                      '--delay': `${i * 0.5}s`,
                      '--position': `${particle.position}%`,
                      transform: isHovering 
                        ? `translate(${(mousePosition.x - 50) * 0.2}px, ${(mousePosition.y - 50) * 0.2}px)`
                        : 'none'
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            </div>

            {/* Interactive content overlay */}
            <div 
              className="absolute inset-0 flex items-center justify-center transform transition-transform duration-500"
              style={{
                transform: isHovering 
                  ? `translate(${(mousePosition.x - 50) * 0.05}px, ${(mousePosition.y - 50) * 0.05}px)`
                  : 'none'
              }}
            >
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-4 transform transition-all duration-500 hover:scale-110">
                  Premium Cuts
                </h2>
                <p className="text-lg opacity-80 transform transition-all duration-500">
                  Experience the difference
                </p>
              </div>
            </div>

            {/* Spotlight effect */}
            <div 
              className="absolute inset-0 pointer-events-none spotlight"
              style={{
                background: isHovering 
                  ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                  : 'none'
              }}
            />
          </div>
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
              HOME
              <br />
              OF
              <br />
              THE UK
              <br />
              &KOREA
              <br />
              CERTIFIED
              <br />
              BARBERS
            </h1>
          </div>
        </div>
      </div>

      {/* Brief Intro */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-2xl font-bold mb-8">A BRIEF INTRO</h2>
        <div className="max-w-3xl text-xl leading-relaxed">
          <p>
            Suma Barber are the grooming specialists for men of good taste. With our passion in the barbering world, 
            we form the foundations of the quality haircut and ultimate grooming experience. Having the certificate 
            of distinction from the <span className="font-semibold">London School of Barbering</span> (London), 
            <span className="font-semibold"> Menspire Academy</span> (London) and 
            <span className="font-semibold"> JUNO Academy</span> (Korea), we knew we're going to bring something 
            new to the table. In 2023, we established our first shop in the heart of the city. 
          </p>
          <p className="mt-8 text-2xl font-bold">See you soon!</p>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="container mx-auto px-4 py-24 bg-accent/5">
        <h2 className="text-2xl font-bold mb-12 text-center">WHY CHOOSE US</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyUs.map((item, index) => (
            <Card key={index} className="p-6 bg-card hover:bg-accent/5 transition-colors duration-300">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Price List Section */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-2xl font-bold mb-12 text-center">OUR SERVICES</h2>
        <div className="max-w-3xl mx-auto grid gap-4">
          {services.map((service, index) => (
            <Card key={index} className="p-6 flex justify-between items-center hover:bg-accent/5 transition-colors duration-300">
              <div>
                <h3 className="text-xl font-semibold">{service.name}</h3>
                <p className="text-sm text-muted-foreground">{service.duration}</p>
              </div>
              <p className="text-xl font-bold">Rp {service.price}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="container mx-auto px-4 py-24 bg-accent/5">
        <h2 className="text-2xl font-bold mb-12 text-center">MEET OUR TEAM</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="overflow-hidden group">
              <div className="relative aspect-square">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-primary">{member.role}</p>
                <p className="text-sm text-muted-foreground mt-1">{member.specialty}</p>
                <div className="mt-4 space-y-1">
                  {member.certifications.map((cert, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {cert}</p>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-2xl font-bold mb-12 text-center">OUR GALLERY</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredGallery.map((image, index) => (
            <Card 
              key={index} 
              className="group overflow-hidden"
            >
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={image.caption}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white font-medium">{image.caption}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button 
            asChild 
            variant="outline"
            size="lg"
            className="group"
          >
            <Link href="/gallery">
              View Full Gallery
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Social Media Feed */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-2xl font-bold mb-12">FOLLOW OUR JOURNEY</h2>
        <SocialFeed />
      </section>

      {/* Locations */}
      <section className="container mx-auto px-4 py-0">
        <h2 className="text-2xl font-bold mb-12">CLICK THE SHOP YOU WANT TO VISIT</h2>
        <div className="space-y-8">
          {[
            { id: "01", name: "DOWNTOWN", area: "CENTRAL" },
            { id: "02", name: "WESTSIDE", area: "WEST" },
            { id: "03", name: "EASTGATE", area: "EAST" }
          ].map((location) => (
            <Link 
              href={`/locations/${location.name.toLowerCase()}`} 
              key={location.id}
              className="group block"
            >
              <div className="flex items-center space-x-4 py-4 border-t border-foreground">
                <span className="text-sm opacity-60">{location.id}</span>
                <span className="text-2xl font-bold">{location.name},</span>
                <span className="text-2xl">{location.area}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}