import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const { id = Date.now(), message, type = 'info', duration = 5000 } = action.payload;
      state.toasts.unshift({ id, message, type, duration, createdAt: Date.now() });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = notificationsSlice.actions;
export default notificationsSlice.reducer;

