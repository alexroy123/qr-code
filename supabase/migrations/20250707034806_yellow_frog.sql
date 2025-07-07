/*
  # Create QR Links Table

  1. New Tables
    - `qr_links`
      - `id` (uuid, primary key, auto-generated)
      - `destination_url` (text, required) - The URL that the QR code will redirect to
      - `created_at` (timestamptz, default now()) - When the QR code was created

  2. Security
    - Enable RLS on `qr_links` table
    - Add policy for public access (since no authentication is required)
    - Allow all operations (SELECT, INSERT, UPDATE, DELETE) for anonymous users
*/

-- Create the qr_links table
CREATE TABLE IF NOT EXISTS qr_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE qr_links ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no authentication required)
CREATE POLICY "Allow public access to qr_links"
  ON qr_links
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users as well (in case someone signs in)
CREATE POLICY "Allow authenticated access to qr_links"
  ON qr_links
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create an index on created_at for better performance when ordering
CREATE INDEX IF NOT EXISTS idx_qr_links_created_at ON qr_links(created_at DESC);