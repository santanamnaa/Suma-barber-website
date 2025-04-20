/*
  # Create booking_services table

  1. New Tables
    - `booking_services`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key to bookings)
      - `location_service_id` (uuid, foreign key to location_services)
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `booking_services` table
    - Add policy for public insert access
    - Add policy for reading own booking services
    - Add foreign key constraints
*/

CREATE TABLE IF NOT EXISTS booking_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  location_service_id uuid NOT NULL REFERENCES location_services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;

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
      AND b.customer_email = current_user
    )
  );