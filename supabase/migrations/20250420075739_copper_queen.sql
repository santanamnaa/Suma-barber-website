/*
  # Add Booking Logic and Terms

  1. New Tables
    - `seats`
      - `id` (uuid, primary key)
      - `location_id` (uuid, foreign key)
      - `name` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Changes
    - Add booking terms columns to bookings table
    - Add seat allocation tracking
    - Add check-in status tracking

  3. Security
    - Enable RLS on seats table
    - Add policies for public read access
*/

-- Create seats table
CREATE TABLE IF NOT EXISTS seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to seats"
  ON seats
  FOR SELECT
  TO public
  USING (true);

-- Add columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS seat_id uuid REFERENCES seats(id),
ADD COLUMN IF NOT EXISTS check_in_time timestamptz,
ADD COLUMN IF NOT EXISTS is_forfeited boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
ADD CONSTRAINT check_in_time_after_created CHECK (check_in_time >= created_at);

-- Insert initial seats data
WITH loc_data AS (
  SELECT id, name FROM locations
)
INSERT INTO seats (location_id, name)
SELECT 
  l.id,
  'Cap ' || generate_series
FROM loc_data l
CROSS JOIN generate_series(1,
  CASE l.name
    WHEN 'KIARA ARTHA' THEN 3
    WHEN 'GEGERKALONG' THEN 5
  END
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_seat_time 
  ON bookings(seat_id, booking_date, booking_time);