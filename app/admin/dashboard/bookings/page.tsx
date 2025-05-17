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

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
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
      if (filterYear) query = query.gte("booking_date", `${filterYear}-01-01`).lte("booking_date", `${filterYear}-12-31`);
      if (filterMonth) {
        const year = filterYear || new Date().getFullYear();
        const start = `${year}-${filterMonth}-01`;
        const end = `${year}-${filterMonth}-${String(new Date(Number(year), parseInt(filterMonth, 10), 0).getDate()).padStart(2, '0')}`;
        query = query.gte("booking_date", start).lte("booking_date", end);
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
      let serviceError = null;
      try {
        const rpcRes = await supabase.rpc('get_booking_services_simple', {
          p_booking_ids: bookingsData.map(b => b.id)
        });
        serviceData = rpcRes.data;
        serviceError = rpcRes.error;
        if (serviceError) throw serviceError;
        if (serviceData && serviceData.length > 0) {
          console.log('Fetched serviceData via RPC:', serviceData);
        }
      } catch (err) {
        console.error('Error fetching services with RPC:', err);
      }

      // --- Fallback 2: Try View ---
      if (!serviceData || serviceData.length === 0) {
        try {
          const viewRes = await supabase.from('booking_services_view')
            .select('booking_id, service_name, service_id')
            .in('booking_id', bookingsData.map(b => b.id));
          if (viewRes.error) throw viewRes.error;
          serviceData = viewRes.data;
          if (serviceData && serviceData.length > 0) {
            console.log('Fetched serviceData via View:', serviceData);
          }
        } catch (err) {
          console.error('Error fetching services with View:', err);
        }
      }

      // --- Fallback 3: Try Direct Query ---
      if (!serviceData || serviceData.length === 0) {
        try {
          const { data: directData, error: directError } = await supabase
            .from('booking_services')
            .select(`
              id,
              booking_id,
              location_service_id
            `)
            .in('booking_id', bookingsData.map(b => b.id));
            
          if (directError) throw directError;
          
          if (directData && directData.length > 0) {
            // Get all unique location_service_ids
            const lsIds = Array.from(new Set(directData.map(bs => bs.location_service_id)));
            
            // Get services for these location_services
            const { data: lsData, error: lsError } = await supabase
              .from('location_services')
              .select(`
                id,
                service_id,
                services (
                  id,
                  name
                )
              `)
              .in('id', lsIds);
              
            if (lsError) throw lsError;
            
            // Create mapping of location_service_id to service info
            const lsMap = {};
            (lsData as any[]).forEach((ls: any) => {
              (lsMap as any)[ls.id] = {
                id: ls.services.id,
                name: ls.services.name
              };
            });
            
            // Map booking_id to service info
            serviceData = (directData as any[]).map((bs: any) => ({
              booking_id: bs.booking_id,
              service_id: (lsMap as any)[bs.location_service_id]?.id,
              service_name: (lsMap as any)[bs.location_service_id]?.name
            })).filter((item: any) => item.service_name); // remove entries without service name
            
            console.log('Fetched serviceData via direct query:', serviceData);
          }
        } catch (err) {
          console.error('Error fetching services with direct query:', err);
        }
      }

      // --- Fallback 4: Per-booking loop as last resort ---
      if (!serviceData || serviceData.length === 0) {
        serviceData = [];
        for (const booking of bookingsData) {
          try {
            // Get the booking service
            const { data: bs } = await supabase
              .from('booking_services')
              .select('location_service_id')
              .eq('booking_id', booking.id)
              .single();
              
            if (bs?.location_service_id) {
              // Get the location service with service info
              const { data: ls } = await supabase
                .from('location_services')
                .select(`
                  services (
                    id,
                    name
                  )
                `)
                .eq('id', bs.location_service_id)
                .single();
                
              if ((ls as any)?.services?.name) {
                serviceData.push({
                  booking_id: booking.id,
                  service_id: (ls as any).services.id,
                  service_name: (ls as any).services.name
                });
              }
            }
          } catch (e) {
            console.error(`Error in per-booking fallback for ${booking.id}:`, e);
          }
        }
        if (serviceData.length > 0) {
          console.log('Fetched serviceData via per-booking loop:', serviceData);
        }
      }

      // --- Merge bookings with service data ---
      const serviceMap = {};
      if (serviceData && serviceData.length > 0) {
        // Group by booking_id (in case multiple services per booking)
        (serviceData as any[]).forEach((item: any) => {
          if (!(serviceMap as any)[item.booking_id] || !(serviceMap as any)[item.booking_id].name) {
            (serviceMap as any)[item.booking_id] = {
              name: item.service_name,
              id: item.service_id
            };
          }
        });
      }
      
      // Create enhanced bookings with service data
      const enhancedBookings = (bookingsData as any[]).map((booking: any) => ({
        ...booking,
        service_name: (serviceMap as any)[booking.id]?.name || '-',
        service_id: (serviceMap as any)[booking.id]?.id || null
      }));
      
      // Apply service filter if needed
      let finalBookings = enhancedBookings;
      if (filterService) {
        finalBookings = (finalBookings as any[]).filter((b: any) => 
          b.service_id && String(b.service_id) === String(filterService)
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
  async function fetchBookingServices(bookingId: any) {
    try {
      const { data, error } = await supabase
        .from('booking_services')
        .select(`
          id,
          location_service_id,
          location_services (
            id,
            service_id,
            services (
              id,
              name
            )
          )
        `)
        .eq('booking_id', bookingId);
        
      if (error) throw error;
      return data;
    } catch (e) {
      console.error(`Error fetching services for booking ${bookingId}:`, e);
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
  }, [search, page, filterLocation, filterService]);

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

  // Auto-fill price & duration when service is selected
  useEffect(() => {
    if (form.location_service_id) {
      const svc = locationServices.find((ls) => ls.id === form.location_service_id);
      if (svc) {
        setForm((f: any) => ({ ...f, total_price: svc.price, total_duration: svc.duration }));
      }
    }
  }, [form.location_service_id, locationServices]);

  function openAdd() {
    setForm({});
    setModal({ type: "add" });
  }
  
  async function openEdit(b: any) {
    try {
      // Load booking_services data for this booking
      const services = await fetchBookingServices(b.id);
      
      // Find the first booking_service
      const bs = services?.[0];
      
      setForm({
        ...b,
        location_id: b.location_id,
        location_service_id: bs?.location_service_id,
        total_price: b.total_price,
        total_duration: b.total_duration,
        booking_services: services
      });
      
      setModal({ type: "edit", data: {...b, booking_services: services} });
    } catch (error) {
      console.error("Error loading data for edit:", error);
      // Fallback if services can't be loaded
      setForm({
        ...b,
        location_id: b.location_id,
        total_price: b.total_price,
        total_duration: b.total_duration
      });
      setModal({ type: "edit", data: b });
    }
  }
  
  function openDelete(b: any) {
    setModal({ type: "delete", data: b });
  }
  
  function openCustomerDetail(customer: any) {
    const bookingsByCustomer = bookings.filter(b => b.customer_email === customer.customer_email);
    const totalSpent = bookingsByCustomer.reduce((acc, b) => acc + (b.total_price || 0), 0);
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
        const { data: booking, error: bookingError } = await supabase.from("bookings").insert([
          {
            customer_name: form.customer_name,
            customer_email: form.customer_email,
            customer_phone: form.customer_phone,
            booking_date: form.booking_date,
            booking_time: form.booking_time,
            total_price: form.total_price,
            total_duration: form.total_duration,
            status: form.status || "scheduled",
            location_id: form.location_id,
          },
        ]).select().maybeSingle();
        
        if (bookingError) {
          console.error("Error saving booking:", bookingError);
          throw bookingError;
        }
        
        // Insert booking_service
        if (booking && form.location_service_id) {
          console.log("Saving booking_service:", {
            booking_id: booking.id,
            location_service_id: form.location_service_id
          });
          
          const { error: serviceError } = await supabase.from("booking_services").insert([
            {
              booking_id: booking.id,
              location_service_id: form.location_service_id,
            },
          ]);
          
          if (serviceError) {
            console.error("Error saving booking_service:", serviceError);
            throw serviceError;
          }
        } else {
          console.log("Not saving booking_service because:", {
            booking: !!booking,
            location_service_id: form.location_service_id
          });
        }
      } else if (modal.type === "edit") {
        console.log("Updating booking with form data:", form);
        
        // Update booking
        const { error: updateError } = await supabase.from("bookings").update({
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          booking_date: form.booking_date,
          booking_time: form.booking_time,
          total_price: form.total_price,
          total_duration: form.total_duration,
          status: form.status,
          location_id: form.location_id,
        }).eq("id", form.id);
        
        if (updateError) {
          console.error("Error updating booking:", updateError);
          throw updateError;
        }
        
        // Update booking_service
        if (form.location_service_id) {
          const bs = form.booking_services?.[0];
          if (bs) {
            const { error: bsUpdateError } = await supabase.from("booking_services").update({
              location_service_id: form.location_service_id,
            }).eq("id", bs.id);
            
            if (bsUpdateError) {
              console.error("Error updating booking_service:", bsUpdateError);
              throw bsUpdateError;
            }
          } else {
            const { error: bsInsertError } = await supabase.from("booking_services").insert([
              {
                booking_id: form.id,
                location_service_id: form.location_service_id,
              },
            ]);
            
            if (bsInsertError) {
              console.error("Error inserting booking_service:", bsInsertError);
              throw bsInsertError;
            }
          }
        }
      }
      
      setModal({ type: null });
      fetchBookings();
    } catch (error) {
      console.error("Error in handleSave:", error);
      // You could add error message display here
    } finally {
      setSaving(false);
    }
  }
  
  async function handleDelete() {
    setSaving(true);
    try {
      // Delete all booking_services first
      const { error: bsDeleteError } = await supabase.from("booking_services")
        .delete()
        .eq("booking_id", modal.data.id);
        
      if (bsDeleteError) {
        console.error("Error deleting booking_services:", bsDeleteError);
        throw bsDeleteError;
      }
      
      // Then delete booking
      const { error: bookingDeleteError } = await supabase.from("bookings")
        .delete()
        .eq("id", modal.data.id);
        
      if (bookingDeleteError) {
        console.error("Error deleting booking:", bookingDeleteError);
        throw bookingDeleteError;
      }
      
      setModal({ type: null });
      fetchBookings();
    } catch (error) {
      console.error("Error in handleDelete:", error);
      // You could add error message display here
    } finally {
      setSaving(false);
    }
  }

  // Ambil daftar tahun unik dari bookings untuk filter
  const years = Array.from(new Set(bookings.map(b => b.booking_date?.slice(0, 4)).filter(Boolean)));

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
            {/* Filter Lokasi dan Service */}
            <div className="flex gap-2 mt-2 md:mt-0 w-full md:w-auto">
              <select 
                className="border rounded px-3 py-2 text-sm max-w-[160px] w-full md:w-[160px]"
                value={filterLocation}
                onChange={e => { setFilterLocation(e.target.value); setPage(1); }}
              >
                <option value="">Semua Lokasi</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <select 
                className="border rounded px-3 py-2 text-sm max-w-[160px] w-full md:w-[160px]"
                value={filterService}
                onChange={e => { setFilterService(e.target.value); setPage(1); }}
              >
                <option value="">Semua Layanan</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
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
                      <TableCell className="whitespace-nowrap">{b.status}</TableCell>
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
                  <select className="w-full border rounded px-3 py-2" value={form.location_id || ""} onChange={e => setForm({ ...form, location_id: e.target.value, location_service_id: "" })} required>
                    <option value="">Pilih Lokasi</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Layanan</label>
                  <select className="w-full border rounded px-3 py-2" value={form.location_service_id || ""} onChange={e => setForm({ ...form, location_service_id: e.target.value })} required>
                    <option value="">Pilih Layanan</option>
                    {filteredServices.map((ls) => (
                      <option key={ls.id} value={ls.id}>{ls.services?.name}</option>
                    ))}
                  </select>
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
                  {customerDetail.bookings.map((b: any) => (
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