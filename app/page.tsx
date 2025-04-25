'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Instagram, BookOpen as TiktokIcon, Scissors, Clock, Award, Users, Tag } from 'lucide-react'
import { SocialFeed } from '@/components/social-feed'
import { Testimonials } from '@/components/testimonials'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HeroSpotlight } from '@/components/hero-spot-light'

export default function Home() {
  const services = [
    {
      category: 'Haircut',
      items: [
        "Premium Gentleman’s Cut (Haircut, Shampoo, Hair Wash, Hair Mask, Warm Towel, Styling)",
        "Premium Gentleman’s Cut (Long trim)",
        "Creambath",
      ],
    },
    {
      category: 'Hairstyling',
      items: [
        "Perm + Gentleman’s Cut",
        "Korean Perm + Gentleman’s Cut",
        "Down Perm",
      ],
    },
    {
      category: 'Hair Coloring',
      items: [
        "Full Hair Coloring",
        "Full Hair Bleach",
        "Highlight",
        "Polish (Semir)",
      ],
    },
    {
      category: 'Additional Services',
      items: [
        "Full Body Massage",
        "Head Massage",
      ],
    },
  ]
  

  const whyUs = [
    {
      icon: <Tag className="h-6 w-6" />,
      title: 'Harga Terjangkau',
      description: 'Layanan grooming premium dengan tarif ramah di kantong.',
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Capster Bersertifikat',
      description: 'Semua capster kami tersertifikasi profesional dan ahli.',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Premium Experience',
      description: 'Suasana santai & layanan personal untuk kenyamanan maksimal.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Klien Puas',
      description: 'Ratusan klien kembali dan merekomendasikan kami.',
    },
  ]

  const featuredGallery = [
    {
      url: '/images/galery/galery-1.jpg',
      caption: '',
    },
    {
      url: '/images/galery/galery-2.jpg',
      caption: 'Modern Pompadour',
    },
    {
      url: '/images/galery/galery-3.jpg',
      caption: 'Textured Crop',
    },
    {
      url: '/images/galery/galery-4.jpg',
      caption: 'Clean Fade',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <HeroSpotlight />

          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
            SUMA BARBER
              <br />
            CERTIFIED EXPERTS
              <br />
              EST. 2022
            </h1>
          </div>
        </div>
      </div>

      {/* Brief Intro */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-2xl font-bold mb-8">A BRIEF INTRO</h2>
        <div className="max-w-3xl text-xl leading-relaxed text-white">
          <p>
            Suma Barber memiliki dua cabang aktif yang berlokasi di{' '}
            <span className="font-semibold">Kiara Artha Park</span> dan{' '}
            <span className="font-semibold">Gegerkalong</span>, menghadirkan layanan grooming berkualitas tinggi.
            Seluruh capster kami telah tersertifikasi secara profesional dan berpengalaman dalam memberikan hasil potongan yang presisi dan memuaskan.
          </p>
          <p className="mt-6">
            Kami berkomitmen untuk menjadi barbershop yang tidak hanya menghadirkan hasil terbaik,
            tetapi juga menjadi ruang di mana anak muda dapat mengekspresikan gaya rambut sesuai tren masa kini dengan percaya diri.
          </p>
          <p className="mt-8 text-2xl font-bold">Sampai jumpa di Suma Barber!</p>
        </div>
      </section>


      {/* Why Us Section */}
      <section className="container mx-auto px-4 py-24 bg-accent/5">
        <h2 className="text-2xl font-bold mb-12 text-center">WHY CHOOSE US</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyUs.map((item, i) => (
            <Card
              key={i}
              className="p-6 bg-card hover:bg-accent/5 transition-colors duration-300"
            >
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-2xl font-bold mb-12 text-center">OUR SERVICES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((group, gi) => (
            <Card
              key={gi}
              className="p-6 bg-card hover:bg-accent/5 transition-colors duration-300"
            >
              <h3 className="text-xl font-semibold mb-6">{group.category}</h3>
              <div className="space-y-4">
                {group.items.map((svc, si) => (
                  <div key={si} className="border-l-4 border-primary pl-4">
                    <p className="text-muted-foreground">{svc}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-2xl font-bold mb-12 text-center">
          OUR GALLERY
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredGallery.map((img, i) => (
            <Card key={i} className="group overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={img.url}
                  alt={img.caption}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white font-medium">
                    {img.caption}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg" className="group">
            <Link href="/gallery">
              View Full Gallery
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Social Feed */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-2xl font-bold mb-12">
          FOLLOW OUR JOURNEY
        </h2>
        <SocialFeed />
      </section>

      {/* Locations Navigation */}
      <section className="container mx-auto px-4 py-0">
        <h2 className="text-2xl font-bold mb-12">
          CLICK THE SHOP YOU WANT TO VISIT
        </h2>
        <div className="space-y-8">
          {[
            { id: '01', name: 'GEGERKALONG', area: 'BANDUNG' },
            { id: '02', name: 'KIARA ARTHA', area: 'BANDUNG' },
          ].map(loc => (
            <Link
              href={`/locations`}
              key={loc.id}
              className="group block"
            >
              <div className="flex items-center space-x-4 py-4 border-t border-foreground">
                <span className="text-sm opacity-60">{loc.id}</span>
                <span className="text-2xl font-bold">
                  {loc.name},
                </span>
                <span className="text-2xl">{loc.area}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
