import { createClient } from '@supabase/supabase-js'
import { Database } from './types'
import {
  ApiResponse,
  AuthResult,
  Booking,
  BookingFilters,
  BookingServiceWithDetails,
  BookingWithDetails,
  DailyStats,
  LocationServiceWithDetails,
  LocationStats,
  LocationWithDetails,
  PaginationParams,
  PopularService,
  ServiceWithDetails
} from './api-types'
import { format, subDays } from 'date-fns'

// Check if environment variables are defined
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create a singleton Supabase client
let supabaseInstance = null

export const supabase = (() => {
  if (supabaseInstance === null) {
    supabaseInstance = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return supabaseInstance
})()

// Helper function to check admin authentication
export const checkAdminAuth = async (): Promise<AuthResult> => {
  try {
    // Check if the user is logged in
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Error checking session:', sessionError)
      return { authenticated: false, error: sessionError.message }
    }
    
    if (!session) {
      return { authenticated: false }
    }

    // Check if user is in the admins table
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select()
      .eq('email', session.user.email)
      .maybeSingle()
    
    if (adminError) {
      console.error('Error checking admin status:', adminError)
      return { authenticated: false, error: adminError.message }
    }
    
    if (!adminData) {
      return { authenticated: false }
    }
    
    // User is authenticated and is an admin
    return { 
      authenticated: true,
      user: session.user,
      admin: adminData
    }
  } catch (error) {
    console.error('Error in admin auth check:', error)
    return { authenticated: false, error: (error as Error).message }
  }
}

// Helper function to fetch booking services with details
export const fetchBookingServicesWithDetails = async (
  locationId?: string,
  limit = 5
): Promise<BookingServiceWithDetails[]> => {
  try {
    // Query untuk mendapatkan booking_services dengan join ke bookings, location_services, services, dan locations
    let query = supabase
      .from('booking_services')
      .select(`
        *,
        bookings!inner(*),
        location_services!inner(
          *,
          services!inner(name),
          locations!inner(name)
        )
      `)
      .order('created_at', { ascending: false });
    
    // Jika locationId diberikan dan bukan 'all', filter berdasarkan lokasi
    if (locationId && locationId !== 'all') {
      query = query.eq('location_services.location_id', locationId);
    }
    
    // Limit jumlah hasil
    query = query.limit(limit);
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Format data untuk display
    return data?.map((item: any) => ({
      id: item.id,
      booking_id: item.booking_id,
      location_service_id: item.location_service_id,
      created_at: item.created_at,
      service_name: item.location_services?.services?.name || 'Unknown Service',
      location_name: item.location_services?.locations?.name || 'Unknown Location',
      price: item.location_services?.price || 0,
      duration: item.location_services?.duration || 0,
      booking: item.bookings || {}
    })) || [];
  } catch (error) {
    console.error('Error fetching booking services with details:', error);
    return [];
  }
};

// Helper function to fetch locations with count of services and seats
export const fetchLocationsWithDetails = async (): Promise<LocationWithDetails[]> => {
  try {
    // Fetch locations
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .order('name');
    
    if (locationsError) {
      throw locationsError;
    }

    // Process each location to get service and seat counts
    const locationsWithDetails: LocationWithDetails[] = [];
    
    for (const location of locations || []) {
      // Count services for this location
      const { count: serviceCount, error: serviceError } = await supabase
        .from('location_services')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', location.id);
      
      if (serviceError) {
        console.error(`Error counting services for location ${location.id}:`, serviceError);
      }
      
      // Count seats for this location
      const { count: seatCount, error: seatError } = await supabase
        .from('seats')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', location.id);
      
      if (seatError) {
        console.error(`Error counting seats for location ${location.id}:`, seatError);
      }
      
      locationsWithDetails.push({
        ...location,
        serviceCount: serviceCount || 0,
        seatCount: seatCount || 0
      });
    }
    
    return locationsWithDetails;
  } catch (error) {
    console.error('Error fetching locations with details:', error);
    return [];
  }
};

