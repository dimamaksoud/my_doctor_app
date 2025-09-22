const { query } = require('../config/database');

class AppointmentSetting {
  // إنشاء أو تحديث إعدادات المواعيد
  static async upsert(doctor_id, settingData) {
    const {
      slot_interval,
      cancellation_deadline_hours,
      max_daily_appointments,
      max_no_show_count,
      work_schedule
    } = settingData;

    // التحقق من وجود إعدادات سابقة
    const existingSettings = await this.findByDoctor(doctor_id);

    if (existingSettings) {
      // تحديث الإعدادات الموجودة
      const sql = `
        UPDATE appointment_settings
        SET slot_interval = $1, cancellation_deadline_hours = $2,
            max_daily_appointments = $3, max_no_show_count = $4,
            work_schedule = $5, updated_at = CURRENT_TIMESTAMP
        WHERE doctor_id = $6
        RETURNING *
      `;

      const values = [
        slot_interval,
        cancellation_deadline_hours,
        max_daily_appointments,
        max_no_show_count,
        work_schedule ? JSON.stringify(work_schedule) : null,
        doctor_id
      ];

      try {
        const result = await query(sql, values);
        return result.rows[0];
      } catch (error) {
        throw new Error(`Error updating appointment settings: ${error.message}`);
      }
    } else {
      // إنشاء إعدادات جديدة
      const sql = `
        INSERT INTO appointment_settings (
          doctor_id, slot_interval, cancellation_deadline_hours,
          max_daily_appointments, max_no_show_count, work_schedule
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        doctor_id,
        slot_interval,
        cancellation_deadline_hours,
        max_daily_appointments,
        max_no_show_count,
        work_schedule ? JSON.stringify(work_schedule) : null
      ];

      try {
        const result = await query(sql, values);
        return result.rows[0];
      } catch (error) {
        throw new Error(`Error creating appointment settings: ${error.message}`);
      }
    }
  }

  // الحصول على إعدادات الطبيب
  static async findByDoctor(doctor_id) {
    const sql = 'SELECT * FROM appointment_settings WHERE doctor_id = $1';
    try {
      const result = await query(sql, [doctor_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding appointment settings: ${error.message}`);
    }
  }

  // الحصول على الإعداد الافتراضي
  static getDefaultSettings() {
    return {
      slot_interval: 30,
      cancellation_deadline_hours: 18,
      max_daily_appointments: 20,
      max_no_show_count: 3,
      work_schedule: null
    };
  }
}

module.exports = AppointmentSetting;
