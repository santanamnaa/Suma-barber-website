'use client'

import Link from "next/link"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"

export default function LocationsPage() {
  const locations = [
    {
      id: "gegerkalong",
      name: "Suma Barber - Gegerkalong",
      area: "BANDUNG",
      images: [
        "/images/geger-1.jpg",
        "/images/geger-2.jpg",
        "/images/geger-3.jpg"
      ],
      address: "Jl. Gegerkalong Hilir No.170, Gegerkalong, Kec. Sukasari, Kota Bandung, Jawa Barat 40153",
      mapUrl: "https://maps.app.goo.gl/csFqMZym91f82jS78",
      status: "open"
    },
    {
      id: "kiara-artha-park",
      name: "Suma Barber - Kiara Artha Park",
      area: "BANDUNG",
      images: [
        "/images/kiara-1.jpg",
        "/images/kiara-2.jpg"
      ],
      address: "Kiara Artha Park, Ruko B22",
      mapUrl: "https://maps.app.goo.gl/WSM1yxLWjZtkFrxD6",
      status: "open"
    }
  ]

  return (
    <div className="container mx-auto px-4 pt-24">
      <h1 className="text-4xl font-bold mb-12">OUR LOCATIONS</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {locations.map((location) => (
          <div key={location.id} className="group relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Swiper spaceBetween={10} slidesPerView={1} className="w-full h-full">
                {location.images.map((src, i) => (
                  <SwiperSlide key={i}>
                    <Image
                      src={src}
                      alt={`${location.name} - ${i + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {location.status === "coming-soon" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">COMING SOON</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h2 className="text-2xl font-bold">{location.name}</h2>
              <p className="text-muted-foreground">{location.area}</p>
              {location.status === "open" && location.address && (
                <>
                  <p className="mt-2 text-sm">{location.address}</p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4"
                  >
                    <Link href={location.mapUrl} target="_blank" rel="noopener noreferrer">
                      <MapPin className="mr-2 h-4 w-4" />
                      View on Maps
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>


      {/* Map Section */}
      <div className="mt-24">
        <h2 className="text-2xl font-bold mb-8">FIND US HERE</h2>

        <div className="grid md:grid-cols-2 gap-10">

          {/* Gegerkalong */}
          <div className="bg-black shadow-lg rounded-2xl p-4">
            <h3 className="text-xl font-semibold mb-2">Suma Barber - Gegerkalong</h3>
            <p className="mb-4 text-sm text-gray-600">Jl. Gegerkalong Hilir No.170, Sukasari, Bandung</p>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.1935418669654!2d107.58765661477415!3d-6.867613695033685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6b943c2c5ff%3A0xee36226526b08d94!2sJl.%20Gegerkalong%20Hilir%20No.170%2C%20Gegerkalong%2C%20Kec.%20Sukasari%2C%20Kota%20Bandung%2C%20Jawa%20Barat%2040153!5e0!3m2!1sen!2sid!4v1645123456789!5m2!1sen!2sid"
              width="100%"
              height="250"
              allowFullScreen
              loading="lazy"
              className="rounded-lg"
            ></iframe>
            <a
              href="https://maps.app.goo.gl/csFqMZym91f82jS78"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-blue-600 hover:underline"
            >
              Lihat di Google Maps
            </a>
          </div>
          {/* Kiara Artha */}
          <div className="bg-black shadow-lg rounded-2xl p-4">
            <h3 className="text-xl font-semibold mb-2">Suma Barber - Kiara Artha</h3>
            <p className="mb-4 text-sm text-gray-600">Kiara Artha Park, Ruko B22</p>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31691.3383122929!2d107.62923584240186!3d-6.916612108926471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e7c984c1214f%3A0xf2ad318f99ff6552!2sKiara%20Artha%20Park!5e0!3m2!1sen!2sid!4v1645123456789!5m2!1sen!2sid"
              width="100%"
              height="250"
              allowFullScreen
              loading="lazy"
              className="rounded-lg"
            ></iframe>
            <a
              href="https://maps.app.goo.gl/WSM1yxLWjZtkFrxD6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-blue-600 hover:underline"
            >
              Lihat di Google Maps
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
