"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { LogOut, RefreshCw, Instagram } from "lucide-react";
import Navbar from "@/components/navbar-admin";

// Create custom TikTok icon
const TikTok = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
    <path d="M13 12h3a5 5 0 0 0 5-5V4"></path>
    <path d="M13 6.2v7.8"></path>
    <path d="M16 6h.01"></path>
  </svg>
);

// Define types
type SocialStats = {
  followers: number;
  engagement: number;
  likes: number;
  comments: number;
  shares?: number;
  views?: number;
};

type DailyStats = {
  date: string;
  followers: number;
  engagement: number;
};

type PostStats = {
  id: string;
  platform: string;
  date: string;
  likes: number;
  comments: number;
  shares?: number;
  views?: number;
  engagement: number;
  caption: string;
  image_url: string;
};

export default function SocialAnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  // State for social media platforms
  const [activePlatform, setActivePlatform] = useState("instagram");
  const [timeRange, setTimeRange] = useState("30");
  
  // Social media state
  const [instagramStats, setInstagramStats] = useState<SocialStats>({
    followers: 0,
    engagement: 0,
    likes: 0,
    comments: 0
  });
  
  const [tiktokStats, setTiktokStats] = useState<SocialStats>({
    followers: 0,
    engagement: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0
  });
  
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [topPosts, setTopPosts] = useState<PostStats[]>([]);
  
  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.clear();
        console.log("Checking authentication...");
        
        // Access localStorage with proper error handling
        const adminSessionJSON = localStorage.getItem("adminSession");
        console.log("Retrieved admin session:", adminSessionJSON);
        
        if (!adminSessionJSON) {
          console.log("No admin session found");
          router.push("/admin/login");
          return;
        }
        
        try {
          const session = JSON.parse(adminSessionJSON);
          
          // Check if session is valid
          if (!session || !session.loggedIn) {
            console.log("Invalid admin session format");
            router.push("/admin/login");
            return;
          }
          
          // Optional: Check if session is expired (after 24 hours)
          const now = new Date().getTime();
          const sessionTime = session.timestamp || 0;
          const sessionAgeHours = (now - sessionTime) / (1000 * 60 * 60);
          
          if (sessionAgeHours > 24) {
            console.log("Session expired");
            localStorage.removeItem("adminSession");
            router.push("/admin/login");
            return;
          }
          
          // Authentication successful
          console.log("Authentication successful");
          setIsAuthenticated(true);
          setAuthLoading(false);
          
        } catch (parseError) {
          console.error("Error parsing admin session:", parseError);
          localStorage.removeItem("adminSession");
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/admin/login");
      }
    };

    // Add a small delay to ensure localStorage is accessible
    const timer = setTimeout(() => {
      checkAuth();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [router]);

  // Load data only after authentication check completes
  useEffect(() => {
    if (isAuthenticated) {
      fetchSocialMediaStats();
    }
  }, [isAuthenticated, activePlatform, timeRange]);

  // Mock function to fetch social media stats
  const fetchSocialMediaStats = async () => {
    setDataLoading(true);
    
    try {
      // In a real implementation, you would call Instagram/TikTok API here
      // For demo purposes, we'll generate mock data
      
      setTimeout(() => {
        if (activePlatform === "instagram") {
          // Instagram stats
          setInstagramStats({
            followers: 5847,
            engagement: 428,
            likes: 5236,
            comments: 387
          });
          
          // Generate daily stats
          const days = parseInt(timeRange);
          const dailyData: DailyStats[] = [];
          
          for (let i = days; i >= 0; i--) {
            const date = subDays(new Date(), i);
            dailyData.push({
              date: format(date, "yyyy-MM-dd"),
              followers: 5847 - Math.floor(i * 5 * Math.random()),
              engagement: 428 - Math.floor(i * 0.8 * Math.random())
            });
          }
          
          setDailyStats(dailyData);
          
          // Top posts
          setTopPosts([
            {
              id: "1",
              platform: "instagram",
              date: "2025-04-15",
              likes: 253,
              comments: 42,
              engagement: 6.3,
              caption: "Gaya rambut terbaru pria untuk bulan ini! #sumabarberstyle",
              image_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c"
            },
            {
              id: "2",
              platform: "instagram",
              date: "2025-04-10",
              likes: 187,
              comments: 31,
              engagement: 4.8,
              caption: "Teknik layering ala barber profesional. Siap untuk mencoba? #barberstyle",
              image_url: "https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1"
            },
            {
              id: "3",
              platform: "instagram",
              date: "2025-04-05",
              likes: 176,
              comments: 28,
              engagement: 4.5,
              caption: "Fade cut sempurna dengan teknik khusus dari Suma Barber #hairstyle",
              image_url: "https://images.unsplash.com/photo-1621605810052-80936654d151"
            }
          ]);
          
        } else if (activePlatform === "tiktok") {
          // TikTok stats
          setTiktokStats({
            followers: 9382,
            engagement: 1275,
            likes: 28764,
            comments: 1832,
            shares: 743,
            views: 132750
          });
          
          // Generate daily stats
          const days = parseInt(timeRange);
          const dailyData: DailyStats[] = [];
          
          for (let i = days; i >= 0; i--) {
            const date = subDays(new Date(), i);
            dailyData.push({
              date: format(date, "yyyy-MM-dd"),
              followers: 9382 - Math.floor(i * 8 * Math.random()),
              engagement: 1275 - Math.floor(i * 2 * Math.random())
            });
          }
          
          setDailyStats(dailyData);
          
          // Top posts
          setTopPosts([
            {
              id: "1",
              platform: "tiktok",
              date: "2025-04-20",
              likes: 2845,
              comments: 183,
              shares: 96,
              views: 28750,
              engagement: 10.8,
              caption: "Tutorial cepat fade cut ala Suma Barber! #barberlife #tutorial",
              image_url: "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5"
            },
            {
              id: "2",
              platform: "tiktok",
              date: "2025-04-12",
              likes: 2367,
              comments: 154,
              shares: 87,
              views: 23400,
              engagement: 9.7,
              caption: "Tren rambut pria 2025 yang wajib kamu coba! #hairstyle #trend2025",
              image_url: "https://images.unsplash.com/photo-1567894340315-735fa7f8bea6"
            },
            {
              id: "3",
              platform: "tiktok",
              date: "2025-04-03",
              likes: 1983,
              comments: 124,
              shares: 72,
              views: 19750,
              engagement: 8.5,
              caption: "Rahasia perawatan rambut pria agar tetap sehat dan rapi #mensgrooming",
              image_url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486"
            }
          ]);
        }
        
        setDataLoading(false);
      }, 1500); // Simulate API delay
      
    } catch (error) {
      console.error('Error fetching social media stats:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data social media"
      });
      setDataLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchSocialMediaStats();
    toast({
      title: "Memperbarui data",
      description: "Data sedang diperbarui..."
    });
  };

  // Calculate average engagement rate
  const calculateEngagementRate = () => {
    if (activePlatform === "instagram") {
      return ((instagramStats.engagement / instagramStats.followers) * 100).toFixed(2);
    } else {
      return ((tiktokStats.engagement / tiktokStats.followers) * 100).toFixed(2);
    }
  };

  // Format large numbers with k/m suffix
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Memeriksa otentikasi...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect handled in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar activeItem="social-analytics" />

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Analisis Media Sosial</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Pantau performa akun Instagram dan TikTok Suma Barber
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Perbarui Data
          </Button>
        </div>

        {/* Platform Tabs */}
        <Tabs
          value={activePlatform}
          onValueChange={setActivePlatform}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="instagram" className="flex items-center">
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="tiktok" className="flex items-center">
                <TikTok />
                <span className="ml-2">TikTok</span>
              </TabsTrigger>
            </TabsList>
            
            <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
              <TabsList>
                <TabsTrigger value="7">7 Hari</TabsTrigger>
                <TabsTrigger value="30">30 Hari</TabsTrigger>
                <TabsTrigger value="90">90 Hari</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Instagram Content */}
          <TabsContent value="instagram">
            {dataLoading ? (
              <div className="flex justify-center p-12">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Followers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatNumber(instagramStats.followers)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        +{Math.floor(instagramStats.followers * 0.03)} dalam {timeRange} hari terakhir
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {calculateEngagementRate()}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Rata-rata {timeRange} hari terakhir
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatNumber(instagramStats.likes)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Dalam {timeRange} hari terakhir
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatNumber(instagramStats.comments)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Dalam {timeRange} hari terakhir
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Perkembangan Followers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={dailyStats.map(day => ({
                              date: format(new Date(day.date), "dd/MM"),
                              followers: day.followers
                            }))}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="followers" 
                              stroke="#E1306C" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={dailyStats.map(day => ({
                              date: format(new Date(day.date), "dd/MM"),
                              rate: (day.engagement / day.followers * 100).toFixed(2)
                            }))}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="rate" 
                              name="Engagement Rate (%)" 
                              stroke="#E1306C" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Performing Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Postingan Terbaik</CardTitle>
                    <CardDescription>
                      Postingan dengan engagement rate tertinggi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {topPosts.map(post => (
                        <Card key={post.id} className="overflow-hidden">
                          <div 
                            className="h-48 bg-cover bg-center" 
                            style={{ backgroundImage: `url(${post.image_url})` }}
                          />
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-500 mb-2">
                              {format(new Date(post.date), "d MMMM yyyy")}
                            </p>
                            <p className="text-sm mb-3 line-clamp-2">
                              {post.caption}
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-lg font-bold">{formatNumber(post.likes)}</p>
                                <p className="text-xs text-gray-500">Likes</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold">{formatNumber(post.comments)}</p>
                                <p className="text-xs text-gray-500">Comments</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold">{post.engagement}%</p>
                                <p className="text-xs text-gray-500">Engagement</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* TikTok Content */}
          <TabsContent value="tiktok">
            {dataLoading ? (
              <div className="flex justify-center p-12">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Followers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatNumber(tiktokStats.followers)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        +{Math.floor(tiktokStats.followers * 0.05)} dalam {timeRange} hari terakhir
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatNumber(tiktokStats.views || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Dalam {timeRange} hari terakhir
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Likes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatNumber(tiktokStats.likes)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Dalam {timeRange} hari terakhir
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Shares</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatNumber(tiktokStats.shares || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Dalam {timeRange} hari terakhir
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Perkembangan Followers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={dailyStats.map(day => ({
                              date: format(new Date(day.date), "dd/MM"),
                              followers: day.followers
                            }))}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="followers" 
                              stroke="#00f2ea" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={dailyStats.map(day => ({
                              date: format(new Date(day.date), "dd/MM"),
                              rate: (day.engagement / day.followers * 100).toFixed(2)
                            }))}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="rate" 
                              name="Engagement Rate (%)" 
                              stroke="#00f2ea" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Performing Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Video Terbaik</CardTitle>
                    <CardDescription>
                      Video dengan engagement rate tertinggi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {topPosts.map(post => (
                        <Card key={post.id} className="overflow-hidden">
                          <div 
                            className="h-48 bg-cover bg-center" 
                            style={{ backgroundImage: `url(${post.image_url})` }}
                          />
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-500 mb-2">
                              {format(new Date(post.date), "d MMMM yyyy")}
                            </p>
                            <p className="text-sm mb-3 line-clamp-2">
                              {post.caption}
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-lg font-bold">{formatNumber(post.views || 0)}</p>
                                <p className="text-xs text-gray-500">Views</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold">{formatNumber(post.likes)}</p>
                                <p className="text-xs text-gray-500">Likes</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold">{formatNumber(post.shares || 0)}</p>
                                <p className="text-xs text-gray-500">Shares</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}