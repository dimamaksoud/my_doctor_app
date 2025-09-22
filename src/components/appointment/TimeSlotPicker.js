// src/components/appointment/TimeSlotPicker.js
import React from 'react';

const TimeSlotPicker = ({ slots, selectedSlot, onSelectSlot }) => {
  if (!slots || slots.length === 0) {
    return <p>لا توجد مواعيد متاحة لهذا اليوم</p>;
  }

  return (
    <div className="time-slots-container">
      <h4>المواعيد المتاحة</h4>
      <div className="time-slots-grid">
        {slots.map(slot => (
          <div
            key={slot.id}
            className={`time-slot ${selectedSlot?.id === slot.id ? 'selected' : ''} ${slot.booked ? 'booked' : 'available'}`}
            onClick={() => !slot.booked && onSelectSlot(slot)}
          >
            <span>{slot.startTime} - {slot.endTime}</span>
            {slot.booked && <span className="booked-label">محجوز</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
