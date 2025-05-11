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
    id: 'gegerkalong',
    name: 'Suma Barber - Gegerkalong',
    area: 'BANDUNG',
    images: ['/images/places/geger-1.PNG', '/images/places/geger-2.PNG', '/images/places/geger-3.PNG'],
    address:
      'Jl. Gegerkalong Hilir No.170, Gegerkalong, Kec. Sukasari, Kota Bandung, Jawa Barat 40153',
    mapUrl: 'https://maps.app.goo.gl/csFqMZym91f82jS78',
    status: 'open',
  },
  {
    id: 'kiara-artha-park',
    name: 'Suma Barber - Kiara Artha Park',
    area: 'BANDUNG',
    images: ['/images/places/kiara-1.PNG', '/images/places/kiara-2.PNG'],
    address: 'Kiara Artha Park, Ruko B22',
    mapUrl: 'https://maps.app.goo.gl/WSM1yxLWjZtkFrxD6',
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
              Suma Barber - Gegerkalong
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Jl. Gegerkalong Hilir No.170, Sukasari, Bandung
            </p>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.1935418669654!2d107.58765661477415!3d-6.867613695033685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6b943c2c5ff%3A0xee36226526b08d94!2sJl.%20Gegerkalong%20Hilir%20No.170%2C%20Gegerkalong%2C%20Kec.%20Sukasari%2C%20Kota%20Bandung%2C%20Jawa%20Barat%2040153!5e0!3m2!1sen!2sid!4v1645123456789!5m2!1sen!2sid"
              width="100%"
              height="250"
              allowFullScreen
              loading="lazy"
              className="rounded-lg"
            />
            <a
              href="https://maps.app.goo.gl/csFqMZym91f82jS78"
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31691.3383122929!2d107.62923584240186!3d-6.916612108926471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e7c984c1214f%3A0xf2ad318f99ff6552!2sKiara%20Artha%20Park!5e0!3m2!1sen!2sid!4v1645123456789!5m2!1sen!2sid"
              width="100%"
              height="250"
              allowFullScreen
              loading="lazy"
              className="rounded-lg"
            />
            <a
              href="https://maps.app.goo.gl/WSM1yxLWjZtkFrxD6"
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
