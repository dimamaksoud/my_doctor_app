const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// إنشاء مريض جديد
const createPatient = async (req, res, next) => {
  try {
    const {
      first_name,
      father_name,
      last_name,
      phone,
      email,
      date_of_birth,
      notes
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!first_name || !last_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'الاسم الأول واسم العائلة ورقم الهاتف مطلوبة'
      });
    }

    // التحقق من عدم وجود مريض بنفس رقم الهاتف
    const existingPatient = await Patient.findByPhone(phone);
    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: 'رقم الهاتف مسجل مسبقاً'
      });
    }

    // إنشاء المريض
    const patientData = {
      first_name,
      father_name,
      last_name,
      phone,
      email,
      date_of_birth,
      notes
    };

    const newPatient = await Patient.create(patientData);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المريض بنجاح',
      data: {
        patient: newPatient
      }
    });

  } catch (error) {
    next(error);
  }
};

// البحث عن مرضى بالاسم
const searchPatientsByName = async (req, res, next) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'اسم البحث مطلوب'
      });
    }

    const patients = await Patient.findByName(name);

    res.status(200).json({
      success: true,
      data: {
        patients,
        count: patients.length
      }
    });

  } catch (error) {
    next(error);
  }
};

// الحصول على مريض محدد
const getPatientById = async (req, res, next) => {
  try {
    const { patient_id } = req.params;

    const patient = await Patient.findById(patient_id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'المريض غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        patient
      }
    });

  } catch (error) {
    next(error);
  }
};

// الحصول على مواعيد المريض
const getPatientAppointments = async (req, res, next) => {
  try {
    const { patient_id } = req.params;
    const { status, limit = 50 } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);

    const appointments = await Appointment.findByPatient(patient_id, filters);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        count: appointments.length
      }
    });

  } catch (error) {
    next(error);
  }
};

// تحديث بيانات المريض
const updatePatient = async (req, res, next) => {
  try {
    const { patient_id } = req.params;
    const updateData = req.body;

    const updatedPatient = await Patient.update(patient_id, updateData);

    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات المريض بنجاح',
      data: {
        patient: updatedPatient
      }
    });

  } catch (error) {
    next(error);
  }
};

// حظر مريض
const blockPatient = async (req, res, next) => {
  try {
    const { patient_id } = req.params;
    const { reason } = req.body;

    const blockedPatient = await Patient.blockPatient(patient_id);

    res.status(200).json({
      success: true,
      message: `تم حظر المريض ${reason ? 'بسبب: ' + reason : ''}`,
      data: {
        patient: blockedPatient
      }
    });

  } catch (error) {
    next(error);
  }
};

// فك حظر مريض
const unblockPatient = async (req, res, next) => {
  try {
    const { patient_id } = req.params;

    const unblockedPatient = await Patient.unblockPatient(patient_id);

    res.status(200).json({
      success: true,
      message: 'تم فك حظر المريض بنجاح',
      data: {
        patient: unblockedPatient
      }
    });

  } catch (error) {
    next(error);
  }
};

// الحصول على جميع المرضى
const getAllPatients = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const patients = await Patient.findAll(parseInt(limit), parseInt(offset));

    res.status(200).json({
      success: true,
      data: {
        patients,
        count: patients.length
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  searchPatientsByName,
  getPatientById,
  getPatientAppointments,
  updatePatient,
  blockPatient,
  unblockPatient,
  getAllPatients
};
