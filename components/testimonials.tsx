"use client"

import {useRef, useEffect, useState, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Card } from "@/components/ui/card"
import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "Ahmad Fadli",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Gila sih, potongannya rapih banget. Fix langganan ke sini!"
  },
  {
    name: "Rizky Hidayat",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Udah coba banyak tempat, tapi cuma di sini yang ngerti gaya rambut gue."
  },
  {
    name: "Bagas Pratama",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Barbernya santai, tapi hasilnya serius bagus. Stylish abis!"
  },
  {
    name: "Dimas Akbar",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Sumpah nyaman banget tempatnya, bisa sambil ngopi nunggu giliran."
  },
  {
    name: "Fauzan Maulana",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Baru potong langsung pede. Bikin ganteng tuh kerjaannya Suma Barber!"
  },
  {
    name: "Hendra Wijaya",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Capsternya ngerti selera anak muda. Hasilnya mantep, nggak perlu diatur ulang."
  },
  {
    name: "Arief Rahman",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Potong di sini berasa di-upgrade jadi versi terbaik diri sendiri. Mantap!"
  },
  {
    name: "Taufik Ramadhan",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Gaya Korea? UK style? Semua bisa, tinggal duduk dan percaya aja."
  },
  {
    name: "Johan Saputra",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Bikin rambut auto glow up. Nggak lebay, tapi emang keren hasilnya!"
  },
  {
    name: "Imam Setiawan",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Serius, habis potong rambut di sini berasa kayak mau photoshoot."
  },
  {
    name: "Dedi Nugroho",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Harga masih masuk akal tapi kualitas premium. Worth banget."
  },
  {
    name: "Randy Saputra",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Potongannya pas banget sama bentuk muka. Jarang-jarang ada barber bisa gitu."
  },
  {
    name: "Andi Permana",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Bilang 'bebas aja bang', tapi tetap hasilnya keren. Capsternya jago cuy."
  },
  {
    name: "Bayu Susanto",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Suka sama detailnya. Setiap helai rambut berasa dipikirin beneran."
  },
  {
    name: "Galang Mahendra",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Barbernya asik diajak ngobrol, jadi potong rambut nggak kerasa lama."
  },
  {
    name: "Yuda Kurniawan",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Habis potong langsung buka kamera depan terus selfie. Ganteng maksimal!"
  },
  {
    name: "Rama Prasetya",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Nggak perlu repot jelasin, capsternya udah paham maunya kita."
  },
  {
    name: "Ilham Fathurrahman",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Model potongannya awet. Udah seminggu tetep stay keren."
  },
  {
    name: "Reza Aryanto",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Kalau mau tampil clean dan rapi, udah pasti ke sini jalannya."
  },
  {
    name: "Dion Saputra",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Cukup sekali coba langsung nagih. Gaya lo bakal naik level!"
  },
  {
    name: "Bimo Nugraha",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Suka banget vibe tempatnya, anak muda banget, tapi tetap profesional."
  },
  {
    name: "Arkan Ramadhan",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Hasil potongnya selalu konsisten. Gak ada drama potong kebanyakan."
  },
  {
    name: "Iqbal Maulana",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Duduk, relax, pulang udah beda aura. Fix panggilan jodoh makin banyak."
  },
  {
    name: "Fikri Alamsyah",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Suka banget sama cara mereka ngatur poni gue. Nggak lebay, pas!"
  },
  {
    name: "Zaki Rizwan",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Sumpah hasilnya satisfying banget. Kayak habis upgrade karakter di game."
  },
  {
    name: "Rafi Hakim",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Baru pertama ke sini tapi langsung berasa loyal customer. Beda kelas!"
  },
  {
    name: "Vino Wicaksono",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Wangi, bersih, adem, nyaman. Bonusnya: jadi ganteng."
  },
  {
    name: "Jefri Santosa",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Mau potong kayak di TikTok? Di sini tempatnya bro!"
  },
  {
    name: "Yoga Prasetyo",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Rekomendasiin ini ke temen, sekarang jadi rebutan jadwal 😅"
  },
  {
    name: "Akbar Ramli",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Model rambut gue sekarang sering ditanya-tanyain. Thanks Suma!"
  },
  {
    name: "Farhan Lazuardi",
    role: "",
    image: "/images/testimonials/default-avatar.webp",
    content: "Setiap ke sini kayak ritual wajib biar makin kece. Best barber in town!"
  }
];


export function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [columnCount, setColumnCount] = useState(5)
  const [isMobile, setIsMobile] = useState(false)

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
      setIsMobile(window.innerWidth < 640)
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

    // Infinite scroll manual di mobile
    function handleManualScroll(col: HTMLElement) {
      // Bagian tengah
      const middle = (col.scrollHeight - col.clientHeight) / 2
      if (col.scrollTop === 0) {
        col.scrollTop = middle
      } else if (col.scrollTop + col.clientHeight >= col.scrollHeight) {
        col.scrollTop = middle
      }
    }

    if (isMobile) {
      columnContainers.forEach(col => {
        // Set awal ke tengah agar user bisa scroll ke atas/bawah
        col.scrollTop = (col.scrollHeight - col.clientHeight) / 2
        col.addEventListener('scroll', () => handleManualScroll(col))
      })
    }

    rafId = requestAnimationFrame(autoScroll)

    return () => {
      cancelAnimationFrame(rafId)
      if (isMobile) {
        columnContainers.forEach(col => {
          col.removeEventListener('scroll', () => handleManualScroll(col))
        })
      }
    }
  }, [isMobile])

  // Duplikasikan data untuk efek looping
  const loopedTestimonials = [...testimonials, ...testimonials, ...testimonials]

  return (
    <section className="relative py-8 overflow-hidden bg-background">
      {/* Gradient masks */}
      <div className="pointer-events-none absolute top-0 h-8 sm:h-32 w-full bg-gradient-to-b from-background via-background/80 to-transparent z-20" />
      <div className="pointer-events-none absolute bottom-0 h-8 sm:h-32 w-full bg-gradient-to-t from-background via-background/80 to-transparent z-20" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-background/90 via-background/80 to-transparent z-20" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-background/90 via-background/80 to-transparent z-20" />

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
            className="flex gap-6 overflow-hidden h-[600px] relative z-10 sm:overflow-hidden overflow-x-auto touch-pan-y"
          >
            {[...Array(columnCount)].map((_, colIndex) => (
              <div
                key={colIndex}
                className={`column flex flex-col gap-6 w-[300px] ${
                  isMobile ? 'overflow-y-auto touch-pan-y' : 'overflow-hidden'
                } no-scrollbar`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {loopedTestimonials
                  .slice(colIndex * 6, colIndex * 6 + 10)
                  .map((testimonial, index) => {
                    const globalIndex = colIndex * 6 + index
                    return (
                      <Card
                        key={globalIndex}
                        className="relative flex flex-col p-6 rounded-2xl border border-border bg-background/80 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                      >
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

<style jsx global>{`
  .no-scrollbar {
    scrollbar-width: none !important; /* Firefox */
    -ms-overflow-style: none !important; /* IE 10+ */
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none !important; /* Safari and Chrome */
  }
  .no-scrollbar::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
`}</style>