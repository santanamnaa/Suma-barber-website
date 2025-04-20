"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GalleryPage() {
  const [visibleImages, setVisibleImages] = useState(8)
  
  const gallery = [
    {
      url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80",
      caption: "Classic Fade Cut"
    },
    {
      url: "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&q=80",
      caption: "Modern Pompadour"
    },
    {
      url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80",
      caption: "Textured Crop"
    },
    {
      url: "https://images.unsplash.com/photo-1593702295094-ac9a262f7c36?auto=format&fit=crop&q=80",
      caption: "Clean Fade"
    },
    {
      url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80",
      caption: "Slick Back Style"
    },
    {
      url: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80",
      caption: "Korean Two-Block"
    },
    {
      url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80",
      caption: "Beard Trim"
    },
    {
      url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80",
      caption: "Classic Gentleman Cut"
    },
    {
      url: "https://images.unsplash.com/photo-1634302086738-b13113181ccd?auto=format&fit=crop&q=80",
      caption: "Modern Quiff"
    },
    {
      url: "https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&q=80",
      caption: "Textured Messy"
    },
    {
      url: "https://images.unsplash.com/photo-1592647420148-bfcc177e2117?auto=format&fit=crop&q=80",
      caption: "Skin Fade"
    },
    {
      url: "https://images.unsplash.com/photo-1580518337843-f959e992563b?auto=format&fit=crop&q=80",
      caption: "Asian Style"
    },
    {
      url: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&q=80",
      caption: "Vintage Cut"
    },
    {
      url: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80",
      caption: "Modern Undercut"
    },
    {
      url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80",
      caption: "Classic Scissor Cut"
    },
    {
      url: "https://images.unsplash.com/photo-1584486483122-af7d49cf2992?auto=format&fit=crop&q=80",
      caption: "Premium Styling"
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