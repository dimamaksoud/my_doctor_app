import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import FormInput from '../components/common/FormInput';
import { arabCountryCodes } from '../utils/countryCodes';
import { formatToGregorian, to12HourFormat } from '../utils/dateUtils';
import './AppointmentInquiry.css';

const AppointmentInquiry = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('phone');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(arabCountryCodes[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setSearchPerformed(true);

    // محاكاة البحث في localStorage
    setTimeout(() => {
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      let results = [];

      if (searchType === 'phone') {
        const cleanPhone = phone.replace(/[\s-]/g, '');
        results = allAppointments.filter(apt =>
          apt.phone.includes(cleanPhone) && apt.countryCode === selectedCountry.dialCode
        );
      } else {
        results = allAppointments.filter(apt =>
          apt.fullName && apt.fullName.toLowerCase().includes(fullName.toLowerCase())
        );
      }

      // إضافة التواريخ المنسقة
      const formattedResults = results.map(apt => ({
        ...apt,
        formattedDate: formatToGregorian(apt.appointmentDate),
        formattedTime: to12HourFormat(apt.startTime),
        formattedEndTime: to12HourFormat(apt.endTime)
      }));

      setAppointments(formattedResults);
      setLoading(false);
    }, 800);
  };
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsCountryDropdownOpen(false);
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
    setPhone(formattedValue);
  };

  const handleConfirmAppointment = (appointmentId) => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = allAppointments.map(apt =>
      apt.appointment_id === appointmentId ? { ...apt, status: 'confirmed' } : apt
    );

    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments.filter(apt =>
      searchType === 'phone'
        ? apt.phone === phone.replace(/[\s-]/g, '') && apt.countryCode === selectedCountry.dialCode
        : apt.fullName.toLowerCase().includes(fullName.toLowerCase())
    ));
    alert('تم تأكيد الموعد بنجاح!');
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('هل أنت متأكد من إلغاء الموعد؟')) {
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updatedAppointments = allAppointments.filter(apt =>
        apt.appointment_id !== appointmentId
      );

      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments.filter(apt =>
        searchType === 'phone'
          ? apt.phone === phone.replace(/[\s-]/g, '') && apt.countryCode === selectedCountry.dialCode
          : apt.fullName.toLowerCase().includes(fullName.toLowerCase())
      ));
      alert('تم إلغاء الموعد بنجاح!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'مساءً' : 'صباحاً';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'في الانتظار';
      case 'cancelled': return 'ملغى';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  return (
    <div className="inquiry-container">
      <div className="inquiry-card">
        <div className="inquiry-header">
          <h1>🔍 الاستعلام عن الموعد</h1>
          <p>ابحث عن مواعيدك باستخدام رقم الهاتف أو الاسم الكامل</p>
        </div>

        {/* اختيار نوع البحث */}
        <div className="search-type-selector">
          <label>طريقة البحث:</label>
          <div className="type-buttons">
            <button
              type="button"
              className={`type-btn ${searchType === 'phone' ? 'active' : ''}`}
              onClick={() => setSearchType('phone')}
            >
              📱 رقم الهاتف
            </button>
            <button
              type="button"
              className={`type-btn ${searchType === 'name' ? 'active' : ''}`}
              onClick={() => setSearchType('name')}
            >
              👤 الاسم الكامل
            </button>
          </div>
        </div>

        {/* حقل البحث حسب النوع */}
        <div className="search-section">
          {searchType === 'phone' ? (
            <div className="phone-search-group">
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
                  type="text"
                  placeholder={selectedCountry.code === 'SA' ? "05x xxx xxxx" : "أدخل رقم الهاتف"}
                  value={phone}
                  onChange={handlePhoneChange}
                  className="phone-input"
                />
              </div>
            </div>
          ) : (
            <div className="name-search-group">
              <FormInput
                type="text"
                label="الاسم الكامل"
                placeholder="أدخل الاسم الثلاثي الكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon="👤"
              />
            </div>
          )}

          <Button
            onClick={handleSearch}
            disabled={searchType === 'phone' ? !phone : !fullName}
            className="search-btn primary"
          >
            🔍 بحث
          </Button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner">⏳</div>
            <p>جاري البحث عن المواعيد...</p>
          </div>
        )}

        {!loading && searchPerformed && (
          <div className="search-results">
            <h3>
              {appointments.length > 0 ?
                `📋 تم العثور على ${appointments.length} موعد` :
                '🔍 نتائج البحث'
              }
            </h3>

            {appointments.length > 0 ? (
              <div className="appointments-list">
                {appointments.map((appointment) => (
                  <div key={appointment.appointment_id} className="appointment-card">
                    <div className="appointment-header">
                      <h4>👤 {appointment.fullName}</h4>
                      {appointment.countryCode && (
                        <span className="patient-phone">
                          📱 {appointment.countryCode} {appointment.phone}
                        </span>
                      )}
                    </div>

                    <div className="appointment-details">
                      <div className="detail-item">
                        <span className="label">📅 التاريخ:</span>
                        <span className="value">{formatDate(appointment.appointmentDate)}</span>
                      </div>

                      <div className="detail-item">
                        <span className="label">⏰ الوقت:</span>
                        <span className="value">
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </span>
                      </div>

                      <div className="detail-item">
                        <span className="label">🔄 الحالة:</span>
                        <span className={`status-value ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                    </div>

                    <div className="appointment-actions">
                      {appointment.status === 'pending' && (
                        <Button
                          onClick={() => handleConfirmAppointment(appointment.appointment_id)}
                          className="confirm-btn"
                        >
                          ✅ تأكيد
                        </Button>
                      )}

                      <Button
                        onClick={() => handleCancelAppointment(appointment.appointment_id)}
                        className="cancel-btn"
                      >
                        ❌ إلغاء
                      </Button>

                      <Button className="details-btn">
                        📋 التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">😕</div>
                <h4>لم يتم العثور على مواعيد</h4>
                <p>
                  {searchType === 'phone' ?
                    `لا توجد مواعيد مسجلة للرقم ${selectedCountry.dialCode} ${phone}` :
                    `لا توجد مواعيد مسجلة للاسم "${fullName}"`
                  }
                </p>
                <Button
                  onClick={() => navigate('/booking')}
                  className="booking-link-btn"
                >
                  📅 احجز موعد جديد
                </Button>
              </div>
            )}
          </div>
        )}

        {!searchPerformed && !loading && (
          <div className="search-guide">
            <div className="guide-icon">💡</div>
            <h4>كيفية البحث عن المواعيد</h4>
            <div className="guide-steps">
              <div className="step">
                <span className="step-number">1</span>
                <p>اختر طريقة البحث (رقم الهاتف أو الاسم)</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <p>أدخل المعلومات المطلوبة</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <p>انقر على زر البحث</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentInquiry;
