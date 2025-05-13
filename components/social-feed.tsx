"use client"
import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Instagram, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from 'embla-carousel-react'
import { Button } from "@/components/ui/button"
import { EmblaCarouselType } from 'embla-carousel';
import { useTheme } from "next-themes"


export function SocialFeed() {
  const [activeTab, setActiveTab] = useState("instagram")
  const { theme, resolvedTheme } = useTheme ? useTheme() : { theme: 'light', resolvedTheme: 'light' };
  const isDark = (theme === 'dark' || resolvedTheme === 'dark');
  const [instagramRef, instagramApi] = useEmblaCarousel({ 
    dragFree: true,
    containScroll: "trimSnaps"
  })
  const [tiktokRef, tiktokApi] = useEmblaCarousel({ 
    dragFree: true,
    containScroll: "trimSnaps"
  })
  
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  
  const updateScrollState = (api: EmblaCarouselType | undefined) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }
  
  useEffect(() => {
    if (instagramApi) {
      instagramApi.on("select", () => updateScrollState(instagramApi));
      updateScrollState(instagramApi);
    }
    if (tiktokApi) {
      tiktokApi.on("select", () => updateScrollState(tiktokApi));
      updateScrollState(tiktokApi);
    }
  }, [instagramApi, tiktokApi, activeTab])
  
  const scrollPrev = () => {
    if (activeTab === "instagram" && instagramApi) {
      instagramApi.scrollPrev()
    } else if (activeTab === "tiktok" && tiktokApi) {
      tiktokApi.scrollPrev()
    }
  }
  
  const scrollNext = () => {
    if (activeTab === "instagram" && instagramApi) {
      instagramApi.scrollNext()
    } else if (activeTab === "tiktok" && tiktokApi) {
      tiktokApi.scrollNext()
    }
  }

  
  // Instagram posts with redirection
  const instagramPosts = [
    "DGFCA5AyiTG",
    "DBgLAgYpTxp",
    "DDrmWbrSrw4"
  ]
  
  // TikTok videos
  const tiktokVideos = [
    "7452201089232817415",
    "7378541937302703366",
    "7435551704193568021"
  ]
  
  // Social media account URLs
  const instagramAccount = "https://www.instagram.com/sumabarber/?hl=en"
  const tiktokAccount = "https://www.tiktok.com/@sumaofficial_"
  
  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="instagram" className="flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            TikTok
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="instagram" className="mt-6">
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {instagramPosts.map((postId) => (
              <Card key={postId} className="overflow-hidden p-2 bg-background dark:bg-background border border-border rounded-xl shadow-md flex flex-col items-center justify-center">
                <iframe 
                  src={`https://www.instagram.com/p/${postId}/embed/?cr=1&v=14&hidecaption=1&omitscript=1&theme=${isDark ? 'dark' : 'light'}`} 
                  className="w-full h-[650px] border-0 rounded-lg bg-background dark:bg-background" 
                  loading="lazy"
                  allowFullScreen
                  scrolling="no"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  style={{ background: isDark ? '#18181b' : '#fff' }}
                />
              </Card>
            ))}
          </div>
          
          {/* Mobile Carousel */}
          <div className="md:hidden relative">
            <div className="overflow-hidden" ref={instagramRef}>
              <div className="flex">
                {instagramPosts.map((postId) => (
                  <div key={postId} className="flex-[0_0_100%] min-w-0">
                    <Card className="overflow-hidden mx-2 p-2 bg-background dark:bg-background border border-border rounded-xl shadow-md flex flex-col items-center justify-center">
                      <iframe 
                        src={`https://www.instagram.com/p/${postId}/embed/?cr=1&v=14&hidecaption=1&omitscript=1&theme=${isDark ? 'dark' : 'light'}`} 
                        className="w-full h-[650px] border-0 rounded-lg bg-background dark:bg-background" 
                        loading="lazy"
                        allowFullScreen
                        scrolling="no"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                        style={{ background: isDark ? '#18181b' : '#fff' }}
                      />
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full bg-background/80 backdrop-blur-sm pointer-events-auto ${!canScrollPrev && 'opacity-50 cursor-not-allowed'}`}
                onClick={scrollPrev}
                disabled={!canScrollPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full bg-background/80 backdrop-blur-sm pointer-events-auto ${!canScrollNext && 'opacity-50 cursor-not-allowed'}`}
                onClick={scrollNext}
                disabled={!canScrollNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <a
              href={instagramAccount}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <Instagram className="h-5 w-5" />
              Follow on Instagram
            </a>
          </div>
        </TabsContent>
        
        <TabsContent value="tiktok" className="mt-6">
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {tiktokVideos.map((videoId) => (
              <Card key={videoId} className="overflow-hidden p-2 bg-background dark:bg-background border border-border rounded-xl shadow-md flex flex-col items-center justify-center">
                <iframe 
                  src={`https://www.tiktok.com/embed/v2/${videoId}?autoplay=1&theme=${isDark ? 'dark' : 'light'}`} 
                  className="w-full h-[650px] border-0 rounded-lg bg-background dark:bg-background" 
                  loading="lazy"
                  allowFullScreen
                  scrolling="no"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  style={{ background: isDark ? '#18181b' : '#fff' }}
                />
              </Card>
            ))}
          </div>
          
          {/* Mobile Carousel */}
          <div className="md:hidden relative">
            <div className="overflow-hidden" ref={tiktokRef}>
              <div className="flex">
                {tiktokVideos.map((videoId) => (
                  <div key={videoId} className="flex-[0_0_100%] min-w-0">
                    <Card className="overflow-hidden mx-2 p-2 bg-background dark:bg-background border border-border rounded-xl shadow-md flex flex-col items-center justify-center">
                      <iframe 
                        src={`https://www.tiktok.com/embed/v2/${videoId}?autoplay=1&theme=${isDark ? 'dark' : 'light'}`} 
                        className="w-full h-[650px] border-0 rounded-lg bg-background dark:bg-background" 
                        loading="lazy"
                        allowFullScreen
                        scrolling="no"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        style={{ background: isDark ? '#18181b' : '#fff' }}
                      />
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full bg-background/80 backdrop-blur-sm pointer-events-auto ${!canScrollPrev && 'opacity-50 cursor-not-allowed'}`}
                onClick={scrollPrev}
                disabled={!canScrollPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full bg-background/80 backdrop-blur-sm pointer-events-auto ${!canScrollNext && 'opacity-50 cursor-not-allowed'}`}
                onClick={scrollNext}
                disabled={!canScrollNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <a
              href={tiktokAccount}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <BookOpen className="h-5 w-5" />
              Follow on TikTok
            </a>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}