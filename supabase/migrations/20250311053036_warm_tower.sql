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
--       - `location_service_id` (uuid, foreign key)
--       - `customer_name` (text)
--       - `customer_email` (text)
--       - `customer_phone` (text)
--       - `booking_date` (date)
--       - `booking_time` (text)
--       - `duration` (integer)
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
--   price integer NOT NULL CHECK (price > 0),
--   duration integer NOT NULL CHECK (duration > 0),
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
--   location_service_id uuid REFERENCES location_services(id) ON DELETE CASCADE,
--   customer_name text NOT NULL,
--   customer_email text NOT NULL,
--   customer_phone text NOT NULL,
--   booking_date date NOT NULL,
--   booking_time text NOT NULL,
--   duration integer NOT NULL CHECK (duration > 0),
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow public read access to bookings"
--   ON bookings
--   FOR SELECT
--   TO public
--   USING (true);

-- CREATE POLICY "Allow public insert to bookings"
--   ON bookings
--   FOR INSERT
--   TO public
--   WITH CHECK (true);

-- -- Create indexes for better query performance
-- CREATE INDEX IF NOT EXISTS idx_bookings_date_time 
--   ON bookings(booking_date, booking_time);

-- CREATE INDEX IF NOT EXISTS idx_bookings_location_service 
--   ON bookings(location_service_id);

-- -- Insert sample data
-- INSERT INTO locations (name, area, address) VALUES
--   ('GEGERKALONG', 'BANDUNG', 'Jl. Gegerkalong Hilir No.170'),
--   ('KIARA ARTHA', 'BANDUNG', 'Jl. Kiara Artha Park No.15')
-- ON CONFLICT DO NOTHING;

-- INSERT INTO services (name, description, image_url) VALUES
--   ('Classic Haircut', 'Traditional barbering techniques for a timeless look', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80'),
--   ('Fade Cut', 'Precision fade with modern styling', 'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&q=80'),
--   ('Beard Trim', 'Expert beard shaping and grooming', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80')
-- ON CONFLICT DO NOTHING;