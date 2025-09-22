import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchDoctorAppointments,
  confirmAppointment,
  setFilters,
  clearFilters
} from '../store/slices/bookingSlice';
import Button from '../components/common/Button';
import FormInput from '../components/common/FormInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './DoctorAppointments.css';

const DoctorAppointments = () => {
  const dispatch = useDispatch();
  const { appointments, loading, error, filters } = useSelector(state => state.booking);
  const { doctor } = useSelector(state => state.auth);

  const [localFilters, setLocalFilters] = useState({
    date: filters.date || '',
    status: filters.status || '',
    patientName: filters.patientName || ''
  });

  useEffect(() => {
    if (doctor && doctor.doctor_id) {
      dispatch(fetchDoctorAppointments({
        doctorId: doctor.doctor_id,
        filters: filters
      }));
    }
  }, [doctor, filters, dispatch]);

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    dispatch(setFilters(localFilters));
  };

  const clearAllFilters = () => {
    const emptyFilters = { date: '', status: '', patientName: '' };
    setLocalFilters(emptyFilters);
    dispatch(clearFilters());
  };

  const handleConfirmAppointment = (appointmentId) => {
    dispatch(confirmAppointment(appointmentId));
  };

  const handleCancelAppointment = (appointmentId) => {
    // سيتم تنفيذ هذه الوظيفة لاحقاً
    console.log('إلغاء الموعد:', appointmentId);
    alert('سيتم تنفيذ وظيفة الإلغاء في المستقبل');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      case 'no_show': return 'status-no-show';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'في الانتظار';
      case 'cancelled': return 'ملغى';
      case 'completed': return 'مكتمل';
      case 'no_show': return 'لم يحضر';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'مساءً' : 'صباحاً';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="doctor-appointments-container">
        <div className="loading-container">
          <LoadingSpinner />
          <p>جاري تحميل المواعيد...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-appointments-container">
      <div className="appointments-header">
        <h1>📋 إدارة المواعيد</h1>
        <p>عرض وإدارة جميع المواعيد المحجوزة</p>
      </div>

      {/* قسم الفلاتر */}
      <div className="filters-section">
        <h3>🔍 تصفية المواعيد</h3>
        <div className="filters-grid">
          <FormInput
            type="date"
            label="التاريخ"
            value={localFilters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
          />

          <div className="form-group">
            <label>الحالة</label>
            <select
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-select"
            >
              <option value="">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="cancelled">ملغى</option>
              <option value="completed">مكتمل</option>
              <option value="no_show">لم يحضر</option>
            </select>
          </div>

          <FormInput
            type="text"
            label="اسم المريض"
            placeholder="ابحث باسم المريض"
            value={localFilters.patientName}
            onChange={(e) => handleFilterChange('patientName', e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <Button onClick={applyFilters} className="primary-btn">
            🔍 تطبيق الفلتر
          </Button>
          <Button onClick={clearAllFilters} className="secondary-btn">
            🗑️ مسح الكل
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* قائمة المواعيد */}
      <div className="appointments-list">
        <h3>
          📊 المواعيد ({appointments.length})
          {filters.date && ` للتاريخ: ${formatDate(filters.date)}`}
          {filters.status && ` - الحالة: ${getStatusText(filters.status)}`}
        </h3>

        {appointments.length === 0 ? (
          <div className="no-appointments">
            <div className="empty-state">
              <p>📭 لا توجد مواعيد متطابقة مع معايير البحث</p>
              {Object.values(filters).some(value => value) && (
                <Button onClick={clearAllFilters} className="primary-btn">
                  عرض جميع المواعيد
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="appointments-grid">
            {appointments.map((appointment) => (
              <div key={appointment.appointment_id} className="appointment-card">
                <div className="appointment-header">
                  <h4>👤 {appointment.patient_name || 'مريض'}</h4>
                  <span className="patient-phone">📱 {appointment.patient_phone}</span>
                </div>

                <div className="appointment-details">
                  <div className="detail-row">
                    <span className="label">📅 التاريخ:</span>
                    <span className="value">{formatDate(appointment.appointment_date)}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">⏰ الوقت:</span>
                    <span className="value">
                      {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="label">🔄 الحالة:</span>
                    <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>

                  {appointment.cancellation_reason && (
                    <div className="detail-row">
                      <span className="label">📝 سبب الإلغاء:</span>
                      <span className="value">{appointment.cancellation_reason}</span>
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  {appointment.status === 'pending' && (
                    <Button
                      onClick={() => handleConfirmAppointment(appointment.appointment_id)}
                      className="confirm-btn"
                      title="تأكيد الموعد"
                    >
                      ✅ تأكيد
                    </Button>
                  )}

                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <Button
                      onClick={() => handleCancelAppointment(appointment.appointment_id)}
                      className="cancel-btn"
                      title="إلغاء الموعد"
                    >
                      ❌ إلغاء
                    </Button>
                  )}

                  <Button className="details-btn" title="عرض التفاصيل">
                    📋 التفاصيل
                  </Button>
                </div>

                <div className="appointment-footer">
                  <span className="created-at">
                    📌 تم الإنشاء: {new Date(appointment.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
