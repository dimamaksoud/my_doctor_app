const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// إنشاء موعد جديد
const createAppointment = async (req, res, next) => {
  try {
    const {
      doctor_id,
      patient_id,
      appointment_date,
      start_time,
      end_time,
      notes
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!doctor_id || !patient_id || !appointment_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول المطلوبة يجب ملؤها'
      });
    }

    // التحقق من عدم وجود تعارض في المواعيد
    const existingAppointments = await Appointment.findByDoctor(doctor_id, {
      date: appointment_date
    });

    const hasConflict = existingAppointments.some(apt =>
      apt.status !== 'cancelled' &&
      ((start_time >= apt.start_time && start_time < apt.end_time) ||
       (end_time > apt.start_time && end_time <= apt.end_time) ||
       (start_time <= apt.start_time && end_time >= apt.end_time))
    );

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'هناك تعارض في المواعيد'
      });
    }

    // إنشاء الموعد
    const appointmentData = {
      doctor_id,
      patient_id,
      appointment_date,
      start_time,
      end_time,
      notes
    };

    const newAppointment = await Appointment.create(appointmentData);

    // إرسال إشعار للطبيب
    await Notification.create({
      user_id: doctor_id,
      user_type: 'doctor',
      title: 'موعد جديد',
      message: `تم حجز موعد جديد ل${newAppointment.patient_first_name} في ${appointment_date} الساعة ${start_time}`,
      type: 'info',
      related_appointment_id: newAppointment.appointment_id
    });

    res.status(201).json({
      success: true,
      message: 'تم حجز الموعد بنجاح',
      data: {
        appointment: newAppointment
      }
    });

  } catch (error) {
    next(error);
  }
};

// الحصول على مواعيد الطبيب
const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor_id = req.user.doctor_id;
    const { date, status, start_date, end_date, limit = 50 } = req.query;

    const filters = {};
    if (date) filters.date = date;
    if (status) filters.status = status;
    if (start_date && end_date) {
      filters.start_date = start_date;
      filters.end_date = end_date;
    }
    if (limit) filters.limit = parseInt(limit);

    const appointments = await Appointment.findByDoctor(doctor_id, filters);

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

// الحصول على مواعيد المريض
const getPatientAppointments = async (req, res, next) => {
  try {
    const { patient_id } = req.params;
    const { status, start_date, end_date, limit = 50 } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (start_date && end_date) {
      filters.start_date = start_date;
      filters.end_date = end_date;
    }
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

// الحصول على موعد محدد
const getAppointmentById = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;

    const appointment = await Appointment.findById(appointment_id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        appointment
      }
    });

  } catch (error) {
    next(error);
  }
};

// تحديث حالة الموعد
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const { status, cancellation_reason } = req.body;

    if (!['confirmed', 'cancelled', 'completed', 'no_show'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة غير صالحة'
      });
    }

    const updatedAppointment = await Appointment.updateStatus(
      appointment_id,
      status,
      cancellation_reason
    );

    // إرسال إشعار للمريض
    await Notification.create({
      user_id: updatedAppointment.patient_id,
      user_type: 'patient',
      title: `تحديث حالة الموعد - ${status === 'confirmed' ? 'تم التأكيد' : 'تم الإلغاء'}`,
      message: `تم ${status === 'confirmed' ? 'تأكيد' : 'إلغاء'} موعدك المحدد في ${updatedAppointment.appointment_date}`,
      type: status === 'confirmed' ? 'success' : 'warning',
      related_appointment_id: appointment_id
    });

    res.status(200).json({
      success: true,
      message: 'تم تحديث حالة الموعد بنجاح',
      data: {
        appointment: updatedAppointment
      }
    });

  } catch (error) {
    next(error);
  }
};

// الحصول على المواعيد المتاحة
const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'التاريخ مطلوب'
      });
    }

    const slots = await Appointment.getAvailableSlots(doctor_id, date);

    // تحويل البيانات إلى تنسيق مناسب
    const availableSlots = slots.map(slot => ({
      startTime: slot.start_time,
      endTime: slot.end_time,
      isAvailable: !slot.booked_start // إذا لم يكن هناك booked_start فهو متاح
    }));

    res.status(200).json({
      success: true,
      data: {
        date,
        availableSlots
      }
    });

  } catch (error) {
    next(error);
  }
};

// حذف موعد
const deleteAppointment = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;

    const deletedAppointment = await Appointment.delete(appointment_id);

    if (!deletedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف الموعد بنجاح',
      data: {
        appointment: deletedAppointment
      }
    });

  } catch (error) {
    next(error);
  }
};
// controllers/appointmentController.js - إضافة دالة جديدة
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, clinicId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطبيب والتاريخ مطلوبان'
      });
    }

    // الحصول على جدول العمل للطبيب في هذا اليوم
    const dayOfWeek = new Date(date).getDay();

    const scheduleSql = `
      SELECT ws.*, c.name as clinic_name, c.address as clinic_address
      FROM work_schedules ws
      LEFT JOIN clinics c ON ws.clinic_id = c.clinic_id
      WHERE ws.doctor_id = $1
        AND ws.day_of_week = $2
        AND ws.is_working = true
        ${clinicId ? 'AND ws.clinic_id = $3' : ''}
    `;

    const scheduleParams = clinicId ? [doctorId, dayOfWeek, clinicId] : [doctorId, dayOfWeek];
    const scheduleResult = await db.query(scheduleSql, scheduleParams);

    if (scheduleResult.rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'لا يوجد جدول عمل لهذا اليوم'
      });
    }

    // الحصول على المواعيد المحجوزة
    const appointmentsSql = `
      SELECT start_time, end_time
      FROM appointments
      WHERE doctor_id = $1
        AND appointment_date = $2
        AND status IN ('confirmed', 'pending')
        ${clinicId ? 'AND clinic_id = $3' : ''}
    `;

    const appointmentParams = clinicId ? [doctorId, date, clinicId] : [doctorId, date];
    const appointmentsResult = await db.query(appointmentsSql, appointmentParams);

    // إنشاء المواعيد المتاحة
    const availableSlots = [];

    for (const workSchedule of scheduleResult.rows) {
      const start = new Date(`1970-01-01T${workSchedule.start_time}`);
      const end = new Date(`1970-01-01T${workSchedule.end_time}`);

      // إنشاء slots كل 30 دقيقة
      for (let time = start; time < end; time.setMinutes(time.getMinutes() + 30)) {
        const slotTime = time.toTimeString().slice(0, 5);

        // التحقق إذا كان Slot محجوز
        const isBooked = appointmentsResult.rows.some(apt =>
          apt.start_time <= slotTime && apt.end_time > slotTime
        );

        if (!isBooked) {
          availableSlots.push({
            startTime: slotTime,
            endTime: new Date(time.getTime() + 30 * 60000).toTimeString().slice(0, 5),
            clinic_id: workSchedule.clinic_id,
            clinic_name: workSchedule.clinic_name,
            clinic_address: workSchedule.clinic_address,
            isAvailable: true
          });
        }
      }
    }

    res.json({
      success: true,
      data: availableSlots
    });

  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب المواعيد المتاحة'
    });
  }
};
module.exports = {
  createAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAvailableSlots,
  deleteAppointment
};
