import api from './api';

export const authService = {
  // تسجيل الدخول
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'فشل في تسجيل الدخول');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'فشل في تسجيل الدخول');
    }
  },

  // تسجيل مستخدم جديد
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'فشل في التسجيل');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'فشل في التسجيل');
    }
  },

  // تسجيل الخروج
  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('doctorData');
    return true;
  },

  // التحقق من حالة المصادقة
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error('فشل في التحقق من المصادقة');
    }
  }
};
