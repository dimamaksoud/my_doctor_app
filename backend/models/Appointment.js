const { query } = require('../config/database');

class Appointment {
  // إنشاء موعد جديد
  static async create(appointmentData) {
    const {
      doctor_id,
      patient_id,
      appointment_date,
      start_time,
      end_time,
      status = 'pending',
      notes
    } = appointmentData;

    const sql = `
      INSERT INTO appointments (
        doctor_id, patient_id, appointment_date,
        start_time, end_time, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      doctor_id,
      patient_id,
      appointment_date,
      start_time,
      end_time,
      status,
      notes
    ];

    try {
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating appointment: ${error.message}`);
    }
  }

  // الحصول على موعد بالID
  static async findById(appointment_id) {
    const sql = `
      SELECT a.*,
             d.first_name as doctor_first_name,
             d.last_name as doctor_last_name,
             d.specialization as doctor_specialization,
             p.first_name as patient_first_name,
             p.last_name as patient_last_name,
             p.phone as patient_phone
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      WHERE a.appointment_id = $1
    `;

    try {
      const result = await query(sql, [appointment_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding appointment by ID: ${error.message}`);
    }
  }

  // الحصول على مواعيد الطبيب
  static async findByDoctor(doctor_id, filters = {}) {
    let sql = `
      SELECT a.*,
             p.first_name as patient_first_name,
             p.last_name as patient_last_name,
             p.phone as patient_phone
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      WHERE a.doctor_id = $1
    `;

    const values = [doctor_id];
    let paramCount = 2;

    // تطبيق الفلاتر
    if (filters.date) {
      sql += ` AND a.appointment_date = $${paramCount}`;
      values.push(filters.date);
      paramCount++;
    }

    if (filters.status) {
      sql += ` AND a.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.start_date && filters.end_date) {
      sql += ` AND a.appointment_date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      values.push(filters.start_date, filters.end_date);
      paramCount += 2;
    }

    sql += ` ORDER BY a.appointment_date, a.start_time`;

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    try {
      const result = await query(sql, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding appointments by doctor: ${error.message}`);
    }
  }

  // الحصول على مواعيد المريض
  static async findByPatient(patient_id, filters = {}) {
    let sql = `
      SELECT a.*,
             d.first_name as doctor_first_name,
             d.last_name as doctor_last_name,
             d.specialization as doctor_specialization
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
      WHERE a.patient_id = $1
    `;

    const values = [patient_id];
    let paramCount = 2;

    // تطبيق الفلاتر
    if (filters.status) {
      sql += ` AND a.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.start_date && filters.end_date) {
      sql += ` AND a.appointment_date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      values.push(filters.start_date, filters.end_date);
      paramCount += 2;
    }

    sql += ` ORDER BY a.appointment_date DESC, a.start_time DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    try {
      const result = await query(sql, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding appointments by patient: ${error.message}`);
    }
  }

  // تحديث حالة الموعد
  static async updateStatus(appointment_id, status, cancellation_reason = null) {
    const sql = `
      UPDATE appointments
      SET status = $1, cancellation_reason = $2, updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = $3
      RETURNING *
    `;

    try {
      const result = await query(sql, [status, cancellation_reason, appointment_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating appointment status: ${error.message}`);
    }
  }

  // الحصول على المواعيد المتاحة للطبيب
  static async getAvailableSlots(doctor_id, date) {
    const sql = `
      WITH doctor_schedule AS (
        SELECT start_time, end_time, is_working
        FROM work_schedules
        WHERE doctor_id = $1 AND day_of_week = EXTRACT(DOW FROM $2::date)
      ),
      booked_slots AS (
        SELECT start_time, end_time
        FROM appointments
        WHERE doctor_id = $1
          AND appointment_date = $2
          AND status IN ('confirmed', 'pending')
      )
      SELECT ds.start_time, ds.end_time, ds.is_working,
             bs.start_time as booked_start,
             bs.end_time as booked_end
      FROM doctor_schedule ds
      LEFT JOIN booked_slots bs ON ds.start_time = bs.start_time
      WHERE ds.is_working = true
      ORDER BY ds.start_time
    `;

    try {
      const result = await query(sql, [doctor_id, date]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting available slots: ${error.message}`);
    }
  }
  // models/Appointment.js (إضافة دالة جديدة)
  static async createWithPatientInfo(appointmentData) {
    const {
      doctor_id,
      patient_name,
      patient_phone,
      appointment_date,
      start_time,
      end_time,
      status = 'pending',
      notes
    } = appointmentData;

    // البحث عن المريض أو إنشاء جديد
    let patient = await Patient.findByPhone(patient_phone);

    if (!patient) {
      patient = await Patient.create({
        first_name: patient_name.split(' ')[0] || patient_name,
        last_name: patient_name.split(' ').slice(1).join(' ') || 'غير معروف',
        phone: patient_phone,
        notes: 'تم الإنشاء تلقائياً من خلال حجز موعد'
      });
    }

    // إنشاء الموعد
    return await Appointment.create({
      doctor_id,
      patient_id: patient.patient_id,
      appointment_date,
      start_time,
      end_time,
      status,
      notes
    });
  }
  // حذف موعد
  static async delete(appointment_id) {
    const sql = 'DELETE FROM appointments WHERE appointment_id = $1 RETURNING *';

    try {
      const result = await query(sql, [appointment_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting appointment: ${error.message}`);
    }
  }
}

module.exports = Appointment;
