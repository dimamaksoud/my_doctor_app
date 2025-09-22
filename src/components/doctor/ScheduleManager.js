// components/doctor/ScheduleManager.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchClinics, updateWorkSchedule } from '../../store/slices/doctorSlice';
import './ScheduleManager.css';

const ScheduleManager = () => {
  const dispatch = useDispatch();
  const { doctor, clinics } = useSelector(state => state.doctor);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [schedule, setSchedule] = useState([]);

  const daysOfWeek = [
    { id: 0, name: 'الأحد' },
    { id: 1, name: 'الإثنين' },
    { id: 2, name: 'الثلاثاء' },
    { id: 3, name: 'الأربعاء' },
    { id: 4, name: 'الخميس' },
    { id: 5, name: 'الجمعة' },
    { id: 6, name: 'السبت' }
  ];

  useEffect(() => {
    if (doctor) {
      dispatch(fetchClinics(doctor.doctor_id));
    }
  }, [doctor, dispatch]);

  useEffect(() => {
    // تهيئة الجدول الافتراضي
    const defaultSchedule = daysOfWeek.map(day => ({
      day_of_week: day.id,
      day_name: day.name,
      clinic_id: selectedClinic,
      start_time: '08:00',
      end_time: '16:00',
      is_working: day.id < 5 // العمل من الأحد إلى الخميس افتراضياً
    }));
    setSchedule(defaultSchedule);
  }, [selectedClinic]);

  const handleTimeChange = (dayIndex, field, value) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex][field] = value;
    setSchedule(updatedSchedule);
  };

  const handleWorkingToggle = (dayIndex) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].is_working = !updatedSchedule[dayIndex].is_working;
    setSchedule(updatedSchedule);
  };

  const handleSaveSchedule = async () => {
    if (!selectedClinic) {
      alert('يرجى اختيار عيادة أولاً');
      return;
    }

    try {
      await dispatch(updateWorkSchedule({
        doctor_id: doctor.doctor_id,
        clinic_id: selectedClinic,
        schedules: schedule
      })).unwrap();

      alert('تم حفظ الجدول بنجاح');
    } catch (error) {
      alert('فشل في حفظ الجدول: ' + error.message);
    }
  };

  return (
    <div className="schedule-manager">
      <h3>إدارة جدول العمل ⏰</h3>

      <div className="clinic-selector">
        <label>اختر العيادة:</label>
        <select
          value={selectedClinic}
          onChange={(e) => setSelectedClinic(e.target.value)}
        >
          <option value="">-- اختر العيادة --</option>
          {clinics.map(clinic => (
            <option key={clinic.clinic_id} value={clinic.clinic_id}>
              {clinic.name} - {clinic.city}
            </option>
          ))}
        </select>
      </div>

      {selectedClinic && (
        <>
          <div className="schedule-table">
            <div className="schedule-header">
              <div>اليوم</div>
              <div>الحالة</div>
              <div>وقت البدء</div>
              <div>وقت الانتهاء</div>
            </div>

            {schedule.map((day, index) => (
              <div key={day.day_of_week} className="schedule-row">
                <div className="day-name">{day.day_name}</div>

                <div className="day-status">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={day.is_working}
                      onChange={() => handleWorkingToggle(index)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="time-inputs">
                  <input
                    type="time"
                    value={day.start_time}
                    onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                    disabled={!day.is_working}
                  />
                  <span>إلى</span>
                  <input
                    type="time"
                    value={day.end_time}
                    onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                    disabled={!day.is_working}
                  />
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSaveSchedule} className="save-schedule-btn">
            💾 حفظ الجدول
          </button>
        </>
      )}
    </div>
  );
};

export default ScheduleManager;
