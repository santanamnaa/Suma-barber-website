-- /*
--   # Create booking system tables

--   1. New Tables
--     - `bookings`
--       - `id` (uuid, primary key)
--       - `location_service_id` (uuid, foreign key)
--       - `customer_name` (text)
--       - `customer_email` (text)
--       - `customer_phone` (text)
--       - `booking_date` (date)
--       - `booking_time` (text)
--       - `duration` (integer)
--       - `status` (text)
--       - `created_at` (timestamptz)

--   2. Security
--     - Enable RLS on `bookings` table
--     - Add policies for reading and creating bookings
-- */

-- CREATE TABLE IF NOT EXISTS bookings (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   location_service_id uuid REFERENCES location_services(id),
--   customer_name text NOT NULL,
--   customer_email text NOT NULL,
--   customer_phone text NOT NULL,
--   booking_date date NOT NULL,
--   booking_time text NOT NULL,
--   duration integer NOT NULL,
--   status text NOT NULL DEFAULT 'pending',
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Anyone can create bookings"
--   ON bookings
--   FOR INSERT
--   TO public
--   WITH CHECK (true);

-- CREATE POLICY "Anyone can read bookings"
--   ON bookings
--   FOR SELECT
--   TO public
--   USING (true);