// app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/dashboard/components/skeletons/ChartSkeleton";
import { DashboardFilters } from "@/dashboard/components/filters/DashboardFilters";
import { getDashboardData } from "@/dashboard/lib/analytics/dashboardService";
import { initRealtimeUpdates } from "@/dashboard/lib/realtime/subscribeDashboard";
import { formatStats } from "@/dashboard/utils/formatters";
import { DashboardError } from "@/dashboard/utils/error";
import type { FilterState, DashboardData } from "@/dashboard/types/dashboard";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchLocationsWithDetails, fetchServicesWithDetails } from "@/lib/supabase/client";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Star, 
  Timer, 
  BarChart3, 
  PieChart, 
  MapPin, 
  Scissors, 
  MessageSquare
} from "lucide-react";

// Dynamic imports for charts
const DynamicRevenueChart = dynamic(
  () => import("@/dashboard/components/charts/RevenueChart").then(mod => mod.RevenueChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const DynamicBookingChart = dynamic(
  () => import("@/dashboard/components/charts/BookingChart").then(mod => mod.BookingChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const DynamicPopularServiceChart = dynamic(
  () => import("@/dashboard/components/charts/PopularServiceChart").then(mod => mod.PopularServiceChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const DynamicStatusChart = dynamic(
  () => import("@/dashboard/components/charts/StatusChart").then(mod => mod.StatusChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const DynamicTimeDistributionChart = dynamic(
  () => import("@/dashboard/components/charts/TimeDistributionChart").then(mod => mod.TimeDistributionChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const DynamicLocationMap = dynamic(
  () => import("@/dashboard/components/maps/LocationMap").then(mod => mod.LocationMap),
  { ssr: false, loading: () => <div className="h-[300px] animate-pulse bg-gray-200 rounded-md"></div> }
);

// Status colors and utilities
const statusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-700';
    case 'scheduled': return 'bg-blue-100 text-blue-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const statusIcon = (status: string): JSX.Element => {
  switch (status) {
    case 'completed': return <div className="w-3 h-3 rounded-full bg-green-500"></div>;
    case 'scheduled': return <div className="w-3 h-3 rounded-full bg-blue-500"></div>;
    case 'cancelled': return <div className="w-3 h-3 rounded-full bg-red-500"></div>;
    case 'pending': return <div className="w-3 h-3 rounded-full bg-yellow-500"></div>;
    default: return <div className="w-3 h-3 rounded-full bg-gray-500"></div>;
  }
};

// Date and time formatters
const formatDate = (date: string | number | Date) =>
  new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const formatTime = (time: string): string => {
  try {
    // Handle various time formats
    if (time && time.includes(':')) {
      const parts = time.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return time || '-';
  } catch (e) {
    return time || '-';
  }
};

const timeAgo = (date: string | number | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s lalu`;
  if (diff < 3600) return `${Math.floor(diff/60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff/3600)}j lalu`;
  if (diff < 604800) return `${Math.floor(diff/86400)}h lalu`;
  return formatDate(date);
};

export default function AdminDashboard() {
  // State
  const today = new Date();
  const [filters, setFilters] = useState<FilterState>({ year: today.getFullYear(), month: today.getMonth() + 1, locationId: undefined });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch filters (locations)
  useEffect(() => {
    async function fetchFilters() {
      try {
        const locs = await fetchLocationsWithDetails();
        setLocations(locs.map(l => ({ id: l.id, name: l.name })));
      } catch (err) {
        setError("Gagal mengambil data lokasi.");
      }
    }
    fetchFilters();
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    setLoading(true);
    console.log({ year: filters.year, month: filters.month, locationId: filters.locationId });
    getDashboardData(filters.year, filters.month, filters.locationId)
      .then(data => {
        setDashboardData(data);
        console.log('RAW DATA FROM SUPABASE', data);
      })
      .catch(err => {
        setError("Gagal mengambil data dashboard.");
        console.error('Error fetching dashboard data:', err);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  // Real-time sync
  useEffect(() => {
    const cleanup = initRealtimeUpdates(() => getDashboardData(filters.year, filters.month, filters.locationId).then(setDashboardData));
    return () => { cleanup && cleanup(); };
  }, [filters]);

  // --- Data mapping and processing ---
  const stats = useMemo(() => {
    if (!dashboardData) return {};
    
    if (Array.isArray(dashboardData)) {
      return dashboardData[0] || {};
    }
    
    return dashboardData || {};
  }, [dashboardData]);

  // Extract all stats for easier access
  const summary = stats.summary || {};
  const bookingStats = stats.booking_stats || [];
  const locationStats = stats.location_stats || [];
  const popularServices = stats.popular_services || [];
  const statusDist = stats.status_dist || [];
  const timeDistribution = stats.time_distribution || [];
  const testimonials = stats.testimonials || [];
  const topCustomers = stats.top_customers || [];
  const latestBookings = stats.latest_bookings || [];
  const seatsAvailability = stats.seats_availability || [];
  const serviceCategories = stats.service_categories?.[0] || {};

  // Filter data based on selected filters if needed
  const filteredLocationStats = useMemo(() => {
    if (filters.locationId) {
      return locationStats.filter((loc: any) => loc.location_id === filters.locationId);
    }
    return locationStats;
  }, [locationStats, filters.locationId]);

  const filteredServiceStats = useMemo(() => {
    if (filters.locationId) {
      return popularServices.filter((svc: any) => svc.location_id === filters.locationId);
    }
    return popularServices;
  }, [popularServices, filters.locationId]);

  // Replace all instances of 'filters.range' with a formatted string for the selected month/year
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const selectedMonthYear = `${monthNames[filters.month - 1]} ${filters.year}`;

  // --- Render ---
  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 dark:bg-zinc-900 dark:text-zinc-100 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Analitik</h1>
          <p className="text-gray-500 dark:text-gray-400">Pantau kinerja bisnis secara real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <span className="mr-2">🖨️</span> Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setLoading(true); getDashboardData(filters.year, filters.month, filters.locationId).then(setDashboardData).finally(() => setLoading(false)); }}>
            <span className="mr-2">🔄</span> Refresh
          </Button>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <DashboardFilters
        filters={filters}
        onChange={(f: FilterState) => setFilters({ ...f, locationId: f.locationId || undefined })}
        locations={locations}
        loading={loading}
      />

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Booking</TabsTrigger>
          <TabsTrigger value="customers">Pelanggan</TabsTrigger>
          <TabsTrigger value="locations">Lokasi & Layanan</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
                  <CardDescription className="text-xs">pada {selectedMonthYear}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.total_bookings || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Rata-rata {Math.round((summary.total_bookings || 0) / 30)} per hari
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 dark:bg-green-900/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CardDescription className="text-xs">pada {selectedMonthYear}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatStats.currency(summary.total_revenue || 0)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Rata-rata {formatStats.currency((summary.total_revenue || 0) / 30)} per hari
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 dark:bg-yellow-900/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
                  <CardDescription className="text-xs">pada {selectedMonthYear}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.total_customers || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Nilai transaksi rata-rata {formatStats.currency(summary.avg_booking_value || 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-pink-50 dark:bg-pink-900/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Star className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                <div>
                  <CardTitle className="text-sm font-medium">Rata-rata Rating</CardTitle>
                  <CardDescription className="text-xs">dari ulasan pelanggan</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold flex items-center gap-1">
                  {testimonials.length > 0
                    ? (
                      <>
                        {(testimonials.reduce((sum: number, t: any) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1)}
                        <span className="text-yellow-400">★</span>
                      </>
                    )
                    : "N/A"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Dari {testimonials.length} ulasan
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="dark:bg-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Booking per Hari
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] p-2">
                {loading ? <ChartSkeleton /> : <DynamicBookingChart data={bookingStats} />}
              </CardContent>
            </Card>
            
            <Card className="dark:bg-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Pendapatan per Cabang
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] p-2">
                {loading ? <ChartSkeleton /> : <DynamicRevenueChart data={locationStats} />}
              </CardContent>
            </Card>
          </div>

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="dark:bg-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Scissors className="h-4 w-4" /> Layanan Populer
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] p-2">
                {loading ? <ChartSkeleton /> : <DynamicPopularServiceChart data={popularServices} />}
              </CardContent>
            </Card>
            
            <Card className="dark:bg-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-4 w-4" /> Status Distribusi
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] p-2">
                {loading ? <ChartSkeleton /> : <DynamicStatusChart data={statusDist} />}
              </CardContent>
            </Card>
            
            <Card className="dark:bg-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Distribusi Waktu
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] p-2">
                {loading ? <ChartSkeleton /> : <DynamicTimeDistributionChart data={timeDistribution} />}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Reservasi Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="w-full h-20 flex flex-col items-center justify-center animate-pulse text-gray-400">
                    <span className="text-3xl">💈</span>
                    Memuat data...
                  </div>
                ) : latestBookings.length === 0 ? (
                  <div className="w-full h-20 flex flex-col items-center justify-center text-gray-400">
                    <span className="text-3xl">😴</span>
                    Tidak ada reservasi
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Pelanggan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latestBookings.slice(0, 5).map((b: any, idx: number) => (
                        <TableRow key={b.id || idx}>
                          <TableCell className="flex items-center gap-2">
                            <span className="inline-block w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                              {b.customer_name?.[0] ?? "?"}
                            </span>
                            <span>{b.customer_name}</span>
                          </TableCell>
                          <TableCell>
                            <div>{formatDate(b.booking_date)}</div>
                            <div className="text-xs text-gray-500">{formatTime(b.booking_time)}</div>
                          </TableCell>
                          <TableCell>{b.location_name}</TableCell>
                          <TableCell>{formatStats.currency(b.total_price || 0)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(b.status)}`}>{b.status}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                  Lihat Semua
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Top Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="w-full h-20 flex flex-col items-center justify-center animate-pulse text-gray-400">
                    <span className="text-3xl">🏆</span>
                    Memuat data...
                  </div>
                ) : topCustomers.length === 0 ? (
                  <div className="w-full h-20 flex flex-col items-center justify-center text-gray-400">
                    <span className="text-3xl">🫥</span>
                    Tidak ada data
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Jumlah Reservasi</TableHead>
                        <TableHead>Total Belanja</TableHead>
                        <TableHead>Terakhir Kunjungan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCustomers.slice(0, 5).map((c: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="flex items-center gap-2">
                            <span className="inline-block w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold">
                              {c.name?.[0] ?? "?"}
                            </span>
                            <div>
                              <div>{c.name}</div>
                              <div className="text-xs text-gray-500">{c.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{c.visit_count}</TableCell>
                          <TableCell>{formatStats.currency(c.total_spent)}</TableCell>
                          <TableCell>{formatDate(c.last_visit)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                  Lihat Semua
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statusDist.map((status: any, idx: number) => (
              <Card key={idx} className={`border-l-4 ${statusColor(status.status).replace('bg-', 'border-').replace('text-', '')}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {statusIcon(status.status)}
                    Booking {status.status}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{status.count}</div>
                  <div className="text-sm text-gray-500 mt-1">{(status.percentage || 0).toFixed(1)}% dari total</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Timeline</CardTitle>
                <CardDescription>Jumlah booking dan pendapatan harian</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? <ChartSkeleton /> : <DynamicBookingChart data={bookingStats} />}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Waktu Booking Populer</CardTitle>
                <CardDescription>Distribusi booking berdasarkan jam</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? <ChartSkeleton /> : <DynamicTimeDistributionChart data={timeDistribution} />}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detail Reservasi</CardTitle>
              <CardDescription>Daftar lengkap reservasi pada {selectedMonthYear}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="w-full h-60 flex items-center justify-center animate-pulse">
                  <span className="text-gray-400">Memuat data...</span>
                </div>
              ) : latestBookings.length === 0 ? (
                <div className="w-full h-40 flex items-center justify-center">
                  <span className="text-gray-400">Tidak ada data reservasi</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Tanggal & Waktu</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestBookings.map((booking: any, idx: number) => (
                      <TableRow key={booking.id || idx}>
                        <TableCell className="font-mono text-xs">#{booking.id?.substring(0, 8) || idx}</TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.customer_name}</div>
                          <div className="text-xs text-gray-500">{booking.customer_phone}</div>
                        </TableCell>
                        <TableCell>
                          <div>{formatDate(booking.booking_date)}</div>
                          <div className="text-xs text-gray-500">{formatTime(booking.booking_time)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {booking.services?.map((svc: any, i: number) => (
                              <div key={i} className="text-xs">
                                {svc.service_name}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{booking.total_duration} menit</TableCell>
                        <TableCell>{formatStats.currency(booking.total_price)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Pelanggan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.total_customers || 0}</div>
                <p className="text-xs text-gray-500 mt-1">pada {selectedMonthYear}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Nilai Transaksi Rata-rata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatStats.currency(summary.avg_booking_value || 0)}</div>
                <p className="text-xs text-gray-500 mt-1">per pelanggan</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rata-rata Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold flex items-center gap-1">
                  {testimonials.length > 0
                    ? (
                      <>
                        {(testimonials.reduce((sum: number, t: any) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1)}
                        <span className="text-yellow-400">★</span>
                      </>
                    )
                    : "N/A"}
                </div>
                <p className="text-xs text-gray-500 mt-1">dari {testimonials.length} ulasan</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Pelanggan</CardTitle>
                <CardDescription>Berdasarkan jumlah kunjungan</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="w-full h-20 flex flex-col items-center justify-center animate-pulse text-gray-400">
                    <span>Memuat data...</span>
                  </div>
                ) : topCustomers.length === 0 ? (
                  <div className="w-full h-20 flex flex-col items-center justify-center text-gray-400">
                    <span>Tidak ada data</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email/Telepon</TableHead>
                        <TableHead>Kunjungan</TableHead>
                        <TableHead>Total Belanja</TableHead>
                        <TableHead>Customer Sejak</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCustomers.map((c: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>
                            <div>{c.email}</div>
                            <div className="text-xs text-gray-500">{c.phone}</div>
                          </TableCell>
                          <TableCell>{c.visit_count}x</TableCell>
                          <TableCell>{formatStats.currency(c.total_spent)}</TableCell>
                          <TableCell>{formatDate(c.first_visit)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ulasan Terbaru</CardTitle>
                <CardDescription>Feedback dari pelanggan</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="w-full h-20 flex flex-col items-center justify-center animate-pulse text-gray-400">
                    <span>Memuat data...</span>
                  </div>
                ) : testimonials.length === 0 ? (
                  <div className="w-full h-20 flex flex-col items-center justify-center text-gray-400">
                    <span>Belum ada ulasan</span>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100 space-y-3">
                    {testimonials.map((t: any, idx: number) => (
                      <li key={t.id || idx} className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                              {t.customer_name?.[0] ?? "?"}
                            </span>
                            <span className="font-semibold">{t.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            {Array.from({ length: 5 }, (_, i: number) => (
                              <span key={i} className={i < t.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                            ))}
                            <span className="text-xs text-gray-400 ml-2">{timeAgo(t.created_at)}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-col">
                          <div className="text-gray-500 text-xs">
                            <span className="font-medium">{t.service_name}</span>
                            {t.location_name && <span> di {t.location_name}</span>}
                          </div>
                          <div className="text-gray-700 text-sm mt-1">{t.comment}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Locations & Services Tab */}
        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performa Lokasi</CardTitle>
                <CardDescription>Analisis kinerja per cabang</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="w-full h-40 flex items-center justify-center animate-pulse">
                    <span className="text-gray-400">Memuat data...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Booking</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locationStats.map((loc: any, idx: number) => (
                        <TableRow key={loc.location_id || idx}>
                          <TableCell>
                            <div className="font-medium">{loc.name}</div>
                            <div className="text-xs text-gray-500">{loc.area}</div>
                          </TableCell>
                          <TableCell>{loc.bookings}</TableCell>
                          <TableCell>{formatStats.currency(loc.revenue)}</TableCell>
                          <TableCell>{loc.unique_customers || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {loc.avg_rating ? (
                                <>
                                  {loc.avg_rating}
                                  <span className="text-yellow-400 ml-1">★</span>
                                </>
                              ) : "N/A"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Layanan Populer</CardTitle>
                <CardDescription>Berdasarkan jumlah booking</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="w-full h-40 flex items-center justify-center animate-pulse">
                    <span className="text-gray-400">Memuat data...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Booking</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Avg. Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {popularServices.map((service: any, idx: number) => (
                        <TableRow key={service.service_id || idx}>
                          <TableCell>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">
                              {service.description}
                            </div>
                          </TableCell>
                          <TableCell>{service.bookings}</TableCell>
                          <TableCell>{formatStats.currency(service.revenue)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {service.avg_rating ? (
                                <>
                                  {service.avg_rating}
                                  <span className="text-yellow-400 ml-1">★</span>
                                </>
                              ) : "N/A"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Status Ketersediaan Kursi</CardTitle>
              <CardDescription>Per lokasi</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="w-full h-40 flex items-center justify-center animate-pulse">
                  <span className="text-gray-400">Memuat data...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Total Kursi</TableHead>
                      <TableHead>Kursi Aktif</TableHead>
                      <TableHead>Reservasi Mendatang</TableHead>
                      <TableHead>Utilization Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seatsAvailability.map((loc: any, idx: number) => (
                      <TableRow key={loc.location_id || idx}>
                        <TableCell>{loc.location_name}</TableCell>
                        <TableCell>{loc.total_seats}</TableCell>
                        <TableCell>{loc.active_seats}</TableCell>
                        <TableCell>{loc.upcoming_bookings}</TableCell>
                        <TableCell>
                          {loc.total_seats > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${Math.min(100, (loc.upcoming_bookings / loc.total_seats) * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs">
                                {Math.round((loc.upcoming_bookings / loc.total_seats) * 100)}%
                              </span>
                            </div>
                          ) : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lokasi dan Distribusi</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <DynamicLocationMap locations={locationStats} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}