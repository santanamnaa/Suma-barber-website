-- /*
--   # Create booking system tables

--   1. New Tables
--     - `bookings`
--       - `id` (uuid, primary key)
--       - `customer_name` (text)
--       - `customer_email` (text)
--       - `customer_phone` (text)
--       - `booking_date` (date)
--       - `booking_time` (time)
--       - `total_duration` (integer)
--       - `total_price` (integer)
--       - `payment_status` (text)
--       - `payment_method` (text)
--       - `created_at` (timestamp)

--   2. Security
--     - Enable RLS on all tables
--     - Add policies for authenticated users
-- */

-- -- Create bookings table
-- CREATE TABLE IF NOT EXISTS bookings (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   customer_name text NOT NULL,
--   customer_email text NOT NULL,
--   customer_phone text NOT NULL,
--   booking_date date NOT NULL,
--   booking_time time NOT NULL,
--   total_duration integer NOT NULL,
--   total_price integer NOT NULL,
--   payment_status text NOT NULL DEFAULT 'pending',
--   payment_method text,
--   created_at timestamptz DEFAULT now()
-- );

-- -- Enable RLS
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- -- Create policy for selecting bookings
-- CREATE POLICY "Anyone can view bookings"
--   ON bookings
--   FOR SELECT
--   TO public
--   USING (true);

-- -- Create policy for inserting bookings
-- CREATE POLICY "Anyone can insert bookings"
--   ON bookings
--   FOR INSERT
--   TO public
--   WITH CHECK (true);

-- -- Create policy for updating bookings
-- CREATE POLICY "Anyone can update bookings"
--   ON bookings
--   FOR UPDATE
--   TO public
--   USING (true);