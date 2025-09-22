// routes/patients.js
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { authenticate } = require('../middleware/auth');

// البحث عن مريض بالهاتف
router.get('/search/phone', async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مطلوب'
      });
    }

    const patient = await Patient.findByPhone(phone);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على مريض بهذا الرقم'
      });
    }

    res.json({
      success: true,
      data: patient
    });

  } catch (error) {
    console.error('Error searching patient by phone:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في البحث عن المريض'
    });
  }
});

// البحث عن مرضى بالاسم
router.get('/search/name', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'اسم المريض مطلوب'
      });
    }

    const patients = await Patient.findByName(name);

    res.json({
      success: true,
      data: patients
    });

  } catch (error) {
    console.error('Error searching patients by name:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في البحث عن المرضى'
    });
  }
});

// تحديث بيانات المريض
router.put('/:patientId', authenticate, async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = req.body;

    const patient = await Patient.update(patientId, updateData);

    res.json({
      success: true,
      message: 'تم تحديث بيانات المريض بنجاح',
      data: patient
    });

  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث بيانات المريض'
    });
  }
});

// الحصول على جميع المرضى
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const patients = await Patient.findAll(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: patients
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات المرضى'
    });
  }
});

module.exports = router;
