// src/store/slices/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentService } from '../../services/appointmentService';

// جلب المواعيد المتاحة لطبيب معين في تاريخ محدد
export const fetchAvailableSlots = createAsyncThunk(
  'booking/fetchAvailableSlots',
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      return await appointmentService.getAvailableSlots(doctorId, date);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// جلب مواعيد الطبيب
export const fetchDoctorAppointments = createAsyncThunk(
  'booking/fetchDoctorAppointments',
  async ({ doctorId, filters = {} }, { rejectWithValue }) => {
    try {
      return await appointmentService.getDoctorAppointments(doctorId, filters);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// حجز موعد جديد
export const bookAppointment = createAsyncThunk(
  'booking/bookAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      return await appointmentService.bookAppointment(appointmentData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// تأكيد الموعد
export const confirmAppointment = createAsyncThunk(
  'booking/confirmAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      return await appointmentService.confirmAppointment(appointmentId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// إلغاء الموعد
export const cancelAppointment = createAsyncThunk(
  'booking/cancelAppointment',
  async ({ appointmentId, reason }, { rejectWithValue }) => {
    try {
      return await appointmentService.cancelAppointment(appointmentId, reason);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// الحالة الابتدائية
const initialState = {
  availableSlots: [],
  appointments: [],
  loading: false,
  error: null,
  bookingSuccess: false,
  bookingData: null,
  filters: {
    date: '',
    status: '',
    patientName: ''
  }
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingState: (state) => {
      state.bookingSuccess = false;
      state.error = null;
      state.bookingData = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { date: '', status: '', patientName: '' };
    },
    setAvailableSlots: (state, action) => {
      state.availableSlots = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAvailableSlots
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.availableSlots = [];
      })

      // fetchDoctorAppointments
      .addCase(fetchDoctorAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
        state.error = null;
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.appointments = [];
      })

      // bookAppointment
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookingSuccess = false;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingSuccess = true;
        state.bookingData = action.payload;
        state.error = null;

        // إضافة الموعد الجديد إلى القائمة
        if (action.payload) {
          state.appointments.push(action.payload);
        }
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bookingSuccess = false;
        state.bookingData = null;
      })

      // confirmAppointment
      .addCase(confirmAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const appointmentId = action.meta.arg;
        state.appointments = state.appointments.map(apt =>
          apt.appointment_id === appointmentId
            ? { ...apt, status: 'confirmed' }
            : apt
        );
      })
      .addCase(confirmAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // cancelAppointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const appointmentId = action.meta.arg.appointmentId;
        state.appointments = state.appointments.map(apt =>
          apt.appointment_id === appointmentId
            ? { ...apt, status: 'cancelled', cancellation_reason: action.meta.arg.reason }
            : apt
        );
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearBookingState,
  setFilters,
  clearFilters,
  setAvailableSlots,
  clearError
} = bookingSlice.actions;

export default bookingSlice.reducer;
