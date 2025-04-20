/*
  # Seed initial data

  1. Purpose
    - Insert sample locations
    - Insert sample services
    - Insert sample location-service mappings

  2. Notes
    - All prices are in IDR
    - Durations are in minutes
*/

-- Insert locations
INSERT INTO locations (name, area, address) VALUES
  ('GEGERKALONG', 'BANDUNG', 'Jl. Gegerkalong Hilir No.170, Gegerkalong, Kec. Sukasari, Kota Bandung, Jawa Barat 40153'),
  ('KIARA ARTHA', 'BANDUNG', 'Jl. Kiara Artha Park No. 1, Bandung');

-- Insert services
INSERT INTO services (name, description, image_url) VALUES
  ('Gentleman''s Cut', 'Classic grooming experience', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80'),
  ('Gentleman''s Cut (Capster by Request)', 'Premium cut with your preferred stylist', 'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&q=80'),
  ('Gentleman''s Cut + 30 Min Full Back Massage', 'Relaxing combination of cut and massage', 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80'),
  ('Gentleman''s Cut + Bekam Kering', 'Traditional therapy with modern styling', 'https://images.unsplash.com/photo-1593702295094-ac9a262f7c36?auto=format&fit=crop&q=80'),
  ('Gentleman''s Cut + Ear Candle', 'Therapeutic ear treatment with styling', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80'),
  ('Gentleman''s Cut (Long Trim)', 'Specialized long hair trimming', 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80'),
  ('Perm + Gentleman''s Cut', 'Classic perm with precision cut', 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80'),
  ('Korean Perm + Gentleman''s Cut', 'K-style perm treatment', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80'),
  ('Down Perm', 'Subtle, natural-looking waves', 'https://images.unsplash.com/photo-1634302086738-b13113181ccd?auto=format&fit=crop&q=80'),
  ('Full Hair Coloring', 'Complete color transformation', 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&q=80'),
  ('Full Hair Bleach', 'Professional lightening service', 'https://images.unsplash.com/photo-1592647420148-bfcc177e2117?auto=format&fit=crop&q=80'),
  ('Highlight', 'Dimensional color accents', 'https://images.unsplash.com/photo-1580518337843-f959e992563b?auto=format&fit=crop&q=80'),
  ('Polish (Semir)', 'Quick color refresh', 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&q=80');

-- Insert location services for GEGERKALONG
WITH loc AS (SELECT id FROM locations WHERE name = 'GEGERKALONG')
INSERT INTO location_services (location_id, service_id, price, duration)
SELECT 
  loc.id,
  s.id,
  CASE s.name
    WHEN 'Gentleman''s Cut' THEN 40000
    WHEN 'Gentleman''s Cut (Capster by Request)' THEN 50000
    WHEN 'Gentleman''s Cut + 30 Min Full Back Massage' THEN 70000
    WHEN 'Gentleman''s Cut + Bekam Kering' THEN 80000
    WHEN 'Gentleman''s Cut + Ear Candle' THEN 80000
    WHEN 'Gentleman''s Cut (Long Trim)' THEN 70000
    WHEN 'Perm + Gentleman''s Cut' THEN 190000
    WHEN 'Korean Perm + Gentleman''s Cut' THEN 320000
    WHEN 'Down Perm' THEN 130000
    WHEN 'Full Hair Coloring' THEN 250000
    WHEN 'Full Hair Bleach' THEN 270000
    WHEN 'Highlight' THEN 290000
    WHEN 'Polish (Semir)' THEN 90000
  END as price,
  CASE s.name
    WHEN 'Gentleman''s Cut' THEN 45
    WHEN 'Gentleman''s Cut (Capster by Request)' THEN 45
    WHEN 'Gentleman''s Cut + 30 Min Full Back Massage' THEN 75
    WHEN 'Gentleman''s Cut + Bekam Kering' THEN 75
    WHEN 'Gentleman''s Cut + Ear Candle' THEN 75
    WHEN 'Gentleman''s Cut (Long Trim)' THEN 60
    WHEN 'Perm + Gentleman''s Cut' THEN 120
    WHEN 'Korean Perm + Gentleman''s Cut' THEN 150
    WHEN 'Down Perm' THEN 90
    WHEN 'Full Hair Coloring' THEN 120
    WHEN 'Full Hair Bleach' THEN 150
    WHEN 'Highlight' THEN 150
    WHEN 'Polish (Semir)' THEN 60
  END as duration
FROM services s, loc;