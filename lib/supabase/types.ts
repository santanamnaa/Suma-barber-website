export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string
          name: string
          area: string
          address: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          area: string
          address: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          area?: string
          address?: string
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string
          created_at?: string
        }
      }
      seats: {
        Row: {
          id: string
          location_id: string
          name: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          name: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          name?: string
          is_active?: boolean
          created_at?: string
        }
      }
      location_services: {
        Row: {
          id: string
          location_id: string
          service_id: string
          price: number
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          service_id: string
          price: number
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          service_id?: string
          price?: number
          duration?: number
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          booking_date: string
          booking_time: string
          total_duration: number
          total_price: number
          payment_status: 'pending' | 'processing' | 'completed' | 'failed'
          payment_method: 'qris' | 'bca' | 'gopay'
          payment_id: string | null
          payment_details: Json | null
          payment_expiry: string | null
          staff_id: string | null
          loyalty_points: number
          cancellation_policy: Json
          notification_preferences: Json
          seat_id: string | null
          check_in_time: string | null
          is_forfeited: boolean
          terms_accepted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_email: string
          customer_phone: string
          booking_date: string
          booking_time: string
          total_duration: number
          total_price: number
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed'
          payment_method: 'qris' | 'bca' | 'gopay'
          payment_id?: string | null
          payment_details?: Json | null
          payment_expiry?: string | null
          staff_id?: string | null
          loyalty_points?: number
          cancellation_policy?: Json
          notification_preferences?: Json
          seat_id?: string | null
          check_in_time?: string | null
          is_forfeited?: boolean
          terms_accepted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          booking_date?: string
          booking_time?: string
          total_duration?: number
          total_price?: number
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed'
          payment_method?: 'qris' | 'bca' | 'gopay'
          payment_id?: string | null
          payment_details?: Json | null
          payment_expiry?: string | null
          staff_id?: string | null
          loyalty_points?: number
          cancellation_policy?: Json
          notification_preferences?: Json
          seat_id?: string | null
          check_in_time?: string | null
          is_forfeited?: boolean
          terms_accepted?: boolean
          created_at?: string
        }
      }
      booking_services: {
        Row: {
          id: string
          booking_id: string
          location_service_id: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          location_service_id: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          location_service_id?: string
          created_at?: string
        }
      }
    }
  }
}