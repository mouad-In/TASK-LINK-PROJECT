// store/client/favoritesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import  {favoritesService } from '@/services/api';

const initialState = {
  favorites: [],
  isLoading: false,
  error: null,
};

export const fetchFavoriteWorkers = createAsyncThunk(
  'favorites/fetchFavoriteWorkers',
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await favoritesService.getFavorites(clientId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async ({ clientId, workerId }, { rejectWithValue }) => {
    try {
      const response = await favoritesService.addFavorite(clientId, workerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async ({ clientId, workerId }, { rejectWithValue }) => {
    try {
      await favoritesService.removeFavorite(clientId, workerId);
      return workerId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavoritesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Favorites
      .addCase(fetchFavoriteWorkers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteWorkers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavoriteWorkers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to Favorites
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.favorites.unshift(action.payload);
      })
      // Remove from Favorites
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(worker => worker.id !== action.payload);
      });
  },
});

export const { clearFavoritesError } = favoritesSlice.actions;
export default favoritesSlice.reducer;