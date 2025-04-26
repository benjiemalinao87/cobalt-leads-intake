
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
    // Use the RPC function to verify credentials without triggering RLS recursion
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

// Updated secure functions to use our new manage_members RPC function
export async function createMemberSecure(memberData: {
  email: string;
  name: string;
  password: string;
  role: string;
}) {
  try {
    const { data, error } = await supabase.rpc(
      'manage_members',
      {
        p_operation: 'create',
        p_email: memberData.email,
        p_name: memberData.name,
        p_password: memberData.password,
        p_role: memberData.role
      }
    );
      
    if (error) throw error;
    return { success: true, member: data?.[0] || null };
  } catch (error) {
    console.error('Error creating member:', error);
    return { 
      success: false, 
      error: (error as { message?: string })?.message || 'Failed to create member' 
    };
  }
}

// Function to update a member securely
export async function updateMemberSecure(
  id: string, 
  updates: Partial<Omit<Member, 'id' | 'created_at' | 'updated_at'>>
) {
  try {
    const { data, error } = await supabase.rpc(
      'manage_members',
      {
        p_operation: 'update',
        p_id: id,
        p_email: updates.email,
        p_name: updates.name,
        p_password: updates.password,
        p_role: updates.role
      }
    );
      
    if (error) throw error;
    return { success: true, member: data?.[0] || null };
  } catch (error) {
    console.error('Error updating member:', error);
    return { 
      success: false, 
      error: (error as { message?: string })?.message || 'Failed to update member' 
    };
  }
}

// Function to delete a member securely
export async function deleteMemberSecure(id: string) {
  try {
    const { data, error } = await supabase.rpc(
      'manage_members',
      {
        p_operation: 'delete',
        p_id: id
      }
    );
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting member:', error);
    return { 
      success: false, 
      error: (error as { message?: string })?.message || 'Failed to delete member' 
    };
  }
}

// Function to fetch all members securely
export async function getAllMembersSecure() {
  try {
    const { data, error } = await supabase.rpc(
      'manage_members',
      {
        p_operation: 'list'
      }
    );
      
    if (error) throw error;
    return { success: true, members: data || [] };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { 
      success: false, 
      error: (error as { message?: string })?.message || 'Failed to fetch members',
      members: []
    };
  }
}
