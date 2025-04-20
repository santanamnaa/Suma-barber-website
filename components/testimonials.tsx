"use client"

import { useState, useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const testimonials = [
  {
    name: "Alex Thompson",
    role: "Regular Client",
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&auto=format&fit=crop",
    content: "The attention to detail and precision in every cut is remarkable. Best barbershop experience I've ever had!"
  },
  {
    name: "James Wilson",
    role: "Style Enthusiast",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&auto=format&fit=crop",
    content: "Their expertise in Korean style cuts is unmatched. They truly understand modern trends and deliver exactly what you want."
  },
  {
    name: "Michael Chen",
    role: "Fashion Blogger",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&auto=format&fit=crop",
    content: "The blend of UK and Korean barbering techniques creates unique styles you can't find anywhere else."
  }
]

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    dragFree: true,
    containScroll: "trimSnaps"
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setPrevBtnEnabled(emblaApi.canScrollPrev())
    setNextBtnEnabled(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  return (
    <section className="py-24 overflow-hidden bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-12 text-center">WHAT OUR CLIENTS SAY</h2>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <Card 
                    className={`
                      group relative p-8 h-full bg-card transition-all duration-500 ease-out
                      hover:bg-accent hover:scale-105 hover:shadow-xl
                      ${selectedIndex === index ? 'ring-2 ring-primary/20' : ''}
                    `}
                  >
                    {/* Animated gradient border */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 
                        group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"
                      style={{
                        transform: `rotate(${index * 120}deg)`
                      }}
                    />

                    <Quote className={`
                      h-8 w-8 mb-6 transition-all duration-500
                      ${hoveredIndex === index ? 'text-primary scale-110' : 'text-primary/60'}
                    `} />
                    
                    <p className={`
                      text-xl mb-8 transition-all duration-500
                      ${hoveredIndex === index ? 'text-foreground' : 'text-foreground/80'}
                    `}>
                      {testimonial.content}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 rounded-full bg-primary/20 transform scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold transition-colors duration-500 group-hover:text-primary">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className={`
                rounded-full transition-all duration-300
                ${prevBtnEnabled ? 'hover:scale-110 hover:bg-primary hover:text-primary-foreground' : 'opacity-50'}
              `}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className={`
                rounded-full transition-all duration-300
                ${nextBtnEnabled ? 'hover:scale-110 hover:bg-primary hover:text-primary-foreground' : 'opacity-50'}
              `}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}