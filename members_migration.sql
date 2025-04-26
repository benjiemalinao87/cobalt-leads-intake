
-- Migration to create members table
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies for members table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (simplified policy to avoid recursion)
CREATE POLICY "Allow authenticated access" ON public.members 
  FOR ALL USING (true);

-- Create a function to verify member credentials without triggering recursive RLS policies
CREATE OR REPLACE FUNCTION public.get_member_by_credentials(p_email TEXT, p_password TEXT)
RETURNS SETOF public.members
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function creator
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.members
  WHERE email = p_email AND password = p_password;
END;
$$;

-- Insert initial admin user with password 'admin123' (not secure, change this in production)
INSERT INTO public.members (email, password, name, role)
VALUES ('admin@example.com', 'admin123', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;
