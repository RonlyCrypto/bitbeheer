import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { usePermissions } from '../contexts/PermissionsContext';
import { impersonationUtils } from '../utils/impersonation';
import { getDisplayName } from '../utils/emailUtils';

export default function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);

  const handleStopImpersonation = async () => {
    setIsLoading(true);
    
    try {
      // Stopping impersonation (silent)
      await impersonationUtils.stopImpersonation();
      
      // Impersonation stopped (silent)
      
      // Small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Redirect to admin
      window.location.href = '/admin';
      
      // Note: Loading state will remain until page unloads
    } catch (error) {
      console.error('❌ Error stopping impersonation:', error);
      
      // Force redirect even if there's an error
      window.location.href = '/admin';
    }
  };

  // Only show banner when impersonating
  if (!isImpersonating || !impersonatedUser) {
    // Not showing banner (silent)
    return null;
  }

  // Rendering banner (no email in logs)

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
            <p className="text-gray-800 font-medium text-lg">Overschakelen naar Admin...</p>
            <p className="text-gray-600 text-sm">Even geduld alstublieft</p>
          </div>
        </div>
      )}
      
      <div className="bg-red-600 text-white py-3 px-4 text-center text-sm font-medium shadow-lg">
        <div className="container mx-auto flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Je bent ingelogd als: <strong>{getDisplayName(null, true, impersonatedUser, null)}</strong></span>
          </div>
          <button
            onClick={handleStopImpersonation}
            disabled={isLoading}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Laden...
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                Terug naar Admin
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
