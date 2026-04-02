import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewService } from '../../services/api';

const initialState = {
  reviews: [],
  currentReview: null,
  isLoading: false,
  error: null,
  averageRating: 0,
};

// Async thunks
export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (_, thunkAPI) => {
    try {
      const data = await reviewService.getAllReviews();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchReviewsByUser = createAsyncThunk(
  'reviews/fetchReviewsByUser',
  async (userId, thunkAPI) => {
    try {
      const data = await reviewService.getReviewsByUser(userId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchReviewsByTask = createAsyncThunk(
  'reviews/fetchReviewsByTask',
  async (taskId, thunkAPI) => {
    try {
      const data = await reviewService.getReviewsByTask(taskId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, thunkAPI) => {
    try {
      const data = await reviewService.createReview(reviewData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    calculateAverageRating: (state, action) => {
      const userReviews = state.reviews.filter(
        (review) => review.revieweeId === action.payload
      );
      if (userReviews.length > 0) {
        const totalRating = userReviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        state.averageRating = totalRating / userReviews.length;
      }
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reviews
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Reviews By User
      .addCase(fetchReviewsByUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
        // Calculate average rating
        if (action.payload.length > 0) {
          const totalRating = action.payload.reduce(
            (sum, review) => sum + review.rating,
            0
          );
          state.averageRating = totalRating / action.payload.length;
        }
      })
      .addCase(fetchReviewsByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Reviews By Task
      .addCase(fetchReviewsByTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsByTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews.push(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { calculateAverageRating, clearCurrentReview, clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;

