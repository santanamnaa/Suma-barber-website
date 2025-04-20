-- /*
--   # Add duration column to bookings table

--   1. Changes
--     - Add `duration` column to `bookings` table
--     - Make duration a required field
--     - Add check constraint to ensure duration is positive

--   2. Notes
--     - Duration is stored in minutes
--     - Non-destructive migration that adds new column
-- */

-- DO $$ 
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM information_schema.columns 
--     WHERE table_name = 'bookings' AND column_name = 'duration'
--   ) THEN
--     ALTER TABLE bookings 
--     ADD COLUMN duration integer NOT NULL DEFAULT 30;

--     ALTER TABLE bookings
--     ADD CONSTRAINT duration_positive CHECK (duration > 0);
--   END IF;
-- END $$;