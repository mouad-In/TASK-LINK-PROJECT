// store/client/taskFavoritesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskFavoritesService } from '@/services/api';

const initialState = {
  favoriteTasks: [],
  isLoading: false,
  error: null,
};

export const fetchFavoriteTasks = createAsyncThunk(
  'taskFavorites/fetchFavoriteTasks',
  async (clientId, { rejectWithValue }) => {
    try {
      return await taskFavoritesService.getFavoriteTasks(clientId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'taskFavorites/addToFavorites',
  async ({ clientId, taskId }, { rejectWithValue }) => {
    try {
      return await taskFavoritesService.addFavoriteTask(clientId, taskId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'taskFavorites/removeFromFavorites',
  async ({ clientId, taskId }, { rejectWithValue }) => {
    try {
      await taskFavoritesService.removeFavoriteTask(clientId, taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'taskFavorites',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch favorites
      .addCase(fetchFavoriteTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favoriteTasks = action.payload;
      })
      .addCase(fetchFavoriteTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to favorites
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.favoriteTasks.push(action.payload);
      })
      // Remove from favorites
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.favoriteTasks = state.favoriteTasks.filter(
          (task) => task.id !== action.payload
        );
      });
  },
});

export const { clearError } = favoritesSlice.actions;
export default favoritesSlice.reducer;