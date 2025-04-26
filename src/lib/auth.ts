
import { supabase } from '@/integrations/supabase/client';

export interface Member {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  member: Member | null;
  isLoading: boolean;
  error: string | null;
}

export async function login(email: string, password: string) {
  try {
    // Use the newly created RPC function to verify credentials
    const { data: members, error: queryError } = await supabase.rpc(
      'get_member_by_credentials', 
      { p_email: email, p_password: password }
    );
    
    if (queryError) {
      console.error('Login query error:', queryError);
      throw queryError;
    }
    
    if (!members || members.length === 0) {
      throw new Error('Invalid email or password');
    }
    
    const member = members[0];
    
    // Store user session in localStorage
    localStorage.setItem('member', JSON.stringify(member));
    
    return { success: true, member };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export function logout() {
  localStorage.removeItem('member');
  window.location.href = '/login';
}

export function getCurrentMember(): Member | null {
  const memberStr = localStorage.getItem('member');
  if (!memberStr) return null;
  
  try {
    return JSON.parse(memberStr) as Member;
  } catch (e) {
    console.error('Error parsing member data', e);
    return null;
  }
}

export function isAdmin(): boolean {
  const member = getCurrentMember();
  return member?.role === 'admin';
}

export function useAuth(): AuthState {
  const member = getCurrentMember();
  
  return {
    member,
    isLoading: false,
    error: null
  };
}
