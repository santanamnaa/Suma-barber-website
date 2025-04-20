-- /*
--   # Services and Bookings Schema

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
--       - `created_at` (timestamp)

--   2. Security
--     - Enable RLS on all tables
--     - Add policies for authenticated users
-- */

-- -- Create locations table
-- CREATE TABLE locations (
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
-- CREATE TABLE services (
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
-- CREATE TABLE location_services (
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
-- CREATE TABLE bookings (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   location_service_id uuid REFERENCES location_services(id) ON DELETE CASCADE,
--   customer_name text NOT NULL,
--   customer_email text NOT NULL,
--   customer_phone text NOT NULL,
--   booking_date date NOT NULL,
--   booking_time text NOT NULL,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow public insert access to bookings"
--   ON bookings
--   FOR INSERT
--   TO public
--   WITH CHECK (true);

-- CREATE POLICY "Allow users to view their own bookings"
--   ON bookings
--   FOR SELECT
--   TO public
--   USING (customer_email = current_user);

-- -- Insert sample data
-- INSERT INTO locations (name, area, address) VALUES
--   ('GEGERKALONG', 'BANDUNG', 'Jl. Gegerkalong Hilir No.170, Gegerkalong, Kec. Sukasari, Kota Bandung, Jawa Barat 40153'),
--   ('KIARA ARTHA', 'BANDUNG', 'Kiara Artha Park, Bandung');

-- INSERT INTO services (name, description, image_url) VALUES
--   ('Korean Style Cut', 'Modern Korean-inspired haircut with precision styling', 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80'),
--   ('Classic Haircut', 'Traditional barbershop cut with modern techniques', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80'),
--   ('Beard Trim', 'Professional beard grooming and shaping', 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80'),
--   ('Hair Color', 'Premium hair coloring with consultation', 'https://images.unsplash.com/photo-1584486483122-af7d49cf2992?auto=format&fit=crop&q=80'),
--   ('Hair Treatment', 'Deep conditioning and scalp treatment', 'https://images.unsplash.com/photo-1580518337843-f959e992563b?auto=format&fit=crop&q=80');

-- -- Insert location services with different prices
-- INSERT INTO location_services (location_id, service_id, price, duration)
-- SELECT 
--   l.id,
--   s.id,
--   CASE s.name
--     WHEN 'Korean Style Cut' THEN 250000
--     WHEN 'Classic Haircut' THEN 200000
--     WHEN 'Beard Trim' THEN 150000
--     WHEN 'Hair Color' THEN 500000
--     WHEN 'Hair Treatment' THEN 350000
--   END as price,
--   CASE s.name
--     WHEN 'Korean Style Cut' THEN 60
--     WHEN 'Classic Haircut' THEN 45
--     WHEN 'Beard Trim' THEN 30
--     WHEN 'Hair Color' THEN 120
--     WHEN 'Hair Treatment' THEN 60
--   END as duration
-- FROM locations l
-- CROSS JOIN services s;