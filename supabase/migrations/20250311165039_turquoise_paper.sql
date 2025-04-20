/*
  # Update booking schema for payment handling

  1. Changes
    - Add payment-related columns to bookings table:
      - payment_status (pending, processing, completed, failed)
      - payment_method (qris, bca, gopay)
      - payment_id (for tracking)
      - payment_details (for storing gateway response)

  2. Security
    - Update RLS policies for bookings table
    - Add policies for booking_services table
*/

-- Add payment columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending' 
  CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'qris' 
  CHECK (payment_method IN ('qris', 'bca', 'gopay')),
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS payment_details jsonb;

-- Update RLS policies for bookings
DROP POLICY IF EXISTS "Allow public insert access" ON bookings;
DROP POLICY IF EXISTS "Allow reading own bookings" ON bookings;

CREATE POLICY "Allow public insert access"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow reading own bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (customer_email = current_user OR payment_status IN ('pending', 'processing'));

-- Update RLS policies for booking_services
DROP POLICY IF EXISTS "Allow public insert access" ON booking_services;
DROP POLICY IF EXISTS "Allow reading own booking services" ON booking_services;

CREATE POLICY "Allow public insert access"
  ON booking_services
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow reading own booking services"
  ON booking_services
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id
      AND (b.customer_email = current_user OR b.payment_status IN ('pending', 'processing'))
    )
  );