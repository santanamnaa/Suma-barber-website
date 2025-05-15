import { Database } from './types';

// Tipe data dasar dari database
export type Location = Database['public']['Tables']['locations']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Seat = Database['public']['Tables']['seats']['Row'];
export type LocationService = Database['public']['Tables']['location_services']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'] & { location_id: string };
export type BookingService = Database['public']['Tables']['booking_services']['Row'];
export type Admin = Database['public']['Tables']['admins']['Row'];

// Tipe data dengan informasi tambahan untuk UI
export type LocationWithDetails = Location & {
  serviceCount?: number;
  seatCount?: number;
};

export type ServiceWithDetails = Service & {
  locations?: LocationService[];
  locationCount?: number;
};

export type SeatWithLocation = Seat & {
  location_name?: string;
};

export type LocationServiceWithDetails = LocationService & {
  service_name?: string;
  location_name?: string;
};

export type BookingWithDetails = Booking & {
  location_name?: string;
  seat_name?: string;
  services?: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
  }>;
};

export type BookingServiceWithDetails = BookingService & {
  service_name?: string;
  location_name?: string;
  price?: number;
  duration?: number;
  booking?: Booking;
};

// Tipe untuk statistik dashboard
export type DailyStats = {
  day: string;
  count: number;
};

export type PopularService = {
  name: string;
  bookings: number;
  revenue: number;
};

export type LocationStats = {
  name: string;
  bookings: number;
  revenue: number;
};

// Tipe data untuk filter dan pagination
export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type BookingFilters = {
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  searchQuery?: string;
};

export type ServiceFilters = {
  locationId?: string;
  searchQuery?: string;
};

// Tipe data untuk respons API
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  count?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};

// Tipe data untuk autentikasi
export type AuthResult = {
  authenticated: boolean;
  user?: any;
  admin?: Admin;
  error?: string;
};