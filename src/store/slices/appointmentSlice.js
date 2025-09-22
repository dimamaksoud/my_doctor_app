import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  availableSlots: [],
  loading: false,
  error: null
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAppointments: (state, action) => {
      state.appointments = action.payload;
      state.error = null;
    },
    setAvailableSlots: (state, action) => {
      state.availableSlots = action.payload;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
    cancelAppointment: (state, action) => {
      const appointment = state.appointments.find(a => a.appointment_id === action.payload);
      if (appointment) {
        appointment.status = 'cancelled';
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setLoading,
  setAppointments,
  setAvailableSlots,
  addAppointment,
  cancelAppointment,
  setError
} = appointmentSlice.actions;
export default appointmentSlice.reducer;
