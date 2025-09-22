// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { loginDoctor, registerDoctor } from '../store/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  const [isLogin, setIsLogin] = useState(true);

  // إعادة التوجيه عند نجاح المصادقة
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/doctor-dashboard');
    }
  }, [isAuthenticated, navigate]);

  // عرض الأخطاء
  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      fatherName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: isLogin
      ? Yup.object({
          username: Yup.string().required('اسم المستخدم مطلوب'),
          password: Yup.string().required('كلمة المرور مطلوبة')
        })
      : Yup.object({
          firstName: Yup.string()
            .required('الاسم الأول مطلوب')
            .matches(/^[\u0600-\u06FF\s]+$/, 'الاسم الأول يجب أن يحتوي فقط على أحرف عربية'),

          fatherName: Yup.string()
            .required('اسم الأب مطلوب')
            .matches(/^[\u0600-\u06FF\s]+$/, 'اسم الأب يجب أن يحتوي فقط على أحرف عربية'),

          lastName: Yup.string()
            .required('اسم العائلة مطلوب')
            .matches(/^[\u0600-\u06FF\s]+$/, 'اسم العائلة يجب أن يحتوي فقط على أحرف عربية'),

          username: Yup.string()
            .required('اسم المستخدم مطلوب')
            .min(3, 'اسم المستخدم يجب أن يكون至少 3 أحرف')
            .max(50, 'اسم المستخدم يجب ألا يتجاوز 50 حرف')
            .matches(/^[\u0600-\u06FFa-zA-Z0-9\s_\-\.]+$/, 'اسم المستخدم يمكن أن يحتوي على أحرف عربية وإنجليزية وأرقام وفراغات و(_ - .)'),

          email: Yup.string()
            .email('البريد الإلكتروني غير صحيح')
            .required('البريد الإلكتروني مطلوب'),

          password: Yup.string()
            .min(6, 'كلمة المرور يجب أن تكون至少 6 أحرف')
            .required('كلمة المرور مطلوبة'),

          confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'كلمات المرور غير متطابقة')
            .required('تأكيد كلمة المرور مطلوب')
        }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (isLogin) {
          await dispatch(loginDoctor({
            username: values.username.trim(),
            password: values.password
          })).unwrap();
        } else {
          await dispatch(registerDoctor({
            username: values.username.trim(),
            email: values.email,
            password: values.password,
            first_name: values.firstName,
            father_name: values.fatherName,
            last_name: values.lastName,
            phone_clinic: '0000000000', // قيمة افتراضية
            specialization: 'طبيب عام', // قيمة افتراضية
            clinic_address: 'سيتم إضافته لاحقاً' // قيمة افتراضية
          })).unwrap();
        }
      } catch (error) {
        console.error('Login/Register error:', error);
        // الخطأ سيتم عرضه تلقائياً عبر useEffect
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب طبيب'}</h2>

        <form onSubmit={formik.handleSubmit} className="login-form">
          {!isLogin && (
            <>
              <FormInput
                name="firstName"
                type="text"
                placeholder="الاسم الأول (عربي فقط)"
                label="الاسم الأول"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && formik.errors.firstName}
              />
              <FormInput
                name="fatherName"
                type="text"
                placeholder="اسم الأب (عربي فقط)"
                label="اسم الأب"
                value={formik.values.fatherName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fatherName && formik.errors.fatherName}
              />
              <FormInput
                name="lastName"
                type="text"
                placeholder="اسم العائلة (عربي فقط)"
                label="اسم العائلة"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && formik.errors.lastName}
              />

              <FormInput
                name="username"
                type="text"
                placeholder="اسم المستخدم (عربي/إنجليزي/أرقام/فراغات)"
                label="اسم المستخدم"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && formik.errors.username}
              />

              <FormInput
                name="email"
                type="email"
                placeholder="البريد الإلكتروني"
                label="البريد الإلكتروني"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && formik.errors.email}
              />
            </>
          )}

          {isLogin && (
            <FormInput
              name="username"
              type="text"
              placeholder="اسم المستخدم"
              label="اسم المستخدم"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && formik.errors.username}
            />
          )}

          <FormInput
            name="password"
            type="password"
            placeholder="كلمة المرور"
            label="كلمة المرور"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password}
          />

          {!isLogin && (
            <FormInput
              name="confirmPassword"
              type="password"
              placeholder="تأكيد كلمة المرور"
              label="تأكيد كلمة المرور"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && formik.errors.confirmPassword}
            />
          )}

          <Button
            type="submit"
            disabled={formik.isSubmitting || loading}
            className="primary-btn"
          >
            {loading ? 'جاري المعالجة...' : isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </Button>
        </form>

        <p className="toggle-form">
          {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              formik.resetForm();
            }}
            style={{ cursor: 'pointer', color: 'blue' }}
          >
            {isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
