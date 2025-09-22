// src/pages/DoctorDashboard.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDoctorAppointments } from '../store/slices/bookingSlice';
import { logout } from '../store/slices/authSlice';
import './DoctorDashboard.css';

// مكونات الإحصائيات
const StatCard = ({ icon, title, value, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  </div>
);

// مكون البطاقة السريعة
const QuickActionCard = ({ icon, title, description, link, buttonText }) => (
  <div className="quick-action-card">
    <div className="action-icon">{icon}</div>
    <div className="action-content">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
    <Link to={link} className="action-button">
      {buttonText}
    </Link>
  </div>
);

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { doctor, isAuthenticated } = useSelector(state => state.auth);
  const { appointments, loading } = useSelector(state => state.booking);

  // إعادة التوجيه إذا لم يكن مستخدمًا مسجلاً
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (doctor) {
      dispatch(fetchDoctorAppointments({ doctorId: doctor.doctor_id }));
    }
  }, [doctor, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // حساب الإحصائيات
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.appointment_date === today);
  const upcomingAppointments = appointments.filter(apt =>
    apt.appointment_date >= today && apt.status === 'confirmed'
  );
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  // دالة لتحويل التاريخ إلى ميلادي
  const formatToGregorian = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // دالة لتحويل الوقت إلى تنسيق 12 ساعة
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">⏳</div>
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      {/* رأس لوحة التحكم */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>مرحباً د. {doctor?.first_name} {doctor?.last_name} 👨‍⚕️</h1>
          <p>لوحة التحكم لإدارة عيادتك ومرضاك</p>
        </div>
        <div className="header-actions">
          <span className="current-date">
            📅 {formatToGregorian(new Date())}
          </span>
          <button onClick={handleLogout} className="logout-btn">
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="stats-grid">
        <StatCard
          icon="📊"
          title="إجمالي المواعيد"
          value={appointments.length}
          color="blue"
        />
        <StatCard
          icon="✅"
          title="مواعيد اليوم"
          value={todayAppointments.length}
          color="green"
        />
        <StatCard
          icon="⏳"
          title="في انتظار التأكيد"
          value={pendingAppointments.length}
          color="orange"
        />
        <StatCard
          icon="📅"
          title="مواعيد قادمة"
          value={upcomingAppointments.length}
          color="purple"
        />
      </div>

      {/* الإجراءات السريعة */}
      <div className="quick-actions">
        <h2>الإجراءات السريعة ⚡</h2>
        <div className="actions-grid">
          <QuickActionCard
            icon="👥"
            title="إدارة المواعيد"
            description="عرض وتعديل جميع المواعيد"
            link="/doctor-appointments"
            buttonText="عرض المواعيد"
          />
          <QuickActionCard
            icon="👤"
            title="الملف الشخصي"
            description="تعديل بياناتك الشخصية"
            link="/doctor-profile"
            buttonText="تعديل الملف"
          />
          <QuickActionCard
            icon="📞"
            title="اتصل بالدعم"
            description="الحصول على مساعدة فورية"
            link="/support"
            buttonText="اتصال"
          />
        </div>
      </div>

      {/* مواعيد اليوم */}
      <div className="today-appointments">
        <h2>مواعيد اليوم 📋 ({todayAppointments.length})</h2>
        {todayAppointments.length === 0 ? (
          <div className="empty-appointments">
            <p>🎉 لا توجد مواعيد لهذا اليوم</p>
          </div>
        ) : (
          <div className="appointments-list">
            {todayAppointments.map(appointment => (
              <div key={appointment.appointment_id} className="appointment-item">
                <div className="appointment-time">
                  <span>⏰ {formatTime(appointment.start_time)}</span>
                  {appointment.end_time && (
                    <span> - {formatTime(appointment.end_time)}</span>
                  )}
                </div>
                <div className="appointment-info">
                  <h4>👤 {appointment.patient_name || 'مريض'}</h4>
                  {appointment.patient_phone && (
                    <p>📱 {appointment.patient_phone}</p>
                  )}
                  <p className="appointment-date">
                    📅 {formatToGregorian(appointment.appointment_date)}
                  </p>
                  {appointment.notes && (
                    <p className="appointment-notes">📝 {appointment.notes}</p>
                  )}
                </div>
                <div className="appointment-status">
                  <span className={`status-badge status-${appointment.status}`}>
                    {appointment.status === 'confirmed' ? '✅ مؤكد' :
                     appointment.status === 'pending' ? '⏳ في الانتظار' :
                     appointment.status === 'cancelled' ? '❌ ملغى' :
                     appointment.status === 'completed' ? '✅ مكتمل' : appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مواعيد قادمة (الأيام القليلة القادمة) */}
      {upcomingAppointments.length > 0 && (
        <div className="upcoming-appointments">
          <h2>المواعيد القادمة 📅 ({upcomingAppointments.length})</h2>
          <div className="appointments-list">
            {upcomingAppointments.slice(0, 5).map(appointment => (
              <div key={appointment.appointment_id} className="appointment-item upcoming">
                <div className="appointment-time">
                  <span>⏰ {formatTime(appointment.start_time)}</span>
                  <span className="appointment-day">
                    📅 {formatToGregorian(appointment.appointment_date)}
                  </span>
                </div>
                <div className="appointment-info">
                  <h4>👤 {appointment.patient_name || 'مريض'}</h4>
                  {appointment.patient_phone && (
                    <p>📱 {appointment.patient_phone}</p>
                  )}
                </div>
                <div className="appointment-status">
                  <span className={`status-badge status-${appointment.status}`}>
                    {appointment.status === 'confirmed' ? '✅ مؤكد' :
                     appointment.status === 'pending' ? '⏳ في الانتظار' : appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {upcomingAppointments.length > 5 && (
            <div className="view-all-container">
              <Link to="/doctor-appointments" className="view-all-btn">
                عرض جميع المواعيد ({upcomingAppointments.length})
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ملخص سريع */}
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>📈 ملخص الأداء</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="label">إجمالي المرضى:</span>
              <span className="value">
                {new Set(appointments.map(apt => apt.patient_id || apt.patient_name)).size} 👥
              </span>
            </div>
            <div className="summary-item">
              <span className="label">مواعيد هذا الأسبوع:</span>
              <span className="value">
                {appointments.filter(apt => {
                  const appointmentDate = new Date(apt.appointment_date);
                  const today = new Date();
                  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  return appointmentDate >= oneWeekAgo && appointmentDate <= today;
                }).length} 📈
              </span>
            </div>
            <div className="summary-item">
              <span className="label">معدل الإشغال:</span>
              <span className="value">
                {appointments.length > 0 ? Math.round((todayAppointments.length / appointments.length) * 100) : 0}% 📊
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
