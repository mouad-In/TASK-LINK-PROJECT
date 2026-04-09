import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false,
    taskUpdates: true,
    messages: true,
    marketing: false,
  },
  privacy: {
    profileVisible: true,
    showLocation: true,
    showPhone: false,
  },
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
  },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    updateNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updateNotificationPrefs: (state, action) => {
    state.notifications = { ...state.notifications, ...action.payload };
  },
    updatePrivacySettings: (state, action) => {
      state.privacy = { ...state.privacy, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setTheme,
  toggleTheme,          
  setLanguage,
  updateNotificationSettings,
  updateNotificationPrefs,  
  updatePrivacySettings,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;