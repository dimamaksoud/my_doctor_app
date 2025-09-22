// routes/appointments.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { authenticate } = require('../middleware/auth');

// الحصول على المواعيد المتاحة للطبيب
router.get('/available-slots', async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطبيب والتاريخ مطلوبان'
      });
    }

    const availableSlots = await Appointment.getAvailableSlots(doctorId, date);

    // تحويل البيانات إلى التنسيق المطلوب من قبل العميل
    const formattedSlots = availableSlots
      .filter(slot => slot.is_working && !slot.booked_start)
      .map(slot => ({
        startTime: slot.start_time,
        endTime: slot.end_time,
        isAvailable: true
      }));

    res.json({
      success: true,
      data: formattedSlots
    });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب المواعيد المتاحة'
    });
  }
});

// حجز موعد جديد
router.post('/book', async (req, res) => {
  try {
    const {
      doctorId,
      patientName,
      patientPhone,
      appointmentDate,
      startTime,
      endTime,
      notes
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!doctorId || !patientName || !patientPhone || !appointmentDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }

    // التحقق من أن الموعد لا يزال متاحاً
    const checkQuery = `
      SELECT 1 FROM appointments
      WHERE doctor_id = $1
        AND appointment_date = $2
        AND start_time = $3
        AND status IN ('confirmed', 'pending')
    `;

    const checkResult = await db.query(checkQuery, [doctorId, appointmentDate, startTime]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'هذا الموعد لم يعد متاحاً'
      });
    }

    // البحث عن المريض أو إنشاء جديد
    let patient = await Patient.findByPhone(patientPhone);

    if (!patient) {
      // إنشاء مريض جديد
      patient = await Patient.create({
        first_name: patientName.split(' ')[0] || patientName,
        last_name: patientName.split(' ').slice(1).join(' ') || 'غير معروف',
        phone: patientPhone,
        notes: 'تم الإنشاء تلقائياً من خلال حجز موعد'
      });
    }

    // إنشاء الموعد
    const appointment = await Appointment.create({
      doctor_id: doctorId,
      patient_id: patient.patient_id,
      appointment_date: appointmentDate,
      start_time: startTime,
      end_time: endTime,
      status: 'pending',
      notes: notes || `حجز تلقائي - ${patientName} - ${patientPhone}`
    });

    // جلب بيانات الموعد الكاملة
    const fullAppointment = await Appointment.findById(appointment.appointment_id);

    res.json({
      success: true,
      message: 'تم حجز الموعد بنجاح',
      data: fullAppointment
    });

  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في حجز الموعد'
    });
  }
});

// الحصول على مواعيد الطبيب
router.get('/doctor/:doctorId', authenticate, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, status, start_date, end_date, limit } = req.query;

    const filters = {};
    if (date) filters.date = date;
    if (status) filters.status = status;
    if (start_date && end_date) {
      filters.start_date = start_date;
      filters.end_date = end_date;
    }
    if (limit) filters.limit = parseInt(limit);

    const appointments = await Appointment.findByDoctor(doctorId, filters);

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب مواعيد الطبيب'
    });
  }
});

// تأكيد الموعد
router.put('/:appointmentId/confirm', authenticate, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.updateStatus(appointmentId, 'confirmed');

    res.json({
      success: true,
      message: 'تم تأكيد الموعد بنجاح',
      data: appointment
    });

  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تأكيد الموعد'
    });
  }
});

// إلغاء الموعد
router.put('/:appointmentId/cancel', authenticate, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.updateStatus(appointmentId, 'cancelled', reason);

    res.json({
      success: true,
      message: 'تم إلغاء الموعد بنجاح',
      data: appointment
    });

  } catch (error) {
    console.error('Error canceling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إلغاء الموعد'
    });
  }
});

// الحصول على تفاصيل موعد
router.get('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود'
      });
    }

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات الموعد'
    });
  }
});

// حذف موعد
router.delete('/:appointmentId', authenticate, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.delete(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الموعد بنجاح',
      data: appointment
    });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في حذف الموعد'
    });
  }
});


// في routes/appointments.js - إضافة endpoint للإدارة
// إدارة المواعيد (للأطباء فقط)
router.post('/manage', authenticate, async (req, res) => {
  try {
    const { doctor_id, clinic_id, appointment_date, start_time, end_time, status } = req.body;

    const sql = `
      INSERT INTO appointments
        (doctor_id, clinic_id, appointment_date, start_time, end_time, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(sql, [
      doctor_id, clinic_id, appointment_date, start_time, end_time, status
    ]);

    res.json({
      success: true,
      message: 'تم إنشاء الموعد بنجاح',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء الموعد'
    });
  }
});

// حذف موعد
router.delete('/manage/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const sql = 'DELETE FROM appointments WHERE appointment_id = $1 RETURNING *';
    const result = await db.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الموعد بنجاح',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في حذف الموعد'
    });
  }
});

module.exports = router;
