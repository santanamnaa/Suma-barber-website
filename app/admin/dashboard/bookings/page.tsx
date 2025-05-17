"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

function formatRupiah(amount: number) {
  return amount.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });
}

// Fungsi untuk validasi UUID
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Tipe data untuk booking service map
interface ServiceMap {
  [key: string]: {
    name: string;
    id: string;
  };
}

interface LocationService {
  id: string;
  location_id: string;
  service_id: string;
  services?: {
    id: string;
    name: string;
  };
  price?: number;
  duration?: number;
}

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  total_price: number;
  total_duration: number;
  status: string;
  location_id: string;
  locations?: { id: string; name: string };
  service_name?: string;
  service_id?: string | null;
}

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | null, data?: any }>({ type: null });
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [locations, setLocations] = useState<any[]>([]);
  const [locationServices, setLocationServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [customerDetail, setCustomerDetail] = useState<any | null>(null);
  
  // New state for filters and counting
  const [filterLocation, setFilterLocation] = useState("");
  const [filterService, setFilterService] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const pageSize = 10;
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  // Generate current year and previous 5 years for filter
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  // Months for filter
  const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" }
  ];

  // Reset month when year changes
  useEffect(() => {
    if (!filterYear) {
      setFilterMonth("");
    }
  }, [filterYear]);

  async function fetchBookings() {
    setLoading(true);
    try {
      // Step 1: Get bookings with basic filters
      let query = supabase
        .from("bookings")
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          booking_date,
          booking_time,
          total_price,
          total_duration,
          status,
          location_id,
          locations(id, name)
        `, { count: "exact" })
        .order("booking_date", { ascending: false })
        .order("created_at", { ascending: false });

      // Apply filters
      if (search) query = query.ilike("customer_name", `%${search}%`);
      if (filterLocation) query = query.eq("location_id", filterLocation);
      
      // Apply date filters
      if (filterYear && filterMonth) {
        const year = filterYear;
        const month = filterMonth;
        const start = `${year}-${month}-01`;
        
        // Calculate last day of month
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const end = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
        
        query = query.gte("booking_date", start).lte("booking_date", end);
      } else if (filterYear) {
        query = query.gte("booking_date", `${filterYear}-01-01`).lte("booking_date", `${filterYear}-12-31`);
      }
      
      const { data: bookingsData, count, error } = await query.range((page-1)*pageSize, page*pageSize-1);
      if (error) throw error;
      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      console.log('Fetched bookingsData:', bookingsData);

      // --- Fallback 1: Try RPC ---
      let serviceData = null;
      try {
        // Try to use a custom RPC if it exists
        const rpcRes = await supabase.rpc('get_booking_services_with_details', {
          p_booking_ids: bookingsData.map((b: any) => b.id)
        });
        
        if (!rpcRes.error) {
          serviceData = rpcRes.data;
          console.log('Fetched serviceData via RPC:', serviceData);
        } else {
          throw rpcRes.error;
        }
      } catch (err) {
        console.log('RPC not available, trying alternative approaches');
      }

      // --- Fallback 2: Try View ---
      if (!serviceData || serviceData.length === 0) {
        try {
          const viewRes = await supabase.from('booking_service_details')
            .select('booking_id, service_name, service_id')
            .in('booking_id', bookingsData.map((b: any) => b.id));
            
          if (viewRes.error) throw viewRes.error;
          serviceData = viewRes.data;
          
          if (serviceData && serviceData.length > 0) {
            console.log('Fetched serviceData via View:', serviceData);
          }
        } catch (err) {
          console.log('View not available, trying direct query');
        }
      }

      // --- Fallback 3: Try Direct Query ---
      if (!serviceData || serviceData.length === 0) {
        try {
          // Get booking services
          const { data: bsData, error: bsError } = await supabase
            .from('booking_services')
            .select('id, booking_id, location_service_id')
            .in('booking_id', bookingsData.map((b: any) => b.id));
            
          if (bsError) throw bsError;
          
          if (bsData && bsData.length > 0) {
            // Get location services with services
            const { data: lsData, error: lsError } = await supabase
              .from('location_services')
              .select(`
                id, 
                service_id,
                services(id, name)
              `)
              .in('id', bsData.map((bs: any) => bs.location_service_id));
              
            if (lsError) throw lsError;
            
            // Map service names to booking services
            const lsMap: { [key: string]: { service_id: string; service_name: string } } = {};
            if (lsData) {
              (lsData as any[]).forEach((ls: any) => {
                if (ls.services) {
                  lsMap[ls.id] = {
                    service_id: ls.services.id,
                    service_name: ls.services.name
                  };
                }
              });
            }
            
            // Map booking_id to service name
            serviceData = bsData.map((bs: any) => ({
              id: bs.id,
              booking_id: bs.booking_id,
              service_id: lsMap[bs.location_service_id]?.service_id,
              service_name: lsMap[bs.location_service_id]?.service_name,
              location_service_id: bs.location_service_id
            })).filter((item: any) => item.service_name) as any[];
            
            console.log('Fetched serviceData via Query:', serviceData);
          }
        } catch (err) {
          const error = err as any;
          console.error('Error with direct query:', error);
        }
      }

      // --- Merge bookings with service data ---
      const serviceMap: ServiceMap = {};
      if (serviceData && serviceData.length > 0) {
        // Group by booking_id (in case multiple services per booking)
        (serviceData as any[]).forEach((item: any) => {
          if (!serviceMap[item.booking_id] || !serviceMap[item.booking_id].name) {
            serviceMap[item.booking_id] = {
              name: item.service_name,
              id: item.service_id
            };
          }
        });
      }
      
      // Create enhanced bookings with service data
      const enhancedBookings: Booking[] = (bookingsData as any[]).map((booking: any) => {
        // locations bisa array atau objek, pastikan objek atau undefined
        let locationsObj: { id: string; name: string } | undefined = undefined;
        if (booking.locations) {
          if (Array.isArray(booking.locations)) {
            locationsObj = booking.locations[0] || undefined;
          } else {
            locationsObj = booking.locations;
          }
        }
        
        return {
          ...booking,
          locations: locationsObj,
          service_name: serviceMap[booking.id]?.name || '-',
          service_id: serviceMap[booking.id]?.id ?? null,
        };
      });
      
      // Apply service filter if needed
      let finalBookings = enhancedBookings;
      if (filterService) {
        finalBookings = enhancedBookings.filter((b: Booking) =>
          !!b.service_id && String(b.service_id) === String(filterService)
        );
      }
      
      setBookings(finalBookings);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  // Function to get booking_services for a specific booking
  async function fetchBookingServices(bookingId: string): Promise<any[]> {
    try {
      console.log(`Fetching booking services for booking ID: ${bookingId}`);
      
      // Approach 1: Try RPC First
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_booking_service_details', {
          booking_id_param: bookingId
        });
        
        if (!rpcError && rpcData && rpcData.length > 0) {
          console.log(`RPC successful, found ${rpcData.length} booking services:`, rpcData);
          return rpcData;
        }
      } catch (rpcErr) {
        console.log('RPC not available, trying other methods:', rpcErr);
      }
      
      // Approach 2: Try View
      try {
        const { data: viewData, error: viewError } = await supabase
          .from('booking_service_details')
          .select('*')
          .eq('booking_id', bookingId);
          
        if (!viewError && viewData && viewData.length > 0) {
          console.log(`View successful, found ${viewData.length} booking services:`, viewData);
          return viewData;
        }
      } catch (viewErr) {
        console.log('View not available, trying direct query:', viewErr);
      }
      
      // Approach 3: Direct queries (most reliable)
      // Get all booking_services for this booking
      const { data: bsData, error: bsError } = await supabase
        .from('booking_services')
        .select('id, location_service_id')
        .eq('booking_id', bookingId);
        
      if (bsError) throw bsError;
      
      if (!bsData || bsData.length === 0) {
        console.log(`No booking services found for booking ${bookingId}`);
        return [];
      }
      
      // Get location service details
      const lsIds = bsData.map((bs: any) => bs.location_service_id);
      
      const { data: lsData, error: lsError } = await supabase
        .from('location_services')
        .select(`
          id,
          service_id,
          price,
          duration,
          services(id, name)
        `)
        .in('id', lsIds);
        
      if (lsError) throw lsError;
      
      // Combine data
      const result = bsData.map((bs: any) => {
        const ls = (lsData as any[]).find((ls: any) => ls.id === bs.location_service_id);
        return {
          booking_service_id: bs.id,
          booking_id: bookingId,
          location_service_id: bs.location_service_id,
          service_id: ls?.service_id || null,
          service_name: ls?.services?.name || null,
          price: ls?.price || 0,
          duration: ls?.duration || 0
        };
      });
      
      console.log(`Successfully fetched ${result.length} booking services via direct query:`, result);
      return result;
    } catch (e) {
      const error = e as any;
      console.error(`Error in fetchBookingServices for ${bookingId}:`, error);
      return [];
    }
  }

  async function fetchDropdowns() {
    try {
      // Load locations
      const { data: locs, error: locError } = await supabase
        .from("locations")
        .select("id, name")
        .order("name");
        
      if (locError) throw locError;
      
      // Load location services with services
      const { data: locSvcs, error: locSvcError } = await supabase
        .from("location_services")
        .select("*, services(id, name)")
        .order("created_at", { ascending: false });
        
      if (locSvcError) throw locSvcError;
      
      // Load all services
      const { data: svcs, error: svcError } = await supabase
        .from("services")
        .select("id, name")
        .order("name");
        
      if (svcError) throw svcError;
      
      setLocations(locs || []);
      setLocationServices(locSvcs || []);
      setServices(svcs || []);
      
      // Fetch available years from booking data for filter
      const { data: yearData } = await supabase
        .from('bookings')
        .select('booking_date')
        .order('booking_date', { ascending: false });
        
      if (yearData && yearData.length > 0) {
        const yearsFromData = Array.from(
          new Set(
            (yearData as any[])
              .map((b) => b.booking_date?.slice(0, 4))
              .filter(Boolean)
          )
        );
        setAvailableYears(yearsFromData);
      }
    } catch (error) {
      console.error("Error loading dropdowns:", error);
    }
  }

  useEffect(() => { 
    fetchBookings(); 
    fetchDropdowns(); 
  }, []);
  
  // Update to include filters in dependencies
  useEffect(() => { 
    fetchBookings(); 
  }, [search, page, filterLocation, filterService, filterYear, filterMonth]);

  // Filter services based on selected location
  useEffect(() => {
    if (form.location_id) {
      setFilteredServices(locationServices.filter((ls) => 
        String(ls.location_id) === String(form.location_id)
      ));
    } else {
      setFilteredServices([]);
    }
  }, [form.location_id, locationServices]);

  // Additional effect to ensure filteredServices is populated in edit mode
  useEffect(() => {
    // This effect ensures that when edit form opens, services are filtered correctly
    if (modal.type === "edit" && form.location_id && filteredServices.length === 0) {
      console.log("Refiltering services for location:", form.location_id);
      setFilteredServices(locationServices.filter((ls) => 
        String(ls.location_id) === String(form.location_id)
      ));
    }
  }, [modal.type, form.location_id, locationServices, filteredServices]);

  // Auto-fill price & duration when service is selected
  useEffect(() => {
    if (form.location_service_id) {
      const svc = locationServices.find((ls: LocationService) => ls.id === form.location_service_id);
      if (svc) {
        setForm((f: any) => ({ ...f, total_price: svc.price, total_duration: svc.duration }));
      }
    }
  }, [form.location_service_id, locationServices]);

  function openAdd() {
    // Initialize with today's date
    const today = new Date().toISOString().split('T')[0];
    setForm({
      booking_date: today,
      booking_time: "10:00",
      status: "scheduled"
    });
    setModal({ type: "add" });
  }
  
  async function openEdit(b: Booking) {
    console.log("Opening edit for booking:", b);
    try {
      // Ensure we have a valid ID
      if (!b.id || !isValidUUID(b.id)) {
        console.error("Invalid booking ID:", b.id);
        alert("ID booking tidak valid. Silakan refresh halaman.");
        return;
      }
      
      // Load booking_services data for this booking
      const services = await fetchBookingServices(b.id);
      console.log("Fetched booking services:", services);
      
      // Find the first booking_service
      const firstService = services?.[0];
      
      // Important: Pre-filter services so the dropdown shows the right options
      if (b.location_id) {
        const filtered = locationServices.filter(
          (ls) => String(ls.location_id) === String(b.location_id)
        );
        setFilteredServices(filtered);
        console.log("Pre-filtered services for location:", b.location_id, filtered.length);
      }
      
      // Prepare form with the booking info and first service
      setForm({
        ...b,
        id: b.id, // Ensure ID is set
        location_id: b.location_id,
        location_service_id: firstService?.location_service_id || "",
        service_id: firstService?.service_id || "",
        service_name: firstService?.service_name || "",
        total_price: b.total_price,
        total_duration: b.total_duration,
        booking_services: services
      });
      
      setModal({ type: "edit", data: {...b, booking_services: services} });
    } catch (error) {
      const err = error as any;
      console.error("Error loading data for edit:", err);
      // Fallback if services can't be loaded
      setForm({
        ...b,
        id: b.id, // Ensure ID is set
        location_id: b.location_id,
        total_price: b.total_price,
        total_duration: b.total_duration
      });
      setModal({ type: "edit", data: b });
    }
  }
  
  function openDelete(b: Booking) {
    console.log("Opening delete for booking:", b);
    
    // Validate booking ID
    if (!b.id || !isValidUUID(b.id)) {
      console.error("Invalid booking ID:", b.id);
      alert("ID booking tidak valid. Silakan refresh halaman.");
      return;
    }
    
    setModal({ type: "delete", data: b });
  }
  
  function openCustomerDetail(customer: Booking) {
    const bookingsByCustomer = bookings.filter((b: Booking) => b.customer_email === customer.customer_email);
    const totalSpent = bookingsByCustomer.reduce((acc: number, b: Booking) => acc + (b.total_price || 0), 0);
    setCustomerDetail({
      ...customer,
      bookings: bookingsByCustomer,
      totalSpent,
    });
  }
  
  async function handleSave() {
    setSaving(true);
    try {
      if (modal.type === "add") {
        console.log("Saving new booking with form data:", form);
        
        // Insert booking
        const { data: booking, error: bookingError } = await supabase.from("bookings").insert([{
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          booking_date: form.booking_date,
          booking_time: form.booking_time,
          total_price: form.total_price,
          total_duration: form.total_duration,
          status: form.status || "scheduled",
          location_id: form.location_id,
        }]).select();
        
        if (bookingError) {
          console.error("Error saving booking:", bookingError);
          throw bookingError;
        }
        
        // Insert booking_service
        if (booking && booking[0] && form.location_service_id) {
          console.log("Saving booking_service:", {
            booking_id: booking[0].id,
            location_service_id: form.location_service_id
          });
          
          const { error: serviceError } = await supabase.from("booking_services").insert([{
            booking_id: booking[0].id,
            location_service_id: form.location_service_id,
          }]);
          
          if (serviceError) {
            console.error("Error saving booking_service:", serviceError);
            throw serviceError;
          }
        } else {
          console.log("Not saving booking_service because:", {
            booking: !!booking,
            booking_id: booking?.[0]?.id,
            location_service_id: form.location_service_id
          });
        }
      } else if (modal.type === "edit") {
        console.log("Updating booking with form data:", form);
        
        // Ensure we have the booking ID
        if (!form.id || !isValidUUID(form.id)) {
          throw new Error("ID booking tidak valid: " + form.id);
        }
        
        // Try using RPC function if available
        try {
          const { error: rpcError } = await supabase.rpc('update_booking_with_service', {
            booking_id_param: form.id,
            customer_name_param: form.customer_name,
            customer_email_param: form.customer_email,
            customer_phone_param: form.customer_phone,
            booking_date_param: form.booking_date,
            booking_time_param: form.booking_time,
            total_price_param: form.total_price,
            total_duration_param: form.total_duration,
            status_param: form.status,
            location_id_param: form.location_id,
            location_service_id_param: form.location_service_id || null
          });
          
          if (!rpcError) {
            console.log("Successfully updated booking using RPC");
            // If successful, no need to do the separate updates
            setModal({ type: null });
            setTimeout(() => fetchBookings(), 500);
            return;
          }
          console.log("RPC update not available, falling back to standard update:", rpcError);
        } catch (rpcErr) {
          console.log("RPC not available, using standard update");
        }
        
        // Standard approach: Update booking
        const { error: updateError } = await supabase
          .from("bookings")
          .update({
            customer_name: form.customer_name,
            customer_email: form.customer_email,
            customer_phone: form.customer_phone,
            booking_date: form.booking_date,
            booking_time: form.booking_time,
            total_price: form.total_price,
            total_duration: form.total_duration,
            status: form.status,
            location_id: form.location_id,
          })
          .eq("id", form.id);
          
        if (updateError) {
          console.error("Error updating booking:", updateError);
          throw updateError;
        }
        
        // Step 2: Handle booking_services update
        
        // First delete existing services
        try {
          const { error: deleteError } = await supabase
            .from("booking_services")
            .delete()
            .eq("booking_id", form.id);
            
          if (deleteError && !deleteError.message.includes("No rows found")) {
            console.warn("Warning when deleting services:", deleteError);
            // Continue anyway - non-critical error
          }
          
          // Wait a moment for delete to complete
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (deleteErr) {
          console.warn("Error during service delete, continuing:", deleteErr);
          // Continue anyway - we'll try to insert the new one
        }
        
        // Then insert new booking_service if there is one
        if (form.location_service_id) {
          // Insert new booking_service
          const { error: insertError } = await supabase
            .from("booking_services")
            .insert([{
              booking_id: form.id,
              location_service_id: form.location_service_id,
            }]);
            
          if (insertError) {
            console.error("Error inserting new booking_service:", insertError);
            throw insertError;
          }
        }
      }
      
      setModal({ type: null });
      // Force refresh after a short delay
      setTimeout(() => {
        fetchBookings();
      }, 500);
      
    } catch (error) {
      console.error("Error in handleSave:", error);
      let errorMessage = "Terjadi kesalahan saat menyimpan data.";
      const err = error as any;
      if (err.message) {
        errorMessage += " " + err.message;
      } else if (err.details) {
        errorMessage += " " + err.details;
      }
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  }
  
  async function handleDelete() {
    setSaving(true);
    try {
      const bookingId = modal.data.id;
      
      // Validasi
      if (!bookingId || !isValidUUID(bookingId)) {
        throw new Error("ID booking tidak valid");
      }
      
      console.log("Deleting booking with ID:", bookingId);
      
      // Try RPC approach first
      try {
        const { error: rpcError } = await supabase.rpc('delete_booking_with_services', {
          booking_id_param: bookingId
        });
        
        if (!rpcError) {
          console.log("Successfully deleted booking using RPC");
          setModal({ type: null });
          setTimeout(() => fetchBookings(), 500);
          return;
        }
        console.log("RPC delete not available, falling back to standard delete:", rpcError);
      } catch (rpcErr) {
        console.log("RPC not available, using standard delete");
      }
      
      // First delete associated booking_services
      try {
        const { error: bsDeleteError } = await supabase
          .from("booking_services")
          .delete()
          .eq("booking_id", bookingId);
          
        if (bsDeleteError && !bsDeleteError.message.includes("No rows found")) {
          console.error("Error deleting booking_services:", bsDeleteError);
          // Continue anyway - we'll try to delete the booking
        }
        
        // Wait a moment for delete to complete
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (deleteErr) {
        console.warn("Error during service delete, continuing:", deleteErr);
        // Continue anyway
      }
      
      // Now delete the booking
      const { error: bookingDeleteError } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);
        
      if (bookingDeleteError) {
        console.error("Error deleting booking:", bookingDeleteError);
        throw bookingDeleteError;
      }
      
      setModal({ type: null });
      // Force refresh after a short delay
      setTimeout(() => {
        fetchBookings();
      }, 500);
    } catch (error) {
      console.error("Error in handleDelete:", error);
      const err = error as any;
      alert(`Terjadi kesalahan saat menghapus data: ${err.message || err.details || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6 md:px-8">
      <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Manajemen Booking</CardTitle>
          <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Cari nama pelanggan..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full md:w-64"
              />
              <Button onClick={openAdd}>+ Tambah Booking</Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Filter Bar */}
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <div>
              <select 
                className="border rounded px-3 py-2 text-sm max-w-[160px] w-full"
                value={filterLocation}
                onChange={e => { setFilterLocation(e.target.value); setPage(1); }}
              >
                <option value="">Semua Lokasi</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select 
                className="border rounded px-3 py-2 text-sm max-w-[160px] w-full"
                value={filterService}
                onChange={e => { setFilterService(e.target.value); setPage(1); }}
              >
                <option value="">Semua Layanan</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select 
                className="border rounded px-3 py-2 text-sm max-w-[160px] w-full"
                value={filterYear}
                onChange={e => { setFilterYear(e.target.value); setPage(1); }}
              >
                <option value="">Semua Tahun</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select 
                className="border rounded px-3 py-2 text-sm max-w-[160px] w-full"
                value={filterMonth}
                onChange={e => { setFilterMonth(e.target.value); setPage(1); }}
                disabled={!filterYear}
              >
                <option value="">Semua Bulan</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            
            {(filterLocation || filterService || filterYear || filterMonth) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setFilterLocation("");
                  setFilterService("");
                  setFilterYear("");
                  setFilterMonth("");
                  setPage(1);
                }}
              >
                Reset Filter
              </Button>
            )}
          </div>
        </div>
        
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="w-full h-20 flex items-center justify-center animate-pulse text-gray-400">Memuat data...</div>
          ) : bookings.length === 0 ? (
            <div className="w-full h-20 flex items-center justify-center text-gray-400">Tidak ada booking</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[700px] w-full text-sm">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jam</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id} className="hover:bg-gray-50">
                      <TableCell className="whitespace-nowrap max-w-[120px] overflow-x-auto">
                        <button
                          onClick={() => openCustomerDetail(b)}
                          className="text-blue-600 hover:underline"
                          type="button"
                        >
                          {b.customer_name}
                        </button>
                      </TableCell>
                      <TableCell className="whitespace-nowrap max-w-[120px] overflow-x-auto">{b.locations?.name || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap max-w-[120px] overflow-x-auto">{b.service_name || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{b.booking_date}</TableCell>
                      <TableCell className="whitespace-nowrap">{b.booking_time}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatRupiah(b.total_price)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          b.status === 'completed' ? 'bg-green-100 text-green-800' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          b.status === 'no-show' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {b.status === 'scheduled' ? 'Dijadwalkan' :
                           b.status === 'completed' ? 'Selesai' :
                           b.status === 'cancelled' ? 'Dibatalkan' :
                           b.status === 'no-show' ? 'Tidak Hadir' : b.status
                          }
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => openEdit(b)}>Edit</Button>
                        <Button size="sm" variant="destructive" className="ml-2" onClick={() => openDelete(b)}>Hapus</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination dengan info total */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2 px-2">
            <div className="text-sm text-gray-500">
              Menampilkan {bookings.length > 0 ? (page-1)*pageSize+1 : 0} - {Math.min(page*pageSize, totalCount)} dari {totalCount} booking
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Sebelumnya</Button>
              <span className="px-2 py-1 text-sm">
                Halaman {page} dari {Math.max(1, Math.ceil(totalCount / pageSize))}
              </span>
              <Button size="sm" variant="outline" onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(totalCount / pageSize) || bookings.length < pageSize}>Berikutnya</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Add/Edit */}
      {(modal.type === "add" || modal.type === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setModal({ type: null })}>✕</button>
            <h2 className="text-xl font-bold mb-4 text-black">{modal.type === "add" ? "Tambah Booking" : "Edit Booking"}</h2>
            <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4">
              {modal.type === "edit" && (
                <div className="text-xs text-gray-500 mb-2">
                  ID Booking: {form.id}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama</label>
                  <input className="w-full border rounded px-3 py-2" value={form.customer_name || ""} onChange={e => setForm({ ...form, customer_name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input className="w-full border rounded px-3 py-2" value={form.customer_email || ""} onChange={e => setForm({ ...form, customer_email: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telepon</label>
                  <input className="w-full border rounded px-3 py-2" value={form.customer_phone || ""} onChange={e => setForm({ ...form, customer_phone: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lokasi</label>
                  <select 
                    className="w-full border rounded px-3 py-2" 
                    value={form.location_id || ""} 
                    onChange={e => setForm({ ...form, location_id: e.target.value, location_service_id: "" })} 
                    required
                  >
                    <option value="">Pilih Lokasi</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Layanan {modal.type === "edit" && filteredServices.length === 0 && "(Harap pilih lokasi terlebih dahulu)"}
                  </label>
                  <select 
                    className="w-full border rounded px-3 py-2" 
                    value={form.location_service_id || ""} 
                    onChange={e => setForm({ ...form, location_service_id: e.target.value })}
                    required
                    disabled={filteredServices.length === 0}
                  >
                    <option value="">Pilih Layanan</option>
                    {filteredServices.map((ls) => (
                      <option key={ls.id} value={ls.id}>{ls.services?.name}</option>
                    ))}
                  </select>
                  {modal.type === "edit" && form.service_name && !form.location_service_id && (
                    <p className="text-xs text-blue-600 mt-1">
                      Layanan sebelumnya: {form.service_name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Harga</label>
                  <input className="w-full border rounded px-3 py-2 bg-gray-100" value={form.total_price || 0} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Durasi (menit)</label>
                  <input className="w-full border rounded px-3 py-2 bg-gray-100" value={form.total_duration || 0} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={form.booking_date || ""} onChange={e => setForm({ ...form, booking_date: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jam</label>
                  <input className="w-full border rounded px-3 py-2" value={form.booking_time || ""} onChange={e => setForm({ ...form, booking_time: e.target.value })} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select className="w-full border rounded px-3 py-2" value={form.status || "scheduled"} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="scheduled">Dijadwalkan</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                    <option value="no-show">Tidak Hadir</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setModal({ type: null })}>Batal</Button>
                <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Delete */}
      {modal.type === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setModal({ type: null })}>✕</button>
            <h2 className="text-xl font-bold mb-4 text-black">Hapus Booking</h2>
            <p className="mb-4 text-gray-700">Yakin ingin menghapus booking <b>{modal.data.customer_name}</b> pada tanggal <b>{modal.data.booking_date}</b>?</p>
            <div className="text-xs text-gray-500 mb-4">
              ID Booking: {modal.data.id}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal({ type: null })}>Batal</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>{saving ? "Menghapus..." : "Hapus"}</Button>
            </div>
          </div>
        </div>
      )}
      {customerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-xl relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setCustomerDetail(null)}>✕</button>
            <h2 className="text-xl font-bold mb-4 text-black">Detail Customer</h2>
            <div className="space-y-2 text-gray-800">
              <p><strong>Nama:</strong> {customerDetail.customer_name}</p>
              <p><strong>Email:</strong> {customerDetail.customer_email}</p>
              <p><strong>Telepon:</strong> {customerDetail.customer_phone}</p>
              <p><strong>Jumlah Booking:</strong> {customerDetail.bookings.length}</p>
              <p><strong>Total Transaksi:</strong> {formatRupiah(customerDetail.totalSpent)}</p>
            </div>
            <h3 className="text-md font-semibold mt-6 mb-2 text-gray-700">Riwayat Booking</h3>
            <div className="max-h-48 overflow-y-auto border rounded p-2">
              {customerDetail.bookings.length === 0 ? (
                <p className="text-gray-500">Belum ada booking</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {customerDetail.bookings.map((b: Booking) => (
                    <li key={b.id}>
                      • {b.booking_date} - {b.status} ({formatRupiah(b.total_price)})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setCustomerDetail(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}