import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle } from 'lucide-react';

interface AccountStatusLoaderProps {
  userEmail: string | undefined;
  isVisible: boolean;
  onAccountReady: () => void;
}

export default function AccountStatusLoader({
  userEmail,
  isVisible,
  onAccountReady
}: AccountStatusLoaderProps) {
  const [isAccountReady, setIsAccountReady] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Account aan het laden...');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isVisible || !userEmail || isAccountReady) return;

    const checkAccountStatus = async () => {
      try {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        
        console.log(`🔍 Checking account status for ${userEmail}... (${elapsedSeconds.toFixed(1)}s)`);
        
        // Timeout: if loading takes more than 3 seconds, force through
        // The page will handle refreshing data anyway
        if (elapsedSeconds > 3) {
          console.warn('⏱️ Account loading timeout (3s), allowing access');
          setStatusMessage('Account geladen!');
          setIsAccountReady(true);
          onAccountReady();
          return;
        }
        
        // Quick check - just verify we can reach the database
        const { data: accountInfo, error } = await supabase
          .from('accounts')
          .select('first_appointment_completed')
          .eq('email', userEmail)
          .maybeSingle();

        if (error) {
          console.error('❌ Error checking account:', error.message);
          // If we get an error, just allow through after 1 attempt
          setIsAccountReady(true);
          onAccountReady();
          return;
        }

        if (accountInfo) {
          console.log(`✅ Account found, first_appointment_completed: ${accountInfo.first_appointment_completed}`);
          setIsAccountReady(true);
          onAccountReady();
          return;
        }

        console.log('⏳ Retry checking account...');
        setCheckAttempts(prev => prev + 1);
      } catch (error) {
        console.error('Error checking account status:', error);
        // On any error, just allow through
        setIsAccountReady(true);
        onAccountReady();
      }
    };

    // Initial check
    checkAccountStatus();

    // Poll every 1 second until account is ready (max 3 seconds)
    const interval = setInterval(checkAccountStatus, 1000);

    return () => clearInterval(interval);
  }, [isVisible, userEmail, isAccountReady, onAccountReady, checkAttempts]);

  if (!isVisible || isAccountReady) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl p-12 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center">
          {/* Loading Animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Account Aan Het Laden
          </h3>

          {/* Status Message */}
          <p className="text-gray-600 text-center mb-4">
            {statusMessage}
          </p>

          {/* Progress Info */}
          <div className="text-sm text-gray-500 text-center">
            <p>We controleren of je account volledig is geopend...</p>
            <p className="mt-2 text-xs">
              {userEmail && <span>📧 {userEmail}</span>}
            </p>
          </div>

          {/* Check Attempts Counter */}
          {checkAttempts > 5 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⏱️ Account aan het synchen... Dit kan even duren.
            </div>
          )}

          {/* Subtle Animation Dots */}
          <div className="flex gap-2 mt-6">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

