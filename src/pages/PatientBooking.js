// src/pages/PatientBooking.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import DatePicker from '../components/common/DatePicker';
import TimeSlotPicker from '../components/appointment/TimeSlotPicker';
import { fetchAvailableSlots, bookAppointment } from '../store/slices/bookingSlice';
import { arabCountryCodes, validatePhoneNumber } from '../utils/countryCodes';
import dateUtils from '../utils/dateUtils';
import './PatientBooking.css';

const BookingSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('الاسم الكامل مطلوب')
    .min(3, 'الاسم يجب أن يكون至少 3 أحرف')
    .matches(/^[\u0600-\u06FF\s]+$/, 'يرجى إدخال اسم عربي صحيح'),
  phone: Yup.string()
    .required('رقم الهاتف مطلوب')
});

const PatientBooking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { doctorId } = useParams(); // الحصول على doctorId من الـ URL

  const { availableSlots = [], loading = false, error = null, bookingSuccess } = useSelector(
    state => state.booking || {}
  );

  const [selectedDate, setSelectedDate] = useState(dateUtils.getToday());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(arabCountryCodes[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  // إذا كان doctorId غير موجود في الـ URL، يمكن تعيين قيمة افتراضية
  const currentDoctorId = doctorId || 1;

  useEffect(() => {
    if (currentDoctorId && selectedDate) {
      dispatch(fetchAvailableSlots({
        doctorId: currentDoctorId,
        date: selectedDate
      }));
    }
  }, [selectedDate, currentDoctorId, dispatch]);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      phone: ''
    },
    validationSchema: BookingSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setValidationError('');

      if (!selectedSlot) {
        setValidationError('يرجى اختيار موعد');
        setSubmitting(false);
        return;
      }

      if (!validatePhoneNumber(values.phone, selectedCountry.dialCode)) {
        setValidationError(`رقم الهاتف غير صحيح لـ ${selectedCountry.name}`);
        setSubmitting(false);
        return;
      }

      try {
        const appointmentData = {
          doctorId: currentDoctorId,
          patientName: values.fullName,
          patientPhone: `${selectedCountry.dialCode}${values.phone.replace(/\D/g, '')}`,
          appointmentDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          countryCode: selectedCountry.code
        };

        // حفظ الموعد في قاعدة البيانات
        const result = await dispatch(bookAppointment(appointmentData)).unwrap();

        if (result) {
          navigate('/booking-confirmation', {
            state: {
              appointment: {
                ...values,
                appointmentId: result.appointment_id || Date.now(),
                country: selectedCountry.code,
                countryCode: selectedCountry.dialCode,
                appointmentDate: selectedDate,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                formattedDate: dateUtils.formatToGregorian(selectedDate),
                formattedTime: dateUtils.to12HourFormat(selectedSlot.startTime),
                status: 'pending'
              }
            }
          });
        }
      } catch (error) {
        setValidationError(error.message || 'حدث خطأ أثناء حجز الموعد');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsCountryDropdownOpen(false);
    formik.setFieldValue('phone', '');
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');

    if (selectedCountry.code === 'SA') {
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
      if (numbers.length <= 9) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 9)}`;
    }

    return numbers;
  };

  const handlePhoneChange = (e) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    formik.setFieldValue('phone', formattedValue);
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <div className="header-icon">📅</div>
        <h1>حجز موعد طبي</h1>
        <p>اختر الموعد المناسب وأدخل بياناتك للحجز</p>
      </div>

      <div className="booking-content">
        <form onSubmit={formik.handleSubmit} className="booking-form">
          {/* قسم معلومات المريض */}
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">👤</span>
              <h3>معلومات المريض</h3>
            </div>

            <FormInput
              name="fullName"
              type="text"
              placeholder="الاسم الثلاثي الكامل"
              label="الاسم الكامل"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.fullName && formik.errors.fullName}
              icon="👤"
            />

            <div className="phone-input-group">
              <label>رقم الهاتف</label>
              <div className="phone-input-container">
                <div className="country-selector">
                  <button
                    type="button"
                    className="country-selector-btn"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  >
                    <span className="country-flag">{selectedCountry.flag}</span>
                    <span className="country-code">{selectedCountry.dialCode}</span>
                    <span className="dropdown-arrow">▼</span>
                  </button>

                  {isCountryDropdownOpen && (
                    <div className="country-dropdown">
                      {arabCountryCodes.map(country => (
                        <div
                          key={country.code}
                          className="country-option"
                          onClick={() => handleCountrySelect(country)}
                        >
                          <span className="country-flag">{country.flag}</span>
                          <span className="country-name">{country.name}</span>
                          <span className="country-dial-code">{country.dialCode}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  name="phone"
                  type="text"
                  placeholder={selectedCountry.code === 'SA' ? "xxx xxx xxxx" : "أدخل رقم الهاتف"}
                  value={formik.values.phone}
                  onChange={handlePhoneChange}
                  onBlur={formik.handleBlur}
                  className={`phone-input ${formik.touched.phone && formik.errors.phone ? 'error' : ''}`}
                />
              </div>

              {formik.touched.phone && formik.errors.phone && (
                <div className="error-message">{formik.errors.phone}</div>
              )}

              <div className="phone-format-hint">
                ⓘ تنسيق رقم {selectedCountry.name}: {selectedCountry.pattern.toString().replace(/^\/\^\([^)]+\)\$$/, '')}
              </div>
            </div>
          </div>

          {/* قسم اختيار الموعد */}
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">⏰</span>
              <h3>اختيار الموعد</h3>
            </div>

            <DatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              minDate={new Date()}
            />

            {loading && (
              <div className="loading-state">
                <div className="loading-spinner">⏳</div>
                <p>جاري تحميل المواعيد المتاحة...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {validationError && (
              <div className="error-state">
                <span>❌</span>
                <p>{validationError}</p>
              </div>
            )}

            <TimeSlotPicker
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              loading={loading}
            />

            {selectedSlot && (
              <div className="selected-slot">
                <div className="selected-slot-icon">✅</div>
                <div className="selected-slot-info">
                  <p>المحدد: {selectedSlot.startTime} - {selectedSlot.endTime}</p>
                  <span>📅 {new Date(selectedDate).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="booking-actions">
            <Button
              type="submit"
              disabled={formik.isSubmitting || !selectedSlot || loading}
              className="booking-btn primary"
            >
              {formik.isSubmitting ? (
                <>
                  <span className="btn-spinner">⏳</span>
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <span className="btn-icon">📋</span>
                  تأكيد الحجز
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientBooking;
