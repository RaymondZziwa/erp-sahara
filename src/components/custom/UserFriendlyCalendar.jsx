import './UserFriendlyCalendar.css'; 
import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

const UserFriendlyCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} aria-label="Previous month">
          &lt;
        </button>
        <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth} aria-label="Next month">
          &gt;
        </button>
      </div>
      
      <div className="weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      
      <div className="days-grid">
        {monthDays.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <button
              key={day.toString()}
              className={`day-cell 
                ${isSelected ? 'selected' : ''} 
                ${!isCurrentMonth ? 'other-month' : ''}`}
              onClick={() => setSelectedDate(day)}
              aria-label={`Select ${format(day, 'MMMM d, yyyy')}`}
              aria-pressed={isSelected}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UserFriendlyCalendar;