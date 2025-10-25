import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://otncto6lvt39cxz598rtoa.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_OtNCto6lVt39cXZ598rtoA_T3KXCjfP'

// Create Supabase client with auth
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

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

// Form submissions functions
export const createFormSubmission = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([formData])
      .select()
    
    if (error) {
      console.error('Error creating form submission:', error)
      return { data: null, error }
    }
    
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error in createFormSubmission:', error)
    return { data: null, error }
  }
}

export const getFormSubmissions = async (formType = null) => {
  try {
    let query = supabase
      .from('form_submissions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (formType) {
      query = query.eq('form_type', formType)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching form submissions:', error)
      return { data: [], error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in getFormSubmissions:', error)
    return { data: [], error }
  }
}

// Email functions
export const sendNotificationEmail = async (emailData) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'update@bitbeheer.nl',
        subject: `Nieuwe ${emailData.category} Notificatie Aanvraag - BitBeheer`,
        template: 'notification',
        data: emailData
      }
    })
    
    if (error) {
      console.error('Error sending notification email:', error)
      return { success: false, error }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in sendNotificationEmail:', error)
    return { success: false, error }
  }
}

export const sendWelcomeEmail = async (userData) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: userData.email,
        subject: 'Welkom bij BitBeheer - Je account is aangemaakt',
        template: 'welcome',
        data: userData
      }
    })
    
    if (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error)
    return { success: false, error }
  }
}

// Authentication functions
export const authenticateUser = async (email, password) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()
    
    if (error) {
      console.error('Error authenticating user:', error)
      return { data: null, error }
    }
    
    // In a real app, you'd verify the password hash here
    // For now, we'll just return the user data
    return { data, error: null }
  } catch (error) {
    console.error('Error in authenticateUser:', error)
    return { data: null, error }
  }
}

// Category functions
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching categories:', error)
      return { data: [], error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in getCategories:', error)
    return { data: [], error }
  }
}

export const createCategory = async (categoryData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
    
    if (error) {
      console.error('Error creating category:', error)
      return { data: null, error }
    }
    
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error in createCategory:', error)
    return { data: null, error }
  }
}

export const updateCategory = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error updating category:', error)
      return { data: null, error }
    }
    
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error in updateCategory:', error)
    return { data: null, error }
  }
}

export const deleteCategory = async (id) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting category:', error)
      return { error }
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error in deleteCategory:', error)
    return { error }
  }
}

// Supabase Auth functions
export const signUpUser = async (email, password, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) {
      console.error('Sign up error:', error)
      return { success: false, error: error.message }
    }
    
    // Also save user data to users table for admin dashboard
    if (data.user) {
      try {
        const userRecord = {
          id: data.user.id,
          email: email.toLowerCase().trim(),
          name: userData.name || email.split('@')[0],
          message: 'Account aangemeld via registratie formulier',
          category: 'account_aanmelden',
          date: new Date().toLocaleString('nl-NL'),
          timestamp: new Date().toISOString(),
          emailSent: false,
          isAdmin: false,
          isTest: false,
          registrationDate: new Date().toISOString().split('T')[0]
        }
        
        const { error: userError } = await supabase
          .from('users')
          .insert([userRecord])
        
        if (userError) {
          console.error('Error saving user to users table:', userError)
          // Don't fail the signup if this fails
        }
      } catch (userError) {
        console.error('Error saving user data:', userError)
        // Don't fail the signup if this fails
      }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: error.message }
  }
}

export const signInUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: error.message }
  }
}

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: error.message }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Get user error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, user }
  } catch (error) {
    console.error('Get user error:', error)
    return { success: false, error: error.message }
  }
}

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) {
      console.error('Reset password error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error)
    return { success: false, error: error.message }
  }
}

export const updateUserProfile = async (updates) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    })
    
    if (error) {
      console.error('Update profile error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Update profile error:', error)
    return { success: false, error: error.message }
  }
}

// Admin functions
export const getAdminStats = async () => {
  try {
    const [usersResult, accountsResult, submissionsResult] = await Promise.all([
      getUsers(),
      getAccounts(),
      getFormSubmissions()
    ])
    
    return {
      users: usersResult.data.length,
      accounts: accountsResult.data.length,
      submissions: submissionsResult.data.length,
      recentSubmissions: submissionsResult.data.slice(0, 5)
    }
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return { users: 0, accounts: 0, submissions: 0, recentSubmissions: [] }
  }
}
