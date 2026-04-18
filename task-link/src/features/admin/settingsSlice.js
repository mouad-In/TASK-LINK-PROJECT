// store/admin/settingsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '@/services/api';

// ─── Async Thunks ───────────────────────────────────────────────

export const fetchSettings = createAsyncThunk(
  'adminSettings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getSettings();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateGeneralSettings = createAsyncThunk(
  'adminSettings/updateGeneralSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await adminService.updateSettings({ general: settings });
      return { general: settings };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updatePaymentSettings = createAsyncThunk(
  'adminSettings/updatePaymentSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await adminService.updateSettings({ payment: settings });
      return { payment: settings };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'adminSettings/updateNotificationSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await adminService.updateSettings({ notifications: settings });
      return { notifications: settings };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateSecuritySettings = createAsyncThunk(
  'adminSettings/updateSecuritySettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await adminService.updateSettings({ security: settings });
      return { security: settings };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Initial State ───────────────────────────────────────────────

const initialState = {
  settings: null,
  isLoading: false,
  error: null,
};

// ─── Slice ───────────────────────────────────────────────────────

const settingsSlice = createSlice({
  name: 'adminSettings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update General Settings
      .addCase(updateGeneralSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      })
      // Update Payment Settings
      .addCase(updatePaymentSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      })
      // Update Notification Settings
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      })
      // Update Security Settings
      .addCase(updateSecuritySettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      });
  },
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer;