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
        
        // Timeout: if loading takes more than 10 seconds, force through
        if (elapsedSeconds > 10) {
          console.warn('⏱️ Account loading timeout (10s), allowing access');
          setStatusMessage('Account geladen!');
          setIsAccountReady(true);
          onAccountReady();
          return;
        }
        
        // Check in users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('first_appointment_completed, email_verified, account_approved')
          .eq('email', userEmail)
          .maybeSingle();

        if (userError) {
          if (userError.code !== 'PGRST116') {
            console.error('❌ Error fetching user data:', {
              code: userError.code,
              message: userError.message,
              status: (userError as any).status,
              details: (userError as any).details
            });
          }
        }

        // Also check in accounts table as backup
        let accountData = userData;
        let accountError = userError;
        
        if (!accountData) {
          const response = await supabase
            .from('accounts')
            .select('first_appointment_completed, email_verified, account_approved')
            .eq('email', userEmail)
            .maybeSingle();
          
          accountData = response.data;
          accountError = response.error;

          if (accountError) {
            if (accountError.code !== 'PGRST116') {
              console.error('❌ Error fetching account data:', {
                code: accountError.code,
                message: accountError.message,
                status: (accountError as any).status,
                details: (accountError as any).details
              });
            }
          }
        }

        // Use whichever has data
        const accountInfo = accountData;

        if (!accountInfo) {
          console.warn(`⚠️ No account data found for ${userEmail}`);
          // On 3rd attempt, just let it through (user might not have account data yet)
          if (checkAttempts >= 3) {
            console.log('ℹ️ No account data after 3 attempts, allowing access anyway');
            setIsAccountReady(true);
            onAccountReady();
            return;
          }
          setStatusMessage('Account data aan het synchen...');
          setCheckAttempts(prev => prev + 1);
          return;
        }

        console.log('📋 Account info:', {
          email: userEmail,
          first_appointment_completed: accountInfo.first_appointment_completed,
          email_verified: accountInfo.email_verified,
          account_approved: accountInfo.account_approved
        });

        // Check if account is fully ready
        // Account is ready when first_appointment_completed is true or truthy (not false/null/0)
        // This covers: true, 1, or any truthy value
        const isReady = Boolean(accountInfo.first_appointment_completed);
        
        if (isReady) {
          console.log('✅ Account is fully ready!');
          setStatusMessage('Account geladen!');
          setIsAccountReady(true);
          onAccountReady();
        } else {
          console.log('⏳ Account not ready yet, waiting for appointment completion');
          setStatusMessage('Wachten op appointment completion...');
          setCheckAttempts(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error checking account status:', error);
        setStatusMessage('Fout bij controleren account...');
      }
    };

    // Initial check
    checkAccountStatus();

    // Poll every 2 seconds until account is ready
    const interval = setInterval(checkAccountStatus, 2000);

    return () => clearInterval(interval);
  }, [isVisible, userEmail, isAccountReady, onAccountReady]);

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

