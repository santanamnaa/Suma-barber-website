-- /*
--   # Create Booking System Tables

--   1. New Tables
--     - `services`: Stores service information
--       - `id` (uuid, primary key)
--       - `name` (text)
--       - `description` (text)
--       - `image_url` (text)
--       - `created_at` (timestamp)
    
--     - `locations`: Stores location information
--       - `id` (uuid, primary key)
--       - `name` (text)
--       - `area` (text)
--       - `address` (text)
--       - `created_at` (timestamp)
    
--     - `location_services`: Links services to locations with pricing
--       - `id` (uuid, primary key)
--       - `location_id` (uuid, references locations)
--       - `service_id` (uuid, references services)
--       - `price` (integer)
--       - `duration` (integer)
--       - `created_at` (timestamp)
    
--     - `bookings`: Stores booking information
--       - `id` (uuid, primary key)
--       - `customer_name` (text)
--       - `customer_email` (text)
--       - `customer_phone` (text)
--       - `booking_date` (date)
--       - `booking_time` (text)
--       - `total_duration` (integer)
--       - `total_price` (integer)
--       - `created_at` (timestamp)
    
--     - `booking_services`: Links bookings to services
--       - `id` (uuid, primary key)
--       - `booking_id` (uuid, references bookings)
--       - `location_service_id` (uuid, references location_services)
--       - `created_at` (timestamp)

--   2. Security
--     - Enable RLS on all tables
--     - Add policies for authenticated users
-- */

-- -- Create services table
-- CREATE TABLE IF NOT EXISTS services (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   name text NOT NULL,
--   description text,
--   image_url text,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- -- Create locations table
-- CREATE TABLE IF NOT EXISTS locations (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   name text NOT NULL,
--   area text NOT NULL,
--   address text NOT NULL,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

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

-- -- Create booking_services table
-- CREATE TABLE IF NOT EXISTS booking_services (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
--   location_service_id uuid REFERENCES location_services(id) ON DELETE CASCADE,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;

-- -- Add RLS policies
-- CREATE POLICY "Allow public read access to services"
--   ON services
--   FOR SELECT
--   TO public
--   USING (true);

-- CREATE POLICY "Allow public read access to locations"
--   ON locations
--   FOR SELECT
--   TO public
--   USING (true);

-- CREATE POLICY "Allow public read access to location_services"
--   ON location_services
--   FOR SELECT
--   TO public
--   USING (true);

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

-- CREATE POLICY "Allow public read access to booking_services"
--   ON booking_services
--   FOR SELECT
--   TO public
--   USING (true);

-- CREATE POLICY "Allow public insert to booking_services"
--   ON booking_services
--   FOR INSERT
--   TO public
--   WITH CHECK (true);

-- -- Insert sample services
-- INSERT INTO services (name, description, image_url) VALUES
--   ('Gentleman''s Cut', 'Classic haircut for the modern gentleman', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80'),
--   ('Gentleman''s Cut (Capster by Request)', 'Premium haircut with your preferred stylist', 'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&q=80'),
--   ('Gentleman''s Cut + 30 Min Full Back Massage', 'Haircut with relaxing massage', 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80'),
--   ('Gentleman''s Cut + Bekam Kering', 'Haircut with cupping therapy', 'https://images.unsplash.com/photo-1593702295094-ac9a262f7c36?auto=format&fit=crop&q=80'),
--   ('Gentleman''s Cut + Ear Candle', 'Haircut with ear candling treatment', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80'),
--   ('Gentleman''s Cut (Long Trim)', 'Specialized cut for longer hairstyles', 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80'),
--   ('Perm + Gentleman''s Cut', 'Permanent wave styling with haircut', 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80'),
--   ('Korean Perm + Gentleman''s Cut', 'Korean-style perm with haircut', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80'),
--   ('Down Perm', 'Specialized downward perm treatment', 'https://images.unsplash.com/photo-1634302086738-b13113181ccd?auto=format&fit=crop&q=80'),
--   ('Full Hair Coloring', 'Complete hair color transformation', 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&q=80'),
--   ('Full Hair Bleach', 'Professional hair lightening service', 'https://images.unsplash.com/photo-1592647420148-bfcc177e2117?auto=format&fit=crop&q=80'),
--   ('Highlight', 'Partial hair coloring for dimension', 'https://images.unsplash.com/photo-1580518337843-f959e992563b?auto=format&fit=crop&q=80'),
--   ('Polish (Semir)', 'Hair color touch-up service', 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&q=80');

-- -- Insert sample location
-- INSERT INTO locations (name, area, address) VALUES
--   ('GEGERKALONG', 'BANDUNG', 'Jl. Gegerkalong Hilir No.170, Gegerkalong, Kec. Sukasari, Kota Bandung, Jawa Barat 40153');

-- -- Insert location services with prices
-- DO $$
-- DECLARE
--   location_id uuid;
--   service_id uuid;
-- BEGIN
--   SELECT id INTO location_id FROM locations WHERE name = 'GEGERKALONG' LIMIT 1;
  
--   -- Haircuts
--   SELECT id INTO service_id FROM services WHERE name = 'Gentleman''s Cut' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 40000, 45);
  
--   SELECT id INTO service_id FROM services WHERE name = 'Gentleman''s Cut (Capster by Request)' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 50000, 45);
  
--   SELECT id INTO service_id FROM services WHERE name = 'Gentleman''s Cut + 30 Min Full Back Massage' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 70000, 75);
  
--   SELECT id INTO service_id FROM services WHERE name = 'Gentleman''s Cut + Bekam Kering' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 80000, 75);
  
--   SELECT id INTO service_id FROM services WHERE name = 'Gentleman''s Cut + Ear Candle' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 80000, 75);
  
--   SELECT id INTO service_id FROM services WHERE name = 'Gentleman''s Cut (Long Trim)' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 70000, 60);
  
--   -- Hairstyling
--   SELECT id INTO service_id FROM services WHERE name = 'Perm + Gentleman''s Cut' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 190000, 120);
  
--   SELECT id INTO service_id FROM services WHERE name = 'Korean Perm + Gentleman''s Cut' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 320000, 150);
  
--   SELECT id INTO service_id FROM services WHERE name = 'Down Perm' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 130000, 90);
  
--   -- Hair Coloring
--   SELECT id INTO service_id FROM services WHERE name = 'Full Hair Coloring' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 250000, 120);
  
--   SELECT id INTO service_id FROM services WHERE name = 'Full Hair Bleach' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 270000, 150);
  
--   SELECT id INTO service_id FROM services WHERE name = 'Highlight' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 290000, 150);
  
--   SELECT id INTO service_id FROM services WHERE name = 'Polish (Semir)' LIMIT 1;
--   INSERT INTO location_services (location_id, service_id, price, duration) VALUES (location_id, service_id, 90000, 60);
-- END $$;