'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {  User, Droplet, Heart ,Instagram, BookOpen as TiktokIcon, Scissors, Clock, Award, Users, Tag, ChevronDown } from 'lucide-react'
import { SocialFeed } from '@/components/social-feed'
import { Testimonials } from '@/components/testimonials'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HeroSpotlight } from '@/components/hero-spot-light'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

export default function Home() {
  const topics = [
  {
    slug: 'face-shape',
    title: 'Match by Face Shape',
    icon: <User className="h-12 w-12" />,
    description: 'Cari potongan rambut terbaik sesuai bentuk wajah Anda.',
  },
  {
    slug: 'hair-type',
    title: 'Match by Hair Type',
    icon: <Droplet className="h-12 w-12" />,
    description: 'Pilihan cut untuk rambut lurus, keriting, atau bergelombang.',
  },
  {
    slug: 'hairstyle',
    title: 'Modern Hairstyles',
    icon: <Scissors className="h-12 w-12" />,
    description: 'Inspirasi gaya rambut terkini untuk semua suasana.',
  },
  {
    slug: 'maintenance',
    title: 'Care & Maintenance',
    icon: <Heart className="h-12 w-12" />,
    description: 'Tips merawat rambut agar selalu sehat dan berkilau.',
  },
]
  

  const whyUs = [
    {
      icon: <Tag className="h-6 w-6" />,
      title: 'Harga Terjangkau',
      short: 'Grooming premium, harga bersahabat.',
      full:
        'Kami menawarkan layanan grooming premium—haircut, shampoo, styling—dengan tarif yang tetap ramah di kantong, tanpa kompromi pada kualitas.',
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Capster Bersertifikat',
      short: 'Profesional & berpengalaman.',
      full:
        'Semua capster kami telah lulus pelatihan bersertifikat internasional dan berpengalaman menangani segala jenis potongan modern hingga klasik.',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Premium Experience',
      short: 'Suasana santai + fasilitas ekstra.',
      full:
        'Nikmati area lounge ber-AC, head massage gratis, hingga welcome drink. Kami menciptakan suasana premium agar setiap kunjungan terasa istimewa.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Klien Puas',
      short: 'Ratusan ulasan positif.',
      full:
        'Lebih dari 500 klien telah merekomendasikan kami berkat layanan ramah, potongan presisi, dan follow-up aftercare yang konsisten.',
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

  const servicesKiara = [
    { category: "Haircut", items: [
      { name: "Gentleman's Cut", price: "40K" },
      { name: "Gentleman's Cut (Capster by Request)", price: "50K" },
      { name: "Gentleman's Cut + 30 Minutes Full Back Massage (Tuina)", price: "70K" },
      { name: "Gentleman's Cut + Bekam Kering", price: "80K" },
      { name: "Gentleman's Cut + Ear Candle", price: "80K" },
      { name: "Gentleman's Cut (Long Trim)", price: "70K" },
    ] },
    { category: "Hairstyling", items: [
      { name: "Perm + Gentleman's Cut", price: "190K" },
      { name: "Korean Perm + Gentleman's Cut", price: "320K" },
      { name: "Down Perm", price: "130K" },
    ] },
    { category: "Hair Coloring", items: [
      { name: "Full Hair Coloring", price: "250K" },
      { name: "Full Hair Bleach", price: "270K" },
      { name: "Highlight", price: "290K" },
      { name: "Polish (Semir)", price: "90K" },
    ] },
  ];
  
  const servicesGegerkalong = [
    { category: "Haircut", items: [
      { name: "Gentleman's Cut", price: "45K" },
      { name: "Gentleman's Cut (Capster by Request)", price: "55K" },
      { name: "Gentleman's Cut + 30 Minutes Full Back Massage (Tuina)", price: "75K" },
      { name: "Gentleman's Cut + Bekam Kering", price: "85K" },
      { name: "Gentleman's Cut + Ear Candle", price: "85K" },
      { name: "Gentleman's Cut (Long Trim)", price: "75K" },
    ] },
    { category: "Hairstyling", items: [
      { name: "Perm + Gentleman's Cut", price: "195K" },
      { name: "Korean Perm + Gentleman's Cut", price: "325K" },
      { name: "Down Perm", price: "135K" },
    ] },
    { category: "Hair Coloring", items: [
      { name: "Full Hair Coloring", price: "255K" },
      { name: "Full Hair Bleach", price: "275K" },
      { name: "Highlight", price: "295K" },
      { name: "Polish (Semir)", price: "95K" },
    ] },
  ];
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
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-8">A BRIEF INTRO</h2>
        <div className="max-w-3xl text-xl leading-relaxed text-muted-foreground dark:text-white">
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


      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-12 text-center">WHY CHOOSE US</h2>

      <Accordion
        type="single"
        collapsible
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {whyUs.map((item, idx) => (
          <AccordionItem
            key={idx}
            value={`item-${idx}`}
            className="border border-border rounded-lg overflow-hidden bg-card"
          >
            <AccordionTrigger
              className="flex items-start gap-4 p-4 hover:bg-primary/5 transition-colors"
            >
              <div className="relative group">
                <div
                  className="
                    p-3 rounded-full bg-black text-white 
                    shadow-lg group-hover:shadow-2xl 
                    transition-shadow
                  "
                >
                  {item.icon}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.short}
                </p>
              </div>

              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-6 pt-0">
              <div
                className="
                  bg-gradient-to-r from-[#030202] to-[#25423a] 
                  rounded-b-lg p-4
                "
              >
                <p className="text-white text-sm leading-relaxed">
                  {item.full}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>


      {/* Services Section */}
<section className="container mx-auto px-4 py-16 bg-gradient-to-b from-background to-background/60">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold mb-2 text-center">OUR SERVICES</h2>
    <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
      Professional grooming services tailored to your style and needs
    </p>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Kiara Location */}
      <div className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="bg-black p-6">
          <h3 className="text-2xl font-bold text-white mb-1">KIARA ARTHA PARK</h3>
          <p className="text-white/70 text-sm">Premium services at competitive prices</p>
        </div>
        
        <div className="p-6 space-y-8">
          {servicesKiara.map((serviceGroup, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center">
                {serviceGroup.category === "Haircut" && <Scissors className="h-5 w-5 mr-2" />}
                {serviceGroup.category === "Hairstyling" && <Heart className="h-5 w-5 mr-2" />}
                {serviceGroup.category === "Hair Coloring" && <Droplet className="h-5 w-5 mr-2" />}
                {serviceGroup.category}
              </h4>
              <div className="space-y-3">
                {serviceGroup.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-2 border-b border-border/50 group">
                    <span className="group-hover:text-primary transition-colors">{item.name}</span>
                    <span className="font-mono text-lg font-bold">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="px-6 pb-6">
          <Button variant="outline" className="w-full group" asChild>
            <Link href="/locations/kiara">
              Book Appointment
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2">→</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Gegerkalong Location */}
      <div className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="bg-gradient-to-r from-[#030202] to-[#25423a] p-6">
          <h3 className="text-2xl font-bold text-white mb-1">GEGERKALONG</h3>
          <p className="text-white/70 text-sm">Exclusive barbering experience</p>
        </div>
        
        <div className="p-6 space-y-8">
          {servicesGegerkalong.map((serviceGroup, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center">
                {serviceGroup.category === "Haircut" && <Scissors className="h-5 w-5 mr-2" />}
                {serviceGroup.category === "Hairstyling" && <Heart className="h-5 w-5 mr-2" />}
                {serviceGroup.category === "Hair Coloring" && <Droplet className="h-5 w-5 mr-2" />}
                {serviceGroup.category}
              </h4>
              <div className="space-y-3">
                {serviceGroup.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-2 border-b border-border/50 group">
                    <span className="group-hover:text-primary transition-colors">{item.name}</span>
                    <span className="font-mono text-lg font-bold">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="px-6 pb-6">
          <Button className="w-full bg-black hover:bg-black/80 group" asChild>
            <Link href="/locations/gegerkalong">
              Book Appointment
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2">→</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>
{/* Haircut Insights Section */}
<section className="container mx-auto px-4 py-16 bg-background">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            Discover Your Perfect Hairstyle
          </h2>
          <p className="text-lg text-muted-foreground">
            Personalized hair guidance tailored to your unique features. Find a look that not only matches your face but also reflects your personality.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topics.map((t, index) => (
            <Link
              key={t.slug}
              href={`/discover/${t.slug}`}
              className="group relative block overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-6">
                <h3 className="text-xl font-semibold text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  {t.title}
                </h3>
                <p className="text-white/80 text-sm mb-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {t.description}
                </p>
                <div className="flex items-center text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <span className="mr-2">Explore</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 transition-transform group-hover:translate-x-1" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* Background with Icon */}
              <div className="relative pt-[100%] w-full">
                <div 
                  className={`
                    absolute inset-0 
                    flex items-center 
                    justify-center 
                    transition-all 
                    duration-300
                    ${
                      index === 0 ? 'bg-blue-50 group-hover:bg-blue-100' :
                      index === 1 ? 'bg-green-50 group-hover:bg-green-100' :
                      index === 2 ? 'bg-purple-50 group-hover:bg-purple-100' :
                      'bg-red-50 group-hover:bg-red-100'
                    }
                  `}
                >
                  <div 
                    className={`
                      p-6 
                      rounded-full 
                      transition-all 
                      duration-300
                      group-hover:scale-110
                      ${
                        index === 0 ? 'bg-blue-100 text-blue-600' :
                        index === 1 ? 'bg-green-100 text-green-600' :
                        index === 2 ? 'bg-purple-100 text-purple-600' :
                        'bg-red-100 text-red-600'
                      }
                    `}
                  >
                    {React.cloneElement(t.icon, { 
                      className: "h-12 w-12 transition-transform group-hover:rotate-6" 
                    })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-card border border-border rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full mr-4">
                <Scissors className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Can't Decide?</h3>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Our expert stylists are ready to provide personalized guidance and help you find the perfect hairstyle that complements your unique features.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="group bg-primary hover:bg-primary/90 transition-colors"
            >
              <Link href="/book-consultation">
                Book Free Consultation
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Gallery */}
      <section className="container mx-auto px-4 py-8">
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
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-12 text-center">
          WHAT OUR CLIENT SAY
        </h2>
      <Testimonials />
      </section>

      {/* Social Feed */}
      <section className="container mx-auto px-4 py-8">
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
