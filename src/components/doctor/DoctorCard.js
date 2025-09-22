// src/components/doctors/DoctorCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './DoctorCard.css';

const DoctorCard = ({ doctor }) => {
  const fullName = `${doctor.first_name} ${doctor.father_name} ${doctor.last_name}`;

  return (
    <div className="doctor-card">
      <div className="doctor-image">
        {doctor.profile_image_url ? (
          <img src={doctor.profile_image_url} alt={fullName} />
        ) : (
          <div className="doctor-avatar">👨‍⚕️</div>
        )}
      </div>

      <div className="doctor-info">
        <h3 className="doctor-name">{fullName}</h3>

        <div className="doctor-specialization">
          <span className="specialty-icon">🎯</span>
          {doctor.specialization || 'طبيب عام'}
        </div>

        {doctor.qualifications && doctor.qualifications.length > 0 && (
          <div className="doctor-qualifications">
            <span className="qualifications-icon">📜</span>
            {doctor.qualifications.join('، ')}
          </div>
        )}

        {doctor.clinic_address && (
          <div className="doctor-location">
            <span className="location-icon">📍</span>
            {doctor.clinic_address}
          </div>
        )}

        {doctor.phone_clinic && (
          <div className="doctor-phone">
            <span className="phone-icon">📞</span>
            {doctor.phone_clinic}
          </div>
        )}

        {doctor.email && (
          <div className="doctor-email">
            <span className="email-icon">✉️</span>
            {doctor.email}
          </div>
        )}

        <div className="doctor-status">
          <span className={`status-badge ${doctor.is_active ? 'active' : 'inactive'}`}>
            {doctor.is_active ? '🟢 متاح' : '🔴 غير متاح'}
          </span>
        </div>
      </div>

      <div className="doctor-actions">
        <Link
          to={`/booking?doctorId=${doctor.doctor_id}`}
          className="book-btn"
        >
          حجز موعد
        </Link>

        <button className="view-profile-btn">
          عرض الملف
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
