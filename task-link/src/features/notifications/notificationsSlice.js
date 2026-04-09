import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  unreadCount: 0,
  notifications: [],
  toasts: [],
  isLoading: false,
};

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, thunkAPI) => {
    const response = { unreadCount: 3 };
    return response.unreadCount;
  }
);

export const markNotificationsAsRead = createAsyncThunk(
  'notifications/markNotificationsAsRead',
  async (_, thunkAPI) => {
    return true;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    addToast: (state, action) => {
      state.toasts.push({
        id: Date.now(),
        title: action.payload.title || '',
        description: action.payload.description || '',
        variant: action.payload.variant || 'default',
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationsAsRead.fulfilled, (state) => {
        state.unreadCount = 0;
      });
  },
});

export const { setUnreadCount, addToast, removeToast } = notificationsSlice.actions;
export default notificationsSlice.reducer;