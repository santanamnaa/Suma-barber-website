/*
  # Update Booking System Schema

  1. Changes
    - Add payment_expiry column to bookings table
    - Add staff_id column to bookings table
    - Add loyalty_points column to bookings table
    - Add cancellation_policy column to bookings table
    - Add notification_preferences column to bookings table
    - Update RLS policies for enhanced security

  2. Security
    - Update RLS policies for all tables
    - Add validation constraints
*/

-- Add new columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_expiry timestamptz,
ADD COLUMN IF NOT EXISTS staff_id uuid,
ADD COLUMN IF NOT EXISTS loyalty_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancellation_policy jsonb DEFAULT '{"allowed": true, "deadline_hours": 24, "refund_percentage": 100}'::jsonb,
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"email": true, "sms": false, "whatsapp": false}'::jsonb;

-- Add check constraints
ALTER TABLE bookings
ADD CONSTRAINT loyalty_points_check CHECK (loyalty_points >= 0),
ADD CONSTRAINT payment_expiry_check CHECK (payment_expiry > created_at);

-- Update RLS policies for bookings
DROP POLICY IF EXISTS "Allow public read access" ON bookings;
DROP POLICY IF EXISTS "Allow public insert access" ON bookings;

CREATE POLICY "Allow public read access to non-expired bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (
    (payment_status IN ('pending', 'processing') AND (payment_expiry IS NULL OR payment_expiry > NOW()))
    OR customer_email = current_user
  );

CREATE POLICY "Allow public insert with validation"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (
    payment_status = 'pending'
    AND booking_date >= CURRENT_DATE
    AND total_duration > 0
    AND total_price > 0
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_expiry ON bookings(payment_expiry);
CREATE INDEX IF NOT EXISTS idx_bookings_staff ON bookings(staff_id);