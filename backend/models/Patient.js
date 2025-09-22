const { query } = require('../config/database');

class Patient {
  // إنشاء مريض جديد
  static async create(patientData) {
    const {
      first_name,
      father_name,
      last_name,
      phone,
      email,
      date_of_birth,
      notes
    } = patientData;

    const sql = `
      INSERT INTO patients (
        first_name, father_name, last_name, phone, email, date_of_birth, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      first_name,
      father_name,
      last_name,
      phone,
      email,
      date_of_birth,
      notes
    ];

    try {
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating patient: ${error.message}`);
    }
  }

  // البحث عن مريض بالهاتف
  static async findByPhone(phone) {
    const sql = 'SELECT * FROM patients WHERE phone = $1 AND is_blocked = false';
    try {
      const result = await query(sql, [phone]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding patient by phone: ${error.message}`);
    }
  }

  // البحث عن مريض بالبريد الإلكتروني
  static async findByEmail(email) {
    const sql = 'SELECT * FROM patients WHERE email = $1 AND is_blocked = false';
    try {
      const result = await query(sql, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding patient by email: ${error.message}`);
    }
  }

  // الحصول على مريض بالID
  static async findById(patient_id) {
    const sql = 'SELECT * FROM patients WHERE patient_id = $1 AND is_blocked = false';
    try {
      const result = await query(sql, [patient_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding patient by ID: ${error.message}`);
    }
  }

  // البحث عن مرضى بالاسم
  static async findByName(name) {
    const sql = `
      SELECT * FROM patients
      WHERE (first_name ILIKE $1 OR last_name ILIKE $1)
      AND is_blocked = false
      ORDER BY first_name, last_name
    `;
    try {
      const result = await query(sql, [`%${name}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding patients by name: ${error.message}`);
    }
  }

  // تحديث بيانات المريض
  static async update(patient_id, updateData) {
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

    values.push(patient_id);
    const sql = `
      UPDATE patients
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating patient: ${error.message}`);
    }
  }

  // حظر مريض
  static async blockPatient(patient_id) {
    const sql = `
      UPDATE patients
      SET is_blocked = true, updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = $1
      RETURNING *
    `;

    try {
      const result = await query(sql, [patient_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error blocking patient: ${error.message}`);
    }
  }

  // فك حظر مريض
  static async unblockPatient(patient_id) {
    const sql = `
      UPDATE patients
      SET is_blocked = false, updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = $1
      RETURNING *
    `;

    try {
      const result = await query(sql, [patient_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error unblocking patient: ${error.message}`);
    }
  }

  // زيادة عداد الغياب
  static async incrementNoShowCount(patient_id) {
    const sql = `
      UPDATE patients
      SET no_show_count = no_show_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = $1
      RETURNING *
    `;

    try {
      const result = await query(sql, [patient_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error incrementing no-show count: ${error.message}`);
    }
  }

  // الحصول على جميع المرضى
  static async findAll(limit = 50, offset = 0) {
    const sql = `
      SELECT * FROM patients
      WHERE is_blocked = false
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    try {
      const result = await query(sql, [limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding all patients: ${error.message}`);
    }
  }
}

module.exports = Patient;
