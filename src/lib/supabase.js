import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Database functions for users
export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching users:', error)
      return { data: [], error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in getUsers:', error)
    return { data: [], error }
  }
}

export const createUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
    
    if (error) {
      console.error('Error creating user:', error)
      return { data: null, error }
    }
    
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error in createUser:', error)
    return { data: null, error }
  }
}

export const updateUser = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error updating user:', error)
      return { data: null, error }
    }
    
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error in updateUser:', error)
    return { data: null, error }
  }
}

export const deleteUser = async (id) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting user:', error)
      return { error }
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error in deleteUser:', error)
    return { error }
  }
}

// Database functions for accounts
export const getAccounts = async () => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching accounts:', error)
      return { data: [], error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in getAccounts:', error)
    return { data: [], error }
  }
}

export const createAccount = async (accountData) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .insert([accountData])
      .select()
    
    if (error) {
      console.error('Error creating account:', error)
      return { data: null, error }
    }
    
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error in createAccount:', error)
    return { data: null, error }
  }
}

export const updateAccount = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error updating account:', error)
      return { data: null, error }
    }
    
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error in updateAccount:', error)
    return { data: null, error }
  }
}

export const deleteAccount = async (id) => {
  try {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting account:', error)
      return { error }
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error in deleteAccount:', error)
    return { error }
  }
}

// Real-time subscriptions
export const subscribeToUsers = (callback) => {
  return supabase
    .channel('users')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'users' }, 
      callback
    )
    .subscribe()
}

export const subscribeToAccounts = (callback) => {
  return supabase
    .channel('accounts')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'accounts' }, 
      callback
    )
    .subscribe()
}
