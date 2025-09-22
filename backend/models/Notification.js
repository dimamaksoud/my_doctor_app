// server/models/Notification.js
const { query } = require('../config/database');

class Notification {
  // إنشاء إشعار جديد
  static async create(notificationData) {
    const {
      user_id,
      user_type,
      title,
      message,
      type = 'info',
      related_appointment_id = null
    } = notificationData;

    const sql = `
      INSERT INTO notifications (
        user_id, user_type, title, message, type, related_appointment_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const values = [
      user_id,
      user_type,
      title,
      message,
      type,
      related_appointment_id
    ];

    try {
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // الحصول على إشعارات المستخدم
  static async findByUser(user_id, user_type, filters = {}) {
    let sql = `
      SELECT * FROM notifications
      WHERE user_id = $1 AND user_type = $2
    `;

    const values = [user_id, user_type];
    let paramCount = 3;

    if (filters.is_read !== undefined) {
      sql += ` AND is_read = $${paramCount}`;
      values.push(filters.is_read);
      paramCount++;
    }

    if (filters.type) {
      sql += ` AND type = $${paramCount}`;
      values.push(filters.type);
      paramCount++;
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    try {
      const result = await query(sql, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding notifications: ${error.message}`);
    }
  }
  // تحديث حالة القراءة
  static async markAsRead(notification_id) {
    const sql = `
      UPDATE notifications
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE notification_id = $1
      RETURNING *
    `;

    try {
      const result = await query(sql, [notification_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  // تحديد جميع الإشعارات كمقروءة
  static async markAllAsRead(user_id, user_type) {
    const sql = `
      UPDATE notifications
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND user_type = $2 AND is_read = false
      RETURNING *
    `;

    try {
      const result = await query(sql, [user_id, user_type]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  // الحصول على عدد الإشعارات غير المقروءة
  static async getUnreadCount(user_id, user_type) {
    const sql = `
      SELECT COUNT(*) FROM notifications
      WHERE user_id = $1 AND user_type = $2 AND is_read = false
    `;

    try {
      const result = await query(sql, [user_id, user_type]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`Error getting unread count: ${error.message}`);
    }
  }

  // حذف إشعار
  static async delete(notification_id) {
    const sql = 'DELETE FROM notifications WHERE notification_id = $1 RETURNING *';

    try {
      const result = await query(sql, [notification_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }
}

module.exports = Notification;
