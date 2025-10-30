import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import ErrorPopup from './ErrorPopup';

interface AvailableSlot {
  id: string;
  date: string;
  start_time: string;
  duration_minutes: number;
}

interface AppointmentBookingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AppointmentBookingPopup({ isOpen, onClose, onSuccess }: AppointmentBookingPopupProps) {
  const { user } = useSupabaseAuth();
  const { isImpersonating, impersonatedUser } = usePermissions();
  
  // Get the effective user email (impersonated user if impersonating, otherwise real user)
  const effectiveUserEmail = isImpersonating && impersonatedUser ? impersonatedUser : user?.email;
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [errorPopup, setErrorPopup] = useState<{ isOpen: boolean; message: string; details?: string[] }>({
    isOpen: false,
    message: '',
    details: []
  });

  // Debug: Log when user changes
  useEffect(() => {
    console.log('👤 User state changed:', { 
      hasUser: !!user, 
      email: user?.email,
      userMetadata: user?.user_metadata,
      isImpersonating,
      impersonatedUser,
      effectiveUserEmail
    });
  }, [user, isImpersonating, impersonatedUser, effectiveUserEmail]);

  // Debug: Log when selectedSlot changes
  useEffect(() => {
    console.log('📌 SelectedSlot changed:', selectedSlot);
  }, [selectedSlot]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([loadAvailableSlots(), loadBookedSlots()]).finally(() => setLoading(false));
    }
  }, [isOpen]);

  const loadAvailableSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('available_slots')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      setErrorPopup({
        isOpen: true,
        message: 'Fout bij het laden van beschikbare tijden',
        details: [
          'Controleer je internetverbinding',
          'Refresh de pagina en probeer het opnieuw'
        ]
      });
    }
  };

  const loadBookedSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('date, start_time, end_time')
        .in('status', ['pending', 'confirmed']);
      
      if (error) throw error;
      
      // Create set of blocked slots
      // Rule: Minimum 30 minutes between start of appointments
      const blocked = new Set<string>();
      (data || []).forEach((apt: any) => {
        // Parse start time
        const [startHours, startMinutes] = apt.start_time.split(':').map(Number);
        const startTimeMinutes = startHours * 60 + startMinutes;
        
        // Block the actual appointment slot
        const startKey = `${apt.date}_${apt.start_time}`;
        blocked.add(startKey);
        
        // Block all times within 30 minutes after the start time
        // This ensures minimum 30 minutes between appointment starts
        for (let mins = startTimeMinutes + 1; mins < startTimeMinutes + 30; mins += 1) {
          const h = Math.floor(mins / 60) % 24;
          const m = mins % 60;
          const timeKey = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
          blocked.add(`${apt.date}_${timeKey}`);
        }
      });
      
      setBookedSlots(blocked);
    } catch (error) {
      console.error('Error loading booked slots:', error);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot('');
  };

  const handleSlotSelect = (slotId: string) => {
    console.log('🟢 Slot selected:', slotId);
    setSelectedSlot(slotId);
  };

  const handleSubmit = async () => {
    console.log('🔵 handleSubmit called', { 
      selectedSlot, 
      userEmail: user?.email,
      isImpersonating,
      impersonatedUser,
      effectiveUserEmail,
      submitting 
    });
    
    if (!selectedSlot) {
      setErrorPopup({
        isOpen: true,
        message: 'Selecteer eerst een tijd slot om door te gaan.',
        details: []
      });
      return;
    }
    
    if (!effectiveUserEmail) {
      setErrorPopup({
        isOpen: true,
        message: 'Je bent niet ingelogd. Log eerst in om een afspraak te maken.',
        details: [
          'Zorg dat je ingelogd bent voordat je een afspraak probeert te boeken',
          'Refresh de pagina als het probleem blijft bestaan'
        ]
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const slot = availableSlots.find(s => s.id === selectedSlot);
      if (!slot) {
        throw new Error('Slot niet gevonden');
      }

      console.log('📅 Booking slot:', slot);

      // Calculate end time correctly
      const [hours, minutes] = slot.start_time.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes + slot.duration_minutes, 0, 0);
      const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}:00`;

      // Get user name - if impersonating, try to get from profile, otherwise use metadata
      let userName = effectiveUserEmail.split('@')[0];
      if (isImpersonating) {
        // For impersonation, we might need to fetch the user profile
        // For now, use email username as fallback
        userName = impersonatedUser?.split('@')[0] || effectiveUserEmail.split('@')[0];
      } else if (user?.user_metadata?.name) {
        userName = user.user_metadata.name;
      } else if (user?.user_metadata?.first_name) {
        userName = user.user_metadata.first_name;
        if (user.user_metadata.last_name) {
          userName += ` ${user.user_metadata.last_name}`;
        }
      }

      const appointmentData = {
        user_email: effectiveUserEmail,
        user_name: userName,
        slot_id: slot.id,
        date: slot.date,
        start_time: slot.start_time,
        end_time: endTimeStr,
        duration_minutes: slot.duration_minutes,
        status: 'pending',
        notes: notes.trim() || null,
      };

      console.log('💾 Inserting appointment:', appointmentData);
      
      // Debug: Check current session and JWT
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const sessionUserEmail = sessionData?.session?.user?.email;
      const isAdminSession = sessionUserEmail === 'admin@bitbeheer.nl';
      
      console.log('🔐 Current session:', {
        session: sessionData?.session,
        userEmail: sessionUserEmail,
        userMetadata: sessionData?.session?.user?.user_metadata,
        isAdmin: isAdminSession,
        isImpersonating,
        impersonatedUser,
        effectiveUserEmail,
        sessionError
      });

      // IMPORTANT: If admin is impersonating, the JWT still contains admin@bitbeheer.nl
      // So the RLS policy should work. But if it doesn't, we need to check the actual session.
      console.log('🔍 RLS Check:', {
        'auth.jwt() email would be': sessionUserEmail,
        'Should pass admin policy': isAdminSession,
        'Appointment user_email': appointmentData.user_email,
        'Effective user email': effectiveUserEmail
      });

      // If admin is impersonating, we need to ensure the RLS policy recognizes admin
      // The policy checks auth.jwt() ->> 'email', which should be admin@bitbeheer.nl
      // if the session is still the admin session
      if (!isAdminSession && isImpersonating) {
        console.warn('⚠️ Warning: Admin impersonating but session email is not admin@bitbeheer.nl');
        console.warn('⚠️ This may cause RLS policy to fail');
        console.warn('⚠️ Session email:', sessionUserEmail, 'Expected: admin@bitbeheer.nl');
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();

      if (error) {
        console.error('❌ Supabase insert error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Extra debugging for RLS errors
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          const sessionUserEmail = sessionData?.session?.user?.email;
          console.error('🚨 RLS Policy Error Details:', {
            contextUserEmail: user?.email || 'null/undefined',
            sessionUserEmail: sessionUserEmail || 'null/undefined',
            isImpersonating,
            impersonatedUser,
            effectiveUserEmail,
            appointmentUserEmail: appointmentData.user_email,
            isAdminFromContext: user?.email === 'admin@bitbeheer.nl',
            isAdminFromSession: sessionUserEmail === 'admin@bitbeheer.nl',
            'Expected JWT email for RLS': sessionUserEmail,
            'Should match admin policy': sessionUserEmail === 'admin@bitbeheer.nl'
          });
        }
        
        throw error;
      }

      console.log('✅ Appointment created:', data);

      // Success - close popup and show success message
      onSuccess();
      onClose();
      setSelectedDate('');
      setSelectedSlot('');
      setNotes('');
    } catch (error: any) {
      console.error('❌ Error booking appointment:', error);
      const errorMessage = error.message || 'Onbekende fout';
      
      // Check if it's an RLS policy error
      const isRLSError = errorMessage.includes('row-level security') || errorMessage.includes('RLS') || error.code === '42501';
      
      // More specific error message for RLS errors
      let errorTitle = 'Fout bij het boeken van de afspraak';
      let errorDetails = [
        'Of je ingelogd bent',
        'Of het slot nog beschikbaar is',
        'Of je rechten hebt om afspraken te maken'
      ];
      
      if (isRLSError) {
        // Get session info for better error message
        const { data: sessionCheck } = await supabase.auth.getSession();
        const sessionEmail = sessionCheck?.session?.user?.email;
        const isAdminFromSession = sessionEmail === 'admin@bitbeheer.nl';
        
        errorTitle = 'Toegangsrechten probleem';
        errorDetails = [
          `Session email: ${sessionEmail || 'onbekend'}`,
          `Impersonation actief: ${isImpersonating ? 'Ja' : 'Nee'}`,
          `Effectieve gebruiker: ${effectiveUserEmail || 'geen'}`,
          `Admin in session: ${isAdminFromSession ? 'Ja' : 'Nee'}`,
          `RLS Policy verwacht: admin@bitbeheer.nl in JWT`,
          `Voer het fix-appointments-rls.sql script uit in Supabase om dit te fixen`
        ];
      }
      
      setErrorPopup({
        isOpen: true,
        message: `${errorTitle}: ${errorMessage}`,
        details: errorDetails
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSlotsForDate = (date: string) => {
    return availableSlots.filter(s => s.date === date);
  };

  const isSlotBlocked = (slot: AvailableSlot) => {
    // Check if this exact slot is blocked
    const key = `${slot.date}_${slot.start_time}`;
    if (bookedSlots.has(key)) return true;
    
    // Also check if any booked appointment starts within 30 minutes before this slot
    // This ensures minimum 30 minutes between appointment starts
    const [slotHours, slotMinutes] = slot.start_time.split(':').map(Number);
    const slotTimeMinutes = slotHours * 60 + slotMinutes;
    
    // Check all booked slots to see if any starts within 30 minutes before this slot
    for (const blockedKey of bookedSlots) {
      const [blockedDate, blockedTime] = blockedKey.split('_');
      if (blockedDate !== slot.date) continue;
      
      const [blockedHours, blockedMinutes] = blockedTime.split(':').map(Number);
      const blockedTimeMinutes = blockedHours * 60 + blockedMinutes;
      
      // If a booked appointment starts within 30 minutes before this slot, block it
      const timeDiff = slotTimeMinutes - blockedTimeMinutes;
      if (timeDiff > 0 && timeDiff < 30) {
        return true;
      }
    }
    
    return false;
  };

  const uniqueDates = Array.from(new Set(availableSlots.map(s => s.date))).sort();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plan je afspraak in</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kies een beschikbare datum en tijd</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Beschikbare tijden laden...</p>
            </div>
          ) : uniqueDates.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Er zijn nog geen beschikbare tijden. Neem contact op met de admin.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selecteer een datum
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {uniqueDates.map((date) => {
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString('nl-NL', { weekday: 'short' });
                    const dayNum = dateObj.getDate();
                    const month = dateObj.toLocaleDateString('nl-NL', { month: 'short' });
                    const isSelected = selectedDate === date;
                    
                    return (
                      <button
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{dayName}</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{dayNum}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{month}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Selecteer een tijd
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {getSlotsForDate(selectedDate).map((slot) => {
                      const isBlocked = isSlotBlocked(slot);
                      const isSelected = selectedSlot === slot.id;
                      
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isBlocked) {
                              console.log('🟡 Clicking slot:', slot.id, 'blocked:', isBlocked);
                              handleSlotSelect(slot.id);
                            }
                          }}
                          disabled={isBlocked}
                          className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                            isBlocked
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600'
                              : isSelected
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{slot.start_time.slice(0, 5)}</span>
                          {isBlocked && <span className="text-xs">Geblokkeerd</span>}
                        </button>
                      );
                    })}
                  </div>
                  {getSlotsForDate(selectedDate).filter(s => !isSlotBlocked(s)).length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">Geen beschikbare tijden voor deze datum</p>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedSlot && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opmerkingen (optioneel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Heb je specifieke vragen of onderwerpen die je wilt bespreken?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔴 Button clicked', { 
                selectedSlot, 
                userEmail: user?.email,
                isImpersonating,
                impersonatedUser,
                effectiveUserEmail,
                submitting 
              });
              handleSubmit();
            }}
            disabled={submitting || !selectedSlot || !effectiveUserEmail}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            title={!effectiveUserEmail ? 'Je bent niet ingelogd' : !selectedSlot ? 'Selecteer eerst een tijd' : submitting ? 'Bezig met boeken...' : ''}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Boeken...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Bevestig afspraak
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Popup */}
      <ErrorPopup
        isOpen={errorPopup.isOpen}
        onClose={() => setErrorPopup({ isOpen: false, message: '', details: [] })}
        message={errorPopup.message}
        details={errorPopup.details}
      />
    </div>
  );
}

