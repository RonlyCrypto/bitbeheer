import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

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
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

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
      alert('Fout bij het laden van beschikbare tijden');
    }
  };

  const loadBookedSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('date, start_time, end_time')
        .in('status', ['pending', 'confirmed']);
      
      if (error) throw error;
      
      // Create set of blocked slots (including 20 min after end time)
      const blocked = new Set<string>();
      (data || []).forEach((apt: any) => {
        // Block the actual appointment slot
        const startKey = `${apt.date}_${apt.start_time}`;
        blocked.add(startKey);
        
        // Parse end time and block until 20 min after
        const [endHours, endMinutes] = apt.end_time.split(':').map(Number);
        const blockUntilMinutes = endMinutes + 20;
        const blockUntilHours = endHours + Math.floor(blockUntilMinutes / 60);
        const finalBlockMinute = blockUntilMinutes % 60;
        
        // Block all 30-min slots from end_time to blockUntil
        const endTimeMinutes = endHours * 60 + endMinutes;
        const blockUntilTimeMinutes = blockUntilHours * 60 + finalBlockMinute;
        
        // Generate blocked time keys (every 30 minutes)
        for (let mins = endTimeMinutes; mins < blockUntilTimeMinutes; mins += 30) {
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          const timeKey = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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
    setSelectedSlot(slotId);
  };

  const handleSubmit = async () => {
    if (!selectedSlot || !user?.email) return;
    
    setSubmitting(true);
    try {
      const slot = availableSlots.find(s => s.id === selectedSlot);
      if (!slot) throw new Error('Slot niet gevonden');

      const [hours, minutes] = slot.start_time.split(':').map(Number);
      const endTime = new Date(0);
      endTime.setHours(hours, minutes + slot.duration_minutes);
      const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}:00`;

      const { error } = await supabase
        .from('appointments')
        .insert([{
          user_email: user.email,
          user_name: user.user_metadata?.name || user.email.split('@')[0],
          slot_id: slot.id,
          date: slot.date,
          start_time: slot.start_time,
          end_time: endTimeStr,
          duration_minutes: slot.duration_minutes,
          status: 'pending',
          notes: notes.trim() || null,
        }]);

      if (error) throw error;

      onSuccess();
      onClose();
      setSelectedDate('');
      setSelectedSlot('');
      setNotes('');
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      alert(`Fout bij het boeken: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getSlotsForDate = (date: string) => {
    return availableSlots.filter(s => s.date === date);
  };

  const isSlotBlocked = (slot: AvailableSlot) => {
    const key = `${slot.date}_${slot.start_time}`;
    return bookedSlots.has(key);
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
                          onClick={() => !isBlocked && handleSlotSelect(slot.id)}
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
                          <span className="font-medium">{slot.start_time}</span>
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
            onClick={handleSubmit}
            disabled={!selectedSlot || submitting}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
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
    </div>
  );
}

