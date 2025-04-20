-- /*
--   # Create booking system tables

--   1. New Tables
--     - `locations`
--       - `id` (uuid, primary key)
--       - `name` (text)
--       - `area` (text)
--       - `address` (text)
--       - `created_at` (timestamp)
    
--     - `services`
--       - `id` (uuid, primary key)
--       - `name` (text)
--       - `description` (text)
--       - `image_url` (text)
--       - `created_at` (timestamp)
    
--     - `location_services`
--       - `id` (uuid, primary key)
--       - `location_id` (uuid, foreign key)
--       - `service_id` (uuid, foreign key)
--       - `price` (integer)
--       - `duration` (integer)
--       - `created_at` (timestamp)
    
--     - `bookings`
--       - `id` (uuid, primary key)
--       - `customer_name` (text)
--       - `customer_email` (text)
--       - `customer_phone` (text)
--       - `booking_date` (date)
--       - `booking_time` (text)
--       - `total_duration` (integer)
--       - `total_price` (integer)
--       - `created_at` (timestamp)
    
--     - `booking_services`
--       - `id` (uuid, primary key)
--       - `booking_id` (uuid, foreign key)
--       - `location_service_id` (uuid, foreign key)
--       - `created_at` (timestamp)

--   2. Security
--     - Enable RLS on all tables
--     - Add policies for authenticated users
-- */

-- -- Create locations table
-- CREATE TABLE IF NOT EXISTS locations (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   name text NOT NULL,
--   area text NOT NULL,
--   address text NOT NULL,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow public read access to locations"
--   ON locations
--   FOR SELECT
--   TO public
--   USING (true);

-- -- Create services table
-- CREATE TABLE IF NOT EXISTS services (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   name text NOT NULL,
--   description text NOT NULL,
--   image_url text NOT NULL,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow public read access to services"
--   ON services
--   FOR SELECT
--   TO public
--   USING (true);

-- -- Create location_services table
-- CREATE TABLE IF NOT EXISTS location_services (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
--   service_id uuid REFERENCES services(id) ON DELETE CASCADE,
--   price integer NOT NULL,
--   duration integer NOT NULL,
--   created_at timestamptz DEFAULT now(),
--   UNIQUE(location_id, service_id)
-- );

-- ALTER TABLE location_services ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow public read access to location_services"
--   ON location_services
--   FOR SELECT
--   TO public
--   USING (true);

-- -- Create bookings table
-- CREATE TABLE IF NOT EXISTS bookings (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   customer_name text NOT NULL,
--   customer_email text NOT NULL,
--   customer_phone text NOT NULL,
--   booking_date date NOT NULL,
--   booking_time text NOT NULL,
--   total_duration integer NOT NULL,
--   total_price integer NOT NULL,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow public insert access to bookings"
--   ON bookings
--   FOR INSERT
--   TO public
--   WITH CHECK (true);

-- CREATE POLICY "Allow public read access to bookings"
--   ON bookings
--   FOR SELECT
--   TO public
--   USING (true);

-- -- Create booking_services table
-- CREATE TABLE IF NOT EXISTS booking_services (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
--   location_service_id uuid REFERENCES location_services(id) ON DELETE CASCADE,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow public insert access to booking_services"
--   ON booking_services
--   FOR INSERT
--   TO public
--   WITH CHECK (true);

-- CREATE POLICY "Allow public read access to booking_services"
--   ON booking_services
--   FOR SELECT
--   TO public
--   USING (true);