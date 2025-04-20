/*
  # Create bookings table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `customer_name` (text, not null)
      - `customer_email` (text, not null)
      - `customer_phone` (text, not null)
      - `booking_date` (date, not null)
      - `booking_time` (text, not null)
      - `total_duration` (integer, not null)
      - `total_price` (integer, not null)
      - `payment_status` (text, not null)
      - `payment_method` (text, not null)
      - `payment_id` (text)
      - `payment_details` (jsonb)
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `bookings` table
    - Add policy for public insert access
    - Add policy for reading own bookings
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  booking_date date NOT NULL,
  booking_time text NOT NULL,
  total_duration integer NOT NULL CHECK (total_duration > 0),
  total_price integer NOT NULL CHECK (total_price >= 0),
  payment_status text NOT NULL CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method text NOT NULL CHECK (payment_method IN ('qris', 'bca', 'gopay')),
  payment_id text,
  payment_details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert access"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow reading own bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (customer_email = current_user);