// models/WorkSchedule.js
const { query } = require('../config/database');

class WorkSchedule {
  // الحصول على جدول عمل الطبيب مع العيادات
  static async findByDoctor(doctor_id, clinic_id = null) {
    let sql = `
      SELECT ws.*, c.name as clinic_name, c.address as clinic_address
      FROM work_schedules ws
      LEFT JOIN clinics c ON ws.clinic_id = c.clinic_id
      WHERE ws.doctor_id = $1
    `;

    const values = [doctor_id];

    if (clinic_id) {
      sql += ' AND ws.clinic_id = $2';
      values.push(clinic_id);
    }

    sql += ' ORDER BY ws.day_of_week, ws.start_time';

    try {
      const result = await query(sql, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding work schedule: ${error.message}`);
    }
  }

  // تحديث جدول العمل مع العيادات
  static async bulkUpsert(doctor_id, schedules) {
    const client = await query.getClient();

    try {
      await client.query('BEGIN');

      // حذف الجدول القديم للطبيب
      await client.query('DELETE FROM work_schedules WHERE doctor_id = $1', [doctor_id]);

      // إدخال الجدول الجديد
      for (const schedule of schedules) {
        const insertSql = `
          INSERT INTO work_schedules
            (doctor_id, clinic_id, day_of_week, start_time, end_time, is_working)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await client.query(insertSql, [
          doctor_id,
          schedule.clinic_id,
          schedule.day_of_week,
          schedule.start_time,
          schedule.end_time,
          schedule.is_working !== false
        ]);
      }

      await client.query('COMMIT');

      // إرجاع الجدول المحدث
      const result = await this.findByDoctor(doctor_id);
      return result;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = WorkSchedule;
