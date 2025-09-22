// src/pages/DoctorsList.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDoctorsList } from '../store/slices/doctorSlice';
import DoctorCard from '../components/doctor/DoctorCard';
import SearchFilters from '../components/doctor/SearchFilters';
import './DoctorsList.css';

const DoctorsList = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { doctorsList, loading, error } = useSelector(state => state.doctor);

  const [filters, setFilters] = useState({
    specialization: '',
    name: '',
    location: '',
    availability: ''
  });

  useEffect(() => {
    dispatch(fetchDoctorsList());
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.fromHeader && location.state?.scrollToFilters) {
      const filtersSection = document.getElementById('filters-section');
      if (filtersSection) {
        filtersSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  // تأكد أن doctorsList هي مصفوفة قبل استخدام filter
  const filteredDoctors = Array.isArray(doctorsList)
    ? doctorsList.filter(doctor => {
        return (
          (filters.specialization === '' ||
           doctor.specialization?.includes(filters.specialization)) &&
          (filters.name === '' ||
           `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(filters.name.toLowerCase())) &&
          (filters.location === '' ||
           doctor.clinic_address?.toLowerCase().includes(filters.location.toLowerCase())) &&
          (filters.availability === '' ||
           (filters.availability === 'available' && doctor.is_active))
        );
      })
    : [];

  const specializations = Array.isArray(doctorsList)
    ? [...new Set(doctorsList.map(doc => doc.specialization).filter(Boolean))]
    : [];

  const locations = Array.isArray(doctorsList)
    ? [...new Set(doctorsList.map(doc => doc.clinic_address).filter(Boolean))]
    : [];

  if (loading) {
    return (
      <div className="doctors-loading">
        <div className="loading-spinner">⚕️</div>
        <p>جاري تحميل قائمة الأطباء...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctors-error">
        <h3>⚠️ حدث خطأ</h3>
        <p>{error}</p>
        <button onClick={() => dispatch(fetchDoctorsList())} className="retry-btn">
          🔄 إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="doctors-list-page">
      <div className="page-header">
        <h1>الأطباء والاختصاصات</h1>
        <p>اكتشف أفضل الأطباء المتخصصين واختر المناسب لك</p>
      </div>

      <section id="filters-section" className="filters-section">
        <SearchFilters
          filters={filters}
          setFilters={setFilters}
          specializations={specializations}
          locations={locations}
        />
      </section>

      <div className="results-info">
        <p>
          عرض {filteredDoctors.length} من أصل {Array.isArray(doctorsList) ? doctorsList.length : 0} طبيب
        </p>
      </div>

      <div className="doctors-grid">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map(doctor => (
            <DoctorCard key={doctor.doctor_id} doctor={doctor} />
          ))
        ) : (
          <div className="no-doctors">
            <h3>👨‍⚕️ لم يتم العثور على أطباء</h3>
            <p>جرب تعديل عوامل التصفية للعثور على نتائج أكثر</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
