// server/routes/notifications.js
const express = require('express');
const {
  getUserNotifications,
  sendPatientNotification,
  getPatientNotificationsByPhone,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Routes التي تتطلب مصادقة
router.use(authenticate);
router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:notification_id/read', markNotificationAsRead);
router.patch('/read-all', markAllNotificationsAsRead);
router.delete('/:notification_id', deleteNotification);

// Routes خاصة بالمرضاء (لا تتطلب مصادقة المريض، فقط التحقق من الرقم)
router.post('/patient', sendPatientNotification);
router.get('/patient/:phone', getPatientNotificationsByPhone);

module.exports = router;
