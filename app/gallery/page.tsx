"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function GalleryPage() {
  const [visibleImages, setVisibleImages] = useState(8)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  const gallery = [
    {
      url: "/images/galery/galery-1.webp",
      caption: ""
    },
    {
      url: "/images/galery/galery-2.webp",
      caption: ""
    },
    {
      url: "/images/galery/galery-3.webp",
      caption: ""
    },
    {
      url: "/images/galery/galery-4.webp",
      caption: ""
    },
    {
      url: "/images/galery/galery-5.webp",
      caption: ""
    },
    {
      url: "/images/galery/galery-6.webp",
      caption: ""
    },
    {
      url: "/images/galery/galery-7.webp",
      caption: ""
    },
    {
      url: "/images/galery/galery-8.webp",
      caption: ""
    },
    {
      url: "/images/galery/galery-9.webp",
      caption: ""
    },
    {
      url: "/images/galery/galery-10.webp",
      caption: ""
    },
    {
      url: "/images/galery/galery-11.webp",
      caption: ""
    },
    {
      url: "/images/places/geger-1.webp",
      caption: ""
    },
    {
      url: "/images/places/geger-2.webp",
      caption: ""
    },
    {
      url: "/images/places/geger-3.webp",
      caption: ""
    },
    {
      url: "/images/places/kiara-1.webp",
      caption: ""
    },
    {
      url: "/images/places/kiara-2.webp",
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {gallery.slice(0, visibleImages).map((image, index) => (
            <Card 
              key={index} 
              className="group overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(image.url)}
            >
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={image.caption}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
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

      {/* Modal for full image */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <button
            className="absolute top-4 right-4 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 transition"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative w-[90vw] max-w-3xl max-h-[90vh] flex items-center justify-center">
            <Image
              src={selectedImage}
              alt="Full Image"
              fill
              className="object-contain rounded-xl shadow-2xl"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </div>
  )
}