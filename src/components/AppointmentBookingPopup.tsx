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
  accountApproved?: boolean;
  firstAppointmentCompleted?: boolean;
}

export default function AppointmentBookingPopup({ isOpen, onClose, onSuccess, accountApproved = false, firstAppointmentCompleted = false }: AppointmentBookingPopupProps) {
  const { user } = useSupabaseAuth();
  const { isImpersonating, impersonatedUser } = usePermissions();
  
  // Get the effective user email (impersonated user if impersonating, otherwise real user)
  const effectiveUserEmail = isImpersonating && impersonatedUser ? impersonatedUser : user?.email;
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [exactSlotStatus, setExactSlotStatus] = useState<Map<string, string>>(new Map());
  const [viewWeekStart, setViewWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1) - day);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [hasExistingAppointment, setHasExistingAppointment] = useState(false);
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
    if (isOpen && effectiveUserEmail) {
      setLoading(true);
      Promise.all([loadAvailableSlots(), loadBookedSlots(), checkExistingAppointment()]).finally(() => setLoading(false));
    } else if (isOpen && !effectiveUserEmail) {
      // If popup is open but no user email, show error
      setErrorPopup({
        isOpen: true,
        message: 'Je bent niet ingelogd. Log eerst in om een afspraak te maken.',
        details: []
      });
    }
  }, [isOpen, effectiveUserEmail]);

  const checkExistingAppointment = async () => {
    if (!effectiveUserEmail) return;
    try {
      const { data } = await supabase
        .from('appointments')
        .select('id, status')
        .eq('user_email', effectiveUserEmail)
        .in('status', ['pending', 'confirmed'])
        .limit(1);
      
      setHasExistingAppointment(!!data && data.length > 0);
    } catch (error) {
      console.error('Error checking existing appointment:', error);
    }
  };

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
        .select('date, start_time, end_time, status')
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;

      // Create set of blocked slots
      // Rule: Minimum 30 minutes between start of appointments
      const blocked = new Set<string>();
      const statusByExactSlot = new Map<string, string>();
      (data || []).forEach((apt: any) => {
        // Parse start time
        const [startHours, startMinutes] = apt.start_time.split(':').map(Number);
        const startTimeMinutes = startHours * 60 + startMinutes;

        // Block the actual appointment slot
        const startKey = `${apt.date}_${apt.start_time}`;
        blocked.add(startKey);
        statusByExactSlot.set(startKey, apt.status);

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
      setExactSlotStatus(statusByExactSlot);
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

      // Determine status: if account is approved and not first appointment, confirm directly
      // Otherwise, first appointment needs admin approval
      const isFirstAppointment = !firstAppointmentCompleted && !hasExistingAppointment;
      const appointmentStatus = (accountApproved && !isFirstAppointment) ? 'confirmed' : 'pending';

      const appointmentData = {
        user_email: effectiveUserEmail,
        user_name: userName,
        slot_id: slot.id,
        date: slot.date,
        start_time: slot.start_time,
        end_time: endTimeStr,
        duration_minutes: slot.duration_minutes,
        status: appointmentStatus,
        notes: notes.trim() || null,
        confirmed_at: appointmentStatus === 'confirmed' ? new Date().toISOString() : null,
      };

      console.log('💾 Inserting appointment:', appointmentData);
      
      // Debug: Check current session
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUserEmail = sessionData?.session?.user?.email;
      const isAdminSession = sessionUserEmail === 'admin@bitbeheer.nl';
      
      console.log('🔐 Current session:', {
        sessionUserEmail,
        isAdminSession,
        isImpersonating,
        impersonatedUser,
        effectiveUserEmail
      });

      let data, error;

      // If impersonating, ALWAYS use Edge Function to create appointment
      // This allows admin to create appointments for the impersonated user
      // The Edge Function uses service role to bypass RLS
      // We only need impersonating + impersonatedUser (session check is not critical)
      const shouldUseEdgeFunction = isImpersonating && !!impersonatedUser;
      
      console.log('🔍 Decision check for Edge Function:', {
        isImpersonating,
        isAdminSession,
        impersonatedUser,
        effectiveUserEmail,
        shouldUseEdgeFunction
      });
      
      if (shouldUseEdgeFunction) {
        console.log('🎭 Admin impersonating - using Edge Function to create appointment...');
        console.log('🎭 Impersonated user:', impersonatedUser);
        console.log('🎭 Appointment will be created for:', impersonatedUser);
        
        try {
          // Use admin email from session, or fallback to checking if user is admin
          const adminEmailToUse = sessionUserEmail === 'admin@bitbeheer.nl' 
            ? sessionUserEmail 
            : user?.email === 'admin@bitbeheer.nl' 
              ? user.email 
              : 'admin@bitbeheer.nl'; // Fallback
          
          console.log('📤 Calling Edge Function with:', {
            appointmentData,
            adminEmail: adminEmailToUse,
            impersonatedUserEmail: impersonatedUser || effectiveUserEmail,
            sessionUserEmail,
            userEmail: user?.email
          });

          const { data: functionData, error: functionError } = await supabase.functions.invoke('create-appointment', {
            body: {
              appointmentData,
              adminEmail: adminEmailToUse,
              impersonatedUserEmail: impersonatedUser || effectiveUserEmail
            }
          });

          console.log('📥 Edge Function response:', {
            functionData,
            functionError,
            'functionData type': typeof functionData,
            'functionData keys': functionData ? Object.keys(functionData) : 'null'
          });

          if (functionError) {
            error = functionError;
            console.error('❌ Edge Function invoke error:', {
              error,
              message: functionError?.message,
              details: functionError
            });
          } else if (functionData?.error) {
            error = { 
              message: functionData.error, 
              code: functionData.code || 'FUNCTION_ERROR',
              details: functionData.details,
              hint: functionData.hint
            };
            console.error('❌ Edge Function returned error:', {
              error: functionData.error,
              code: functionData.code,
              details: functionData.details,
              hint: functionData.hint
            });
          } else if (functionData?.success === true && functionData?.data) {
            // Edge Function returns { success: true, data: ... }
            data = Array.isArray(functionData.data) ? functionData.data : [functionData.data];
            console.log('✅ Appointment created via Edge Function:', data);
          } else if (functionData?.data && !functionData?.error) {
            // Fallback: if data is directly in response without error
            data = Array.isArray(functionData.data) ? functionData.data : [functionData.data];
            console.log('✅ Appointment created via Edge Function (fallback):', data);
          } else {
            // No data but no error - log for debugging
            console.warn('⚠️ Edge Function returned unexpected response:', {
              functionData,
              hasSuccess: !!functionData?.success,
              hasData: !!functionData?.data,
              hasError: !!functionData?.error
            });
            error = {
              message: 'Edge Function returned success but no appointment data',
              code: 'FUNCTION_ERROR',
              response: functionData
            };
          }
        } catch (functionErr: any) {
          error = {
            message: functionErr.message || 'Edge Function call failed',
            code: 'FUNCTION_ERROR',
            originalError: functionErr
          };
          console.error('❌ Failed to call Edge Function:', functionErr);
        }
      } else {
        // Normal insert (for regular users or admin when not impersonating)
        console.log('👤 Normal appointment creation (no impersonation)...');
        const result = await supabase
          .from('appointments')
          .insert([appointmentData])
          .select();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('❌ Appointment creation error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          isImpersonating,
          impersonatedUser,
          usedEdgeFunction: shouldUseEdgeFunction,
          sessionUserEmail,
          effectiveUserEmail
        });
        
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
        
        // More helpful error message based on the issue
        if (isImpersonating && !isAdminFromSession) {
          errorDetails = [
            `⚠️ Probleem: Impersonation actief maar Supabase session is geen admin`,
            `Session email: ${sessionEmail || 'onbekend'}`,
            `Vereist: admin@bitbeheer.nl in Supabase session`,
            `Effectieve gebruiker: ${effectiveUserEmail || 'geen'}`,
            `🔧 Oplossing: Log uit en opnieuw in als admin@bitbeheer.nl`,
            `🔧 Daarna: Gebruik "Inloggen als" functie voor impersonation`
          ];
        } else {
          errorDetails = [
            `Session email: ${sessionEmail || 'onbekend'}`,
            `Impersonation actief: ${isImpersonating ? 'Ja' : 'Nee'}`,
            `Effectieve gebruiker: ${effectiveUserEmail || 'geen'}`,
            `Admin in session: ${isAdminFromSession ? 'Ja' : 'Nee'}`,
            `RLS Policy verwacht: admin@bitbeheer.nl in JWT`,
            `Voer het fix-appointments-rls.sql script uit in Supabase`
          ];
        }
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

  // If there's already a pending or confirmed appointment and account is not approved, don't allow booking
  if (!isOpen) return null;
  
  // Show message if already has appointment and not approved (but only after loading is complete)
  if (!loading && hasExistingAppointment && !accountApproved && !firstAppointmentCompleted) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Eerste afspraak in afwachting
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Je hebt al een 20-minuten gesprek ingepland. Deze moet eerst door de admin worden goedgekeurd voordat je een nieuwe afspraak kunt maken.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              {/* Date + Time Selection: 2 weeks, every day, click a slot to select it */}
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selecteer een datum en tijd
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 14); return n; })}
                      className="flex items-center gap-1 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 transition-colors"
                    >
                      Vorige
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 14); return n; })}
                      className="flex items-center gap-1 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 transition-colors"
                    >
                      Volgende
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-50 border-[1.5px] border-blue-300 inline-block" /> Beschikbaar</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-50 border-[1.5px] border-green-300 inline-block" /> Afspraak bevestigd</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-50 border-[1.5px] border-orange-300 inline-block" /> Aanvraag in afwachting</span>
                </div>

                <div className="space-y-5">
                  {(() => {
                    const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
                    const toLocalDateStr = (d: Date) =>
                      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                    const todayWeekStart = (() => {
                      const d = new Date();
                      const day = d.getDay();
                      d.setDate(d.getDate() + (day === 0 ? -6 : 1) - day);
                      d.setHours(0, 0, 0, 0);
                      return d;
                    })();

                    return [0, 1].map((weekIndex) => {
                      const weekStart = new Date(viewWeekStart);
                      weekStart.setDate(weekStart.getDate() + weekIndex * 7);
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekEnd.getDate() + 6);
                      const isCurrentWeek = weekStart.getTime() === todayWeekStart.getTime();

                      const days = Array.from({ length: 7 }, (_, i) => {
                        const d = new Date(weekStart);
                        d.setDate(d.getDate() + i);
                        return d;
                      });

                      return (
                        <div key={weekIndex}>
                          <div className="flex items-baseline gap-2 mb-2">
                            {isCurrentWeek ? (
                              <span className="text-[10px] font-bold uppercase tracking-wide bg-orange-600 text-white px-2 py-0.5 rounded-full">Deze week</span>
                            ) : (
                              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Volgende week</span>
                            )}
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {weekStart.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} – {weekEnd.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="grid grid-cols-7 gap-1.5">
                            {days.map((dateObj) => {
                              const dateStr = toLocalDateStr(dateObj);
                              const slotsForDate = getSlotsForDate(dateStr).sort((a, b) => a.start_time.localeCompare(b.start_time));
                              const hasSlots = slotsForDate.length > 0;

                              return (
                                <div
                                  key={dateStr}
                                  className={`rounded-lg border p-1.5 min-h-[76px] border-gray-200 dark:border-gray-700 ${
                                    hasSlots ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/30'
                                  }`}
                                >
                                  <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                                    {dayNames[dateObj.getDay()]} <span className="font-normal text-gray-400 dark:text-gray-600">{dateObj.getDate()}</span>
                                  </div>
                                  {hasSlots ? (
                                    <div className="flex flex-col gap-1">
                                      {slotsForDate.map((slot) => {
                                        const exactKey = `${slot.date}_${slot.start_time}`;
                                        const status = exactSlotStatus.get(exactKey);
                                        const isBlocked = isSlotBlocked(slot);
                                        const isSelected = selectedSlot === slot.id;
                                        const isClickable = !isBlocked;

                                        let colorClasses: string;
                                        if (status === 'confirmed') {
                                          colorClasses = 'border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 cursor-not-allowed';
                                        } else if (status === 'pending') {
                                          colorClasses = 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 cursor-not-allowed';
                                        } else if (isBlocked) {
                                          colorClasses = 'border-gray-200 bg-gray-100 text-gray-400 dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed';
                                        } else if (isSelected) {
                                          colorClasses = 'border-orange-500 bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200';
                                        } else {
                                          colorClasses = 'border-blue-300 bg-blue-50 text-blue-700 hover:border-orange-400 hover:bg-orange-50 dark:bg-blue-900/20 dark:text-blue-300';
                                        }

                                        return (
                                          <button
                                            key={slot.id}
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (isClickable) {
                                                handleDateSelect(slot.date);
                                                handleSlotSelect(slot.id);
                                              }
                                            }}
                                            disabled={!isClickable}
                                            className={`px-1 py-0.5 rounded text-[11px] font-semibold border-[1.5px] transition-colors ${colorClasses}`}
                                          >
                                            {slot.start_time.slice(0, 5)}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-[11px] text-gray-300 dark:text-gray-600">—</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

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
            disabled={submitting || !selectedSlot || !effectiveUserEmail || (!accountApproved && hasExistingAppointment && !firstAppointmentCompleted)}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              (!accountApproved && hasExistingAppointment && !firstAppointmentCompleted)
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            title={
              (!accountApproved && hasExistingAppointment && !firstAppointmentCompleted)
                ? 'Je eerste afspraak moet eerst door de admin worden goedgekeurd voordat je een nieuwe afspraak kunt maken.'
                : !effectiveUserEmail 
                ? 'Je bent niet ingelogd' 
                : !selectedSlot 
                ? 'Selecteer eerst een tijd' 
                : submitting 
                ? 'Bezig met boeken...' 
                : ''
            }
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

