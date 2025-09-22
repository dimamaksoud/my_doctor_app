const express = require('express');
const {
  getAllDoctors,
  getDoctorById,
  getDoctorSettings,
  updateDoctorSettings,
  getWorkSchedule,
  updateWorkSchedule,
  searchDoctorsBySpecialization
} = require('../controllers/doctorController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Routes العامة
router.get('/', getAllDoctors); // ✅ هذا الآن يدعم الفلاتر
router.get('/search', searchDoctorsBySpecialization);
router.get('/:doctor_id', getDoctorById);
router.get('/:doctor_id/schedule', getWorkSchedule);

// Routes محمية
router.use(authenticate);
router.get('/settings/profile', getDoctorSettings);
router.put('/settings/profile', updateDoctorSettings);
router.put('/settings/schedule', updateWorkSchedule);

module.exports = router;
