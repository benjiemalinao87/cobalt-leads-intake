
-- This file is for reference only and should be executed in Supabase SQL Editor
-- Function to get all members without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_all_members()
RETURNS SETOF public.members
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.members ORDER BY created_at DESC;
END;
$$;

-- Note: This function should be executed manually in the Supabase SQL Editor
-- It allows secure access to members data without triggering RLS recursion
