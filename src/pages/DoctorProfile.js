import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { doctorService } from '../services/doctorService';
import { updateDoctor } from '../store/slices/authSlice';

const DoctorProfile = () => {
  const dispatch = useDispatch();
  const { doctor, loading } = useSelector(state => state.auth);

  const validationSchema = Yup.object({
    first_name: Yup.string().required('الاسم الأول مطلوب'),
    father_name: Yup.string().required('اسم الأب مطلوب'),
    last_name: Yup.string().required('اسم العائلة مطلوب'),
    email: Yup.string().email('البريد الإلكتروني غير صحيح').required('البريد الإلكتروني مطلوب'),
    phone_personal: Yup.string().required('رقم الهاتف الشخصي مطلوب'),
    phone_clinic: Yup.string().required('رقم هاتف العيادة مطلوب'),
    specialization: Yup.string().required('التخصص مطلوب'),
    clinic_address: Yup.string().required('عنوان العيادة مطلوب'),
  });

  const formik = useFormik({
    initialValues: {
      first_name: doctor?.first_name || '',
      father_name: doctor?.father_name || '',
      last_name: doctor?.last_name || '',
      email: doctor?.email || '',
      phone_personal: doctor?.phone_personal || '',
      phone_clinic: doctor?.phone_clinic || '',
      specialization: doctor?.specialization || '',
      qualifications: doctor?.qualifications?.join(', ') || '',
      clinic_address: doctor?.clinic_address || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const qualificationsArray = values.qualifications
          .split(',')
          .map(q => q.trim())
          .filter(q => q !== '');

        const doctorData = {
          ...values,
          qualifications: qualificationsArray
        };

        const response = await doctorService.update(doctor.doctor_id, doctorData);
        dispatch(updateDoctor(response.data));
        alert('تم تحديث البيانات بنجاح');
      } catch (error) {
        alert('فشل في تحديث البيانات: ' + error.message);
      }
    },
  });

  if (loading) {
    return <div>جاري تحميل البيانات...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>الملف الشخصي للطبيب</h2>

        <form onSubmit={formik.handleSubmit} className="profile-form">
          <div className="form-row">
            <FormInput
              name="first_name"
              label="الاسم الأول"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.first_name && formik.errors.first_name}
            />

            <FormInput
              name="father_name"
              label="اسم الأب"
              value={formik.values.father_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.father_name && formik.errors.father_name}
            />
          </div>

          <div className="form-row">
            <FormInput
              name="last_name"
              label="اسم العائلة"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.last_name && formik.errors.last_name}
            />

            <FormInput
              name="specialization"
              label="التخصص"
              value={formik.values.specialization}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.specialization && formik.errors.specialization}
            />
          </div>

          <FormInput
            name="email"
            label="البريد الإلكتروني"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email}
          />

          <div className="form-row">
            <FormInput
              name="phone_personal"
              label="رقم الهاتف الشخصي"
              value={formik.values.phone_personal}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone_personal && formik.errors.phone_personal}
            />

            <FormInput
              name="phone_clinic"
              label="رقم هاتف العيادة"
              value={formik.values.phone_clinic}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone_clinic && formik.errors.phone_clinic}
            />
          </div>

          <FormInput
            name="qualifications"
            label="المؤهلات (افصل بينها بفواصل)"
            value={formik.values.qualifications}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.qualifications && formik.errors.qualifications}
          />

          <FormInput
            name="clinic_address"
            label="عنوان العيادة"
            value={formik.values.clinic_address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.clinic_address && formik.errors.clinic_address}
          />

          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="primary-btn"
          >
            {formik.isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;
