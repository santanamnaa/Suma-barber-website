"use client"

import {useRef, useEffect, useState, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Card } from "@/components/ui/card"
import { Quote } from "lucide-react"

const testimonials = [
    {
      name: "Maliki Somma",
      role: "",
      image: "/images/testimonials/maliki-somma.jpg",
      content: "Potongan rambutnya detail dan presisi sekali. Pengalaman barbershop terbaik yang pernah saya rasakan!"
    },
    {
      name: "Kevin Faulky",
      role: "",
      image: "/images/testimonials/kevin-faulky.jpeg",
      content: "Ahli dalam gaya potongan Korea—mereka paham tren masa kini dan hasilnya selalu memuaskan sekali."
    },
    {
      name: "Nadhif Herdian",
      role: "",
      image: "/images/testimonials/nadhif-herdian.jpg",
      content: "Perpaduan teknik barbering UK dan Korea menciptakan gaya unik yang sulit ditemukan di tempat lain."
    },
    {
      name: "Rayhan Aldi",
      role: "",
      image: "/images/testimonials/rayhan-aldi.jpeg",
      content: "Layanan ramah dan suasana santainya bikin nyaman. Potongan rambut selalu sesuai ekspektasi!"
    },
    {
      name: "Santana Mena",
      role: "",
      image: "/images/testimonials/santana-mena.jpeg",
      content: "Capster-nya profesional dan hasilnya rapi. Saya selalu puas setiap kali berkunjung ke Suma Barber."
    },
    {
      name: "Alex Johnson",
      role: "Frontend Engineer",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      content: "Amazing service! The attention to detail is unmatched. Highly recommend for anyone looking for professional grooming."
    },
    {
      name: "Sophia Martinez",
      role: "Marketing Specialist",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      content: "Suma Barber delivers consistent quality. I always walk out feeling more confident and polished!"
    },
    {
      name: "Ethan Williams",
      role: "Product Designer",
      image: "https://randomuser.me/api/portraits/men/76.jpg",
      content: "Professional, friendly, and skillful barbers. The ambiance is relaxing, and the final result is always top-notch."
    },
    {
      name: "Olivia Brown",
      role: "Entrepreneur",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      content: "The best haircut experience I've ever had! Highly skilled team and beautiful space. Can't wait for my next visit."
    },
    {
      name: "Liam Davis",
      role: "Software Developer",
      image: "https://randomuser.me/api/portraits/men/85.jpg",
      content: "Their attention to hair texture and style trends is fantastic. You can tell they genuinely care about their clients."
    },
    {
      name: "Mia Wilson",
      role: "UX Researcher",
      image: "https://randomuser.me/api/portraits/women/21.jpg",
      content: "Top-notch experience! From consultation to the final style, everything was done with care and professionalism."
    },
    {
      name: "Noah Anderson",
      role: "Financial Analyst",
      image: "https://randomuser.me/api/portraits/men/47.jpg",
      content: "Incredible service! They understand modern trends and personalize the cut according to my face shape."
    },
    {
      name: "Ava Thomas",
      role: "HR Manager",
      image: "https://randomuser.me/api/portraits/women/53.jpg",
      content: "The barbers are welcoming, skilled, and listen carefully to what you want. I always leave looking sharp!"
    },
    {
      name: "William Garcia",
      role: "Startup Founder",
      image: "https://randomuser.me/api/portraits/men/90.jpg",
      content: "Exceptional skills and friendly service. They pay attention to the little details that truly make the difference."
    },
    {
      name: "Isabella Moore",
      role: "Creative Director",
      image: "https://randomuser.me/api/portraits/women/62.jpg",
      content: "Every visit feels like a refresh. Their precision and artistry keep me coming back."
    },
    {
      name: "Maliki Somma",
      role: "",
      image: "/images/testimonials/maliki-somma.jpg",
      content: "Potongan rambutnya detail dan presisi sekali. Pengalaman barbershop terbaik yang pernah saya rasakan!"
    },
    {
      name: "Kevin Faulky",
      role: "",
      image: "/images/testimonials/kevin-faulky.jpeg",
      content: "Ahli dalam gaya potongan Korea—mereka paham tren masa kini dan hasilnya selalu memuaskan sekali."
    },
    {
      name: "Nadhif Herdian",
      role: "",
      image: "/images/testimonials/nadhif-herdian.jpg",
      content: "Perpaduan teknik barbering UK dan Korea menciptakan gaya unik yang sulit ditemukan di tempat lain."
    },
    {
      name: "Rayhan Aldi",
      role: "",
      image: "/images/testimonials/rayhan-aldi.jpeg",
      content: "Layanan ramah dan suasana santainya bikin nyaman. Potongan rambut selalu sesuai ekspektasi!"
    },
    {
      name: "Santana Mena",
      role: "",
      image: "/images/testimonials/santana-mena.jpeg",
      content: "Capster-nya profesional dan hasilnya rapi. Saya selalu puas setiap kali berkunjung ke Suma Barber."
    },
    {
      name: "Alex Johnson",
      role: "Frontend Engineer",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      content: "Amazing service! The attention to detail is unmatched. Highly recommend for anyone looking for professional grooming."
    },
    {
      name: "Sophia Martinez",
      role: "Marketing Specialist",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      content: "Suma Barber delivers consistent quality. I always walk out feeling more confident and polished!"
    },
    {
      name: "Ethan Williams",
      role: "Product Designer",
      image: "https://randomuser.me/api/portraits/men/76.jpg",
      content: "Professional, friendly, and skillful barbers. The ambiance is relaxing, and the final result is always top-notch."
    },
    {
      name: "Olivia Brown",
      role: "Entrepreneur",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      content: "The best haircut experience I've ever had! Highly skilled team and beautiful space. Can't wait for my next visit."
    },
    {
      name: "Liam Davis",
      role: "Software Developer",
      image: "https://randomuser.me/api/portraits/men/85.jpg",
      content: "Their attention to hair texture and style trends is fantastic. You can tell they genuinely care about their clients."
    },
    {
      name: "Mia Wilson",
      role: "UX Researcher",
      image: "https://randomuser.me/api/portraits/women/21.jpg",
      content: "Top-notch experience! From consultation to the final style, everything was done with care and professionalism."
    },
    {
      name: "Noah Anderson",
      role: "Financial Analyst",
      image: "https://randomuser.me/api/portraits/men/47.jpg",
      content: "Incredible service! They understand modern trends and personalize the cut according to my face shape."
    },
    {
      name: "Ava Thomas",
      role: "HR Manager",
      image: "https://randomuser.me/api/portraits/women/53.jpg",
      content: "The barbers are welcoming, skilled, and listen carefully to what you want. I always leave looking sharp!"
    },
    {
      name: "William Garcia",
      role: "Startup Founder",
      image: "https://randomuser.me/api/portraits/men/90.jpg",
      content: "Exceptional skills and friendly service. They pay attention to the little details that truly make the difference."
    },
    {
      name: "Isabella Moore",
      role: "Creative Director",
      image: "https://randomuser.me/api/portraits/women/62.jpg",
      content: "Every visit feels like a refresh. Their precision and artistry keep me coming back."
    }
]

