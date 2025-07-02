import React, { useEffect } from 'react';

const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export const Calendar = ({
  selectedDate,
  onChangeDate,
  onMonthChange,
  fullyBookedDates = [],
  allowedWeekdays = [0, 1, 2, 3, 4, 5, 6],
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = React.useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    onMonthChange?.(currentDate);
  }, [currentDate]);

  const prevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const isSelected = day =>
    selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year;

  // Prepare days with empty slots for start
  const daysArray = [];
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <div className="text-center font-montserrat w-full">
      <div className="flex items-center justify-between mb-6 px-4">
        <button
          onClick={prevMonth}
          className="p-2 text-blue hover:bg-light-blue rounded-full transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800">
            {currentDate
              .toLocaleString('pt-BR', { month: 'long' })
              .toUpperCase()}
          </h3>
          <p className="text-md text-gray-600">{year}</p>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 text-blue hover:bg-light-blue rounded-full transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-3">
        {weekdays.map((day, i) => (
          <div key={i} className="text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysArray.map((day, idx) => {
          if (!day) {
            return <div key={idx} className="h-12" />;
          }

          const dateObj = new Date(year, month, day);
          const dateISO = dateObj.toISOString().slice(0, 10);
          const weekday = dateObj.getDay();
          const isFullyBooked = fullyBookedDates?.includes(dateISO);
          const isWeekdayAllowed = allowedWeekdays.includes(weekday);
          const isDisabled = isFullyBooked || !isWeekdayAllowed;
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <button
              key={idx}
              onClick={() => !isDisabled && onChangeDate(dateObj)}
              disabled={isDisabled}
              className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors text-lg
                ${isToday ? 'border-2 border-blue' : ''}
                ${isSelected(day) ? 'bg-blue text-white' : ''}
                ${isFullyBooked ? 'text-gray-400 cursor-not-allowed' : ''}
                ${!isWeekdayAllowed ? 'text-gray-400 cursor-not-allowed' : ''}
                ${
                  !isSelected(day) && !isFullyBooked && isWeekdayAllowed
                    ? 'hover:bg-blue hover:text-white'
                    : ''
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
