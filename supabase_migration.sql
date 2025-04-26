
-- Migration to add API fields to the leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS api_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS api_response_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS api_response_data JSONB;
-- Add new column for all form fields
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS form_data JSONB;

-- Create RLS policy to allow access to these new fields
ALTER POLICY "Allow anonymous selects" ON public.leads USING (true);
ALTER POLICY "Allow anonymous updates" ON public.leads WITH CHECK (true);
ALTER POLICY "Allow anonymous inserts" ON public.leads WITH CHECK (true); 