// Helper function to fetch bookings with pagination and filters
export const fetchBookings = async (
  params: PaginationParams & BookingFilters
): Promise<ApiResponse<BookingWithDetails[]>> => {
  const { page = 1, pageSize = 10, locationId, dateFrom, dateTo, searchQuery } = params;
  
  try {
    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Start building the query
    let query = supabase
      .from('bookings')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (locationId) {
      // For location filtering, we need to look at booking_services
      // Ambil semua location_service_id untuk locationId ini
      const { data: locationServices } = await supabase
        .from('location_services')
        .select('id')
        .eq('location_id', locationId);
      const locationServiceIds = locationServices?.map((ls: any) => ls.id) || [];
      if (locationServiceIds.length > 0) {
        const { data: bookingIds } = await supabase
          .from('booking_services')
          .select('booking_id')
          .in('location_service_id', locationServiceIds);
        if (bookingIds?.length) {
          const ids: string[] = bookingIds.map((item: { booking_id: string }) => item.booking_id);
          query = query.in('id', ids);
        } else {
          // No bookings for this location
          return { data: [], count: 0, page, pageSize, totalPages: 0 };
        }
      } else {
        // No location_services for this location
        return { data: [], count: 0, page, pageSize, totalPages: 0 };
      }
    }
    
    if (dateFrom) {
      query = query.gte('booking_date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('booking_date', dateTo);
    }
    
    if (searchQuery) {
      query = query.or(`customer_name.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`);
    }
    
    // Apply pagination
    query = query.range(from, to).order('booking_date', { ascending: false });
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    // Process bookings to add location names and seat names
    const processedBookings: BookingWithDetails[] = [];
    
    for (const booking of data || []) {
      // Get seat information if seat_id exists
      let seat_name = null;
      if (booking.seat_id) {
        const { data: seatData } = await supabase
          .from('seats')
          .select('name')
          .eq('id', booking.seat_id)
          .single();
        
        seat_name = seatData?.name || null;
      }
      
      // Get services for this booking
      const { data: bookingServicesData } = await supabase
        .from('booking_services')
        .select(`
          location_services!inner(
            id,
            price,
            duration,
            services!inner(name)
          )
        `)
        .eq('booking_id', booking.id);
      
      const services = (bookingServicesData?.map((bs: any) => ({
        id: bs.location_services.id,
        name: bs.location_services.services.name,
        price: bs.location_services.price,
        duration: bs.location_services.duration
      })) || []);
      
      // Get first service's location name as the booking location
      let location_name = null;
      if (bookingServicesData && bookingServicesData.length > 0) {
        let firstServiceLocationId: any = null;
        const locSvc: any = bookingServicesData[0].location_services;
        if (Array.isArray(locSvc)) {
          firstServiceLocationId = locSvc[0]?.id;
        } else {
          firstServiceLocationId = locSvc?.id;
        }
        const { data: locationData } = await supabase
          .from('location_services')
          .select('locations!inner(name)')
          .eq('id', firstServiceLocationId)
          .single();
        if (Array.isArray(locationData?.locations)) {
          const locArr: any = locationData.locations;
          location_name = locArr.length > 0 ? locArr[0]?.name || null : null;
        } else {
          location_name = (locationData?.locations as any)?.name || null;
        }
      }
      
      processedBookings.push({
        ...booking,
        location_name,
        seat_name,
        services
      });
    }
    
    // Calculate total pages
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return {
      data: processedBookings,
      count: totalCount,
      page,
      pageSize,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { error: (error as Error).message };
  }
};

// Helper function to fetch dashboard stats
export const fetchDashboardStats = async (days: number): Promise<{
  bookings: Booking[];
  bookingServices: any[];
  visitorStats: DailyStats[];
  bookingStats: DailyStats[];
  popularServices: PopularService[];
  locationStats: LocationStats[];
}> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateISO = startDate.toISOString();
    
    // Fetch bookings for the time period
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .gte('created_at', startDateISO)
      .order('booking_date', { ascending: false });
    
    if (bookingsError) {
      throw bookingsError;
    }
    
    // Fetch booking_services for the time period
    const { data: bookingServicesData, error: bookingServicesError } = await supabase
      .from('booking_services')
      .select(`
        *,
        location_services!inner(
          price,
          locations!inner(name),
          services!inner(name)
        )
      `)
      .gte('created_at', startDateISO);
    
    if (bookingServicesError) {
      throw bookingServicesError;
    }
    
    // Process visitor stats (assuming visitor data comes from a different source)
    // Placeholder for visitor stats calculation
    const visitorStatsByDay: { [key: string]: number } = {};
    const today = new Date();
    
    // Initialize all days with 0 visitors
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      visitorStatsByDay[dateStr] = 0;
    }
    
    // To be replaced with actual visitor data calculation
    // For now, using random data for demonstration
    Object.keys(visitorStatsByDay).forEach(day => {
      visitorStatsByDay[day] = Math.floor(Math.random() * 100);
    });
    
    // Process booking stats by day
    const bookingStatsByDay: { [key: string]: number } = {};
    
    // Initialize all days with 0 bookings
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      bookingStatsByDay[dateStr] = 0;
    }
    
    // Count bookings per day
    (bookingsData as any[])?.forEach((booking: any) => {
      const dateStr = booking.booking_date;
      if (bookingStatsByDay[dateStr] !== undefined) {
        bookingStatsByDay[dateStr]++;
      }
    });
    
    // Process popular services
    const serviceStats: { [key: string]: { count: number, revenue: number } } = {};
    
    bookingServicesData?.forEach((bs: any) => {
      const serviceName = bs.location_services?.services?.name || 'Unknown Service';
      
      if (!serviceStats[serviceName]) {
        serviceStats[serviceName] = { count: 0, revenue: 0 };
      }
      
      serviceStats[serviceName].count++;
      serviceStats[serviceName].revenue += Number(bs.location_services?.price) || 0;
    });
    
    // Process location stats
    const locationStats: { [key: string]: { bookings: number, revenue: number } } = {};
    
    bookingServicesData?.forEach((bs: any) => {
      const locationName = bs.location_services?.locations?.name || 'Unknown Location';
      
      if (!locationStats[locationName]) {
        locationStats[locationName] = { bookings: 0, revenue: 0 };
      }
      
      locationStats[locationName].bookings++;
      locationStats[locationName].revenue += Number(bs.location_services?.price) || 0;
    });
    
    // Format stats for return
    const visitorStatsArray = Object.keys(visitorStatsByDay).map(day => ({
      day,
      count: visitorStatsByDay[day]
    })).sort((a, b) => a.day.localeCompare(b.day));
    
    const bookingStatsArray = Object.keys(bookingStatsByDay).map(day => ({
      day,
      count: bookingStatsByDay[day]
    })).sort((a, b) => a.day.localeCompare(b.day));
    
    const popularServicesArray = Object.keys(serviceStats).map(name => ({
      name,
      bookings: serviceStats[name].count,
      revenue: serviceStats[name].revenue
    })).sort((a, b) => b.bookings - a.bookings);
    
    const locationStatsArray = Object.keys(locationStats).map(name => ({
      name,
      bookings: locationStats[name].bookings,
      revenue: locationStats[name].revenue
    })).sort((a, b) => b.revenue - a.revenue);
    
    return {
      bookings: bookingsData || [],
      bookingServices: bookingServicesData || [],
      visitorStats: visitorStatsArray,
      bookingStats: bookingStatsArray,
      popularServices: popularServicesArray,
      locationStats: locationStatsArray
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Helper function to fetch services with location details
export const fetchServicesWithDetails = async (): Promise<ServiceWithDetails[]> => {
  try {
    // Fetch services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    if (servicesError) {
      throw servicesError;
    }
    
    // Process each service to get location details
    const servicesWithDetails: ServiceWithDetails[] = [];
    
    for (const service of services || []) {
      // Get locations that offer this service
      const { data: locationServices, error: locationServicesError } = await supabase
        .from('location_services')
        .select(`
          *,
          locations!inner(name)
        `)
        .eq('service_id', service.id);
      
      if (locationServicesError) {
        console.error(`Error fetching locations for service ${service.id}:`, locationServicesError);
      }
      
      servicesWithDetails.push({
        ...service,
        locations: locationServices || [],
        locationCount: locationServices?.length || 0
      });
    }
    
    return servicesWithDetails;
  } catch (error) {
    console.error('Error fetching services with details:', error);
    return [];
  }
};

// Helper function to fetch location services with details
export const fetchLocationServices = async (
  locationId?: string
): Promise<LocationServiceWithDetails[]> => {
  try {
    let query = supabase
      .from('location_services')
      .select(`
        *,
        locations!inner(name),
        services!inner(name)
      `)
      .order('created_at', { ascending: false });
    
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data?.map((item: any) => ({
      ...item,
      service_name: item.services?.name || 'Unknown Service',
      location_name: item.locations?.name || 'Unknown Location',
    })) || [];
  } catch (error) {
    console.error('Error fetching location services:', error);
    return [];
  }
};