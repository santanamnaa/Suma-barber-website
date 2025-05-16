// Dashboard data types
export interface BookingStats {
  booking_date: string;
  total_bookings: number;
  revenue: number;
  location: string;
  popular_service: string;
}

export interface DashboardData {
  stats: BookingStats[];
  topCustomers: Array<{
    name: string;
    count: number;
    total: number;
  }>;
  testimonials: Array<{
    customer_name: string;
    service: string;
    rating: number;
    comment: string;
    created_at: string;
  }>;
  bookingStatusDist: Array<{
    status: string;
    count: number;
  }>;
  visitorStats: Array<{
    day: string;
    count: number;
  }>;
}

export interface FilterState {
  range: number;
  locationId?: string | null;
  serviceId?: string | null;
}

export type DashboardErrorType = 'API' | 'AUTH' | 'DATA';

export interface LocationStat {
  location_id: string;
  name: string;
  area?: string;
  address?: string;
  bookings: number;
  revenue: number;
  unique_customers?: number;
  avg_rating?: number;
  latitude?: number;
  longitude?: number;
}

export interface ServiceStat {
  service_id: string;
  name: string;
  description?: string;
  image_url?: string;
  bookings: number;
  revenue: number;
  avg_rating?: number;
  total_duration?: number;
  unique_customers?: number;
}

export interface StatusStat {
  status: string;
  count: number;
  percentage: number;
}

export interface TimeStat {
  hour: number;
  count: number;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  service_id: string;
  service_name: string;
  rating: number;
  comment: string;
  created_at: string;
  location_name?: string;
}

export interface TopCustomer {
  name: string;
  email: string;
  phone?: string;
  visit_count: number;
  total_spent: number;
  first_visit: string;
  last_visit: string;
  booking_statuses: string[];
}

export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  booking_date: string;
  booking_time: string;
  total_duration: number;
  total_price: number;
  status: string;
  created_at: string;
  location_name: string;
  services: {
    service_id: string;
    service_name: string;
    price: number;
    duration: number;
  }[];
}

export interface SeatAvailability {
  location_id: string;
  location_name: string;
  total_seats: number;
  active_seats: number;
  upcoming_bookings: number;
  scheduled_bookings: number;
}

export interface ServiceCategory {
  service_count: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  avg_duration: number;
}

export interface Summary {
  total_bookings: number;
  total_revenue: number;
  total_customers: number;
  avg_booking_duration?: number;
  avg_booking_value?: number;
  conversion_rate?: number;
}

export interface DashboardData {
  summary: Summary;
  booking_stats: BookingStat[];
  location_stats: LocationStat[];
  popular_services: ServiceStat[];
  status_dist: StatusStat[];
  time_distribution: TimeStat[];
  testimonials: Testimonial[];
  top_customers: TopCustomer[];
  latest_bookings: Booking[];
  seats_availability: SeatAvailability[];
  service_categories?: ServiceCategory[];
} 