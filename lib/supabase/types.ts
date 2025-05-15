export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// lib/supabase/types.ts
export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          // tambahkan kolom lain jika diperlukan
        };
        Insert: {
          // kolom yang diperlukan untuk insert
          email: string;
          name: string;
          created_at?: string;
        };
        Update: {
          // kolom opsional untuk update
          email?: string;
          name?: string;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          booking_date: string;
          booking_time: string;
          location_id: string;
          seat_id?: string | null;
          status: string;
          total_price: number;
          created_at: string;
          // tambahkan kolom lain jika diperlukan
        };
        Insert: {
          // kolom yang diperlukan untuk insert
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          booking_date: string;
          booking_time: string;
          location_id: string;
          // kolom opsional
          seat_id?: string | null;
          status?: string;
          total_price?: number;
          created_at?: string;
        };
        Update: {
          // semua kolom opsional
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          booking_date?: string;
          booking_time?: string;
          location_id?: string;
          seat_id?: string | null;
          status?: string;
          total_price?: number;
          created_at?: string;
        };
      };
      booking_services: {
        Row: {
          id: string;
          booking_id: string;
          location_service_id: string;
          created_at: string;
        };
        Insert: {
          booking_id: string;
          location_service_id: string;
          created_at?: string;
        };
        Update: {
          booking_id?: string;
          location_service_id?: string;
          created_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          address: string;
          created_at: string;
        };
        Insert: {
          name: string;
          address: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          address?: string;
          created_at?: string;
        };
      };
      location_services: {
        Row: {
          id: string;
          location_id: string;
          service_id: string;
          price: number;
          duration: number;
          created_at: string;
        };
        Insert: {
          location_id: string;
          service_id: string;
          price: number;
          duration: number;
          created_at?: string;
        };
        Update: {
          location_id?: string;
          service_id?: string;
          price?: number;
          duration?: number;
          created_at?: string;
        };
      };
      seats: {
        Row: {
          id: string;
          name: string;
          location_id: string;
          created_at: string;
        };
        Insert: {
          name: string;
          location_id: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          location_id?: string;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description?: string;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          customer_name: string;
          service_id: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          customer_name: string;
          service_id: string;
          rating: number;
          comment: string;
          created_at?: string;
        };
        Update: {
          customer_name?: string;
          service_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string[];
    };
  };
};