// server/controllers/notificationController.js
const Notification = require('../models/Notification');

// الحصول على إشعارات المستخدم
const getUserNotifications = async (req, res, next) => {
  try {
    const user_id = req.user.doctor_id || req.user.patient_id;
    const user_type = req.user.doctor_id ? 'doctor' : 'patient';
    const { is_read, type, limit = 20 } = req.query;

    const filters = {};
    if (is_read !== undefined) filters.is_read = is_read === 'true';
    if (type) filters.type = type;
    if (limit) filters.limit = parseInt(limit);

    const notifications = await Notification.findByUser(user_id, user_type, filters);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        count: notifications.length
      }
    });

  } catch (error) {
    next(error);
  }
};

// إرسال إشعار للمريض (وظيفة جديدة)
const sendPatientNotification = async (req, res, next) => {
  try {
    const { phone, title, message, type } = req.body;

    const notification = await Notification.create({
      user_id: phone,
      user_type: 'patient',
      title,
      message,
      type
    });

    res.status(201).json({
      success: true,
      data: { notification }
    });

  } catch (error) {
    next(error);
  }
};

// الحصول على إشعارات المريض بالرقم (وظيفة جديدة)
const getPatientNotificationsByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const { is_read, type, limit = 20 } = req.query;

    const filters = {};
    if (is_read !== undefined) filters.is_read = is_read === 'true';
    if (type) filters.type = type;
    if (limit) filters.limit = parseInt(limit);

    const notifications = await Notification.findByUser(phone, 'patient', filters);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        count: notifications.length
      }
    });

  } catch (error) {
    next(error);
  }
};

// الباقي كما هو مع تعديلات طفيفة
const markNotificationAsRead = async (req, res, next) => {
  try {
    const { notification_id } = req.params;
    const { userType } = req.body;

    const updatedNotification = await Notification.markAsRead(notification_id);

    res.status(200).json({
      success: true,
      message: 'تم تحديد الإشعار كمقروء',
      data: {
        notification: updatedNotification
      }
    });

  } catch (error) {
    next(error);
  }
};

const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const { userType, userId } = req.body;

    const updatedNotifications = await Notification.markAllAsRead(userId, userType);

    res.status(200).json({
      success: true,
      message: 'تم تحديد جميع الإشعارات كمقروءة',
      data: {
        count: updatedNotifications.length
      }
    });

  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const user_id = req.user.doctor_id || req.user.patient_id;
    const user_type = req.user.doctor_id ? 'doctor' : 'patient';

    const count = await Notification.getUnreadCount(user_id, user_type);

    res.status(200).json({
      success: true,
      data: {
        unread_count: count
      }
    });

  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { notification_id } = req.params;

    const deletedNotification = await Notification.delete(notification_id);

    res.status(200).json({
      success: true,
      message: 'تم حذف الإشعار بنجاح',
      data: {
        notification: deletedNotification
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  sendPatientNotification,
  getPatientNotificationsByPhone,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification
};
