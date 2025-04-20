/*
  # Create services table

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
      - `image_url` (text, not null)
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `services` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON services
  FOR SELECT
  TO public
  USING (true);