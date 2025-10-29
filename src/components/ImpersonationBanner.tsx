import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { usePermissions } from '../contexts/PermissionsContext';
import { impersonationUtils } from '../utils/impersonation';

export default function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser } = usePermissions();

  const handleStopImpersonation = () => {
    impersonationUtils.stopImpersonation();
    // Redirect to admin dashboard
    window.location.href = '/admin';
  };

  // Only show banner when impersonating
  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  return (
    <div className="bg-red-600 text-white py-3 px-4 text-center text-sm font-medium shadow-lg">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Je bent ingelogd als: <strong>{impersonatedUser}</strong></span>
        </div>
        <button
          onClick={handleStopImpersonation}
          className="flex items-center gap-2 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar Admin
        </button>
      </div>
    </div>
  );
}
