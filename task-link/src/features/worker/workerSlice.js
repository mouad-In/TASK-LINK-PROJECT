import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService, taskService, reviewService } from '@/services/api';

// ─── Async Thunks ───────────────────────────────────────────────

export const fetchWorkerProfile = createAsyncThunk(
    'worker/fetchWorkerProfile',
    async (workerId, { rejectWithValue }) => {
        try {
            const data = await userService.getUserById(workerId);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchWorkerStats = createAsyncThunk(
    'worker/fetchWorkerStats',
    async (workerId, { rejectWithValue }) => {
        try {
            const [tasks, reviews] = await Promise.all([
                taskService.getTasksByWorker(workerId),
                reviewService.getReviewsByUser(workerId),
            ]);

            const completedTasks = tasks.filter(t => t.status === 'completed');

            // حساب الأرباح الشهرية
            const now = new Date();
            const thisMonth = completedTasks.filter(t => {
                const d = new Date(t.updated_at);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
            const monthlyEarnings = thisMonth.reduce((sum, t) => sum + (t.budget || 0), 0);

            // حساب متوسط التقييم
            const averageRating = reviews.length
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                : 0;

            return {
                monthlyEarnings,
                earningsGrowth: 12,
                averageRating: parseFloat(averageRating.toFixed(1)),
                ratingChange: 0.2,
                totalEarnings: completedTasks.reduce((sum, t) => sum + (t.budget || 0), 0),
                completedTasksCount: completedTasks.length,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchPerformanceMetrics = createAsyncThunk(
    'worker/fetchPerformanceMetrics',
    async (workerId, { rejectWithValue }) => {
        try {
            const [tasks, reviews] = await Promise.all([
                taskService.getTasksByWorker(workerId),
                reviewService.getReviewsByUser(workerId),
            ]);

            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const cancelledTasks = tasks.filter(t => t.status === 'cancelled').length;

            const completionRate = totalTasks > 0
                ? Math.round((completedTasks / (totalTasks - cancelledTasks)) * 100)
                : 0;

            // حساب التسليم في الوقت
            const onTimeTasks = tasks.filter(t =>
                t.status === 'completed' &&
                t.due_date &&
                new Date(t.updated_at) <= new Date(t.due_date)
            ).length;

            const onTimeRate = completedTasks > 0
                ? Math.round((onTimeTasks / completedTasks) * 100)
                : 0;

            // رضا العملاء بناءً على التقييمات
            const positiveReviews = reviews.filter(r => r.rating >= 4).length;
            const satisfactionRate = reviews.length > 0
                ? Math.round((positiveReviews / reviews.length) * 100)
                : 0;

            return {
                completionRate,
                completionRateChange: 5,
                onTimeRate,
                satisfactionRate,
                completedTasks,
                totalTasks,
                totalReviews: reviews.length,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);
export const updateWorkerProfile = createAsyncThunk(
    'worker/updateWorkerProfile',
    async (profileData, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            const data = await userService.updateUser(auth.user?.id, profileData);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const changePassword = createAsyncThunk(
    'worker/changePassword',
    async (passwordData, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            const data = await userService.updateUser(auth.user?.id, passwordData);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updateWorkerAvailability = createAsyncThunk(
    'worker/updateWorkerAvailability',
    async (availabilityData, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            const data = await userService.updateUser(auth.user?.id, { availability: availabilityData });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const deleteAccount = createAsyncThunk(
    'worker/deleteAccount',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            await userService.updateUser(auth.user?.id, { deleted: true });
            return true;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);
export const updateWorkerSettings = createAsyncThunk(
  "worker/updateSettings",
  async (data, thunkAPI) => {
    try {
      // API call هنا
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ─── Initial State ───────────────────────────────────────────────

const initialState = {
    profile: null,
    stats: {
        monthlyEarnings: 0,
        earningsGrowth: 0,
        averageRating: 0,
        ratingChange: 0,
        totalEarnings: 0,
        completedTasksCount: 0,
    },
    performance: {
        completionRate: 0,
        completionRateChange: 0,
        onTimeRate: 0,
        satisfactionRate: 0,
        completedTasks: 0,
        totalTasks: 0,
        totalReviews: 0,
    },
    isLoading: false,
    error: null,
};

// ─── Slice ───────────────────────────────────────────────────────

const workerSlice = createSlice({
    name: 'worker',
    initialState,
    reducers: {
        setWorkerProfile: (state, action) => {
            state.profile = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            // fetchWorkerProfile
            .addCase(fetchWorkerProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkerProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
            })
            .addCase(fetchWorkerProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // fetchWorkerStats
            .addCase(fetchWorkerStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkerStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchWorkerStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // fetchPerformanceMetrics
            .addCase(fetchPerformanceMetrics.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.performance = action.payload;
            })
            .addCase(fetchPerformanceMetrics.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(updateWorkerProfile.fulfilled, (state, action) => {
                state.profile = { ...state.profile, ...action.payload };
            })
            .addCase(changePassword.fulfilled, (state) => {
                // done
            })
            .addCase(updateWorkerAvailability.fulfilled, (state, action) => {
                if (state.profile) state.profile.availability = action.payload.availability;
            })
            .addCase(deleteAccount.fulfilled, (state) => {
                state.profile = null;
            });
            

    },
});

export const { setWorkerProfile, clearError } = workerSlice.actions;
export default workerSlice.reducer;