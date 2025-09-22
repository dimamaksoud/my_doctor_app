import api from './api';

export const doctorService = {
  // في src/services/doctorService.js - أضف هذه الدالة
getDoctorsList: async (filters = {}) => {
  try {
    const response = await api.get('/doctors', { params: filters });

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'فشل في جلب قائمة الأطباء');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل في جلب قائمة الأطباء');
  }
},
  // تحديث بيانات الطبيب
  updateProfile: async (doctorId, doctorData) => {
    try {
      const response = await api.put(`/doctors/${doctorId}`, doctorData);

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'فشل في تحديث البيانات');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'فشل في تحديث البيانات');
    }
  },

  // الحصول على بيانات الطبيب
  getProfile: async (doctorId) => {
    try {
      const response = await api.get(`/doctors/${doctorId}`);

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'فشل في جلب البيانات');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'فشل في جلب البيانات');
    }
  },

  // الحصول على مواعيد الطبيب
  getAppointments: async (doctorId) => {
    try {
      const response = await api.get(`/doctors/${doctorId}/appointments`);

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'فشل في جلب المواعيد');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'فشل في جلب المواعيد');
    }
  },



    // الحصول على قائمة الأطباء
    getDoctorsList: async (filters = {}) => {
      try {
        const response = await api.get('/doctors', { params: filters });

        if (response.data && response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'فشل في جلب قائمة الأطباء');
        }
      } catch (error) {
        throw new Error(error.response?.data?.message || 'فشل في جلب قائمة الأطباء');

    }
  },
  // إدارة جدول العمل
  updateSchedule: async (doctorId, scheduleData) => {
    try {
      const response = await api.put(`/doctors/${doctorId}/schedule`, scheduleData);

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'فشل في تحديث الجدول');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'فشل في تحديث الجدول');
    }
  }
};
