'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { Button } from '@/components/ui/button'

interface Location {
  id: string
  name: string
  area: string
  images: string[]
  address: string
  mapUrl: string
  status: 'open' | 'closed'
}

const locations: Location[] = [
  {
    id: 'Sukajadi',
    name: 'Suma Barber - Sukajadi',
    area: 'BANDUNG',
    images: ['/images/places/geger-1.webp', '/images/places/geger-2.webp', '/images/places/geger-3.webp'],
    address:
      'Jl. Gegerkalong Hilir No.170, Gegerkalong, Kec. Sukasari, Kota Bandung, Jawa Barat 40153',
    mapUrl: 'https://maps.app.goo.gl/csFqMZym91f82jS78',
    status: 'open',
  },
  {
    id: 'kiara-artha-park',
    name: 'Suma Barber - Kiara Artha Park',
    area: 'BANDUNG',
    images: ['/images/places/kiara-1.webp', '/images/places/kiara-2.webp'],
    address: 'Kiara Artha Park, Ruko B22',
    mapUrl: 'https://maps.app.goo.gl/WSM1yxLWjZtkFrxD6',
    status: 'open',
  },
  {
    id: 'riung-bandung',
    name: 'Suma Barber - Riung Bandung',
    area: 'BANDUNG',
    images: ['/images/places/riung1.jpeg', '/images/places/riung2.jpeg', '/images/places/riung3.jpeg', '/images/places/riung4.jpeg'],
    address: 'Jl. Riung Bandung',
    mapUrl: 'https://maps.app.goo.gl/q25gHLkgRmrs778JA?g_st=iw',
    status: 'open',
  },
]

function LocationCard({ location }: { location: Location }) {
  const [swiper, setSwiper] = useState<any>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const initSwiper = (sw: any) => {
    setSwiper(sw)
    setCanPrev(!sw.isBeginning)
    setCanNext(!sw.isEnd)
  }

  const onSlideChange = (sw: any) => {
    setCanPrev(!sw.isBeginning)
    setCanNext(!sw.isEnd)
  }

  return (
    <div className="group relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <Swiper
          onSwiper={initSwiper}
          onSlideChange={onSlideChange}
          slidesPerView={1}
          spaceBetween={10}
          className="w-full h-full"
        >
          {location.images.map((src, idx) => (
            <SwiperSlide key={idx}>
              <Image
                src={src}
                alt={`${location.name} – ${idx + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* tombol nav */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none z-20">
          <Button
            variant="outline"
            size="icon"
            onClick={() => swiper?.slidePrev()}
            disabled={!canPrev}
            className={`
              rounded-full bg-black/60 backdrop-blur-sm pointer-events-auto
              ${!canPrev ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/80'}
            `}
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => swiper?.slideNext()}
            disabled={!canNext}
            className={`
              rounded-full bg-black/60 backdrop-blur-sm pointer-events-auto
              ${!canNext ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/80'}
            `}
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-2xl font-bold">{location.name}</h2>
        <p className="text-muted-foreground">{location.area}</p>
        {location.status === 'open' && location.address && (
          <>
            <p className="mt-2 text-sm">{location.address}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link
                href={location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="mr-2 h-4 w-4" />
                View on Maps
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
  
}

export default function LocationsPage() {
  return (
    <div className="container mx-auto px-4 pt-24">
      <h1 className="text-4xl font-bold mb-12">OUR LOCATIONS</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {locations.map((loc) => (
          <LocationCard key={loc.id} location={loc} />
        ))}
      </div>

      {/* Map Section */}
      <div className="mt-24">
        <h2 className="text-2xl font-bold mb-8">FIND US HERE</h2>
        <div className="grid md:grid-cols-2 gap-10">
          {/* Gegerkalong */}
          <div className="bg-white dark:bg-black shadow-lg rounded-2xl p-4">
            <h3 className="text-xl font-semibold mb-2">
              Suma Barber - Sukajadi
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Jl. Sindang Sirna No.21, Gegerkalong, Kec. Sukasari, Kota Bandung, Jawa Barat 40151
            </p>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.10216770727!2d107.5921822!3d-6.8783619!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e785fd8c53c3%3A0x41a5c94703e85d23!2sSUMA%20Barber!5e0!3m2!1sid!2sid!4v1750343203108!5m2!1sid!2sid"
              width={600}
              height={450}
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            />
            <a
              href="https://maps.app.goo.gl/rybppdkbZ9RSo1Rt9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Lihat di Google Maps
            </a>
          </div>

          {/* Kiara Artha */}
          <div className="bg-white dark:bg-black shadow-lg rounded-2xl p-4">
            <h3 className="text-xl font-semibold mb-2">
              Suma Barber - Kiara Artha
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Kiara Artha Park, Ruko B22
            </p>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d990.1959079082066!2d107.64234876959627!3d-6.916452199567688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e700694dd10b%3A0xdeb58e538de134a8!2sSuma%20Barber%20kiara%20artha!5e0!3m2!1sid!2sid!4v1750343440777!5m2!1sid!2sid"
              width={600}
              height={450}
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            />
            <a
              href="https://maps.app.goo.gl/4atazA6BzkhztKJV7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Lihat di Google Maps
            </a>
          </div>

          {/* riung-bandung */}
          <div className="bg-white dark:bg-black shadow-lg rounded-2xl p-4">
            <h3 className="text-xl font-semibold mb-2">
              Suma Barber - Riung Bandung
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Jl. Terusan Saluyu, Bandung
            </p>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d25780.360273701695!2d107.67447739800153!3d-6.952207816063832!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNsKwNTcnMDEuNCJTIDEwN8KwNDAnNDUuOSJF!5e0!3m2!1sid!2sid!4v1750336835953!5m2!1sid!2sid"
              width={600}
              height={450}
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            />
            <a
              href="https://maps.app.goo.gl/q25gHLkgRmrs778JA?g_st=iw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Lihat di Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
