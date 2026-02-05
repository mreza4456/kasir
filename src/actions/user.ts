'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'

export type User = {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'kasir'
  created_at: string
  updated_at: string
  auth_user_id: string
}

export type ActionResult = {
  success: boolean
  message?: string
  data?: any
}

// Login action
export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      success: false,
      message: 'Email dan password harus diisi'
    }
  }

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return {
      success: false,
      message: authError.message
    }
  }

  if (!authData.user) {
    return {
      success: false,
      message: 'Gagal login'
    }
  }

  // Get user profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authData.user.id)
    .single()

  if (profileError) {
    return {
      success: false,
      message: 'Gagal mengambil data user'
    }
  }

  // Redirect based on role
  if (profile.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/')
  }
}

// Logout action
export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// Get all users (admin only)
export async function getAllUsers(): Promise<ActionResult> {
  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized'
    }
  }

  const { data: currentUser } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (currentUser?.role !== 'admin') {
    return {
      success: false,
      message: 'Hanya admin yang dapat mengakses data ini'
    }
  }

  // Fetch all users
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return {
      success: false,
      message: error.message
    }
  }

  return {
    success: true,
    data: data
  }
}

// Get current user
export async function getCurrentUser(): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      success: false,
      message: 'Not authenticated'
    }
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (error) {
    return {
      success: false,
      message: error.message
    }
  }

  return {
    success: true,
    data: profile
  }
}

// Create new user (admin only)
export async function createUser(formData: FormData): Promise<ActionResult> {

  // 🔐 client anon (cek login + role)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Unauthorized' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (currentUser?.role !== 'admin') {
    return {
      success: false,
      message: 'Hanya admin yang dapat menambah user'
    }
  }

  // 📥 ambil data form
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as 'admin' | 'kasir'

  if (!email || !password || !full_name || !role) {
    return {
      success: false,
      message: 'Semua field harus diisi'
    }
  }

  // 🚀 CREATE AUTH USER (SERVICE ROLE)
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
      },
    })

  if (authError) {
    return {
      success: false,
      message: authError.message
    }
  }

  revalidatePath('/admin')

  return {
    success: true,
    message: 'User berhasil ditambahkan',
    data: authData.user
  }
}
// Update user role and name (admin only)
export async function updateUser(userId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized'
    }
  }

  const { data: currentUser } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (currentUser?.role !== 'admin') {
    return {
      success: false,
      message: 'Hanya admin yang dapat mengupdate user'
    }
  }

  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as 'admin' | 'kasir'

  if (!full_name || !role) {
    return {
      success: false,
      message: 'Semua field harus diisi'
    }
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      full_name,
      role
    })
    .eq('id', userId)

  if (error) {
    return {
      success: false,
      message: error.message
    }
  }

  revalidatePath('/admin')

  return {
    success: true,
    message: 'User berhasil diupdate'
  }
}

// Delete user (admin only)
export async function deleteUser(userId: string, authUserId: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      success: false,
      message: 'Unauthorized'
    }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role, id')
    .eq('auth_user_id', user.id)
    .single()

  if (currentUser?.role !== 'admin') {
    return {
      success: false,
      message: 'Hanya admin yang dapat menghapus user'
    }
  }

  // Prevent deleting self
  if (currentUser.id === userId) {
    return {
      success: false,
      message: 'Tidak dapat menghapus akun sendiri'
    }
  }

  // Delete from auth (this will cascade to users table)
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(authUserId)

  if (authError) {
    return {
      success: false,
      message: authError.message
    }
  }

  revalidatePath('/admin')

  return {
    success: true,
    message: 'User berhasil dihapus'
  }
}