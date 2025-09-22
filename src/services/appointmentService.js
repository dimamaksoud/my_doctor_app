import { notificationService } from './notificationService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const appointmentService = {
  getAvailableSlots: async (date) => {
    await delay(600);
    return mockAvailableSlots;
  },

  bookAppointment: async (appointmentData) => {
    await delay(800);

    // التحقق من عدم وجود حجز سابق
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const hasExistingAppointment = existingAppointments.some(apt =>
      apt.phone === appointmentData.phone &&
      apt.appointmentDate === appointmentData.appointmentDate &&
      apt.status !== 'cancelled'
    );

    if (hasExistingAppointment) {
      throw new Error('لديك موعد سابق في هذا اليوم');
    }

    const newAppointment = {
      appointment_id: Date.now(),
      doctor_id: 1,
      ...appointmentData,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const updatedAppointments = [...existingAppointments, newAppointment];
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

    return { data: newAppointment, message: "تم حجز الموعد بنجاح" };
  },

  cancelAppointment: async (appointmentId, reason) => {
    await delay(700);

    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = appointments.map(apt =>
      apt.appointment_id === appointmentId
        ? { ...apt, status: 'cancelled', cancellation_reason: reason }
        : apt
    );

    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    return { message: "تم إلغاء الموعد بنجاح" };
  },

  // ✅ إضافة الدالة المفقودة getDoctorAppointments
  getDoctorAppointments: async (doctorId, filters = {}) => {
    await delay(500);

    // الحصول على جميع المواعيد من localStorage
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');

    // تصفية المواعيد حسب doctorId
    let appointments = allAppointments.filter(apt => apt.doctor_id == doctorId);

    // تطبيق الفلاتر الإضافية
    if (filters.date) {
      appointments = appointments.filter(apt => apt.appointment_date === filters.date);
    }

    if (filters.status) {
      appointments = appointments.filter(apt => apt.status === filters.status);
    }

    if (filters.patientName) {
      appointments = appointments.filter(apt =>
        apt.fullName && apt.fullName.toLowerCase().includes(filters.patientName.toLowerCase())
      );
    }

    return appointments;
  },

  // في services/appointmentService.js - إضافة الدوال
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments/manage', appointmentData);

      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'فشل في إنشاء الموعد');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في إنشاء الموعد');
    }
  },

  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.delete(`/appointments/manage/${appointmentId}`);

      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'فشل في حذف الموعد');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في حذف الموعد');
    }
  },
  // ✅ إضافة الدوال الأخرى المطلوبة
  confirmAppointment: async (appointmentId) => {
    await delay(400);

    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = appointments.map(apt =>
      apt.appointment_id === appointmentId
        ? { ...apt, status: 'confirmed' }
        : apt
    );

    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    return { message: "تم تأكيد الموعد" };
  },

  getPatientAppointments: async (phone) => {
    await delay(600);
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    return appointments.filter(apt => apt.phone === phone);
  }
};

// ✅ تأكد من التصدير الافتراضي
export default appointmentService;
