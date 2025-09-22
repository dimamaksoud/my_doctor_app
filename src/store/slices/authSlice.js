// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService'; // استيراد صحيح

/**
 * تسجيل الدخول للطبيب - Async Thunk
 */
export const loginDoctor = createAsyncThunk(
  'auth/loginDoctor',
  async (credentials, { rejectWithValue }) => {
    try {
      // استخدام authService بدلاً من doctorService
      const doctor = await authService.login(credentials);
      return doctor;
    } catch (error) {
      return rejectWithValue(error.message || 'فشل تسجيل الدخول');
    }
  }
);

/**
 * تسجيل طبيب جديد - Async Thunk
 */
export const registerDoctor = createAsyncThunk(
  'auth/registerDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      // استخدام authService بدلاً من doctorService
      const doctor = await authService.register(doctorData);
      return doctor;
    } catch (error) {
      return rejectWithValue(error.message || 'فشل إنشاء الحساب');
    }
  }
);

const initialState = {
  doctor: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    loginSuccess: (state, action) => {
      state.doctor = action.payload.doctor;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.doctor = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateDoctor: (state, action) => {
      if (state.doctor) {
        state.doctor = { ...state.doctor, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // تسجيل الدخول
      .addCase(loginDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.doctor = action.payload; // البيانات تأتي مباشرة من authService
        state.isAuthenticated = true;
        state.error = null;

        // حفظ token إذا كان موجوداً في البيانات
        if (action.payload.token) {
          state.token = action.payload.token;
        }
      })
      .addCase(loginDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.doctor = null;
        state.token = null;
      })

      // تسجيل جديد
      .addCase(registerDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.doctor = action.payload; // البيانات تأتي مباشرة من authService
        state.isAuthenticated = true;
        state.error = null;

        // حفظ token إذا كان موجوداً في البيانات
        if (action.payload.token) {
          state.token = action.payload.token;
        }
      })
      .addCase(registerDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.doctor = null;
        state.token = null;
      });
  }
});

export const {
  setLoading,
  loginSuccess,
  logout,
  setError,
  clearError,
  updateDoctor
} = authSlice.actions;

export default authSlice.reducer;
