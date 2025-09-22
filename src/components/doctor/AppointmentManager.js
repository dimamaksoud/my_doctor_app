// components/doctor/AppointmentManager.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchClinics, fetchDoctorAppointments, createAppointmentSlot } from '../../store/slices/doctorSlice';
import './AppointmentManager.css';

const AppointmentManager = () => {
  const dispatch = useDispatch();
  const { doctor, clinics, appointments, loading } = useSelector(state => state.doctor);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ start_time: '', end_time: '' });

  useEffect(() => {
    if (doctor) {
      dispatch(fetchClinics(doctor.doctor_id));
    }
  }, [doctor, dispatch]);

  useEffect(() => {
    if (selectedClinic && selectedDate) {
      dispatch(fetchDoctorAppointments({
        doctorId: doctor.doctor_id,
        filters: {
          date: selectedDate,
          clinic_id: selectedClinic
        }
      }));
    }
  }, [selectedClinic, selectedDate, doctor, dispatch]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = minute === 30
          ? `${(hour + 1).toString().padStart(2, '0')}:00`
          : `${hour.toString().padStart(2, '0')}:30`;

        // التحقق إذا كان الموعد محجوزاً
        const isBooked = appointments.some(apt =>
          apt.start_time === time && apt.appointment_date === selectedDate
        );

        slots.push({
          time,
          end_time: endTime,
          is_available: !isBooked,
          is_booked: isBooked
        });
      }
    }
    setTimeSlots(slots);
  };

  const handleAddSlot = async () => {
    if (!newSlot.start_time || !newSlot.end_time) {
      alert('يرجى اختيار وقت البدء والانتهاء');
      return;
    }

    if (!selectedClinic || !selectedDate) {
      alert('يرجى اختيار العيادة والتاريخ أولاً');
      return;
    }

    try {
      await dispatch(createAppointmentSlot({
        doctor_id: doctor.doctor_id,
        clinic_id: selectedClinic,
        appointment_date: selectedDate,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        status: 'available'
      })).unwrap();

      setNewSlot({ start_time: '', end_time: '' });
      alert('تم إضافة الموعد بنجاح');

      // إعادة تحميل المواعيد
      dispatch(fetchDoctorAppointments({
        doctorId: doctor.doctor_id,
        filters: { date: selectedDate, clinic_id: selectedClinic }
      }));

    } catch (error) {
      alert('فشل في إضافة الموعد: ' + error.message);
    }
  };

  const handleDeleteSlot = async (slotTime) => {
    if (!window.confirm('هل تريد حذف هذا الموعد؟')) return;

    try {
      // البحث عن الموعد وحذفه
      const appointmentToDelete = appointments.find(apt =>
        apt.start_time === slotTime && apt.appointment_date === selectedDate
      );

      if (appointmentToDelete) {
        await dispatch(deleteAppointmentSlot(appointmentToDelete.appointment_id)).unwrap();
        alert('تم حذف الموعد بنجاح');

        // إعادة تحميل المواعيد
        dispatch(fetchDoctorAppointments({
          doctorId: doctor.doctor_id,
          filters: { date: selectedDate, clinic_id: selectedClinic }
        }));
      }
    } catch (error) {
      alert('فشل في حذف الموعد: ' + error.message);
    }
  };

  return (
    <div className="appointment-manager">
      <h3>إدارة المواعيد 📅</h3>

      <div className="appointment-filters">
        <div className="filter-group">
          <label>العيادة:</label>
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

        <div className="filter-group">
          <label>التاريخ:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <button
          onClick={generateTimeSlots}
          disabled={!selectedClinic || !selectedDate}
          className="generate-btn"
        >
          🔄 عرض المواعيد
        </button>
      </div>

      {selectedClinic && selectedDate && (
        <>
          <div className="add-slot-form">
            <h4>إضافة موعد جديد</h4>
            <div className="slot-inputs">
              <input
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})}
                placeholder="وقت البدء"
              />
              <span>إلى</span>
              <input
                type="time"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})}
                placeholder="وقت الانتهاء"
              />
              <button onClick={handleAddSlot} className="add-btn">
                ➕ إضافة
              </button>
            </div>
          </div>

          <div className="appointments-grid">
            <h4>المواعيد المتاحة ليوم {selectedDate}</h4>

            {loading ? (
              <div className="loading">جاري تحميل المواعيد...</div>
            ) : (
              <div className="time-slots">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`time-slot ${slot.is_booked ? 'booked' : 'available'}`}
                    onClick={() => !slot.is_booked && handleDeleteSlot(slot.time)}
                    title={slot.is_booked ? 'محجوز - انقر للحذف' : 'متاح - انقر للحذف'}
                  >
                    <span className="slot-time">{slot.time} - {slot.end_time}</span>
                    <span className="slot-status">
                      {slot.is_booked ? '🔴 محجوز' : '🟢 متاح'}
                    </span>
                    {!slot.is_booked && (
                      <button className="delete-btn">🗑️</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="appointment-stats">
            <div className="stat-item">
              <span className="stat-label">المجموع:</span>
              <span className="stat-value">{timeSlots.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">المتاحة:</span>
              <span className="stat-value available">
                {timeSlots.filter(slot => !slot.is_booked).length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">المحجوزة:</span>
              <span className="stat-value booked">
                {timeSlots.filter(slot => slot.is_booked).length}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentManager;
