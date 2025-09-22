// معالج الأخطاء المركزي
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // تسجيل الخطأ لل debugging
  console.error('Error:', err);

  // خطأ في قاعدة البيانات
  if (err.code) {
    switch (err.code) {
      case '23505': // unique violation
        error = {
          message: 'هذا السجل موجود مسبقاً',
          statusCode: 409
        };
        break;
      case '23503': // foreign key violation
        error = {
          message: 'مرجع غير صحيح',
          statusCode: 400
        };
        break;
      case '23502': // not null violation
        error = {
          message: 'حقل مطلوب مفقود',
          statusCode: 400
        };
        break;
      default:
        error = {
          message: 'خطأ في قاعدة البيانات',
          statusCode: 500
        };
    }
  }

  // خطأ في JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'رمز الدخول غير صالح',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'انتهت صلاحية رمز الدخول',
      statusCode: 401
    };
  }

  // خطأ في التحقق من الصحة
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = {
      message: messages.join(', '),
      statusCode: 400
    };
  }

  // إرسال response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
