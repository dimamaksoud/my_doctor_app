const { query } = require('../config/database');

class Doctor {
  // إنشاء طبيب جديد
  static async create(doctorData) {
    const {
      first_name,
      father_name,
      last_name,
      username,
      email,
      password,
      phone_personal,
      phone_clinic,
      specialization,
      qualifications,
      clinic_address,
      clinic_lat,
      clinic_lng,
      profile_image_url
    } = doctorData;

    const sql = `
      INSERT INTO doctors (
        first_name, father_name, last_name, username, email, password,
        phone_personal, phone_clinic, specialization, qualifications,
        clinic_address, clinic_lat, clinic_lng, profile_image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      first_name,
      father_name,
      last_name,
      username,
      email,
      password,
      phone_personal,
      phone_clinic,
      specialization,
      qualifications ? JSON.stringify(qualifications) : null,
      clinic_address,
      clinic_lat,
      clinic_lng,
      profile_image_url
    ];

    try {
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating doctor: ${error.message}`);
    }
  }

  // البحث عن طبيب بالبريد الإلكتروني
  static async findByEmail(email) {
    const sql = 'SELECT * FROM doctors WHERE email = $1 AND is_active = true';
    try {
      const result = await query(sql, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding doctor by email: ${error.message}`);
    }
  }

  // البحث عن طبيب بالاسم المستخدم (يدعم الفراغات)
  static async findByUsername(username) {
    // إزالة الفراغات الزائدة للبحث
    const cleanUsername = username.replace(/\s+/g, ' ').trim();

    const sql = `
      SELECT * FROM doctors
      WHERE REPLACE(username, ' ', '') = REPLACE($1, ' ', '')
      AND is_active = true
    `;

    try {
      const result = await query(sql, [cleanUsername]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding doctor by username: ${error.message}`);
    }
  }

  // الحصول على طبيب بالID
  static async findById(doctor_id) {
    const sql = 'SELECT * FROM doctors WHERE doctor_id = $1 AND is_active = true';
    try {
      const result = await query(sql, [doctor_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding doctor by ID: ${error.message}`);
    }
  }

  // تحديث بيانات الطبيب
  static async update(doctor_id, updateData) {
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

    values.push(doctor_id);
    const sql = `
      UPDATE doctors
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE doctor_id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating doctor: ${error.message}`);
    }
  }

  // حذف طبيب (soft delete)
  static async delete(doctor_id) {
    const sql = `
      UPDATE doctors
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE doctor_id = $1
      RETURNING *
    `;

    try {
      const result = await query(sql, [doctor_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting doctor: ${error.message}`);
    }
  }

  // في models/Doctor.js - أضف هذه الدالة
  static async findAllWithFilters(filters = {}) {
    const { specialization, name, location, limit = 50, offset = 0 } = filters;

    let sql = `
      SELECT
        doctor_id,
        first_name,
        father_name,
        last_name,
        username,
        email,
        phone_personal,
        phone_clinic,
        specialization,
        qualifications,
        clinic_address,
        clinic_lat,
        clinic_lng,
        profile_image_url,
        is_active,
        created_at
      FROM doctors
      WHERE is_active = true
    `;

    const values = [];
    let paramCount = 1;

    // تطبيق الفلاتر
    if (specialization) {
      sql += ` AND specialization ILIKE $${paramCount}`;
      values.push(`%${specialization}%`);
      paramCount++;
    }

    if (name) {
      sql += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      values.push(`%${name}%`);
      paramCount++;
    }

    if (location) {
      sql += ` AND clinic_address ILIKE $${paramCount}`;
      values.push(`%${location}%`);
      paramCount++;
    }

    sql += ' ORDER BY first_name, last_name';
    sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), parseInt(offset));

    try {
      const result = await query(sql, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding doctors with filters: ${error.message}`);
    }
  }

  // وأضف هذه الدالة للحصول على العدد
  static async countWithFilters(filters = {}) {
    const { specialization, name, location } = filters;

    let sql = `SELECT COUNT(*) FROM doctors WHERE is_active = true`;
    const values = [];
    let paramCount = 1;

    if (specialization) {
      sql += ` AND specialization ILIKE $${paramCount}`;
      values.push(`%${specialization}%`);
      paramCount++;
    }

    if (name) {
      sql += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      values.push(`%${name}%`);
      paramCount++;
    }

    if (location) {
      sql += ` AND clinic_address ILIKE $${paramCount}`;
      values.push(`%${location}%`);
      paramCount++;
    }

    try {
      const result = await query(sql, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`Error counting doctors: ${error.message}`);
    }
  }
  // الحصول على جميع الأطباء
  static async findAll(limit = 50, offset = 0) {
    const sql = `
      SELECT * FROM doctors
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    try {
      const result = await query(sql, [limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding all doctors: ${error.message}`);
    }
  }
}

module.exports = Doctor;
