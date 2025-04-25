"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GalleryPage() {
  const [visibleImages, setVisibleImages] = useState(8)
  
  const gallery = [
    {
      url: "/images/galery/galery-1.jpg",
      caption: ""
    },
    {
      url: "/images/galery/galery-2.jpg",
      caption: ""
    },
    {
      url: "/images/galery/galery-3.jpg",
      caption: ""
    },
    {
      url: "/images/galery/galery-4.jpg",
      caption: ""
    },
    {
      url: "/images/galery/galery-5.jpg",
      caption: ""
    },
    {
      url: "/images/galery/galery-6.jpg",
      caption: ""
    },
    {
      url: "/images/galery/galery-7.jpg",
      caption: ""
    },
    {
      url: "/images/galery/galery-8.jpg",
      caption: ""
    },
    {
      url: "/images/galery/galery-9.jpg",
      caption: ""
    },
    {
      url: "/images/galery/galery-10.jpg",
      caption: ""
    },
    {
      url: "/images/galery/galery-11.jpg",
      caption: ""
    },
    {
      url: "/images/places/geger-1.PNG",
      caption: ""
    },
    {
      url: "/images/places/geger-2.PNG",
      caption: ""
    },
    {
      url: "/images/places/geger-3.PNG",
      caption: ""
    },
    {
      url: "/images/places/kiara-1.PNG",
      caption: ""
    },
    {
      url: "/images/places/kiara-2.PNG",
      caption: ""
    }
  ]

  const loadMore = () => {
    setVisibleImages(prev => Math.min(prev + 8, gallery.length))
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Gallery</h1>
          <p className="text-xl text-muted-foreground">
            Explore our collection of premium haircuts and styles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gallery.slice(0, visibleImages).map((image, index) => (
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

        {visibleImages < gallery.length && (
          <div className="text-center mt-12">
            <Button 
              onClick={loadMore}
              variant="outline"
              size="lg"
              className="animate-pulse hover:animate-none"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}