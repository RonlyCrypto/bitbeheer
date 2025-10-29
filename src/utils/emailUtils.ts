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

export const getDisplayName = (user: any, isImpersonating: boolean, impersonatedUser: string | null): string => {
  if (isImpersonating && impersonatedUser) {
    return impersonatedUser;
  }
  
  // Try to get full name from user metadata
  if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
    return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
  }
  
  // Try to get name from user metadata
  if (user?.user_metadata?.name) {
    return user.user_metadata.name;
  }
  
  // Fallback to email username
  if (user?.email) {
    return user.email.split('@')[0];
  }
  
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
