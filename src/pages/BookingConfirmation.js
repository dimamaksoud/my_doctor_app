import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [existingAppointment, setExistingAppointment] = useState(null);

  useEffect(() => {
    if (location.state?.appointment) {
      setAppointment(location.state.appointment);
    }

    // التحقق من وجود موعد سابق لنفس الرقم
    checkExistingAppointments();
  }, [location]);

  const checkExistingAppointments = () => {
    const phone = location.state?.appointment?.phone;
    if (phone) {
      const today = new Date().toISOString().split('T')[0];
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const existing = appointments.find(apt =>
        apt.phone === phone && apt.appointmentDate === today
      );

      if (existing) {
        setExistingAppointment(existing);
      }
    }
  };

  const handleConfirmBooking = () => {
    if (appointment) {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      appointments.push({
        ...appointment,
        appointmentId: Date.now(),
        status: 'confirmed',
        bookedAt: new Date().toISOString()
      });

      localStorage.setItem('appointments', JSON.stringify(appointments));
      alert('تم تثبيت الموعد بنجاح!');
      navigate('/booking-success', { state: { appointment } });
    }
  };

  const handleCancelBooking = () => {
    if (window.confirm('هل أنت متأكد من إلغاء الحجز؟')) {
      navigate('/booking');
    }
  };

  const handleInquireLater = () => {
    if (appointment) {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      appointments.push({
        ...appointment,
        appointmentId: Date.now(),
        status: 'pending',
        bookedAt: new Date().toISOString()
      });

      localStorage.setItem('appointments', JSON.stringify(appointments));
      alert('تم حفظ الموعد للاستعلام لاحقاً');
      navigate('/');
    }
  };

  const handleViewDetails = () => {
    navigate('/appointment-inquiry', {
      state: { phone: existingAppointment.phone }
    });
  };

  if (existingAppointment) {
    return (
      <div className="confirmation-container">
        <div className="confirmation-card error">
          <h2>⚠️ لديك موعد سابق</h2>
          <p>لقد حجزت موعداً سابقاً اليوم بنفس رقم الهاتف</p>

          <div className="appointment-details">
            <p><strong>الاسم:</strong> {existingAppointment.fullName}</p>
            <p><strong>التاريخ:</strong> {existingAppointment.appointmentDate}</p>
            <p><strong>الوقت:</strong> {existingAppointment.startTime} - {existingAppointment.endTime}</p>
          </div>

          <Button
            onClick={handleViewDetails}
            className="primary-btn"
          >
            تفاصيل الموعد
          </Button>

          <Button
            onClick={() => navigate('/booking')}
            className="secondary-btn"
          >
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="confirmation-container">
        <div className="confirmation-card">
          <h2>لم يتم العثور على بيانات الحجز</h2>
          <Button onClick={() => navigate('/booking')}>
            العودة إلى حجز موعد
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h2>تأكيد حجز الموعد</h2>
          <p>يرجى مراجعة المعلومات قبل التثبيت النهائي</p>
        </div>

        <div className="appointment-details">
          <div className="detail-item">
            <span className="label">الاسم الكامل:</span>
            <span className="value">{appointment.fullName}</span>
          </div>

          <div className="detail-item">
            <span className="label">رقم الهاتف:</span>
            <span className="value">{appointment.phone}</span>
          </div>

          <div className="detail-item">
            <span className="label">يوم الحجز:</span>
            <span className="value">{appointment.appointmentDate}</span>
          </div>

          <div className="detail-item">
            <span className="label">موعد الحجز:</span>
            <span className="value">{appointment.startTime} - {appointment.endTime}</span>
          </div>
        </div>

        <div className="confirmation-actions">
          <Button
            onClick={handleConfirmBooking}
            className="confirm-btn"
          >
            ✅ تثبيت الموعد
          </Button>

          <Button
            onClick={handleInquireLater}
            className="inquire-btn"
          >
            💾 استعلام لاحق
          </Button>

          <Button
            onClick={handleCancelBooking}
            className="cancel-btn"
          >
            ❌ إلغاء الموعد
          </Button>
        </div>

        <div className="confirmation-note">
          <p>⚠️ ملاحظة: بعد الضغط على "تثبيت الموعد" لا يمكن التراجع عن الحجز</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
