"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
  location_id: string;
  location_name?: string;
};

type Location = {
  id: string;
  name: string;
  area: string;
  address: string;
};

type Service = {
  id: string;
  name: string;
  description: string;
  image_url: string;
};

type LocationService = {
  id: string;
  location_id: string;
  service_id: string;
  price: number;
  duration: number;
  service_name?: string;
};

export default function BookingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  // State for tabs and locations
  const [activeLocation, setActiveLocation] = useState("");
  
  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  
  // Reference data
  const [locations, setLocations] = useState<Location[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [locationServices, setLocationServices] = useState<LocationService[]>([]);
  
  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Form state
  const [bookingForm, setBookingForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    booking_date: "",
    booking_time: "",
    location_id: "",
    selected_services: [] as string[]
  });

  // Selected services for edit/add
  const [selectedServices, setSelectedServices] = useState<LocationService[]>([]);
  
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
      fetchReferenceData();
    }
  }, [isAuthenticated]);

  // Fetch bookings when activeLocation changes
  useEffect(() => {
    if (activeLocation) {
      fetchBookings(activeLocation);
    }
  }, [activeLocation]);

  // Filter bookings when search query or filter date changes
  useEffect(() => {
    if (bookings.length > 0) {
      filterBookings();
    }
  }, [searchQuery, filterDate, bookings]);

  // Fetch reference data (locations, services)
  const fetchReferenceData = async () => {
    try {
      console.log("Fetching reference data...");
      
      // Fetch locations
      const { data: locationsData, error: locationsError } = await supabase
        .from("locations")
        .select("*");
      
      if (locationsError) throw locationsError;
      
      if (locationsData && locationsData.length > 0) {
        setLocations(locationsData);
        // Set the first location as active by default
        setActiveLocation(locationsData[0].id);
      }
      
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*");
      
      if (servicesError) throw servicesError;
      setServices(servicesData || []);
      
      // Fetch location services with service names
      const { data: locationServicesData, error: locationServicesError } = await supabase
        .from("location_services")
        .select(`
          *,
          services:service_id (name)
        `);
      
      if (locationServicesError) throw locationServicesError;
      
      // Process location services to include service_name
      const processedLocationServices = locationServicesData?.map((ls: any) => ({
        ...ls,
        service_name: ls.services?.name || "Unknown Service"
      })) || [];
      
      setLocationServices(processedLocationServices);
      
      console.log("Reference data loaded successfully");
      
    } catch (error) {
      console.error('Error fetching reference data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data referensi"
      });
    }
  };

  // Fetch bookings for a specific location
  const fetchBookings = async (locationId: string) => {
    setDataLoading(true);
    try {
      console.log(`Fetching bookings for location ${locationId}...`);
      
      // Fetch bookings for the selected location
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("location_id", locationId)
        .order("booking_date", { ascending: false });
      
      if (bookingsError) throw bookingsError;

      // Get location name
      const location = locations.find(loc => loc.id === locationId);
      const locationName = location ? location.name : "Unknown Location";
      
      // Add location name to each booking
      const processedBookings = bookingsData?.map(booking => ({
        ...booking,
        location_name: locationName
      })) || [];
      
      setBookings(processedBookings);
      setFilteredBookings(processedBookings);
      
      console.log(`Loaded ${processedBookings.length} bookings for location ${locationName}`);
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data booking"
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Filter bookings based on search query and filter date
  const filterBookings = () => {
    let filtered = [...bookings];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.customer_name?.toLowerCase().includes(query) ||
        booking.customer_email?.toLowerCase().includes(query) ||
        booking.customer_phone?.toLowerCase().includes(query)
      );
    }
    
    // Apply date filter
    if (filterDate) {
      const dateStr = format(filterDate, "yyyy-MM-dd");
      filtered = filtered.filter(booking => booking.booking_date === dateStr);
    }
    
    setFilteredBookings(filtered);
  };

  // Reset filter
  const resetFilter = () => {
    setSearchQuery("");
    setFilterDate(undefined);
    setFilteredBookings(bookings);
  };

  // Open add dialog
  const openAddDialog = () => {
    // Reset form
    setBookingForm({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      booking_date: format(new Date(), "yyyy-MM-dd"),
      booking_time: "10:00",
      location_id: activeLocation,
      selected_services: []
    });
    
    setSelectedServices([]);
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    
    // Fetch booking services
    fetchBookingServices(booking.id);
    
    // Set form data
    setBookingForm({
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_phone: booking.customer_phone,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      location_id: booking.location_id,
      selected_services: []
    });
    
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  // Fetch services for a specific booking
  const fetchBookingServices = async (bookingId: string) => {
    try {
      const { data: bookingServicesData, error: bookingServicesError } = await supabase
        .from("booking_services")
        .select("*, location_services(*, services(name))")
        .eq("booking_id", bookingId);
      
      if (bookingServicesError) throw bookingServicesError;

      // Process booking services
      if (bookingServicesData) {
        // Extract location service IDs
        const selectedServiceIds = bookingServicesData.map(bs => bs.location_service_id);
        
        // Update form
        setBookingForm(prev => ({
          ...prev,
          selected_services: selectedServiceIds
        }));
        
        // Set selected services
        const services = bookingServicesData.map((bs: any) => ({
          id: bs.location_service_id,
          location_id: bs.location_services?.location_id || "",
          service_id: bs.location_services?.service_id || "",
          price: bs.price || 0,
          duration: bs.duration || 0,
          service_name: bs.location_services?.services?.name || "Unknown Service"
        }));
        
        setSelectedServices(services);
      }
    } catch (error) {
      console.error('Error fetching booking services:', error);
    }
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle service selection change
  const handleServiceChange = (serviceId: string) => {
    
    // Check if already selected
    if (bookingForm.selected_services.includes(serviceId)) {
      return;
    }
    
    // Find the service
    const service = locationServices.find(ls => ls.id === serviceId);
    
    if (service) {
      // Add to selected services
      setSelectedServices(prev => [...prev, service]);
      
      // Update form
      setBookingForm(prev => ({
        ...prev,
        selected_services: [...prev.selected_services, serviceId]
      }));
    }
  };

  // Remove a selected service
  const removeSelectedService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(service => service.id !== serviceId));
    
    setBookingForm(prev => ({
      ...prev,
      selected_services: prev.selected_services.filter(id => id !== serviceId)
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
    const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
    
    return { totalPrice, totalDuration };
  };

  // Handle add booking
  const handleAddBooking = async () => {
    try {
      // Validate form
      if (
        !bookingForm.customer_name ||
        !bookingForm.customer_email ||
        !bookingForm.customer_phone ||
        !bookingForm.booking_date ||
        !bookingForm.booking_time ||
        !bookingForm.location_id ||
        selectedServices.length === 0
      ) {
        toast({
          variant: "destructive",
          title: "Validasi Gagal",
          description: "Silakan lengkapi semua field yang diperlukan"
        });
        return;
      }
      
      // Calculate totals
      const { totalPrice, totalDuration } = calculateTotals();
      
      // Add booking
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_name: bookingForm.customer_name,
          customer_email: bookingForm.customer_email,
          customer_phone: bookingForm.customer_phone,
          booking_date: bookingForm.booking_date,
          booking_time: bookingForm.booking_time,
          location_id: bookingForm.location_id,
          total_duration: totalDuration,
          total_price: totalPrice
        })
        .select()
        .single();
      
      if (bookingError) throw bookingError;

      // Add booking services
      if (bookingData) {
        const bookingId = bookingData.id;
        
        // Prepare booking services data
        const bookingServices = selectedServices.map(service => ({
          booking_id: bookingId,
          location_service_id: service.id,
          service_id: service.service_id,
          price: service.price,
          duration: service.duration
        }));
        
        // Insert booking services
        const { error: bookingServicesError } = await supabase
          .from("booking_services")
          .insert(bookingServices);
        
        if (bookingServicesError) throw bookingServicesError;
        
        // Success
        toast({
          title: "Booking Berhasil Ditambahkan",
          description: "Data booking baru telah berhasil disimpan"
        });
        
        // Close dialog and refresh data
        setIsAddDialogOpen(false);
        fetchBookings(activeLocation);
      }
    } catch (error) {
      console.error('Error adding booking:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan booking baru"
      });
    }
  };

  // Handle edit booking
  const handleEditBooking = async () => {
    try {
      if (!selectedBooking) return;
      
      // Validate form
      if (
        !bookingForm.customer_name ||
        !bookingForm.customer_email ||
        !bookingForm.customer_phone ||
        !bookingForm.booking_date ||
        !bookingForm.booking_time ||
        !bookingForm.location_id ||
        selectedServices.length === 0
      ) {
        toast({
          variant: "destructive",
          title: "Validasi Gagal",
          description: "Silakan lengkapi semua field yang diperlukan"
        });
        return;
      }
      
      // Calculate totals
      const { totalPrice, totalDuration } = calculateTotals();
      
      // Update booking
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          customer_name: bookingForm.customer_name,
          customer_email: bookingForm.customer_email,
          customer_phone: bookingForm.customer_phone,
          booking_date: bookingForm.booking_date,
          booking_time: bookingForm.booking_time,
          location_id: bookingForm.location_id,
          total_duration: totalDuration,
          total_price: totalPrice
        })
        .eq("id", selectedBooking.id);
      
      if (bookingError) throw bookingError;

      // Delete existing booking services
      const { error: deleteError } = await supabase
        .from("booking_services")
        .delete()
        .eq("booking_id", selectedBooking.id);
      
      if (deleteError) throw deleteError;
      
      // Add new booking services
      const bookingServices = selectedServices.map(service => ({
        booking_id: selectedBooking.id,
        location_service_id: service.id,
        service_id: service.service_id,
        price: service.price,
        duration: service.duration
      }));
      
      if (bookingServices.length > 0) {
        const { error: bookingServicesError } = await supabase
          .from("booking_services")
          .insert(bookingServices);
        
        if (bookingServicesError) throw bookingServicesError;
      }
      
      // Success
      toast({
        title: "Booking Berhasil Diperbarui",
        description: "Data booking telah berhasil diperbarui"
      });
      
      // Close dialog and refresh data
      setIsEditDialogOpen(false);
      fetchBookings(activeLocation);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memperbarui booking"
      });
    }
  };

  // Handle delete booking
  const handleDeleteBooking = async () => {
    try {
      if (!selectedBooking) return;
      
      // Delete booking services first (foreign key constraint)
      const { error: bookingServicesError } = await supabase
        .from("booking_services")
        .delete()
        .eq("booking_id", selectedBooking.id);
      
      if (bookingServicesError) throw bookingServicesError;
      
      // Delete booking
      const { error: bookingError } = await supabase
        .from("bookings")
        .delete()
        .eq("id", selectedBooking.id);
      
      if (bookingError) throw bookingError;
      
      // Success
      toast({
        title: "Booking Berhasil Dihapus",
        description: "Data booking telah berhasil dihapus"
      });
      
      // Close dialog and refresh data
      setIsDeleteDialogOpen(false);
      fetchBookings(activeLocation);
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus booking"
      });
    }
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
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Manajemen Booking</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola semua booking dari kedua lokasi barber shop
          </p>
        </div>

        {/* Location Tabs */}
        <Tabs
          value={activeLocation}
          onValueChange={setActiveLocation}
          className="mb-6"
        >
          <TabsList>
            {locations.map(location => (
              <TabsTrigger key={location.id} value={location.id}>
                {location.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filter and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari nama, email, atau telepon pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-auto">
                  {filterDate ? format(filterDate, "dd/MM/yyyy") : "Pilih Tanggal"}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filterDate}
                  onSelect={setFilterDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={resetFilter}>
              Reset Filter
            </Button>
            <Button onClick={openAddDialog}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Tambah Booking
            </Button>
          </div>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Daftar Booking - {locations.find(loc => loc.id === activeLocation)?.name || ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex justify-center p-12">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada data booking yang ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">Tanggal & Waktu</th>
                      <th className="py-2 px-4 text-left">Pelanggan</th>
                      <th className="py-2 px-4 text-left">Kontak</th>
                      <th className="py-2 px-4 text-right">Durasi</th>
                      <th className="py-2 px-4 text-right">Harga</th>
                      <th className="py-2 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          {format(new Date(booking.booking_date), "dd MMM yyyy")}
                          <br />
                          <span className="text-sm text-gray-500">Jam {booking.booking_time}</span>
                        </td>
                        <td className="py-3 px-4">{booking.customer_name}</td>
                        <td className="py-3 px-4">
                          {booking.customer_email}
                          <br />
                          <span className="text-sm text-gray-500">{booking.customer_phone}</span>
                        </td>
                        <td className="py-3 px-4 text-right">{booking.total_duration} menit</td>
                        <td className="py-3 px-4 text-right">Rp{booking.total_price.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(booking)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(booking)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Booking Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Booking Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="customer_name">Nama Pelanggan</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={bookingForm.customer_name}
                  onChange={handleFormChange}
                  placeholder="Masukkan nama pelanggan"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  value={bookingForm.customer_email}
                  onChange={handleFormChange}
                  placeholder="Masukkan email pelanggan"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="customer_phone">Nomor Telepon</Label>
                <Input
                  id="customer_phone"
                  name="customer_phone"
                  value={bookingForm.customer_phone}
                  onChange={handleFormChange}
                  placeholder="Masukkan nomor telepon"
                />
              </div>
              <div>
                <Label htmlFor="booking_date">Tanggal Booking</Label>
                <Input
                  id="booking_date"
                  name="booking_date"
                  type="date"
                  value={bookingForm.booking_date}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="booking_time">Waktu Booking</Label>
                <Input
                  id="booking_time"
                  name="booking_time"
                  type="time"
                  value={bookingForm.booking_time}
                  onChange={handleFormChange}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="services">Pilih Layanan</Label>
                <Select onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih layanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationServices
                      .filter(ls => ls.location_id === activeLocation)
                      .map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.service_name} - Rp{service.price.toLocaleString()}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Selected Services */}
              {selectedServices.length > 0 && (
                <div className="col-span-2">
                  <Label>Layanan yang Dipilih</Label>
                  <div className="mt-2 border rounded-md p-2">
                    {selectedServices.map(service => (
                      <div key={service.id} className="flex justify-between items-center py-1 border-b last:border-0">
                        <div>
                          <div>{service.service_name}</div>
                          <div className="text-sm text-gray-500">
                            {service.duration} menit - Rp{service.price.toLocaleString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelectedService(service.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="mt-3 pt-2 border-t flex justify-between font-medium">
                      <div>Total</div>
                      <div>
                        {calculateTotals().totalDuration} menit - Rp{calculateTotals().totalPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddBooking}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="edit_customer_name">Nama Pelanggan</Label>
                <Input
                  id="edit_customer_name"
                  name="customer_name"
                  value={bookingForm.customer_name}
                  onChange={handleFormChange}
                  placeholder="Masukkan nama pelanggan"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_customer_email">Email</Label>
                <Input
                  id="edit_customer_email"
                  name="customer_email"
                  type="email"
                  value={bookingForm.customer_email}
                  onChange={handleFormChange}
                  placeholder="Masukkan email pelanggan"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_customer_phone">Nomor Telepon</Label>
                <Input
                  id="edit_customer_phone"
                  name="customer_phone"
                  value={bookingForm.customer_phone}
                  onChange={handleFormChange}
                  placeholder="Masukkan nomor telepon"
                />
              </div>
              <div>
                <Label htmlFor="edit_booking_date">Tanggal Booking</Label>
                <Input
                  id="edit_booking_date"
                  name="booking_date"
                  type="date"
                  value={bookingForm.booking_date}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="edit_booking_time">Waktu Booking</Label>
                <Input
                  id="edit_booking_time"
                  name="booking_time"
                  type="time"
                  value={bookingForm.booking_time}
                  onChange={handleFormChange}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_services">Pilih Layanan</Label>
                <Select onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih layanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationServices
                      .filter(ls => ls.location_id === activeLocation)
                      .map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.service_name} - Rp{service.price.toLocaleString()}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Selected Services */}
              {selectedServices.length > 0 && (
                <div className="col-span-2">
                  <Label>Layanan yang Dipilih</Label>
                  <div className="mt-2 border rounded-md p-2">
                    {selectedServices.map(service => (
                      <div key={service.id} className="flex justify-between items-center py-1 border-b last:border-0">
                        <div>
                          <div>{service.service_name}</div>
                          <div className="text-sm text-gray-500">
                            {service.duration} menit - Rp{service.price.toLocaleString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelectedService(service.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="mt-3 pt-2 border-t flex justify-between font-medium">
                      <div>Total</div>
                      <div>
                        {calculateTotals().totalDuration} menit - Rp{calculateTotals().totalPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditBooking}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Apakah Anda yakin ingin menghapus booking untuk <strong>{selectedBooking?.customer_name}</strong> pada tanggal <strong>{selectedBooking?.booking_date}</strong>?
            </p>
            <p className="mt-2 text-red-500">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteBooking}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}