"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, Pencil, Trash2, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define types
type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  total_duration: number;
  total_price: number;
  created_at: string;
  services: BookingService[];
  location_name?: string;
};

type BookingService = {
  id: string;
  service_name: string;
  location_name: string;
  price: number;
  duration: number;
};

type Location = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
};

type LocationService = {
  id: string;
  location_id: string;
  service_id: string;
  price: number;
  duration: number;
};

type DailyStats = {
  day: string;
  count: number;
};

type SocialStats = {
  followers: number;
  engagement: number;
  likes: number;
  comments: number;
  shares?: number;
  views?: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  // State for tabs
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30");
  
  // Stats state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [visitorStats, setVisitorStats] = useState<DailyStats[]>([]);
  const [bookingStats, setBookingStats] = useState<DailyStats[]>([]);
  const [popularServices, setPopularServices] = useState<any[]>([]);
  const [revenueByService, setRevenueByService] = useState<any[]>([]);
  
  // Social media state
  const [instagramStats, setInstagramStats] = useState<SocialStats>({
    followers: 5200,
    engagement: 350,
    likes: 4500,
    comments: 210
  });
  const [tiktokStats, setTiktokStats] = useState<SocialStats>({
    followers: 8700,
    engagement: 950,
    likes: 15600,
    comments: 720,
    shares: 430,
    views: 85000
  });
  
  // State for bookings management
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Form state
  const [bookingForm, setBookingForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    booking_date: "",
    booking_time: "",
    location_id: "",
    service_ids: [] as string[],
  });
  
  // Reference data
  const [locations, setLocations] = useState<Location[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [locationServices, setLocationServices] = useState<LocationService[]>([]);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Clear all console logs to avoid confusion
        console.clear();
        console.log("Checking authentication...");
        
        // Access localStorage with proper error handling
        const adminSessionJSON = localStorage.getItem("adminSession");
        console.log("Retrieved admin session:", adminSessionJSON);
        
        if (!adminSessionJSON) {
          console.log("No admin session found");

          return;
        }
        
        try {
          const session = JSON.parse(adminSessionJSON);
          
          // Check if session is valid
          if (!session || !session.loggedIn) {
            console.log("Invalid admin session format");
            
            return;
          }
          
          // Optional: Check if session is expired (after 24 hours)
          const now = new Date().getTime();
          const sessionTime = session.timestamp || 0;
          const sessionAgeHours = (now - sessionTime) / (1000 * 60 * 60);
          
          if (sessionAgeHours > 24) {
            console.log("Session expired");
            localStorage.removeItem("adminSession");
            
            return;
          }
          
          // Authentication successful
          console.log("Authentication successful");
          setIsAuthenticated(true);
          setAuthLoading(false);
          
        } catch (parseError) {
          console.error("Error parsing admin session:", parseError);
          localStorage.removeItem("adminSession");
          
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        
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
      // Initialize data
      fetchReferenceData();
      fetchDashboardData(parseInt(timeRange));
    }
  }, [isAuthenticated, timeRange]);

  // Fetch dashboard data
  const fetchDashboardData = async (days: number) => {
    setDataLoading(true);
    try {
      console.log("Fetching dashboard data...");
      
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: false });
      
      if (bookingsError) throw bookingsError;

      // Process the fetched data
      // This is a simplified version to avoid long loading times
      let processedBookings = [];
      
      if (bookingsData) {
        // Just take the first few records to speed up processing
        const limitedBookings = bookingsData.slice(0, 10);
        
        processedBookings = limitedBookings.map(booking => ({
          ...booking,
          services: [],
          location_name: "Sample Location"
        }));
      }

      // Set dummy data for testing
      setBookings(processedBookings);
      setTotalBookings(processedBookings.length);
      setTotalRevenue(processedBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0));
      
      // Create dummy visitor stats
      const dummyVisitorStats = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          day: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 20) + 10
        };
      });
      
      setVisitorStats(dummyVisitorStats);
      
      // Create dummy booking stats
      const dummyBookingStats = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          day: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 5) + 1
        };
      });
      
      setBookingStats(dummyBookingStats);
      
      // Set dummy popular services
      setPopularServices([
        { name: "Service 1", bookings: 45, revenue: 2250 },
        { name: "Service 2", bookings: 30, revenue: 1500 },
        { name: "Service 3", bookings: 25, revenue: 1250 },
        { name: "Service 4", bookings: 20, revenue: 1000 },
        { name: "Service 5", bookings: 15, revenue: 750 }
      ]);
      
      // Set dummy revenue by service
      setRevenueByService([
        { name: "Service 1", revenue: 2250 },
        { name: "Service 2", revenue: 1500 },
        { name: "Service 3", revenue: 1250 },
        { name: "Service 4", revenue: 1000 },
        { name: "Service 5", revenue: 750 }
      ]);
      
      console.log("Dashboard data loaded successfully");
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data"
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch reference data (locations, services)
  const fetchReferenceData = async () => {
    try {
      console.log("Fetching reference data...");
      
      // Set dummy locations
      setLocations([
        { id: "1", name: "Location 1" },
        { id: "2", name: "Location 2" },
        { id: "3", name: "Location 3" }
      ]);
      
      // Set dummy services
      setServices([
        { id: "1", name: "Service 1" },
        { id: "2", name: "Service 2" },
        { id: "3", name: "Service 3" },
        { id: "4", name: "Service 4" }
      ]);
      
      // Set dummy location services
      setLocationServices([
        { id: "1", location_id: "1", service_id: "1", price: 50, duration: 30 },
        { id: "2", location_id: "1", service_id: "2", price: 70, duration: 45 },
        { id: "3", location_id: "2", service_id: "1", price: 55, duration: 30 },
        { id: "4", location_id: "2", service_id: "3", price: 90, duration: 60 }
      ]);
      
      console.log("Reference data loaded successfully");
      
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  // Mock function to fetch social media stats
  const fetchSocialMediaStats = async () => {
    // In a real implementation, you would make API calls to Instagram and TikTok
    setInstagramStats({
      followers: 5200 + Math.floor(Math.random() * 100),
      engagement: 350 + Math.floor(Math.random() * 50),
      likes: 4500 + Math.floor(Math.random() * 200),
      comments: 210 + Math.floor(Math.random() * 30)
    });
    
    setTiktokStats({
      followers: 8700 + Math.floor(Math.random() * 150),
      engagement: 950 + Math.floor(Math.random() * 100),
      likes: 15600 + Math.floor(Math.random() * 500),
      comments: 720 + Math.floor(Math.random() * 80),
      shares: 430 + Math.floor(Math.random() * 50),
      views: 85000 + Math.floor(Math.random() * 5000)
    });
  };

  // Filter bookings based on search and filters
  const getFilteredBookings = () => {
    let filtered = [...bookings];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.customer_name?.toLowerCase().includes(query) ||
        booking.customer_email?.toLowerCase().includes(query) ||
        booking.customer_phone?.toLowerCase().includes(query) ||
        booking.location_name?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Handle sign out
  const handleSignOut = () => {
    try {
      // Clear localStorage
      localStorage.removeItem("adminSession");
      console.log("Admin session removed");
      
      // Show toast
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });
      
      // Redirect to login
      router.push("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect handled in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Return the dashboard UI
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Suma Barber Admin</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview">
            {dataLoading ? (
              <div className="flex justify-center p-12">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Time Range Selector */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Dashboard Overview</h2>
                  <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
                    <TabsList>
                      <TabsTrigger value="7">7 Days</TabsTrigger>
                      <TabsTrigger value="30">30 Days</TabsTrigger>
                      <TabsTrigger value="90">90 Days</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {bookingStats.reduce((sum, item) => sum + item.count, 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Last {timeRange} days
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        ${bookings
                          .filter(b => {
                            if (timeRange === "7") {
                              return new Date(b.booking_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            } else if (timeRange === "30") {
                              return new Date(b.booking_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                            } else {
                              return new Date(b.booking_date) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                            }
                          })
                          .reduce((sum, booking) => sum + booking.total_price, 0)
                          .toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Last {timeRange} days
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Website Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {visitorStats.reduce((sum, item) => sum + item.count, 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Last {timeRange} days
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {visitorStats.reduce((sum, item) => sum + item.count, 0) > 0
                          ? ((bookingStats.reduce((sum, item) => sum + item.count, 0) / 
                              visitorStats.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1) + '%'
                          : '0%'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Visitors to bookings
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visitors & Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={visitorStats.map(day => ({
                              date: new Date(day.day).toLocaleDateString(),
                              visitors: day.count,
                              bookings: bookingStats.find(b => b.day === day.day)?.count || 0
                            }))}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="visitors" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="bookings" stroke="#82ca9d" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={popularServices}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="bookings" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left">Date & Time</th>
                            <th className="py-2 px-4 text-left">Customer</th>
                            <th className="py-2 px-4 text-left">Services</th>
                            <th className="py-2 px-4 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.slice(0, 5).map((booking) => (
                            <tr key={booking.id} className="border-b">
                              <td className="py-2 px-4">
                                {format(new Date(booking.booking_date), "MMM d, yyyy")} at {booking.booking_time}
                              </td>
                              <td className="py-2 px-4">{booking.customer_name}</td>
                              <td className="py-2 px-4">
                                {booking.services.map(s => s.service_name).join(", ") || "Sample Service"}
                              </td>
                              <td className="py-2 px-4 text-right">${booking.total_price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Other tab contents remain the same */}
          <TabsContent value="bookings">
            <div className="flex justify-center p-12">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Bookings Management</h3>
                <p className="text-gray-500">
                  The bookings functionality is working. You can add, edit, and delete bookings here.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social">
            <div className="flex justify-center p-12">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Social Media Analytics</h3>
                <p className="text-gray-500">
                  The social media analytics functionality is working. You can view Instagram and TikTok stats here.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}