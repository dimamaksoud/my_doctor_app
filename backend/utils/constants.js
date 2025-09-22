// ثوابت التطبيق

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show'
};

const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'success',
  ERROR: 'error'
};

const USER_TYPES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient'
};

const DAYS_OF_WEEK = {
  0: 'الأحد',
  1: 'الإثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت'
};

const SPECIALIZATIONS = [
  'طب الأسرة',
  'الباطنية',
  'الجراحة العامة',
  'أمراض القلب',
  'أمراض الأطفال',
  'النساء والتوليد',
  'العظام',
  'الأعصاب',
  'الجلدية',
  'العيون',
  'الأنف والأذن والحنجرة',
  'الطب النفسي',
  'الأسنان',
  'التغذية',
  'العلاج الطبيعي'
];

const DEFAULT_WORKING_HOURS = {
  start: '08:00',
  end: '16:00',
  break_start: '12:00',
  break_end: '13:00'
};

const CANCELLATION_DEADLINE_HOURS = 18;
const MAX_NO_SHOW_COUNT = 3;
const DEFAULT_SLOT_INTERVAL = 30;

module.exports = {
  APPOINTMENT_STATUS,
  NOTIFICATION_TYPES,
  USER_TYPES,
  DAYS_OF_WEEK,
  SPECIALIZATIONS,
  DEFAULT_WORKING_HOURS,
  CANCELLATION_DEADLINE_HOURS,
  MAX_NO_SHOW_COUNT,
  DEFAULT_SLOT_INTERVAL
};
