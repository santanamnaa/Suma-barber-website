/*
  # Create locations table

  1. New Tables
    - `locations`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `area` (text, not null)
      - `address` (text, not null)
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `locations` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  area text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON locations
  FOR SELECT
  TO public
  USING (true);