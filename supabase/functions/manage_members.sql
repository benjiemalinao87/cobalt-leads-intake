-- This file is for reference only and should be executed in Supabase SQL Editor
-- Function to manage members with various operations
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

-- Note: This function should be executed manually in the Supabase SQL Editor
-- It allows secure access to members data with all CRUD operations 