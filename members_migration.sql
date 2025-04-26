
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

-- Allow authenticated users to read members
CREATE POLICY "Allow authenticated reads" ON public.members 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admin to perform all operations
CREATE POLICY "Allow admin full access" ON public.members 
  USING (auth.email() IN (SELECT email FROM public.members WHERE role = 'admin'))
  WITH CHECK (auth.email() IN (SELECT email FROM public.members WHERE role = 'admin'));

-- Insert initial admin user with password 'admin123' (not secure, change this in production)
INSERT INTO public.members (email, password, name, role)
VALUES ('admin@example.com', 'admin123', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;
