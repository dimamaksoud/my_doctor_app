// routes/auth.js - الإصلاح
const express = require('express');
const {
  loginDoctor,
  registerDoctor,
  getCurrentDoctor,
  updateDoctor
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, registerValidation, loginValidation } = require('../middleware/validation');

const router = express.Router();

// ✅ التوجيهات الصحيحة
router.post('/login', validate(loginValidation), loginDoctor);
router.post('/register', validate(registerValidation), registerDoctor);

// ✅ Routes محمية
router.get('/me', authenticate, getCurrentDoctor);
router.put('/profile', authenticate, updateDoctor);

// ✅ إزالة route test إذا كان يسبب مشاكل
// router.get('/test', (req, res) => {
//   res.json({ message: 'Auth route is working!' });
// });

module.exports = router;
