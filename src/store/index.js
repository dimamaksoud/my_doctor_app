import { configureStore } from '@reduxjs/toolkit';
import doctorReducer from './slices/doctorSlice';
import appointmentReducer from './slices/appointmentSlice';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice'; // تأكد من أن المسار صحيح

import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctor: doctorReducer,
    appointments: appointmentReducer,
    booking: bookingReducer, // تأكد من إضافته هنا
    notifications: notificationReducer,

  },
});

export default store;
