import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { savedTasksService } from '@/services/api'
// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchSavedTasks = createAsyncThunk(
    'savedTasks/fetchSavedTasks',
    async (_, thunkAPI) => {
        try {
            return await savedTasksService.getSavedTasks()
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch saved tasks'
            )
        }
    }
)

export const unsaveTask = createAsyncThunk(
    'savedTasks/unsaveTask',
    async (taskId, thunkAPI) => {
        try {
            await savedTasksService.unsaveTask(taskId)
            return taskId
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to remove saved task'
            )
        }
    }
)

export const saveTask = createAsyncThunk(
    'savedTasks/saveTask',
    async (taskId, thunkAPI) => {
        try {
            return await savedTasksService.saveTask(taskId)
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to save task'
            )
        }
    }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const savedTasksSlice = createSlice({
    name: 'savedTasks',
    initialState: {
        items: [],
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        // fetchSavedTasks
        builder
            .addCase(fetchSavedTasks.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSavedTasks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchSavedTasks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || action.error.message;
            });

        // saveTask
        builder
            .addCase(saveTask.fulfilled, (state, action) => {
                const exists = state.items.find((t) => t.id === action.payload.id);
                if (!exists) state.items.push(action.payload);
            })
            .addCase(saveTask.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
            });

        // unsaveTask
        builder
            .addCase(unsaveTask.fulfilled, (state, action) => {
                state.items = state.items.filter((t) => t.id !== action.payload);
            })
            .addCase(unsaveTask.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
            });
    },
});

export default savedTasksSlice.reducer;