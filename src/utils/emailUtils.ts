// Utility functions for email handling
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) {
    return email;
  }
  
  const [localPart, domain] = email.split('@');
  
  if (localPart.length <= 2) {
    return `${localPart[0]}****@${domain}`;
  }
  
  const visibleStart = localPart.substring(0, 2);
  const visibleEnd = localPart.substring(localPart.length - 1);
  const maskedMiddle = '****';
  
  return `${visibleStart}${maskedMiddle}${visibleEnd}@${domain}`;
};

export const getDisplayName = (user: any, isImpersonating: boolean, impersonatedUser: string | null, userProfile?: any): string => {
  console.log('🔍 getDisplayName - user:', user);
  console.log('🔍 getDisplayName - isImpersonating:', isImpersonating);
  console.log('🔍 getDisplayName - impersonatedUser:', impersonatedUser);
  console.log('🔍 getDisplayName - userProfile:', userProfile);
  
  if (isImpersonating && impersonatedUser) {
    // For impersonation, try to get first name from userProfile first, then user data
    if (userProfile?.first_name) {
      console.log('✅ Using userProfile.first_name for impersonation:', userProfile.first_name);
      return userProfile.first_name;
    }
    if (user?.user_metadata?.first_name) {
      console.log('✅ Using user.user_metadata.first_name for impersonation:', user.user_metadata.first_name);
      return user.user_metadata.first_name;
    }
    // Fallback to email username for impersonation
    console.log('⚠️ Using email username for impersonation:', impersonatedUser.split('@')[0]);
    return impersonatedUser.split('@')[0];
  }
  
  // Try to get first name from userProfile first
  if (userProfile?.first_name) {
    console.log('✅ Using userProfile.first_name:', userProfile.first_name);
    return userProfile.first_name;
  }
  
  // Try to get full name from user metadata
  if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
    console.log('✅ Using user.user_metadata full name:', `${user.user_metadata.first_name} ${user.user_metadata.last_name}`);
    return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
  }
  
  // Try to get first name only
  if (user?.user_metadata?.first_name) {
    console.log('✅ Using user.user_metadata.first_name:', user.user_metadata.first_name);
    return user.user_metadata.first_name;
  }
  
  // Try to get name from user metadata
  if (user?.user_metadata?.name) {
    console.log('✅ Using user.user_metadata.name:', user.user_metadata.name);
    return user.user_metadata.name;
  }
  
  // Fallback to email username
  if (user?.email) {
    console.log('⚠️ Using email username:', user.email.split('@')[0]);
    return user.email.split('@')[0];
  }
  
  console.log('⚠️ Using default Admin name');
  return 'Admin';
};

export const getDisplayEmail = (user: any, isImpersonating: boolean, impersonatedUser: string | null, isAuthenticated: boolean): string => {
  if (isImpersonating) {
    return 'Ingelogd als gebruiker';
  }
  
  if (user?.email) {
    return maskEmail(user.email);
  }
  
  return isAuthenticated ? 'Ingelogd' : 'Niet ingelogd';
};
