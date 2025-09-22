// src/store/slices/doctorSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doctorService } from '../../services/doctorService';

// إضافة هذا الـ async thunk
export const fetchDoctorsList = createAsyncThunk(
  'doctor/fetchDoctorsList',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const doctors = await doctorService.getDoctorsList(filters);
      return doctors;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// في store/slices/doctorSlice.js - إضافة الـ actions
export const createAppointmentSlot = createAsyncThunk(
  'doctor/createAppointmentSlot',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentService.createAppointment(appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAppointmentSlot = createAsyncThunk(
  'doctor/deleteAppointmentSlot',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await appointmentService.cancelAppointment(appointmentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  doctorsList: [],
  loading: false,
  error: null
};

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    setDoctorsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDoctorsList: (state, action) => {
      state.doctorsList = action.payload;
      state.error = null;
    },
    setDoctorsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addDoctorToList: (state, action) => {
      state.doctorsList.push(action.payload);
    },
    updateDoctorInList: (state, action) => {
      const index = state.doctorsList.findIndex(d => d.doctor_id === action.payload.doctor_id);
      if (index !== -1) {
        state.doctorsList[index] = action.payload;
      }
    },
    clearDoctorsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorsList.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorsList = action.payload;
      })
      .addCase(fetchDoctorsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setDoctorsLoading,
  setDoctorsList,
  setDoctorsError,
  addDoctorToList,
  updateDoctorInList,
  clearDoctorsError
} = doctorSlice.actions;

export default doctorSlice.reducer;
