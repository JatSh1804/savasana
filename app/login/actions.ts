'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  // Get form data
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validate inputs
  if (!data.email || !data.password) {
    return { error: 'Email and password are required' };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      console.log('Authentication error:', error.message)
      // Return the error instead of redirecting
      return { error: error.message };
    }

    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    console.error('Unexpected error during login:', error)
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  // Get form data
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validate inputs
  if (!data.email || !data.password) {
    return { error: 'Email and password are required' };
  }

  try {
    const { error } = await supabase.auth.signUp(data)

    if (error) {
      console.log('Signup error:', error.message)
      // Return the error instead of redirecting
      return { error: error.message };
    }

    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    console.error('Unexpected error during signup:', error)
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}