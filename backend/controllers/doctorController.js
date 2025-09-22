// controllers/doctorController.js
const Doctor = require('../models/Doctor');
const AppointmentSetting = require('../models/AppointmentSetting');
const WorkSchedule = require('../models/WorkSchedule');
const db = require('../config/database');

// الحصول على جميع الأطباء مع دعم الفلاتر
const getAllDoctors = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, specialization, name, location } = req.query;

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

    const result = await db.query(sql, values);

    // الحصول على العدد الكلي للنتائج
    let countSql = `SELECT COUNT(*) FROM doctors WHERE is_active = true`;
    const countValues = [];
    let countParam = 1;

    if (specialization) {
      countSql += ` AND specialization ILIKE $${countParam}`;
      countValues.push(`%${specialization}%`);
      countParam++;
    }

    if (name) {
      countSql += ` AND (first_name ILIKE $${countParam} OR last_name ILIKE $${countParam})`;
      countValues.push(`%${name}%`);
      countParam++;
    }

    if (location) {
      countSql += ` AND clinic_address ILIKE $${countParam}`;
      countValues.push(`%${location}%`);
      countParam++;
    }

    const countResult = await db.query(countSql, countValues);
    const totalCount = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });

  } catch (error) {
    console.error('Error in getAllDoctors:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب قائمة الأطباء'
    });
  }
};

// الحصول على طبيب محدد
const getDoctorById = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;

    const doctor = await Doctor.findById(doctor_id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });

  } catch (error) {
    console.error('Error in getDoctorById:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات الطبيب'
    });
  }
};

// الحصول على إعدادات الطبيب
const getDoctorSettings = async (req, res, next) => {
  try {
    const doctor_id = req.user.doctor_id;

    let settings = await AppointmentSetting.findByDoctor(doctor_id);

    // إذا لم يكن هناك إعدادات، إرجاع الإعدادات الافتراضية
    if (!settings) {
      settings = {
        slot_interval: 30,
        cancellation_deadline_hours: 24,
        max_daily_appointments: 20,
        max_no_show_count: 3,
        work_schedule: {}
      };
    }

    res.status(200).json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error in getDoctorSettings:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب إعدادات الطبيب'
    });
  }
};

