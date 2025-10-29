import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfilePopupContextType {
  isOpen: boolean;
  openProfilePopup: () => void;
  closeProfilePopup: () => void;
}

const ProfilePopupContext = createContext<ProfilePopupContextType | undefined>(undefined);

export function ProfilePopupProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openProfilePopup = () => {
    console.log('🎭 ProfilePopupContext - Opening profile popup');
    setIsOpen(true);
  };

  const closeProfilePopup = () => {
    console.log('🎭 ProfilePopupContext - Closing profile popup');
    setIsOpen(false);
  };

  return (
    <ProfilePopupContext.Provider value={{ isOpen, openProfilePopup, closeProfilePopup }}>
      {children}
    </ProfilePopupContext.Provider>
  );
}

export function useProfilePopup() {
  const context = useContext(ProfilePopupContext);
  if (context === undefined) {
    throw new Error('useProfilePopup must be used within a ProfilePopupProvider');
  }
  return context;
}
