// lib/supabase/dashboard-utils.ts
import type { Booking, BookingServiceWithDetails, DailyStats, LocationStats, PopularService } from "@/lib/supabase/api-types";

export function processBookingsToChartData(bookings: Booking[]): DailyStats[] {
  const dateMap: Record<string, { day: string; count: number }> = {};
  
  // Group bookings by date
  bookings.forEach((booking) => {
    const day = booking.booking_date;
    if (!dateMap[day]) {
      dateMap[day] = { day, count: 0 };
    }
    dateMap[day].count += 1;
  });
  
  // Convert to array and sort by date
  return Object.values(dateMap).sort((a, b) => 
    new Date(a.day).getTime() - new Date(b.day).getTime()
  );
}

export function calculateLocationStats(bookings: Booking[], locationMap: Record<string, string>): LocationStats[] {
  const locationStats: Record<string, { name: string; bookings: number; revenue: number }> = {};
  
  bookings.forEach((booking) => {
    const locationId = booking.location_id;
    const locationName = locationMap[locationId] || "Unknown";
    
    if (!locationStats[locationId]) {
      locationStats[locationId] = { name: locationName, bookings: 0, revenue: 0 };
    }
    
    locationStats[locationId].bookings += 1;
    locationStats[locationId].revenue += booking.total_price || 0;
  });
  
  return Object.values(locationStats);
}

export function calculateServicePopularity(bookingServices: BookingServiceWithDetails[]): PopularService[] {
  const serviceStats: Record<string, { name: string; bookings: number; revenue: number }> = {};
  
  bookingServices.forEach((bs) => {
    const serviceName = bs.service_name || "Unknown";
    
    if (!serviceName || serviceName === "Unknown") return;
    
    if (!serviceStats[serviceName]) {
      serviceStats[serviceName] = { name: serviceName, bookings: 0, revenue: 0 };
    }
    
    serviceStats[serviceName].bookings += 1;
    serviceStats[serviceName].revenue += bs.price || 0;
  });
  
  // Sort by booking count
  return Object.values(serviceStats).sort((a, b) => b.bookings - a.bookings);
}

export function processTestimonialsToRatingData(testimonials: any[]): { name: string; avg: number }[] {
  const ratingMap: Record<string, { total: number; count: number }> = {};
  
  testimonials.forEach((testimonial) => {
    const serviceName = testimonial.services?.name || testimonial.service_name || "Unknown";
    
    if (!ratingMap[serviceName]) {
      ratingMap[serviceName] = { total: 0, count: 0 };
    }
    
    ratingMap[serviceName].total += testimonial.rating || 0;
    ratingMap[serviceName].count += 1;
  });
  
  return Object.entries(ratingMap).map(([name, { total, count }]) => ({
    name,
    avg: count ? total / count : 0
  }));
}