// تحديث إعدادات الطبيب
const updateDoctorSettings = async (req, res, next) => {
  try {
    const doctor_id = req.user.doctor_id;
    const settingData = req.body;

    // التحقق من البيانات المطلوبة
    if (!settingData.slot_interval || !settingData.cancellation_deadline_hours) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }

    // حفظ الإعدادات في الجدول
    const sql = `
      INSERT INTO appointment_settings
        (doctor_id, slot_interval, cancellation_deadline_hours,
         max_daily_appointments, max_no_show_count, work_schedule)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (doctor_id)
      DO UPDATE SET
        slot_interval = EXCLUDED.slot_interval,
        cancellation_deadline_hours = EXCLUDED.cancellation_deadline_hours,
        max_daily_appointments = EXCLUDED.max_daily_appointments,
        max_no_show_count = EXCLUDED.max_no_show_count,
        work_schedule = EXCLUDED.work_schedule,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      doctor_id,
      settingData.slot_interval,
      settingData.cancellation_deadline_hours,
      settingData.max_daily_appointments || 20,
      settingData.max_no_show_count || 3,
      JSON.stringify(settingData.work_schedule || {})
    ];

    const result = await db.query(sql, values);
    const updatedSettings = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'تم تحديث الإعدادات بنجاح',
      data: updatedSettings
    });

  } catch (error) {
    console.error('Error in updateDoctorSettings:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث الإعدادات'
    });
  }
};

// الحصول على جدول عمل الطبيب
const getWorkSchedule = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;

    const sql = `
      SELECT * FROM work_schedules
      WHERE doctor_id = $1
      ORDER BY day_of_week, start_time
    `;

    const result = await db.query(sql, [doctor_id]);
    const schedules = result.rows;

    res.status(200).json({
      success: true,
      data: schedules
    });

  } catch (error) {
    console.error('Error in getWorkSchedule:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب جدول العمل'
    });
  }
};

// تحديث جدول عمل الطبيب
const updateWorkSchedule = async (req, res, next) => {
  try {
    const doctor_id = req.user.doctor_id;
    const { schedules } = req.body;

    if (!Array.isArray(schedules)) {
      return res.status(400).json({
        success: false,
        message: 'يجب إرسال جدول العمل كمصفوفة'
      });
    }

    // بدء transaction
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // حذف الجدول القديم
      await client.query('DELETE FROM work_schedules WHERE doctor_id = $1', [doctor_id]);

      // إدخال الجدول الجديد
      for (const schedule of schedules) {
        const insertSql = `
          INSERT INTO work_schedules
            (doctor_id, day_of_week, start_time, end_time, is_working)
          VALUES ($1, $2, $3, $4, $5)
        `;

        await client.query(insertSql, [
          doctor_id,
          schedule.day_of_week,
          schedule.start_time,
          schedule.end_time,
          schedule.is_working !== false
        ]);
      }

      await client.query('COMMIT');

      // جلب الجدول المحدث
      const selectSql = `
        SELECT * FROM work_schedules
        WHERE doctor_id = $1
        ORDER BY day_of_week, start_time
      `;

      const result = await client.query(selectSql, [doctor_id]);
      const updatedSchedules = result.rows;

      res.status(200).json({
        success: true,
        message: 'تم تحديث جدول العمل بنجاح',
        data: updatedSchedules
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error in updateWorkSchedule:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث جدول العمل'
    });
  }
};

// البحث عن أطباء حسب التخصص
const searchDoctorsBySpecialization = async (req, res, next) => {
  try {
    const { specialization, limit = 20, offset = 0 } = req.query;

    if (!specialization) {
      return res.status(400).json({
        success: false,
        message: 'التخصص مطلوب للبحث'
      });
    }

    const sql = `
      SELECT
        doctor_id,
        first_name,
        father_name,
        last_name,
        specialization,
        clinic_address,
        phone_clinic,
        profile_image_url,
        is_active
      FROM doctors
      WHERE specialization ILIKE $1
        AND is_active = true
      ORDER BY first_name, last_name
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(sql, [
      `%${specialization}%`,
      parseInt(limit),
      parseInt(offset)
    ]);

    // الحصول على العدد الكلي
    const countSql = `
      SELECT COUNT(*)
      FROM doctors
      WHERE specialization ILIKE $1
        AND is_active = true
    `;

    const countResult = await db.query(countSql, [`%${specialization}%`]);
    const totalCount = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        doctors: result.rows,
        count: result.rows.length,
        total: totalCount,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Error in searchDoctorsBySpecialization:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في البحث عن الأطباء'
    });
  }
};

// إنشاء طبيب جديد (للاستخدام في التسجيل)
const createDoctor = async (req, res, next) => {
  try {
    const doctorData = req.body;

    // التحقق من البيانات المطلوبة
    const requiredFields = ['first_name', 'last_name', 'username', 'email', 'password', 'phone_clinic', 'specialization', 'clinic_address'];
    for (const field of requiredFields) {
      if (!doctorData[field]) {
        return res.status(400).json({
          success: false,
          message: `حقل ${field} مطلوب`
        });
      }
    }

    // التحقق من عدم وجود email مكرر
    const existingDoctor = await Doctor.findByEmail(doctorData.email);
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجل مسبقاً'
      });
    }

    // التحقق من عدم وجود username مكرر
    const existingUsername = await Doctor.findByUsername(doctorData.username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'اسم المستخدم مسجل مسبقاً'
      });
    }

    const newDoctor = await Doctor.create(doctorData);

    // إزالة كلمة المرور من البيانات المرتجعة
    delete newDoctor.password;

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: newDoctor
    });

  } catch (error) {
    console.error('Error in createDoctor:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء الحساب'
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorSettings,
  updateDoctorSettings,
  getWorkSchedule,
  updateWorkSchedule,
  searchDoctorsBySpecialization,
  createDoctor
};