export function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [columnCount, setColumnCount] = useState(5)

  const getColumnCount = () => {
    const width = window.innerWidth
    if (width < 640) return 1
    if (width < 768) return 2
    if (width < 1024) return 3
    return 5
  }

  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount())
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const columnContainers = Array.from(container.querySelectorAll<HTMLElement>(".column"))
    const speeds = columnContainers.map((_, i) => (i % 2 === 0 ? 0.3 : -0.3))

    let rafId: number

    const autoScroll = () => {
      columnContainers.forEach((col, idx) => {
        const isHovered = hoveredIndex !== null && Math.floor(hoveredIndex / 6) === idx
        if (isHovered) return

        col.scrollTop += speeds[idx]
        if (speeds[idx] > 0 && col.scrollTop >= col.scrollHeight - col.clientHeight) {
          col.scrollTop = 0
        }
        if (speeds[idx] < 0 && col.scrollTop <= 0) {
          col.scrollTop = col.scrollHeight - col.clientHeight
        }
      })
      rafId = requestAnimationFrame(autoScroll)
    }

    rafId = requestAnimationFrame(autoScroll)
    return () => cancelAnimationFrame(rafId)
  }, [hoveredIndex])

  // Duplikasikan data untuk efek looping
  const loopedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="relative py-8 overflow-hidden bg-background">
      {/* Gradient masks */}
      <div className="pointer-events-none absolute top-0 h-32 w-full bg-gradient-to-b from-background via-background/80 to-transparent z-20" />
      <div className="pointer-events-none absolute bottom-0 h-32 w-full bg-gradient-to-t from-background via-background/80 to-transparent z-20" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-20" />
      <div className="pointer-events-none absolute right-0 top-0 h-full bg-gradient-to-l from-background via-background/80 to-transparent z-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="relative flex justify-center items-center">
          <div
            className="absolute inset-0 mx-auto my-auto max-w-7xl h-[800px] rounded-full
                       bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]
                       from-muted/30 via-muted/10 to-transparent
                       dark:from-white/10 dark:via-white/5 dark:to-transparent
                       blur-3xl opacity-50 pointer-events-none animate-slow-pulse z-0"
          />

          <div
            ref={containerRef}
            className="flex gap-6 overflow-hidden h-[600px] relative z-10"
          >
            {[...Array(columnCount)].map((_, colIndex) => (
              <div
                key={colIndex}
                className="column flex flex-col gap-6 w-[300px] overflow-hidden"
                onMouseMove={(e) => {
                  setMousePos({
                    x: e.nativeEvent.offsetX,
                    y: e.nativeEvent.offsetY,
                  })
                }}
              >
                {loopedTestimonials
                  .slice(colIndex * 6, colIndex * 6 + 10) // ambil lebih banyak untuk looping
                  .map((testimonial, index) => {
                    const globalIndex = colIndex * 6 + index
                    return (
                      <Card
                        key={globalIndex}
                        onMouseEnter={() => {
                          if (selectedIndex === null) setHoveredIndex(globalIndex)
                        }}
                        onMouseLeave={() => {
                          if (selectedIndex === null) setHoveredIndex(null)
                        }}
                        onClick={() => {
                          setSelectedIndex(globalIndex === selectedIndex ? null : globalIndex)
                          setHoveredIndex(null)
                        }}
                        className="relative flex flex-col p-6 rounded-2xl border border-border bg-background/80 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                      >
                        {(hoveredIndex === globalIndex || selectedIndex === globalIndex) && (
                          <div
                            className="pointer-events-none absolute inset-0 rounded-2xl blur-2xl opacity-60 animate-pulse-glow"
                            style={{
                              background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.4), transparent 40%)`,
                            }}
                          />
                        )}

                        <Quote className="h-6 w-6 text-primary mb-4 relative z-10" />
                        <p className="text-sm text-muted-foreground mb-6 relative z-10">
                          {testimonial.content}
                        </p>
                        <div className="flex items-center gap-4 mt-auto relative z-10">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-10 h-10 rounded-full object-cover border border-primary"
                          />
                          <div>
                            <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}