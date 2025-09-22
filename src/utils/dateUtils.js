// دوال مساعدة للتعامل مع التواريخ الميلادية

/**
 * تحويل التاريخ إلى صيغة ميلادية
 * @param {string|Date} dateInput - التاريخ بصيغة YYYY-MM-DD أو كائن Date
 * @param {string} locale - اللغة (افتراضي: en-US)
 * @returns {string} التاريخ المنسق
 */
const formatToGregorian = (dateInput, locale = 'en-US') => {
  if (!dateInput) return '';

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) {
      return dateInput;
    }

    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return typeof dateInput === 'string' ? dateInput : '';
  }
};

/**
 * تحويل الوقت إلى تنسيق 12 ساعة مع AM/PM
 * @param {string} timeString - الوقت بصيغة HH:MM
 * @returns {string} الوقت المنسق
 */
const to12HourFormat = (timeString) => {
  if (!timeString) return '';

  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * تحويل التاريخ إلى صيغة مختصرة YYYY-MM-DD
 * @param {string|Date} dateInput - التاريخ
 * @returns {string} التاريخ المنسق
 */
const toShortGregorian = (dateInput) => {
  if (!dateInput) return '';

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) {
      return typeof dateInput === 'string' ? dateInput : '';
    }

    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting short date:', error);
    return typeof dateInput === 'string' ? dateInput : '';
  }
};

/**
 * الحصول على تاريخ اليوم بصيغة YYYY-MM-DD
 * @returns {string} تاريخ اليوم
 */
const getToday = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * التحقق إذا كان التاريخ هو اليوم
 * @param {string|Date} dateInput - التاريخ للتحقق
 * @returns {boolean} هل هو اليوم؟
 */
const isToday = (dateInput) => {
  const today = getToday();
  const dateStr = typeof dateInput === 'string' ? dateInput : toShortGregorian(dateInput);
  return dateStr === today;
};

/**
 * التحقق إذا كان التاريخ في المستقبل
 * @param {string|Date} dateInput - التاريخ للتحقق
 * @returns {boolean} هل هو في المستقبل؟
 */
const isFutureDate = (dateInput) => {
  const today = getToday();
  const dateStr = typeof dateInput === 'string' ? dateInput : toShortGregorian(dateInput);
  return dateStr > today;
};

/**
 * إضافة أيام إلى تاريخ
 * @param {string|Date} dateInput - التاريخ الأساسي
 * @param {number} days - عدد الأيام للإضافة
 * @returns {string} التاريخ الجديد
 */
const addDays = (dateInput, days) => {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) {
      return typeof dateInput === 'string' ? dateInput : '';
    }

    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error adding days:', error);
    return typeof dateInput === 'string' ? dateInput : '';
  }
};

/**
 * الحصول على اسم اليوم من التاريخ
 * @param {string|Date} dateInput - التاريخ
 * @returns {string} اسم اليوم
 */
const getDayName = (dateInput) => {
  if (!dateInput) return '';

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } catch (error) {
    console.error('Error getting day name:', error);
    return '';
  }
};

/**
 * التحقق من صحة التاريخ
 * @param {string|Date} dateInput - التاريخ للتحقق
 * @returns {boolean} هل التاريخ صحيح؟
 */
const isValidDate = (dateInput) => {
  if (!dateInput) return false;

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * دالة مساعدة لتحويل أي مدخل إلى كائن Date
 * @param {string|Date} dateInput - المدخل المراد تحويله
 * @returns {Date} كائن Date
 */
const toDate = (dateInput) => {
  if (!dateInput) return new Date();

  if (dateInput instanceof Date) {
    return dateInput;
  }

  if (typeof dateInput === 'string') {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  return new Date();
};

// التصديرات المسماة (Named Exports)
export {
  formatToGregorian,
  toShortGregorian,
  to12HourFormat,
  getToday,
  isToday,
  isFutureDate,
  addDays,
  getDayName,
  isValidDate,
  toDate
};

// التصدير الافتراضي (Default Export)
const dateUtils = {
  formatToGregorian,
  toShortGregorian,
  to12HourFormat,
  getToday,
  isToday,
  isFutureDate,
  addDays,
  getDayName,
  isValidDate,
  toDate
};

export default dateUtils;
