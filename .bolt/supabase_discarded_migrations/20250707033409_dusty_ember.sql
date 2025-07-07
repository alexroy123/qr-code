/*
# Create QR Links Table

1. New Tables
   - `qr_links`
     - `id` (uuid, primary key, auto-generated)
     - `destination_url` (text, required)
     - `created_at` (timestamp, default now)

2. Security
   - Enable RLS on `qr_links` table
   - Add permissive policy for all operations (select, insert, update)
   - No authentication required for personal use

3. Notes
   - This table stores the mapping between short QR codes and destination URLs
   - The UUID serves as the unique identifier for redirect links
*/

CREATE TABLE IF NOT EXISTS qr_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE qr_links ENABLE ROW LEVEL SECURITY;

-- Permissive policy for personal use (no authentication required)
CREATE POLICY "Allow all operations for personal use"
  ON qr_links
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);