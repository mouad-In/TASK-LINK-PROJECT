import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService, taskService } from '@/services/api';

// ─── Async Thunks ───────────────────────────────────────────────

export const fetchClientStats = createAsyncThunk(
    'client/fetchClientStats',
    async (clientId, { rejectWithValue }) => {
        try {
            const tasks = await taskService.getTasksByClient(clientId);

            const activeTasks = tasks.filter(t =>
                t.status === 'in_progress' || t.status === 'assigned' || t.status === 'open'
            ).length;

            const completedTasks = tasks.filter(t => t.status === 'completed');

            const workersHired = new Set(
                completedTasks.map(t => t.assigned_worker_id).filter(Boolean)
            ).size;

            const totalSpent = completedTasks.reduce((sum, t) => sum + (t.budget || 0), 0);

            const ratingsGiven = tasks.filter(t => t.my_rating);
            const averageRating = ratingsGiven.length
                ? (ratingsGiven.reduce((sum, t) => sum + t.my_rating, 0) / ratingsGiven.length)
                : 0;

            return {
                activeTasks,
                activeTasksChange: 2,
                workersHired,
                workersHiredChange: 1,
                totalSpent,
                spentChange: 12,
                averageRating,
                ratingChange: 0.2,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchBudgetAnalytics = createAsyncThunk(
    'client/fetchBudgetAnalytics',
    async (clientId, { rejectWithValue }) => {
        try {
            const tasks = await taskService.getTasksByClient(clientId);

            const completedTasks = tasks.filter(t => t.status === 'completed');
            const totalSpent = completedTasks.reduce((sum, t) => sum + (t.budget || 0), 0);
            const monthlyBudget = 5000;
            const remaining = Math.max(0, monthlyBudget - totalSpent);
            const percentage = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));

            // تجميع الإنفاق حسب الفئة
            const categoryMap = {};
            completedTasks.forEach(task => {
                const cat = task.category || 'Other';
                categoryMap[cat] = (categoryMap[cat] || 0) + (task.budget || 0);
            });

            const categories = Object.entries(categoryMap).map(([name, amount]) => ({
                name,
                amount,
                percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
            }));

            return {
                spent: totalSpent,
                total: monthlyBudget,
                remaining,
                percentage,
                categories,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchClientProfile = createAsyncThunk(
    'client/fetchClientProfile',
    async (clientId, { rejectWithValue }) => {
        try {
            const data = await userService.getUserById(clientId);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);
export const updateClientProfile = createAsyncThunk(
    'client/updateClientProfile',
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

// ─── Initial State ───────────────────────────────────────────────

const initialState = {
    profile: null,
    stats: {
        activeTasks: 0,
        activeTasksChange: 0,
        workersHired: 0,
        workersHiredChange: 0,
        totalSpent: 0,
        spentChange: 0,
        averageRating: 0,
        ratingChange: 0,
    },
    budgetAnalytics: {
        spent: 0,
        total: 5000,
        remaining: 5000,
        percentage: 0,
        categories: [],
    },
    isLoading: false,
    error: null,
};

// ─── Slice ───────────────────────────────────────────────────────

const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {
        setClientProfile: (state, action) => {
            state.profile = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            // fetchClientProfile
            .addCase(fetchClientProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchClientProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
            })
            .addCase(fetchClientProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // fetchClientStats
            .addCase(fetchClientStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchClientStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchClientStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // fetchBudgetAnalytics
            .addCase(fetchBudgetAnalytics.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchBudgetAnalytics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.budgetAnalytics = action.payload;
            })
            .addCase(fetchBudgetAnalytics.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateClientProfile.fulfilled, (state, action) => {
                state.profile = { ...state.profile, ...action.payload };
            });
    },
});

export const { setClientProfile, clearError } = clientSlice.actions;
export default clientSlice.reducer;