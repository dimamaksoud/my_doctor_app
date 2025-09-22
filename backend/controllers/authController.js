const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const db = require('../config/database'); // تأكد من المسار الصحيح

const loginDoctor = async (req, res) => {
  try {
    console.log('🔐 [LOGIN] طلب تسجيل دخول received:', req.body);

    const { username, password } = req.body;

    // 1. التحقق من وجود البيانات
    if (!username || !password) {
      console.log('❌ [LOGIN] بيانات ناقصة');
      return res.status(400).json({
        success: false,
        message: 'اسم المستخدم وكلمة المرور مطلوبان'
      });
    }

    console.log('🔍 [LOGIN] البحث عن:', username);

    // 2. البحث في قاعدة البيانات
    const query = `
      SELECT doctor_id, first_name, father_name, last_name,
             email, phone_personal, phone_clinic, specialization,
             qualifications, clinic_address, profile_image_url, password
      FROM doctors
      WHERE username = $1 AND is_active = true
    `;

    const result = await db.query(query, [username]);
    console.log('📊 [LOGIN] نتائج البحث:', result.rows);

    if (result.rows.length === 0) {
      console.log('❌ [LOGIN] لم يتم العثور على مستخدم');
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    const doctor = result.rows[0];
    console.log('✅ [LOGIN] تم العثور على الطبيب:', doctor.first_name);

    // 3. التحقق من كلمة المرور
    if (doctor.password !== password) {
      console.log('❌ [LOGIN] كلمة المرور غير صحيحة');
      console.log('🔑 المدخل:', password, 'المخزنة:', doctor.password);
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    // 4. إزالة كلمة المرور من البيانات المرتجعة
    delete doctor.password;

    console.log('🎯 [LOGIN] تسجيل دخول ناجح ل:', doctor.first_name);

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: doctor
    });

  } catch (error) {
    console.error('💥 [LOGIN] خطأ في تسجيل الدخول:', error);
    console.error('💥 [LOGIN] Stack trace:', error.stack);

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول'
    });
  }
};
// تسجيل طبيب جديد (بدون تشفير كلمة المرور)
const registerDoctor = async (req, res, next) => {
  try {
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
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!first_name || !last_name || !username || !email || !password || !phone_clinic || !specialization || !clinic_address) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول المطلوبة يجب ملؤها'
      });
    }

    // التحقق من عدم وجود طبيب بنفس البريد أو اسم المستخدم
    const existingDoctorByEmail = await Doctor.findByEmail(email);
    const existingDoctorByUsername = await Doctor.findByUsername(username);

    if (existingDoctorByEmail) {
      return res.status(409).json({
        success: false,
        message: 'هذا البريد الإلكتروني مسجل مسبقاً'
      });
    }

    if (existingDoctorByUsername) {
      return res.status(409).json({
        success: false,
        message: 'اسم المستخدم هذا مسجل مسبقاً'
      });
    }

    // استخدام كلمة المرور كما هي بدون تشفير

    // إنشاء الطبيب
    const doctorData = {
      first_name,
      father_name,
      last_name,
      username,
      email,
      password, // استخدام حقل password بدلاً من password_hash
      phone_personal,
      phone_clinic,
      specialization,
      qualifications,
      clinic_address,
      clinic_lat,
      clinic_lng,
      profile_image_url
    };

    const newDoctor = await Doctor.create(doctorData);

    // إنشاء token
    const token = jwt.sign(
      {
        doctor_id: newDoctor.doctor_id,
        email: newDoctor.email,
        user_type: 'doctor'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // إرجاع البيانات بدون كلمة المرور
    const { password: _, ...doctorWithoutPassword } = newDoctor;

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        doctor: doctorWithoutPassword,
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

// الحصول على بيانات الطبيب الحالي
const getCurrentDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.user.doctor_id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود'
      });
    }

    // إرجاع البيانات بدون كلمة المرور
    const { password, ...doctorWithoutPassword } = doctor;

    res.status(200).json({
      success: true,
      data: {
        doctor: doctorWithoutPassword
      }
    });

  } catch (error) {
    next(error);
  }
};

// تحديث بيانات الطبيب
const updateDoctor = async (req, res, next) => {
  try {
    const doctor_id = req.user.doctor_id;
    const updateData = req.body;

    // منع تحديث بعض الحقول
    delete updateData.password;
    delete updateData.email;
    delete updateData.username;

    const updatedDoctor = await Doctor.update(doctor_id, updateData);

    // إرجاع البيانات بدون كلمة المرور
    const { password, ...doctorWithoutPassword } = updatedDoctor;

    res.status(200).json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      data: {
        doctor: doctorWithoutPassword
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginDoctor,
  registerDoctor,
  getCurrentDoctor,
  updateDoctor
};
