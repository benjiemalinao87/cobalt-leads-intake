
import { supabase } from './supabase';

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
    // First check if the user exists in our members table
    const { data: members, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle();
    
    if (memberError) throw memberError;
    if (!members) throw new Error('Invalid email or password');
    
    // For a real app, you should use Supabase Auth instead of storing passwords in your table
    // This is a simplified version for demo purposes
    
    // Store user session in localStorage
    localStorage.setItem('member', JSON.stringify(members));
    
    return { success: true, member: members };
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
  // This is a simple implementation that doesn't use React hooks
  // For a real app, you should use React Context or a state management library
  const member = getCurrentMember();
  
  return {
    member,
    isLoading: false,
    error: null
  };
}
