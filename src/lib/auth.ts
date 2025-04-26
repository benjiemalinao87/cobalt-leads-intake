
import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// Create a separate Supabase client with the service role key for admin operations
// This client bypasses RLS
const supabaseUrl = 'https://xpwdtjmtaqzrjyeazszz.supabase.co';
// Note: In production, this should be stored securely and not in client-side code
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwd2R0am10YXF6cmp5ZWF6c3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NjkzMDMsImV4cCI6MjA2MTA0NTMwM30.6hWvRv0li-0HTI1KcknfD3ZvGIvjJtcTtsqBQA8eIkc';
const adminClient = createClient(supabaseUrl, serviceRoleKey);

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
    // Use raw SQL query to directly verify credentials without triggering RLS policies
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
  // This is a simple implementation that doesn't use React hooks
  // For a real app, you should use React Context or a state management library
  const member = getCurrentMember();
  
  return {
    member,
    isLoading: false,
    error: null
  };
}
