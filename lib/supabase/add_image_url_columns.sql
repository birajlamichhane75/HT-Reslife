-- Migration: Add image_url to announcements and events tables
-- Run this in your Supabase Dashboard -> SQL Editor (optional, but recommended for clean schema)

-- 1. Add image_url column to announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Add image_url column to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url text;

-- Note: The Supabase Storage bucket 'reslife-media' is already created and configured with public read access.

