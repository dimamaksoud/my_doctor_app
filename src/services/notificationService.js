// src/services/notificationService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// وظيفة مساعدة للاتصال بالخادم
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const notificationService = {
  // إشعارات المريض
  sendPatientNotification: async (patientPhone, title, message, type = 'info') => {
    try {
      return await apiRequest('/notifications/patient', {
        method: 'POST',
        body: JSON.stringify({
          phone: patientPhone,
          title,
          message,
          type
        })
      });
    } catch (error) {
      // Fallback إلى localStorage
      console.warn('Using localStorage fallback for notifications');
      const notifications = JSON.parse(localStorage.getItem('patientNotifications') || '[]');
      const newNotification = {
        id: Date.now(),
        phone: patientPhone,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      notifications.push(newNotification);
      localStorage.setItem('patientNotifications', JSON.stringify(notifications));

      return newNotification;
    }
  },

  // الحصول على إشعارات المريض
  getPatientNotifications: async (phone) => {
    try {
      return await apiRequest(`/notifications/patient/${phone}`);
    } catch (error) {
      // Fallback إلى localStorage
      const notifications = JSON.parse(localStorage.getItem('patientNotifications') || '[]');
      return notifications.filter(notif => notif.phone === phone);
    }
  },

  // تحديد الإشعار كمقروء
  markAsRead: async (notificationId, userType = 'patient') => {
    try {
      return await apiRequest(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
        body: JSON.stringify({ userType })
      });
    } catch (error) {
      // Fallback إلى localStorage
      const key = userType === 'patient' ? 'patientNotifications' : 'doctorNotifications';
      const notifications = JSON.parse(localStorage.getItem(key) || '[]');

      const updatedNotifications = notifications.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      );

      localStorage.setItem(key, JSON.stringify(updatedNotifications));
      return true;
    }
  },

  // تحديد كل الإشعارات كمقروءة
  markAllAsRead: async (userType = 'patient', userId) => {
    try {
      return await apiRequest('/notifications/read-all', {
        method: 'PATCH',
        body: JSON.stringify({ userType, userId })
      });
    } catch (error) {
      // Fallback إلى localStorage
      const key = userType === 'patient' ? 'patientNotifications' : 'doctorNotifications';
      const notifications = JSON.parse(localStorage.getItem(key) || '[]');

      const updatedNotifications = notifications.map(notif =>
        (userType === 'patient' && notif.phone === userId) ||
        (userType === 'doctor' && notif.doctorId === userId)
          ? { ...notif, isRead: true }
          : notif
      );

      localStorage.setItem(key, JSON.stringify(updatedNotifications));
      return true;
    }
  }
};
