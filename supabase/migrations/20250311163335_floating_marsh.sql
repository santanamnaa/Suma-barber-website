/*
  # Create location_services table

  1. New Tables
    - `location_services`
      - `id` (uuid, primary key)
      - `location_id` (uuid, foreign key to locations)
      - `service_id` (uuid, foreign key to services)
      - `price` (integer, not null)
      - `duration` (integer, not null)
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `location_services` table
    - Add policy for public read access
    - Add foreign key constraints
*/

CREATE TABLE IF NOT EXISTS location_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price integer NOT NULL CHECK (price >= 0),
  duration integer NOT NULL CHECK (duration > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(location_id, service_id)
);

ALTER TABLE location_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON location_services
  FOR SELECT
  TO public
  USING (true);