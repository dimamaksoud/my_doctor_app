// models/Clinic.js
const { query } = require('../config/database');

class Clinic {
  // إنشاء عيادة جديدة
  static async create(clinicData) {
    const {
      doctor_id,
      name,
      address,
      city,
      country,
      phone,
      lat,
      lng
    } = clinicData;

    const sql = `
      INSERT INTO clinics
        (doctor_id, name, address, city, country, phone, lat, lng)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [doctor_id, name, address, city, country, phone, lat, lng];

    try {
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating clinic: ${error.message}`);
    }
  }

  // الحصول على عيادات الطبيب
  static async findByDoctor(doctor_id) {
    const sql = 'SELECT * FROM clinics WHERE doctor_id = $1 AND is_active = true ORDER BY name';

    try {
      const result = await query(sql, [doctor_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding clinics by doctor: ${error.message}`);
    }
  }

  // تحديث عيادة
  static async update(clinic_id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(clinic_id);
    const sql = `
      UPDATE clinics
      SET ${fields.join(', ')}
      WHERE clinic_id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating clinic: ${error.message}`);
    }
  }
}

module.exports = Clinic;
