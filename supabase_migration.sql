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

-- Create a comprehensive manage_members function for handling all member operations
CREATE OR REPLACE FUNCTION public.manage_members(
  p_operation TEXT,
  p_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_name TEXT DEFAULT NULL,
  p_password TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL
)
RETURNS SETOF public.members
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with the privileges of the function creator
AS $$
DECLARE
  v_member members;
BEGIN
  -- List all members
  IF p_operation = 'list' THEN
    RETURN QUERY SELECT * FROM public.members ORDER BY created_at DESC;
  
  -- Create a new member
  ELSIF p_operation = 'create' THEN
    INSERT INTO public.members (email, password, name, role)
    VALUES (p_email, p_password, p_name, p_role)
    RETURNING * INTO v_member;
    
    RETURN NEXT v_member;
  
  -- Update an existing member
  ELSIF p_operation = 'update' THEN
    UPDATE public.members
    SET 
      name = COALESCE(p_name, name),
      email = COALESCE(p_email, email),
      role = COALESCE(p_role, role),
      password = CASE WHEN p_password IS NOT NULL THEN p_password ELSE password END,
      updated_at = now()
    WHERE id = p_id
    RETURNING * INTO v_member;
    
    RETURN NEXT v_member;
  
  -- Delete a member
  ELSIF p_operation = 'delete' THEN
    DELETE FROM public.members
    WHERE id = p_id
    RETURNING * INTO v_member;
    
    RETURN NEXT v_member;
  
  -- Invalid operation
  ELSE
    RAISE EXCEPTION 'Invalid operation: %', p_operation;
  END IF;
END;
$$; 