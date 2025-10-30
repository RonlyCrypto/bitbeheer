import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, User, Trash2, CheckCircle, XCircle, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  status: string;
  notes?: string;
  admin_notes?: string;
}

export default function AdminAppointmentManagement() {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    start_time: '',
    duration_minutes: 20
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load available slots
      const { data: slots, error: slotsError } = await supabase
        .from('available_slots')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (slotsError) throw slotsError;
      setAvailableSlots(slots || []);

      // Load appointments
      const { data: apts, error: aptsError } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (aptsError) throw aptsError;
      setAppointments(apts || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Fout bij het laden van gegevens');
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

  const updateAppointmentStatus = async (aptId: string, newStatus: string) => {
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

  const getSlotAppointment = (slotId: string) => {
    return appointments.find(apt => apt.id === slotId);
  };

  const isSlotBooked = (slot: AvailableSlot) => {
    return appointments.some(apt => 
      apt.date === slot.date && 
      apt.start_time === slot.start_time &&
      ['pending', 'confirmed'].includes(apt.status)
    );
  };

  const getSlotAppointmentForSlot = (slot: AvailableSlot) => {
    return appointments.find(apt => 
      apt.date === slot.date && 
      apt.start_time === slot.start_time &&
      ['pending', 'confirmed'].includes(apt.status)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Afspraken Beheer</h2>
          <p className="text-gray-600 dark:text-gray-400">Beheer beschikbare tijden en bekijk geboekte afspraken</p>
        </div>
        <button
          onClick={() => setShowSlotForm(!showSlotForm)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Beschikbare Tijd Toevoegen
        </button>
      </div>

      {/* Add Slot Form */}
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

      {/* Available Slots */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Beschikbare Tijden
        </h3>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3 inline" /> Verwijderen
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

      {/* Booked Appointments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-orange-600" />
          Geboekte Afspraken ({appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length})
        </h3>
        {appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nog geen geboekte afspraken</p>
        ) : (
          <div className="space-y-4">
            {appointments
              .filter(a => ['pending', 'confirmed'].includes(a.status))
              .map((apt) => {
                const dateObj = new Date(apt.date);
                return (
                  <div
                    key={apt.id}
                    className={`p-4 rounded-lg border-2 ${
                      apt.status === 'confirmed'
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                        : 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {dateObj.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {apt.start_time} - {apt.end_time}
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
                            <strong>Opmerkingen:</strong> {apt.notes}
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
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Bevestigen
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
      </div>
    </div>
  );
}

