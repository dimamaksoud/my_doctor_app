import React from 'react';
import dateUtils from '../../utils/dateUtils'; // استيراد افتراضي

const DatePicker = ({ selectedDate, onDateChange, minDate, maxDate }) => {
  // تحويل المدخلات إلى تواريخ صالحة باستخدام dateUtils
  const safeSelectedDate = dateUtils.toDate(selectedDate);
  const safeMinDate = dateUtils.toDate(minDate);
  const safeMaxDate = dateUtils.toDate(maxDate);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    onDateChange(newDate);
  };

  return (
    <input
      type="date"
      value={dateUtils.toShortGregorian(safeSelectedDate)} // استخدام dateUtils.
      min={dateUtils.toShortGregorian(safeMinDate)} // استخدام dateUtils.
      max={dateUtils.toShortGregorian(safeMaxDate)} // استخدام dateUtils.
      onChange={handleDateChange}
    />
  );
};

export default DatePicker; // تأكد من التصدير الافتراضي
