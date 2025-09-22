// دوال مساعدة متنوعة

// تنسيق التاريخ
const formatDate = (date, format = 'ar-SA') => {
  return new Date(date).toLocaleDateString(format, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

// تنسيق الوقت
const formatTime = (time, showSeconds = false) => {
  const [hours, minutes, seconds] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'مساءً' : 'صباحاً';
  const formattedHour = hour % 12 || 12;

  if (showSeconds) {
    return `${formattedHour}:${minutes}:${seconds} ${ampm}`;
  }
  return `${formattedHour}:${minutes} ${ampm}`;
};

// إنشاء فواصل زمنية للمواعيد
const generateTimeSlots = (startTime, endTime, intervalMinutes = 30) => {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    slots.push(timeString);

    currentMinute += intervalMinutes;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
};

// حساب العمر من تاريخ الميلاد
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

// إنشاء رقم موعد عشوائي
const generateAppointmentNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `APT-${timestamp}${random}`;
};

// التحقق من توفر الموعد
const isTimeSlotAvailable = (bookedSlots, startTime, endTime) => {
  return !bookedSlots.some(slot => {
    const slotStart = new Date(`1970-01-01T${slot.start_time}`);
    const slotEnd = new Date(`1970-01-01T${slot.end_time}`);
    const newStart = new Date(`1970-01-01T${startTime}`);
    const newEnd = new Date(`1970-01-01T${endTime}`);

    return (newStart >= slotStart && newStart < slotEnd) ||
           (newEnd > slotStart && newEnd <= slotEnd) ||
           (newStart <= slotStart && newEnd >= slotEnd);
  });
};

module.exports = {
  formatDate,
  formatTime,
  generateTimeSlots,
  calculateAge,
  generateAppointmentNumber,
  isTimeSlotAvailable
};
