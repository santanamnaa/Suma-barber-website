/*
  # Update Service Durations

  1. Changes
    - Update durations for hairstyling services to 120 minutes
    - Update durations for coloring services to 180 minutes
    - Update durations for haircut services to 60 minutes

  2. Notes
    - Non-destructive updates to existing services
    - Maintains data integrity
*/

-- Update Haircut Services (60 minutes)
UPDATE location_services ls
SET duration = 60
FROM services s
WHERE ls.service_id = s.id
AND s.name IN (
  'Gentleman''s Cut',
  'Gentleman''s Cut (Capster by Request)',
  'Gentleman''s Cut (Long Trim)'
);

-- Update Hairstyling Services (120 minutes)
UPDATE location_services ls
SET duration = 120
FROM services s
WHERE ls.service_id = s.id
AND s.name IN (
  'Perm + Gentleman''s Cut',
  'Down Perm'
);

-- Update Korean Perm (Special case - 120 minutes)
UPDATE location_services ls
SET duration = 120
FROM services s
WHERE ls.service_id = s.id
AND s.name = 'Korean Perm + Gentleman''s Cut';

-- Update Coloring Services (180 minutes)
UPDATE location_services ls
SET duration = 180
FROM services s
WHERE ls.service_id = s.id
AND s.name IN (
  'Full Hair Coloring',
  'Full Hair Bleach',
  'Highlight',
  'Polish (Semir)'
);

-- Update Combination Services
UPDATE location_services ls
SET duration = 90
FROM services s
WHERE ls.service_id = s.id
AND s.name IN (
  'Gentleman''s Cut + 30 Min Full Back Massage',
  'Gentleman''s Cut + Bekam Kering',
  'Gentleman''s Cut + Ear Candle'
);