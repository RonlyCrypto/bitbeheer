import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, User, Trash2, CheckCircle, XCircle, Edit, Search, Filter, Download, Copy, RefreshCw, ChevronDown, ChevronUp, Video, AlertCircle, FileText, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TeamsLinkPopup from './TeamsLinkPopup';
import AgendaView from './AgendaView';

interface AvailableSlot {
  id: string;
  date: string;
  start_time: string;
  duration_minutes: number;
}

interface Appointment {
  id: string;
  user_email: string;
  user_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  notes?: string;
  admin_notes?: string;
  teams_link?: string;
  one_on_one_approved?: boolean;
  questions?: {
    has_bitcoin_experience: boolean | null;
    knows_hardware_wallet: boolean | null;
    has_crypto_wallet: boolean | null;
    investment_experience: string;
    monthly_investment_budget: string;
    main_goal: string;
    questions_or_concerns: string;
  };
}

type ViewMode = 'single' | 'recurring' | 'calendar';

export default function AdminAppointmentManagement() {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [showEditAppointment, setShowEditAppointment] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTeamsLinkPopup, setShowTeamsLinkPopup] = useState(false);
  const [confirmingAppointment, setConfirmingAppointment] = useState<Appointment | null>(null);
  const [displayMode, setDisplayMode] = useState<'agenda' | 'list'>('agenda');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newSlot, setNewSlot] = useState({
    date: '',
    start_time: '',
    duration_minutes: 20
  });
  const [recurringPattern, setRecurringPattern] = useState({
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    duration_minutes: 20,
    repeat_type: 'weekly', // daily, weekly, monthly
    repeat_days: [] as number[], // 0=Sunday, 1=Monday, etc.
    interval: 1 // every X weeks/days
  });

  useEffect(() => {
    console.log('🚀 AdminAppointmentManagement mounted, calling loadData()...');
    loadData();
  }, []);

  const loadData = async () => {
    console.log('🔄 loadData() called');
    setLoading(true);
    try {
      // Check current session to debug
      let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      let sessionEmail = sessionData?.session?.user?.email;
      let accessToken = sessionData?.session?.access_token;
      
      console.log('🔐 Admin loading data - Session:', {
        email: sessionEmail,
        isAdmin: sessionEmail === 'admin@bitbeheer.nl',
        hasSession: !!sessionData?.session,
        hasToken: !!accessToken,
        sessionError,
        'Full session': sessionData?.session
      });
      
      // If no Supabase Auth session, but localStorage says we're admin, try to auto-login
      if (!sessionEmail && typeof window !== 'undefined') {
        const localStorageAuth = localStorage.getItem('admin_authenticated');
        const localStorageUserType = localStorage.getItem('user_type');
        
        if (localStorageAuth === 'true' && localStorageUserType === 'admin') {
          console.log('⚠️ No Supabase Auth session, but localStorage indicates admin. Attempting auto-login...');
          
          try {
            // Try to sign in with admin credentials
            // Note: This requires the password to be known, which is not ideal
            // For now, we'll prompt the user to log in via Supabase Auth
            console.warn('⚠️ Auto-login not possible without password. User must log in via Supabase Auth.');
            alert('Je bent ingelogd via de oude methode. Log uit en opnieuw in via Supabase Auth (email + wachtwoord) om appointments te kunnen beheren.');
            setLoading(false);
            return;
          } catch (autoLoginError) {
            console.error('❌ Auto-login failed:', autoLoginError);
          }
        }
      }
      
      // If not admin session, warn
      if (sessionEmail !== 'admin@bitbeheer.nl') {
        console.error('❌ CRITICAL: Not logged in as admin!');
        console.error('❌ Session email:', sessionEmail);
        console.error('❌ Expected: admin@bitbeheer.nl');
        
        // Check if user is logged in via old method
        const localStorageAuth = localStorage.getItem('admin_authenticated');
        if (localStorageAuth === 'true') {
          alert('Je bent ingelogd via de oude methode (localStorage). Log uit en opnieuw in via Supabase Auth (gebruik de "Login" knop rechtsboven) om appointments te kunnen beheren.');
        } else {
          alert('Je bent niet ingelogd als admin. Log uit en opnieuw in als admin@bitbeheer.nl');
        }
        setLoading(false);
        return;
      }

      const { data: slots, error: slotsError } = await supabase
        .from('available_slots')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (slotsError) {
        console.error('❌ Error loading slots:', slotsError);
        throw slotsError;
      }
      setAvailableSlots(slots || []);
      console.log('✅ Loaded slots:', slots?.length || 0);

      // Load appointments - admin should be able to read all
      console.log('🔍 Attempting to load ALL appointments...');
      console.log('📋 Query: SELECT * FROM appointments ORDER BY date, start_time');
      
      // Load all appointments - no filters, just get everything
      // Try with explicit columns first
      console.log('📤 Sending query to Supabase...');
      
      let apts: any[] = [];
      let aptsError: any = null;
      
      // Try the query
      const queryResult = await supabase
        .from('appointments')
        .select('id, user_email, user_name, slot_id, date, start_time, end_time, duration_minutes, status, notes, admin_notes, one_on_one_approved, created_at, updated_at, confirmed_at')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      apts = queryResult.data || [];
      aptsError = queryResult.error;
      
      console.log('📥 Query response received:', {
        hasData: !!queryResult.data,
        dataLength: queryResult.data?.length || 0,
        isArray: Array.isArray(queryResult.data),
        error: queryResult.error,
        'Data type': typeof queryResult.data,
        'Raw response': queryResult,
        'Session email': sessionEmail
      });
      
      // If no error but also no data, RLS might be silently blocking
      if (!aptsError && (!queryResult.data || queryResult.data.length === 0)) {
        console.warn('⚠️ Query returned no data and no error - RLS might be blocking silently');
        console.warn('⚠️ This happens when RLS policies don\'t match and return empty result');
        console.warn('⚠️ Check: Is session email admin@bitbeheer.nl?', sessionEmail === 'admin@bitbeheer.nl');
      }
      
      if (aptsError) {
        console.error('❌ Query returned error:', aptsError);
        console.error('❌ Error loading appointments:', {
          error: aptsError,
          code: aptsError.code,
          message: aptsError.message,
          details: aptsError.details,
          hint: aptsError.hint,
          sessionEmail,
          'RLS Error?': aptsError.code === '42501' || aptsError.message?.includes('row-level security')
        });
        
        // If RLS error, try alternative: query with explicit admin check
        if (aptsError.code === '42501' || aptsError.message?.includes('row-level security')) {
          console.warn('⚠️ RLS blocked query. Trying alternative approach...');
          
          // Try a count query first to see if that works
          const { count: appointmentCount, error: countError } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true });
          
          console.log('📊 Appointment count query result:', { count: appointmentCount, error: countError });
          
          alert(`RLS Policy Error: ${aptsError.message}\n\nVoer fix-all-appointments-rls.sql uit in Supabase SQL Editor.\n\nCount query result: ${appointmentCount || 'failed'}`);
        }
        throw aptsError;
      }
      
      console.log('✅ Loaded appointments in admin:', {
        count: apts?.length || 0,
        hasData: !!apts,
        isArray: Array.isArray(apts),
        appointments: apts,
        sessionEmail,
        'First appointment': apts?.[0],
        'All appointment IDs': apts?.map(a => a?.id),
        'All appointment emails': apts?.map(a => a?.user_email),
        'All appointment statuses': apts?.map(a => a?.status)
      });
      
      // Ensure we have valid data
      const validAppointments = (apts || []).filter(apt => apt && apt.id);
      
      // Load questions for each appointment
      const appointmentsWithQuestions = await Promise.all(
        validAppointments.map(async (apt: Appointment) => {
          const { data: questions } = await supabase
            .from('appointment_questions')
            .select('*')
            .eq('appointment_id', apt.id)
            .single();
          
          return {
            ...apt,
            questions: questions || null
          };
        })
      );
      
      console.log('📊 Valid appointments after filter:', appointmentsWithQuestions.length);
      
      setAppointments(appointmentsWithQuestions);
      
      if (!appointmentsWithQuestions || appointmentsWithQuestions.length === 0) {
        console.warn('⚠️ No valid appointments found. Raw response:', apts);
        console.warn('⚠️ This could mean:');
        console.warn('  1. RLS policy is blocking but returning empty array (not error)');
        console.warn('  2. There are truly no appointments in the database');
        console.warn('  3. The session email does not match admin@bitbeheer.nl');
        console.warn('  Session email:', sessionEmail);
        console.warn('  Expected: admin@bitbeheer.nl');
        console.warn('  Raw data type:', typeof apts);
        console.warn('  Raw data:', apts);
        
      } else {
        console.log('🎉 Successfully loaded and set appointments:', appointmentsWithQuestions.length);
        console.log('📋 First 3 appointments:', appointmentsWithQuestions.slice(0, 3));
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      alert(`Fout bij het laden van gegevens: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    } finally {
      setLoading(false);
    }
  };

  const addAvailableSlot = async () => {
    if (!newSlot.date || !newSlot.start_time) {
      alert('Vul datum en tijd in');
      return;
    }

    try {
      const { error } = await supabase
        .from('available_slots')
        .insert([{
          date: newSlot.date,
          start_time: newSlot.start_time,
          duration_minutes: newSlot.duration_minutes
        }]);

      if (error) throw error;
      
      setNewSlot({ date: '', start_time: '', duration_minutes: 20 });
      setShowSlotForm(false);
      await loadData();
    } catch (error: any) {
      console.error('Error adding slot:', error);
      alert(`Fout bij toevoegen: ${error.message}`);
    }
  };

  const addRecurringSlots = async () => {
    if (!recurringPattern.start_date || !recurringPattern.end_date || !recurringPattern.start_time || !recurringPattern.end_time) {
      alert('Vul alle velden in');
      return;
    }

    try {
      const slotsToAdd: any[] = [];
      const startDate = new Date(recurringPattern.start_date);
      const endDate = new Date(recurringPattern.end_date);
      const startTime = parseTime(recurringPattern.start_time);
      const endTime = parseTime(recurringPattern.end_time);
      const interval = recurringPattern.interval || 1;

      let currentDate = new Date(startDate);
      const msPerDay = 1000 * 60 * 60 * 24;

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();

        // Check if this day matches the pattern. For weekly, walk day by day
        // (below) so every selected weekday gets checked, and only count a
        // week "in" the pattern every `interval` weeks from the start date.
        let shouldAdd = false;
        if (recurringPattern.repeat_type === 'daily') {
          shouldAdd = true;
        } else if (recurringPattern.repeat_type === 'weekly' && recurringPattern.repeat_days.includes(dayOfWeek)) {
          const daysSinceStart = Math.round((currentDate.getTime() - startDate.getTime()) / msPerDay);
          const weeksSinceStart = Math.floor(daysSinceStart / 7);
          shouldAdd = weeksSinceStart % interval === 0;
        } else if (recurringPattern.repeat_type === 'monthly') {
          shouldAdd = true;
        }

        if (shouldAdd) {
          // Generate slots for this day from start_time to end_time
          // IMPORTANT: Always use 30 minute intervals between slots (regardless of slot duration)
          // This ensures minimum 30 minutes between appointment starts
          let currentSlotTime = new Date(startTime);
          const endSlotTime = new Date(endTime);
          const slotDuration = recurringPattern.duration_minutes;
          const timeInterval = 30; // Always 30 minutes between slots

          while (currentSlotTime < endSlotTime) {
            const timeStr = `${String(currentSlotTime.getHours()).padStart(2, '0')}:${String(currentSlotTime.getMinutes()).padStart(2, '0')}`;
            slotsToAdd.push({
              date: currentDate.toISOString().split('T')[0],
              start_time: timeStr + ':00',
              duration_minutes: slotDuration
            });

            // Move to next slot: always 30 minutes later (not slotDuration!)
            currentSlotTime.setMinutes(currentSlotTime.getMinutes() + timeInterval);
          }
        }

        // Move to next candidate date. Weekly walks one day at a time so
        // every selected weekday within the range gets checked -- jumping
        // straight by 7*interval days (the old behavior) would only ever
        // land on the single weekday start_date itself falls on.
        if (recurringPattern.repeat_type === 'daily') {
          currentDate.setDate(currentDate.getDate() + interval);
        } else if (recurringPattern.repeat_type === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (recurringPattern.repeat_type === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + interval);
        }
      }

      if (slotsToAdd.length === 0) {
        alert('Geen slots gevonden voor dit patroon');
        return;
      }

      // Insert in batches to avoid too large requests
      const batchSize = 50;
      for (let i = 0; i < slotsToAdd.length; i += batchSize) {
        const batch = slotsToAdd.slice(i, i + batchSize);
        const { error } = await supabase
          .from('available_slots')
          .insert(batch);
        
        if (error) throw error;
      }

      alert(`${slotsToAdd.length} slots succesvol toegevoegd!`);
      setShowRecurringForm(false);
      setRecurringPattern({
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        duration_minutes: 20,
        repeat_type: 'weekly',
        repeat_days: [],
        interval: 1
      });
      await loadData();
    } catch (error: any) {
      console.error('Error adding recurring slots:', error);
      alert(`Fout bij toevoegen: ${error.message}`);
    }
  };

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes || 0, 0, 0);
    return date;
  };

  const deleteSlot = async (slotId: string) => {
    if (!confirm('Weet je zeker dat je deze beschikbare tijd wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('available_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      console.error('Error deleting slot:', error);
      alert(`Fout bij verwijderen: ${error.message}`);
    }
  };

  const deleteMultipleSlots = async (slotIds: string[]) => {
    if (!confirm(`Weet je zeker dat je ${slotIds.length} slots wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('available_slots')
        .delete()
        .in('id', slotIds);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      console.error('Error deleting slots:', error);
      alert(`Fout bij verwijderen: ${error.message}`);
    }
  };

  const updateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          date: editingAppointment.date,
          start_time: editingAppointment.start_time,
          end_time: editingAppointment.end_time,
          duration_minutes: editingAppointment.duration_minutes,
          admin_notes: editingAppointment.admin_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAppointment.id);

      if (error) throw error;
      
      setShowEditAppointment(false);
      setEditingAppointment(null);
      await loadData();
      alert('Afspraak succesvol bijgewerkt!');
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      alert(`Fout bij bijwerken: ${error.message}`);
    }
  };

  const handleConfirmWithTeamsLink = async (teamsLink: string) => {
    if (!confirmingAppointment) return;

    try {
      const updateData: any = { 
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (teamsLink) {
        updateData.teams_link = teamsLink;
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', confirmingAppointment.id);

      if (error) throw error;
      
      // Check if this is the user's first confirmed appointment
      if (confirmingAppointment.user_email) {
        const { data: allUserAppointments } = await supabase
          .from('appointments')
          .select('id')
          .eq('user_email', confirmingAppointment.user_email)
          .eq('status', 'confirmed');

        if (allUserAppointments && allUserAppointments.length === 1) {
          // This is the first confirmed appointment - mark as completed
          // Try both tables, silently fail if columns don't exist
          try {
            await supabase
              .from('users')
              .update({ 
                first_appointment_completed: true,
                updated_at: new Date().toISOString()
              })
              .eq('email', confirmingAppointment.user_email);
          } catch (e) {
            // Ignore if column doesn't exist
          }
          
          try {
            await supabase
              .from('accounts')
              .update({ 
                first_appointment_completed: true,
                updated_at: new Date().toISOString()
              })
              .eq('email', confirmingAppointment.user_email);
          } catch (e) {
            // Ignore if column doesn't exist
          }
        }
      }
      
      // TODO: Send confirmation email with teams link if provided
      
      setShowTeamsLinkPopup(false);
      setConfirmingAppointment(null);
      await loadData();
      alert('Afspraak bevestigd!' + (teamsLink ? ' Teams link toegevoegd.' : ''));
    } catch (error: any) {
      console.error('Error confirming appointment:', error);
      alert(`Fout bij bevestigen: ${error.message}`);
    }
  };

  const updateAppointmentStatus = async (aptId: string, newStatus: string) => {
    // If confirming, show teams link popup
    if (newStatus === 'confirmed') {
      const appointment = appointments.find(a => a.id === aptId);
      if (appointment) {
        setConfirmingAppointment(appointment);
        setShowTeamsLinkPopup(true);
        return;
      }
    }

    // For other status updates, proceed normally
    try {
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', aptId);

      if (error) throw error;
      await loadData();
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      alert(`Fout bij bijwerken: ${error.message}`);
    }
  };

  const toggleRepeatDay = (day: number) => {
    setRecurringPattern(prev => ({
      ...prev,
      repeat_days: prev.repeat_days.includes(day)
        ? prev.repeat_days.filter(d => d !== day)
        : [...prev.repeat_days, day]
    }));
  };

  const getFilteredAppointments = () => {
    console.log('🔍 getFilteredAppointments called:', {
      totalAppointments: appointments.length,
      appointments: appointments,
      filterStatus,
      searchQuery,
      'Appointment statuses': appointments.map(a => a.status)
    });
    
    let filtered = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
    
    console.log('📊 After status filter (pending/confirmed):', filtered.length);
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
      console.log('📊 After filterStatus filter:', filtered.length);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        (a.user_email?.toLowerCase().includes(query)) ||
        (a.user_name?.toLowerCase().includes(query)) ||
        (a.date.includes(query)) ||
        (a.notes?.toLowerCase().includes(query))
      );
      console.log('📊 After searchQuery filter:', filtered.length);
    }
    
    console.log('✅ Final filtered appointments:', filtered.length, filtered);
    return filtered;
  };

  const exportAppointments = () => {
    const csv = [
      ['Datum', 'Tijd', 'Gebruiker', 'Email', 'Status', 'Notities', 'Admin Notities'].join(','),
      ...getFilteredAppointments().map(apt => [
        apt.date,
        `${apt.start_time}-${apt.end_time}`,
        apt.user_name || '',
        apt.user_email,
        apt.status,
        (apt.notes || '').replace(/"/g, '""'),
        (apt.admin_notes || '').replace(/"/g, '""')
      ].map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afspraken-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const end = new Date();
    end.setHours(hours, minutes + durationMinutes, 0, 0);
    return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}:00`;
  };

  const getSlotAppointmentForSlot = (slot: AvailableSlot) => {
    return appointments.find(apt => 
      apt.date === slot.date && 
      apt.start_time === slot.start_time &&
      ['pending', 'confirmed'].includes(apt.status)
    );
  };

  const isSlotBooked = (slot: AvailableSlot) => {
    return appointments.some(apt => 
      apt.date === slot.date && 
      apt.start_time === slot.start_time &&
      ['pending', 'confirmed'].includes(apt.status)
    );
  };

  const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
  const fullDayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowRecurringForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Copy className="w-5 h-5" />
            Terugkerend Patroon
          </button>
          <button
            onClick={() => setShowSlotForm(!showSlotForm)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Enkele Tijd
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Single Slot Form */}
      {showSlotForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Nieuwe Beschikbare Tijd</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Datum</label>
              <input
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tijd</label>
              <input
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duur (minuten)</label>
              <select
                value={newSlot.duration_minutes}
                onChange={(e) => setNewSlot({ ...newSlot, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={20}>20 minuten</option>
                <option value={30}>30 minuten</option>
                <option value={60}>60 minuten</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={addAvailableSlot}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Toevoegen
            </button>
            <button
              onClick={() => setShowSlotForm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Recurring Pattern Form */}
      {showRecurringForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Terugkerend Patroon Toevoegen</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Van Datum</label>
                <input
                  type="date"
                  value={recurringPattern.start_date}
                  onChange={(e) => setRecurringPattern({ ...recurringPattern, start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tot Datum</label>
                <input
                  type="date"
                  value={recurringPattern.end_date}
                  onChange={(e) => setRecurringPattern({ ...recurringPattern, end_date: e.target.value })}
                  min={recurringPattern.start_date || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Van Tijd</label>
                <input
                  type="time"
                  value={recurringPattern.start_time}
                  onChange={(e) => setRecurringPattern({ ...recurringPattern, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tot Tijd</label>
                <input
                  type="time"
                  value={recurringPattern.end_time}
                  onChange={(e) => setRecurringPattern({ ...recurringPattern, end_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Herhaal Type</label>
                <select
                  value={recurringPattern.repeat_type}
                  onChange={(e) => setRecurringPattern({ ...recurringPattern, repeat_type: e.target.value, repeat_days: [] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="daily">Dagelijks</option>
                  <option value="weekly">Wekelijks</option>
                  <option value="monthly">Maandelijks</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duur per Slot (minuten)</label>
                <select
                  value={recurringPattern.duration_minutes}
                  onChange={(e) => setRecurringPattern({ ...recurringPattern, duration_minutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={20}>20 minuten</option>
                  <option value={30}>30 minuten</option>
                  <option value={60}>60 minuten</option>
                </select>
              </div>
            </div>

            {recurringPattern.repeat_type === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dagen van de Week</label>
                <div className="flex gap-2 flex-wrap">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => toggleRepeatDay(index)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        recurringPattern.repeat_days.includes(index)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(recurringPattern.repeat_type === 'weekly' || recurringPattern.repeat_type === 'daily') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Herhaal elke {recurringPattern.repeat_type === 'weekly' ? 'X weken' : 'X dagen'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={recurringPattern.interval}
                  onChange={(e) => setRecurringPattern({ ...recurringPattern, interval: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={addRecurringSlots}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Patroon Toevoegen
              </button>
              <button
                onClick={() => {
                  setShowRecurringForm(false);
                  setRecurringPattern({
                    start_date: '',
                    end_date: '',
                    start_time: '',
                    end_time: '',
                    duration_minutes: 20,
                    repeat_type: 'weekly',
                    repeat_days: [],
                    interval: 1
                  });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditAppointment && editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Afspraak Bewerken</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Datum</label>
                <input
                  type="date"
                  value={editingAppointment.date}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Tijd</label>
                  <input
                    type="time"
                    value={editingAppointment.start_time}
                    onChange={(e) => {
                      const newEndTime = calculateEndTime(e.target.value, editingAppointment.duration_minutes);
                      setEditingAppointment({ ...editingAppointment, start_time: e.target.value, end_time: newEndTime });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duur (minuten)</label>
                  <select
                    value={editingAppointment.duration_minutes}
                    onChange={(e) => {
                      const duration = parseInt(e.target.value);
                      const newEndTime = calculateEndTime(editingAppointment.start_time, duration);
                      setEditingAppointment({ ...editingAppointment, duration_minutes: duration, end_time: newEndTime });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={20}>20 minuten</option>
                    <option value={30}>30 minuten</option>
                    <option value={60}>60 minuten</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Notities</label>
                <textarea
                  value={editingAppointment.admin_notes || ''}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, admin_notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Interne notities alleen zichtbaar voor admin..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={updateAppointment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Opslaan
                </button>
                <button
                  onClick={() => {
                    setShowEditAppointment(false);
                    setEditingAppointment(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Slots */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Beschikbare Tijden ({availableSlots.length})
          </h3>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        ) : availableSlots.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nog geen beschikbare tijden. Voeg er een toe hierboven.</p>
        ) : (
          <div className="space-y-4">
            {Array.from(new Set(availableSlots.map(s => s.date))).map((date) => {
              const slotsForDate = availableSlots.filter(s => s.date === date);
              const dateObj = new Date(date);
              return (
                <div key={date} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <div className="font-semibold text-gray-900 dark:text-white mb-3">
                    {dateObj.toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {slotsForDate.map((slot) => {
                      const appointment = getSlotAppointmentForSlot(slot);
                      const isBooked = isSlotBooked(slot);
                      
                      return (
                        <div
                          key={slot.id}
                          className={`p-3 rounded-lg border-2 ${
                            isBooked
                              ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">{slot.start_time}</span>
                            {isBooked && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          {appointment && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <div className="font-medium">{appointment.user_name || appointment.user_email}</div>
                              <div className="text-xs">{appointment.status === 'pending' ? '⏳ In afwachting' : '✅ Bevestigd'}</div>
                            </div>
                          )}
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Verwijderen
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booked Appointments with Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            Geboekte Afspraken ({getFilteredAppointments().length})
          </h3>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setDisplayMode('agenda')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  displayMode === 'agenda'
                    ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Agenda
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  displayMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Lijst
              </button>
            </div>
            {displayMode === 'list' && (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoeken..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Alle Status</option>
                  <option value="pending">In Afwachting</option>
                  <option value="confirmed">Bevestigd</option>
                </select>
              </>
            )}
            <button
              onClick={exportAppointments}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporteren
            </button>
          </div>
        </div>

        {displayMode === 'agenda' ? (
          <AgendaView
            appointments={getFilteredAppointments()}
            onAppointmentClick={(apt) => {
              setSelectedAppointment(apt);
              setDisplayMode('list');
              // Scroll to appointment in list
              setTimeout(() => {
                const element = document.getElementById(`appointment-${apt.id}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            }}
          />
        ) : (
          <>
            {getFilteredAppointments().length === 0 ? (
              <p className="text-gray-500 text-center py-8">Geen afspraken gevonden</p>
            ) : (
              <div className="space-y-4">
                {getFilteredAppointments().map((apt) => {
                  const dateObj = new Date(apt.date);
                  const isSelected = selectedAppointment?.id === apt.id;
                  const appointmentDateTime = new Date(`${apt.date}T${apt.start_time}`);
                  const now = new Date();
                  const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                  const isUpcoming = hoursUntil > 0 && hoursUntil <= 24; // Binnen 24 uur
                  const isVerySoon = hoursUntil > 0 && hoursUntil <= 2; // Binnen 2 uur
                  
                  return (
                    <div
                      id={`appointment-${apt.id}`}
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${
                        isSelected ? 'ring-2 ring-orange-500 border-orange-500' : ''
                      } ${
                    isVerySoon && apt.status === 'confirmed'
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/30 ring-2 ring-red-300'
                      : isUpcoming && apt.status === 'confirmed'
                      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
                      : apt.status === 'confirmed'
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                      : 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isVerySoon && apt.status === 'confirmed' && (
                        <div className="mb-3 flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-semibold text-sm">⚠️ BINNENKORT: Over {Math.round(hoursUntil * 10) / 10} uur</span>
                        </div>
                      )}
                      {isUpcoming && apt.status === 'confirmed' && !isVerySoon && (
                        <div className="mb-3 flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold text-sm">Binnen {Math.round(hoursUntil * 10) / 10} uur</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {dateObj.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {apt.start_time} - {apt.end_time} ({apt.duration_minutes} min)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {apt.user_name || apt.user_email}
                        </span>
                      </div>
                      {apt.notes && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <strong>Klant Opmerkingen:</strong> {apt.notes}
                        </div>
                      )}
                      {apt.admin_notes && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                          <strong>Admin Notities:</strong> {apt.admin_notes}
                        </div>
                      )}
                      {apt.teams_link && (
                        <div className="mt-2">
                          <a
                            href={apt.teams_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            <Video className="w-3 h-3" />
                            Microsoft Teams Link
                          </a>
                        </div>
                      )}
                      {apt.questions && (
                        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Pre-afspraak Vragen:
                          </h4>
                          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            <p><strong>Bitcoin ervaring:</strong> {apt.questions.has_bitcoin_experience ? 'Ja' : 'Nee'}</p>
                            <p><strong>Kent hardware wallet:</strong> {apt.questions.knows_hardware_wallet ? 'Ja' : 'Nee'}</p>
                            <p><strong>Heeft crypto wallet:</strong> {apt.questions.has_crypto_wallet ? 'Ja' : 'Nee'}</p>
                            <p><strong>Investeringservaring:</strong> {
                              apt.questions.investment_experience === 'beginner' ? 'Beginner' :
                              apt.questions.investment_experience === 'intermediate' ? 'Gemiddeld' :
                              apt.questions.investment_experience === 'advanced' ? 'Gevorderd' : '-'
                            }</p>
                            <p><strong>Maandelijks budget:</strong> {apt.questions.monthly_investment_budget || '-'}</p>
                            <p><strong>Hoofddoel:</strong> {
                              apt.questions.main_goal === 'long_term' ? 'Langetermijn opslag' :
                              apt.questions.main_goal === 'dca' ? 'DCA strategie' :
                              apt.questions.main_goal === 'trading' ? 'Handelen' :
                              apt.questions.main_goal === 'education' ? 'Leren' :
                              apt.questions.main_goal === 'diversification' ? 'Diversificatie' : '-'
                            }</p>
                            {apt.questions.questions_or_concerns && (
                              <div className="mt-2 pt-2 border-t border-blue-300 dark:border-blue-700">
                                <p><strong>Vragen/Zorgen:</strong></p>
                                <p className="italic">{apt.questions.questions_or_concerns}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        apt.status === 'confirmed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}>
                        {apt.status === 'confirmed' ? 'Bevestigd' : 'In Afwachting'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingAppointment({ ...apt });
                          setShowEditAppointment(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        Bewerken
                      </button>
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Bevestigen
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={async () => {
                            // If already approved, don't ask for confirmation again
                            if (apt.one_on_one_approved) {
                              return;
                            }
                            
                            if (!confirm('Weet je zeker dat je dit account wilt goedkeuren? Dit maakt alle tabs beschikbaar voor de gebruiker.')) {
                              return;
                            }
                            try {
                              let updateSuccess = false;
                              
                              // Update appointment with one_on_one_approved status
                              const { error: appointmentError } = await supabase
                                .from('appointments')
                                .update({ 
                                  one_on_one_approved: true,
                                  updated_at: new Date().toISOString()
                                })
                                .eq('id', apt.id);

                              if (appointmentError && appointmentError.code !== 'PGRST116') {
                                console.error('Error updating appointment:', appointmentError);
                              }
                              
                              // Try to update accounts table first (most likely to exist)
                              const { error: accountsError } = await supabase
                                .from('accounts')
                                .update({ 
                                  account_approved: true,
                                  first_appointment_completed: true, // Mark appointment as completed
                                  updated_at: new Date().toISOString()
                                })
                                .eq('email', apt.user_email);

                              if (!accountsError || accountsError.code === 'PGRST116') {
                                updateSuccess = true;
                              }

                              // Try to update users table if accounts failed or as additional update
                              const { error: userError } = await supabase
                                .from('users')
                                .update({ 
                                  account_approved: true,
                                  first_appointment_completed: true, // Mark appointment as completed
                                  updated_at: new Date().toISOString()
                                })
                                .eq('email', apt.user_email);

                              // If both fail with schema errors, inform user about SQL script
                              if (accountsError && accountsError.code === 'PGRST204' && userError && userError.code === 'PGRST204') {
                                alert(`De database kolommen ontbreken nog. Voer eerst het SQL script uit:\n\nadd-users-account-status-columns.sql\n\nOf voeg handmatig toe:\n- account_approved BOOLEAN DEFAULT FALSE\n- first_appointment_completed BOOLEAN DEFAULT FALSE\n\naan de 'users' en 'accounts' tabellen.`);
                                return;
                              }

                              // If at least one succeeded, we're good
                              if (!userError || userError.code === 'PGRST116') {
                                updateSuccess = true;
                              }

                              if (!updateSuccess) {
                                throw accountsError || userError;
                              }

                              alert('Account succesvol goedgekeurd! Alle tabs zijn nu beschikbaar voor de gebruiker.');
                              
                              // Trigger refresh of accounts list in AccountBeheer
                              if (window.dispatchEvent) {
                                window.dispatchEvent(new CustomEvent('refreshAccounts'));
                              }
                              
                              await loadData();
                            } catch (error: any) {
                              console.error('Error approving account:', error);
                              if (error?.code === 'PGRST204') {
                                alert(`De 'account_approved' kolom ontbreekt in de database.\n\nVoer eerst het SQL script uit: add-users-account-status-columns.sql\n\nOf voeg handmatig de kolom 'account_approved BOOLEAN DEFAULT FALSE' toe aan de 'users' en 'accounts' tabellen.`);
                              } else {
                                alert(`Fout bij goedkeuren: ${error?.message || 'Onbekende fout'}`);
                              }
                            }
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
                            apt.one_on_one_approved
                              ? 'bg-green-600 text-white cursor-default'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                          title={apt.one_on_one_approved 
                            ? "1 op 1 akkoord - Account is goedgekeurd en volledig actief" 
                            : "1 op 1 akkoord - Het gesprek ging goed en we zetten dit account open"
                          }
                          disabled={apt.one_on_one_approved}
                        >
                          {apt.one_on_one_approved ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              1 op 1 Akkoord ✓
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3" />
                              1 op 1 Akkoord
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-3 h-3" />
                        Annuleren
                      </button>
                    </div>
                  </div>
                </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Teams Link Popup */}
      {showTeamsLinkPopup && confirmingAppointment && (
        <TeamsLinkPopup
          isOpen={showTeamsLinkPopup}
          onClose={() => {
            setShowTeamsLinkPopup(false);
            setConfirmingAppointment(null);
          }}
          onConfirm={handleConfirmWithTeamsLink}
          appointmentDate={confirmingAppointment.date}
          appointmentTime={confirmingAppointment.start_time}
        />
      )}
    </div>
  );
}
