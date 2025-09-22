import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';

export const fetchPatientNotifications = createAsyncThunk(
  'notifications/fetchPatientNotifications',
  async (phone, { rejectWithValue }) => {
    try {
      return await notificationService.getPatientNotifications(phone);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDoctorNotifications = createAsyncThunk(
  'notifications/fetchDoctorNotifications',
  async (doctorId, { rejectWithValue }) => {
    try {
      return await notificationService.getDoctorNotifications(doctorId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ notificationId, userType, userId }, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId, userType);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async ({ userType, userId }, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead(userType, userId);
      return { userType, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  patientNotifications: [],
  doctorNotifications: [],
  loading: false,
  error: null,
  unreadCount: 0
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const { userType, notification } = action.payload;
      if (userType === 'patient') {
        state.patientNotifications.unshift(notification);
      } else {
        state.doctorNotifications.unshift(notification);
      }
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
      state.patientNotifications = [];
      state.doctorNotifications = [];
      state.unreadCount = 0;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.patientNotifications = action.payload;
        state.unreadCount = action.payload.filter(notif => !notif.isRead).length;
      })
      .addCase(fetchPatientNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDoctorNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorNotifications = action.payload;
        state.unreadCount = action.payload.filter(notif => !notif.isRead).length;
      })
      .addCase(fetchDoctorNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        state.patientNotifications = state.patientNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        );
        state.doctorNotifications = state.doctorNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        );
        state.unreadCount = [
          ...state.patientNotifications,
          ...state.doctorNotifications
        ].filter(notif => !notif.isRead).length;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.patientNotifications = state.patientNotifications.map(notif => ({
          ...notif,
          isRead: true
        }));
        state.doctorNotifications = state.doctorNotifications.map(notif => ({
          ...notif,
          isRead: true
        }));
        state.unreadCount = 0;
      });
  }
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
