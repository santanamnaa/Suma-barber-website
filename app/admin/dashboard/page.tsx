// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import React from "react";
import type { 
  Booking, 
  BookingServiceWithDetails, 
  DailyStats, 
  PopularService, 
  LocationStats 
} from "@/lib/supabase/api-types";
import { supabase, fetchDashboardStats } from '@/lib/supabase/client';
import { 
  processTestimonialsToRatingData 
} from "@/lib/supabase/dashboard-utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function formatRupiah(amount: number) {
  return amount.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });
}

const dateRanges = [
  { label: "7 Hari", value: 7 },
  { label: "30 Hari", value: 30 },
  { label: "90 Hari", value: 90 },
];

// COLORS for Pie Chart
const COLORS = ["#22d3ee", "#a3e635", "#fbbf24", "#f87171", "#6366f1", "#34d399", "#f472b6", "#f59e42"];

// Simple ErrorBoundary for this page
class DashboardErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // Log error if needed
    console.error("Dashboard ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Terjadi Kesalahan</AlertTitle>
          <AlertDescription>{this.state.error?.message || "Terjadi error pada dashboard."}</AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}

export default function AdminDashboard() {
  // --- State ---
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [range, setRange] = useState<number>(30);
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [filterService, setFilterService] = useState<string>("");
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [latestTestimonials, setLatestTestimonials] = useState<any[]>([]);

  // --- Fetch Filters ---
  useEffect(() => {
    let isMounted = true;
    async function fetchFilters() {
      try {
        const { data: locs } = await supabase.from("locations").select("id, name").order("name");
        if (isMounted) setLocations(locs || []);
        const { data: svcs } = await supabase.from("services").select("id, name").order("name");
        if (isMounted) setServices(svcs || []);
      } catch (err) {
        setError("Gagal mengambil data lokasi/layanan.");
      }
    }
    fetchFilters();
    return () => { isMounted = false; };
  }, []);

  // --- Fetch Dashboard Stats ---
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    fetchDashboardStats(range)
      .then((data) => { 
        if (isMounted) setDashboardStats(data);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setError("Gagal mengambil data dashboard.");
      })
      .finally(() => { 
        if (isMounted) setLoading(false); 
      });
      
    return () => { isMounted = false; };
  }, [range]);

  // --- Fetch Latest Testimonials ---
  useEffect(() => {
    let isMounted = true;
    async function fetchTestimonials() {
      try {
        const { data: latestTestimonialsData, error: latestTestimonialsError } = await supabase
          .from('testimonials')
          .select(`
            customer_name, 
            service_id, 
            services (name), 
            rating, 
            comment, 
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (latestTestimonialsError) throw latestTestimonialsError;
        if (isMounted) setLatestTestimonials(latestTestimonialsData || []);
      } catch (err) {
        setError("Gagal mengambil data testimoni terbaru.");
        console.error("Latest testimonials fetch error:", err);
      }
    }
    fetchTestimonials();
    return () => { isMounted = false; };
  }, [range]);

  // --- Memoized Filtered Data ---
  const filteredBookingStats = useMemo(() => {
    if (!dashboardStats?.bookingStats) return [];
    return dashboardStats.bookingStats;
  }, [dashboardStats]);

  const filteredLocationStats = useMemo(() => {
    if (!dashboardStats?.locationStats) return [];
    if (!filterLocation) return dashboardStats.locationStats;
    const loc = locations.find((l: { id: string; name: string }) => l.id === filterLocation)?.name;
    return dashboardStats.locationStats.filter((l: any) => l.name === loc);
  }, [dashboardStats, filterLocation, locations]);

  const filteredPopularServices = useMemo(() => {
    if (!dashboardStats?.popularServices) return [];
    if (!filterService) return dashboardStats.popularServices;
    const svc = services.find((s: { id: string; name: string }) => s.id === filterService)?.name;
    return dashboardStats.popularServices.filter((s: any) => s.name === svc);
  }, [dashboardStats, filterService, services]);

  const filteredBookingServices = useMemo(() => {
    if (!dashboardStats?.bookingServices) return [];
    return dashboardStats.bookingServices.filter((bs: any) => {
      const matchLoc = !filterLocation || bs.location_services?.locations?.id === filterLocation;
      const matchSvc = !filterService || bs.location_services?.services?.id === filterService;
      return matchLoc && matchSvc;
    });
  }, [dashboardStats, filterLocation, filterService]);

  // --- Aggregations ---
  const bookings = dashboardStats?.bookings || [];
  const bookingServices = dashboardStats?.bookingServices || [];
  const testimonials = dashboardStats?.testimonials || [];

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);
  const totalCustomers = new Set(bookings.map((b: any) => b.customer_email)).size;
  const totalReviews = testimonials?.length || 0;
  const averageRating = testimonials?.length ? 
    testimonials.reduce((sum: number, t: any) => sum + t.rating, 0) / testimonials.length : 0;
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((b: any) => b.booking_date === today).length;
  const todayRevenue = bookings.filter((b: any) => b.booking_date === today).reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);

  // Top Pelanggan
  const customerMap: Record<string, { name: string, count: number, total: number }> = {};
  bookings.forEach((b: any) => {
    if (!customerMap[b.customer_email]) customerMap[b.customer_email] = { name: b.customer_name, count: 0, total: 0 };
    customerMap[b.customer_email].count += 1;
    customerMap[b.customer_email].total += b.total_price || 0;
  });
  const topCustomers = Object.values(customerMap).sort((a: { name: string; count: number; total: number }, b: { name: string; count: number; total: number }) => b.count - a.count).slice(0, 5);

  const popularService = useMemo(() => filteredPopularServices[0]?.name || "-", [filteredPopularServices]);

  const bookingPerService = useMemo(() => dashboardStats?.popularServices?.map((svc: any) => ({
    name: svc.name,
    bookings: svc.bookings,
    revenue: svc.revenue,
  })) || [], [dashboardStats]);

  const bookingPerLocation = useMemo(() => dashboardStats?.locationStats?.map((loc: any) => ({
    name: loc.name,
    bookings: loc.bookings,
    revenue: loc.revenue,
  })) || [], [dashboardStats]);

  const ratingPerService = useMemo(() => {
    return processTestimonialsToRatingData(latestTestimonials);
  }, [latestTestimonials]);

  const visitorStats = useMemo(() => dashboardStats?.visitorStats || [], [dashboardStats]);

  const bookingStatusDistArr = useMemo(() => {
    if (!dashboardStats?.bookings) return [];
    const bookingStatusDist = dashboardStats.bookings.reduce((acc: any, b: any) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(bookingStatusDist).map(([status, count]) => ({ status, count: Number(count) }));
  }, [dashboardStats]);

  // Target Bulanan
  const targetRevenue = 10000000; // contoh target
  const progress = Math.min(100, Math.round((totalRevenue / targetRevenue) * 100));

  // Activity Log
  const activityLog = useMemo(() => {
    const logs: string[] = [];
    if (dashboardStats?.bookings) {
      dashboardStats.bookings.slice(-5).reverse().forEach((b: any) => {
        logs.push(`Reservasi baru: ${b.customer_name} pada ${b.booking_date}`);
      });
    }
    if (latestTestimonials) {
      latestTestimonials.slice(0, 3).forEach(t => {
        logs.push(`Ulasan baru: ${t.customer_name} memberi rating ${t.rating}`);
      });
    }
    return logs;
  }, [dashboardStats, latestTestimonials]);

  // --- Handlers ---
  const handleRangeChange = useCallback((value: number) => {
    setRange(value);
    setFilterLocation("");
    setFilterService("");
  }, []);

  // --- Render ---
  return (
    <DashboardErrorBoundary>
      <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-6 md:px-8 py-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Terjadi Kesalahan</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold">Dashboard Barber Admin</h1>
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm text-gray-400">Periode:</span>
            <div className="flex gap-1">
              {dateRanges.map((r) => (
                <Button
                  key={r.value}
                  variant={range === r.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRangeChange(r.value)}
                  disabled={loading}
                >
                  {r.label}
                </Button>
              ))}
            </div>
            <div className="ml-4 flex gap-2 items-center">
              <label className="text-sm">Cabang Barber:</label>
              <select
                className="border rounded px-2 py-1 text-black"
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
                disabled={loading}
              >
                <option value="">Semua</option>
                {locations.map((l: { id: string; name: string }) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm">Jenis Potongan:</label>
              <select
                className="border rounded px-2 py-1 text-black"
                value={filterService}
                onChange={e => setFilterService(e.target.value)}
                disabled={loading}
              >
                <option value="">Semua</option>
                {services.map((s: { id: string; name: string }) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <Button className="ml-4" onClick={() => window.location.href = '/admin/dashboard/bookings'} disabled={loading}>
              + Tambah Reservasi
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading && [1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-32" />
          ))}
          {!loading && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Total Reservasi</CardTitle>
                  <CardDescription>Jumlah reservasi dalam {range} hari terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalBookings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Pendapatan</CardTitle>
                  <CardDescription>Pendapatan dari layanan barber ({range} hari)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatRupiah(totalRevenue)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Jenis Potongan Terpopuler</CardTitle>
                  <CardDescription>Jenis potongan/barber paling sering dipesan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{popularService}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="h-[350px]">
            <CardHeader>
              <CardTitle>Grafik Reservasi</CardTitle>
              <CardDescription>Jumlah reservasi per hari ({range} hari)</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center animate-pulse text-gray-400">Memuat grafik...</div>
              ) : filteredBookingStats.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada data reservasi</div>
              ) : (
                <ChartContainer
                  config={{ booking: { label: "Reservasi", color: "#22d3ee" } }}
                >
                  <RechartsBookingChart data={filteredBookingStats} />
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <Card className="h-[350px]">
            <CardHeader>
              <CardTitle>Grafik Pendapatan per Cabang</CardTitle>
              <CardDescription>Pendapatan per cabang barber ({range} hari)</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center animate-pulse text-gray-400">Memuat grafik...</div>
              ) : filteredLocationStats.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada data pendapatan</div>
              ) : (
                <ChartContainer
                  config={Object.fromEntries(
                    filteredLocationStats.map((loc: any) => [loc.name, { label: loc.name, color: "#a3e635" }])
                  )}
                >
                  <RechartsRevenueChart data={filteredLocationStats} />
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reservasi Terbaru</CardTitle>
            <CardDescription>5 reservasi terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full h-20 flex items-center justify-center animate-pulse text-gray-400">Memuat data...</div>
            ) : filteredBookingServices.length === 0 ? (
              <div className="w-full h-20 flex items-center justify-center text-gray-400">Tidak ada reservasi</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pelanggan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis Potongan</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookingServices.slice(0, 5).map((bs: any) => (
                    <TableRow key={bs.id}>
                      <TableCell>{bs.booking?.customer_name || "-"}</TableCell>
                      <TableCell>{bs.booking?.booking_date || "-"}</TableCell>
                      <TableCell>{bs.location_services?.services?.name || "-"}</TableCell>
                      <TableCell>{formatRupiah(bs.location_services?.price || 0)}</TableCell>
                      <TableCell>{bs.booking?.status || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ...Rest of the components remain the same as before... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="h-[350px]">
            <CardHeader>
              <CardTitle>Reservasi per Cabang</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center animate-pulse text-gray-400">Memuat grafik...</div>
              ) : bookingPerLocation.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada data</div>
              ) : (
                <ChartContainer config={Object.fromEntries(
                  bookingPerLocation.map((loc: any) => [loc.name, { label: loc.name, color: COLORS[0] }])
                )}>
                  <RechartsBookingPerLocationChart data={bookingPerLocation} />
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <Card className="h-[350px]">
            <CardHeader>
              <CardTitle>Reservasi per Jenis Potongan</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center animate-pulse text-gray-400">Memuat grafik...</div>
              ) : bookingPerService.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada data</div>
              ) : (
                <ChartContainer config={Object.fromEntries(
                  bookingPerService.map((svc: any) => [svc.name, { label: svc.name, color: COLORS[1] }])
                )}>
                  <RechartsBookingPerServiceChart data={bookingPerService} />
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="h-[350px]">
            <CardHeader>
              <CardTitle>Rata-rata Rating per Jenis Potongan</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center animate-pulse text-gray-400">Memuat grafik...</div>
              ) : ratingPerService.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada data</div>
              ) : (
                <ChartContainer config={Object.fromEntries(
                  ratingPerService.map((svc: any) => [svc.name, { label: svc.name, color: COLORS[2] }])
                )}>
                  <RechartsRatingChart data={ratingPerService} />
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <Card className="h-[350px]">
            <CardHeader>
              <CardTitle>Jumlah Pelanggan per Hari</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center animate-pulse text-gray-400">Memuat grafik...</div>
              ) : visitorStats.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada data</div>
              ) : (
                <ChartContainer config={{ pengunjung: { label: "Pelanggan", color: COLORS[3] } }}>
                  <RechartsVisitorChart data={visitorStats} />
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="h-[350px]">
            <CardHeader>
              <CardTitle>Distribusi Status Reservasi</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center animate-pulse text-gray-400">Memuat grafik...</div>
              ) : bookingStatusDistArr.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada data</div>
              ) : (
                <ChartContainer config={Object.fromEntries(
                  bookingStatusDistArr.map((s: any, idx: number) => [s.status, { label: s.status, color: COLORS[idx % COLORS.length] }])
                )}>
                  <RechartsBookingStatusChart data={bookingStatusDistArr} />
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <Card className="h-[350px]">
            <CardHeader>
              <CardTitle>Ulasan Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] overflow-y-auto">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center animate-pulse text-gray-400">Memuat data...</div>
              ) : latestTestimonials.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Tidak ada ulasan</div>
              ) : (
                <ul>
                  {latestTestimonials.map((t, idx) => (
                    <li key={idx} className="mb-2 border-b pb-2">
                      <div className="font-bold">{t.customer_name} ({t.services?.name})</div>
                      <div>Rating: {t.rating}</div>
                      <div>{t.comment}</div>
                      <div className="text-xs text-gray-400">{new Date(t.created_at).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Pelanggan</CardTitle>
              <CardDescription>Jumlah pelanggan unik</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCustomers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Ulasan</CardTitle>
              <CardDescription>Jumlah ulasan masuk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalReviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rata-rata Rating</CardTitle>
              <CardDescription>Rating dari pelanggan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageRating.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reservasi Hari Ini</CardTitle>
              <CardDescription>Jumlah reservasi hari ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan Hari Ini</CardTitle>
              <CardDescription>Pendapatan dari reservasi hari ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatRupiah(todayRevenue)}</div>
            </CardContent>
          </Card>
        </div>
        {/* Target Bulanan */}
        <Card>
          <CardHeader>
            <CardTitle>Target Bulanan</CardTitle>
            <CardDescription>Progress pencapaian target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded h-4">
                <div className="bg-green-500 h-4 rounded" style={{ width: `${progress}%` }} />
              </div>
              <span>{progress}%</span>
            </div>
            <div className="text-sm mt-2">Target: {formatRupiah(targetRevenue)}</div>
            <div className="text-sm">Tercapai: {formatRupiah(totalRevenue)}</div>
          </CardContent>
        </Card>
        {/* Top Pelanggan */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pelanggan</CardTitle>
            <CardDescription>Pelanggan dengan reservasi terbanyak</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jumlah Reservasi</TableHead>
                  <TableHead>Total Belanja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((c, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.count}</TableCell>
                    <TableCell>{formatRupiah(c.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Log Aktivitas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {activityLog.map((log, idx) => (
                <li key={idx} className="mb-2">{log}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardErrorBoundary>
  );
}

// --- Chart Components ---
function RechartsBookingChart({ data }: { data: DailyStats[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" label={{ value: "Tanggal", position: "insideBottom", offset: -10 }} />
        <YAxis allowDecimals={false} label={{ value: "Reservasi", angle: -90, position: "insideLeft" }} />
        <Tooltip formatter={(value: any) => `${value} reservasi`} />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#22d3ee" name="Reservasi" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function RechartsRevenueChart({ data }: { data: { name: string; bookings: number; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <XAxis dataKey="name" label={{ value: "Cabang Barber", position: "insideBottom", offset: -10 }} />
        <YAxis tickFormatter={formatRupiah} label={{ value: "Pendapatan (IDR)", angle: -90, position: "insideLeft" }} />
        <Tooltip formatter={formatRupiah} />
        <Legend />
        <Bar dataKey="revenue" fill="#a3e635" name="Pendapatan" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RechartsBookingPerLocationChart({ data }: { data: { name: string; bookings: number; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <XAxis dataKey="name" label={{ value: "Cabang Barber", position: "insideBottom", offset: -10 }} />
        <YAxis allowDecimals={false} label={{ value: "Reservasi", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="bookings" fill={COLORS[0]} name="Reservasi" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RechartsBookingPerServiceChart({ data }: { data: { name: string; bookings: number; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <XAxis dataKey="name" label={{ value: "Jenis Potongan", position: "insideBottom", offset: -10 }} />
        <YAxis allowDecimals={false} label={{ value: "Reservasi", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="bookings" fill={COLORS[1]} name="Reservasi" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RechartsRatingChart({ data }: { data: { name: string; avg: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <XAxis dataKey="name" label={{ value: "Jenis Potongan", position: "insideBottom", offset: -10 }} />
        <YAxis allowDecimals={true} label={{ value: "Rata-rata Rating", angle: -90, position: "insideLeft" }} domain={[0, 5]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="avg" fill="#a3e635" name="Rata-rata Rating" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RechartsVisitorChart({ data }: { data: DailyStats[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" label={{ value: "Tanggal", position: "insideBottom", offset: -10 }} />
        <YAxis allowDecimals={false} label={{ value: "Pelanggan", angle: -90, position: "insideLeft" }} />
        <Tooltip formatter={(value: any) => `${value} pelanggan`} />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#34d399" name="Pelanggan" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function RechartsBookingStatusChart({ data }: { data: { status: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((entry: any, idx: number) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}