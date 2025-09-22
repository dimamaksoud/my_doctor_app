const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

// middleware للمصادقة
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'رمز الدخول مطلوب'
      });
    }

    // التحقق من token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // التحقق من وجود الطبيب
    const doctor = await Doctor.findById(decoded.doctor_id);
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح'
      });
    }

    // إضافة بيانات المستخدم إلى request
    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'رمز الدخول غير صالح'
    });
  }
};

// middleware للصلاحيات
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول'
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
