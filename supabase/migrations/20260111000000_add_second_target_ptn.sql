-- Migration: Add Second Target PTN & Prodi
-- Created: 2026-01-11
-- Description: Allow users to set 2 target PTN (primary and secondary)

-- Add columns for second target
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS target_ptn_2 TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_prodi_2 TEXT DEFAULT '';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS profiles_target_ptn_2_idx ON public.profiles(target_ptn_2);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.target_ptn_2 IS 'Target PTN Cadangan (Secondary)';
COMMENT ON COLUMN public.profiles.target_prodi_2 IS 'Target Program Studi Cadangan (Secondary)';

-- Note: No need to backfill as these are new optional fields that default to empty string
