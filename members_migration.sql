
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

-- Insert initial admin user with password 'admin123' (not secure, change this in production)
INSERT INTO public.members (email, password, name, role)
VALUES ('admin@example.com', 'admin123', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;
