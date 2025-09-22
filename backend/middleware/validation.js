// middleware/validation.js
const { body, validationResult } = require('express-validator');

// middleware للتحقق من الصحة
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      message: 'بيانات غير صالحة',
      errors: errors.array()
    });
  };
};

// قواعد التحقق للتسجيل
const registerValidation = [
  body('first_name')
    .notEmpty()
    .withMessage('الاسم الأول مطلوب')
    .isLength({ min: 2 })
    .withMessage('الاسم الأول يجب أن يكون至少 حرفين')
    .matches(/^[\p{Script=Arabic}\s]+$/u)
    .withMessage('الاسم الأول يجب أن يحتوي فقط على أحرف عربية وفراغات'),

  body('father_name')
    .notEmpty()
    .withMessage('اسم الأب مطلوب')
    .isLength({ min: 2 })
    .withMessage('اسم الأب يجب أن يكون至少 حرفين')
    .matches(/^[\p{Script=Arabic}\s]+$/u)
    .withMessage('اسم الأب يجب أن يحتوي فقط على أحرف عربية وفراغات'),

  body('last_name')
    .notEmpty()
    .withMessage('اسم العائلة مطلوب')
    .isLength({ min: 2 })
    .withMessage('اسم العائلة يجب أن يكون至少 حرفين')
    .matches(/^[\p{Script=Arabic}\s]+$/u)
    .withMessage('اسم العائلة يجب أن يحتوي فقط على أحرف عربية وفراغات'),

  body('username')
    .notEmpty()
    .withMessage('اسم المستخدم مطلوب')
    .isLength({ min: 3, max: 50 })
    .withMessage('اسم المستخدم يجب أن يكون بين 3 و 50 حرف')
    .matches(/^[\p{Script=Arabic}\p{Script=Latin}0-9\s_\-\.]+$/u)
    .withMessage('اسم المستخدم يمكن أن يحتوي على أحرف عربية وإنجليزية وأرقام وفراغات و(_ - .)'),

  body('email')
    .isEmail()
    .withMessage('بريد إلكتروني غير صالح')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون至少 6 أحرف'),

  body('phone_clinic')
    .notEmpty()
    .withMessage('رقم عيادة الطبيب مطلوب')
    .matches(/^[0-9+()\s\-]+$/)
    .withMessage('رقم الهاتف غير صالح')
];

// قواعد التحقق لتسجيل الدخول
const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('اسم المستخدم أو البريد الإلكتروني مطلوب'),

  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
];

// قواعد التحقق للموعد
const appointmentValidation = [
  body('doctor_id')
    .isInt({ min: 1 })
    .withMessage('معرف الطبيب غير صالح'),

  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('معرف المريض غير صالح'),

  body('appointment_date')
    .isISO8601()
    .withMessage('تاريخ غير صالح'),

  body('start_time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('وقت البدء غير صالح'),

  body('end_time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('وقت الانتهاء غير صالح')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  appointmentValidation
};
