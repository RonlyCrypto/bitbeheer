import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, MapPin, Plus } from 'lucide-react';

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  notes?: string;
  teams_link?: string;
}

interface AgendaViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  viewMode?: string;
  setViewMode?: (mode: string) => void;
  onBookAppointment?: () => void;
  setSelectedAppointment?: (apt: Appointment | null) => void;
  isListMode?: boolean;
}

export default function AgendaView({ appointments, onAppointmentClick, viewMode = 'agenda', setViewMode, onBookAppointment, setSelectedAppointment, isListMode = false }: AgendaViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredAppointment, setHoveredAppointment] = useState<Appointment | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [calendarView, setCalendarView] = useState<'week' | 'month' | 'year'>('week');

  // Get start and end of current week
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      return aptDate === dateStr && (apt.status === 'confirmed' || apt.status === 'pending');
    }).sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Navigate months
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Navigate years
  const goToPreviousYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentDate(newDate);
  };

  const goToNextYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentDate(newDate);
  };

  // Get month dates (all days in month)
  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  // Get year dates (all months in year)
  const getYearMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(new Date(currentDate.getFullYear(), i, 1));
    }
    return months;
  };

  // Get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 border-green-600';
      case 'pending':
        return 'bg-orange-500 border-orange-600';
      case 'cancelled':
        return 'bg-red-500 border-red-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  // Format time
  const formatTime = (time: string) => {
    return time.slice(0, 5); // HH:mm
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Bevestigd';
      case 'pending':
        return 'In Afwachting';
      case 'cancelled':
        return 'Geannuleerd';
      default:
        return status;
    }
  };

  const weekDates = getWeekDates();

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={
              calendarView === 'week' ? goToPreviousWeek :
              calendarView === 'month' ? goToPreviousMonth :
              goToPreviousYear
            }
            disabled={isListMode}
            className={`p-2 rounded-lg transition-colors ${
              isListMode ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            disabled={isListMode}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isListMode
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            Vandaag
          </button>
          <button
            onClick={
              calendarView === 'week' ? goToNextWeek :
              calendarView === 'month' ? goToNextMonth :
              goToNextYear
            }
            disabled={isListMode}
            className={`p-2 rounded-lg transition-colors ${
              isListMode ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900">
              {calendarView === 'week' 
                ? weekDates[0].toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
                : calendarView === 'month'
                ? currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
                : currentDate.getFullYear()}
            </h2>
            <p className="text-sm text-gray-600">
              {calendarView === 'week'
                ? `Week ${Math.ceil((currentDate.getDate() - currentDate.getDay() + 1) / 7)}`
                : calendarView === 'month'
                ? `Maand`
                : `Jaar`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Calendar view tabs - Week/Maand/Jaar */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCalendarView('week')}
              disabled={isListMode}
              className={`px-3 py-2 rounded-md transition-colors text-sm ${
                calendarView === 'week' && !isListMode
                  ? 'bg-white text-orange-600 shadow-sm'
                  : isListMode ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarView('month')}
              disabled={isListMode}
              className={`px-3 py-2 rounded-md transition-colors text-sm ${
                calendarView === 'month' && !isListMode
                  ? 'bg-white text-orange-600 shadow-sm'
                  : isListMode ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Maand
            </button>
            <button
              onClick={() => setCalendarView('year')}
              disabled={isListMode}
              className={`px-3 py-2 rounded-md transition-colors text-sm ${
                calendarView === 'year' && !isListMode
                  ? 'bg-white text-orange-600 shadow-sm'
                  : isListMode ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Jaar
            </button>
          </div>

          {/* Agenda/Lijst tabs - Always enabled for switching */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                if (setViewMode) setViewMode('agenda');
                if (setSelectedAppointment) setSelectedAppointment(null);
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => {
                if (setViewMode) setViewMode('list');
                if (setSelectedAppointment) setSelectedAppointment(null);
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lijst
            </button>
          </div>
          
          {/* Afspraak Boeken button - Disabled only in list mode */}
          <button
            onClick={onBookAppointment}
            disabled={isListMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isListMode
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            Afspraak Boeken
          </button>
        </div>
      </div>

      {/* Calendar View - Only show in agenda mode */}
      {!isListMode && calendarView === 'week' && <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day, index) => (
          <div
            key={day}
            className="text-center p-2 font-semibold text-gray-700 bg-gray-50 rounded-t-lg"
          >
            {day}
          </div>
        ))}

        {/* Day Cells */}
        {weekDates.map((date, dayIndex) => {
          const dayAppointments = getAppointmentsForDate(date);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={dayIndex}
              className={`min-h-[200px] border-2 rounded-lg p-2 transition-all ${
                isCurrentDay
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Date Header */}
              <div className={`text-center mb-2 ${isCurrentDay ? 'font-bold text-orange-700' : 'text-gray-700'}`}>
                <div className="text-lg">{date.getDate()}</div>
                {isCurrentDay && (
                  <div className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded mt-1 inline-block">
                    Vandaag
                  </div>
                )}
              </div>

              {/* Appointments */}
              <div className="space-y-1">
                {dayAppointments.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center mt-4">Geen afspraken</p>
                ) : (
                  dayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => onAppointmentClick(apt)}
                      onMouseEnter={(e) => {
                        setHoveredAppointment(apt);
                        setHoverPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredAppointment(null)}
                      className={`${getStatusColor(apt.status)} text-white p-1.5 rounded text-xs cursor-pointer hover:opacity-90 transition-all relative group`}
                    >
                      <div className="font-medium truncate">
                        {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                      </div>
                      <div className="text-xs opacity-90 mt-0.5">
                        {getStatusLabel(apt.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>}

      {/* Month View Grid */}
      {!isListMode && calendarView === 'month' && (
        <div className="grid grid-cols-7 gap-2">
          {/* Month day headers */}
          {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
            <div key={day} className="text-center p-2 font-semibold text-gray-700 bg-gray-50 rounded">
              {day}
            </div>
          ))}
          
          {/* Month days */}
          {getMonthDates().map((date, idx) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isCurrentDay = isToday(date);
            return (
              <div
                key={idx}
                className={`min-h-[100px] border-2 rounded-lg p-2 transition-all ${
                  isCurrentDay ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? 'text-orange-700' : 'text-gray-700'}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1 text-xs">
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => onAppointmentClick(apt)}
                      className={`${getStatusColor(apt.status)} text-white p-1 rounded truncate cursor-pointer hover:opacity-90`}
                    >
                      {formatTime(apt.start_time)}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-gray-500 text-xs">+{dayAppointments.length - 2} meer</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Year View Grid */}
      {!isListMode && calendarView === 'year' && (
        <div className="grid grid-cols-3 gap-4">
          {getYearMonths().map((monthDate) => {
            const monthAppointments = appointments.filter(apt => {
              const aptDate = new Date(apt.date);
              return aptDate.getMonth() === monthDate.getMonth() &&
                     aptDate.getFullYear() === monthDate.getFullYear() &&
                     (apt.status === 'confirmed' || apt.status === 'pending');
            });
            
            return (
              <div key={monthDate.getMonth()} className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {monthDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="space-y-2 text-sm">
                  {monthAppointments.length === 0 ? (
                    <p className="text-gray-400 text-xs">Geen afspraken</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-gray-600 font-medium">{monthAppointments.length} afspraken</p>
                      {monthAppointments.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => onAppointmentClick(apt)}
                          className="text-xs p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                        >
                          {new Date(apt.date).getDate()} {formatTime(apt.start_time)}
                        </div>
                      ))}
                      {monthAppointments.length > 3 && (
                        <p className="text-gray-500 text-xs">+{monthAppointments.length - 3} meer</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredAppointment && (
        <div
          className="fixed z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm pointer-events-none"
          style={{
            left: `${hoverPosition.x + 10}px`,
            top: `${hoverPosition.y + 10}px`,
            transform: 'translateX(0)'
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-semibold">
                {new Date(hoveredAppointment.date).toLocaleDateString('nl-NL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {hoveredAppointment.start_time} - {hoveredAppointment.end_time}
                {' '}({hoveredAppointment.duration_minutes} min)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(hoveredAppointment.status).split(' ')[0]}`}></div>
              <span>{getStatusLabel(hoveredAppointment.status)}</span>
            </div>
            {hoveredAppointment.notes && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-sm text-gray-300">{hoveredAppointment.notes}</p>
              </div>
            )}
            {hoveredAppointment.teams_link && (
              <div className="pt-2 border-t border-gray-700">
                <span className="text-sm text-blue-300">Microsoft Teams link beschikbaar</span>
              </div>
            )}
            <p className="text-xs text-gray-400 pt-2 mt-2 border-t border-gray-700">
              Klik voor meer details
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legenda</h3>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 border border-green-600"></div>
            <span className="text-sm text-gray-600">Bevestigd</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500 border border-orange-600"></div>
            <span className="text-sm text-gray-600">In Afwachting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500 border border-red-600"></div>
            <span className="text-sm text-gray-600">Geannuleerd</span>
          </div>
        </div>
      </div>
    </div>
  );
}

