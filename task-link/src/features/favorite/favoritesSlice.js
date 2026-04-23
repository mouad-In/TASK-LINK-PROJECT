import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoritesService } from '@/services/api';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchFavoriteTasks = createAsyncThunk(
  'favorites/fetchFavoriteTasks',
  async (clientId, { rejectWithValue }) => {
    try {
      return await favoritesService.getFavorites(clientId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async ({ clientId, taskId }, { rejectWithValue }) => {
    try {
      return await favoritesService.addFavorite(clientId, taskId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async ({ clientId, taskId }, { rejectWithValue }) => {
    try {
      await favoritesService.removeFavorite(clientId, taskId);
      return taskId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearFavoritesError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchFavoriteTasks
      .addCase(fetchFavoriteTasks.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchFavoriteTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchFavoriteTasks.rejected,  (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // addToFavorites
      .addCase(addToFavorites.fulfilled, (state, action) => {
        if (!state.favorites) state.favorites = [];
        if (action.payload) {
          const exists = state.favorites.find((t) => t.id === action.payload.id);
          if (!exists) state.favorites.unshift(action.payload);
        }
      })

      // removeFromFavorites
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.favorites = (state.favorites ?? []).filter(
          (t) => String(t.id) !== String(action.payload)
        );
      });
  },
});

export const { clearFavoritesError } = favoritesSlice.actions;
export default favoritesSlice.reducer;