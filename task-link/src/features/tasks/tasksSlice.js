import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../services/api';
import { addToast } from '../notifications/notificationsSlice';

const initialState = {
  tasks: [],
  currentTask: null,
  filteredTasks: [],
  isLoading: false,
  error: null,
  filters: {
    category: '',
    minBudget: '',
    maxBudget: '',
    urgency: '',
    status: '',
    search: '',
  },
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, thunkAPI) => {
    try {
      const data = await taskService.getAllTasks();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId, thunkAPI) => {
    try {
      const data = await taskService.getTaskById(taskId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, thunkAPI) => {
    try {
      const data = await taskService.createTask(taskData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, thunkAPI) => {
    try {
      const data = await taskService.updateTask(taskId, taskData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, thunkAPI) => {
    try {
      await taskService.deleteTask(taskId);
      return taskId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const assignWorker = createAsyncThunk(
  'tasks/assignWorker',
  async ({ taskId, workerId }, thunkAPI) => {
    try {
      const data = await taskService.assignWorker(taskId, workerId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Apply filters
      state.filteredTasks = state.tasks.filter((task) => {
        const matchesCategory = !state.filters.category || task.category === state.filters.category;
        const matchesMinBudget = !state.filters.minBudget || task.budget >= parseInt(state.filters.minBudget);
        const matchesMaxBudget = !state.filters.maxBudget || task.budget <= parseInt(state.filters.maxBudget);
        const matchesUrgency = !state.filters.urgency || task.urgency === state.filters.urgency;
        const matchesStatus = !state.filters.status || task.status === state.filters.status;
        const matchesSearch = !state.filters.search || 
          task.title.toLowerCase().includes(state.filters.search.toLowerCase()) ||
          task.description.toLowerCase().includes(state.filters.search.toLowerCase());
        return matchesCategory && matchesMinBudget && matchesMaxBudget && matchesUrgency && matchesStatus && matchesSearch;
      });
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredTasks = state.tasks;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.map(task => ({
          ...task,
          applicationsCount: task.applications ? task.applications.length : 0
        }));
        state.filteredTasks = state.tasks;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Task By ID
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action, thunkAPI) => {
        state.isLoading = false;
        state.tasks.push(action.payload);
        state.filteredTasks.push(action.payload);
        thunkAPI.dispatch(addToast({ message: 'Task created and published successfully!', type: 'success' }));
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action, thunkAPI) => {
        state.isLoading = false;
        state.tasks = state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        );
        state.filteredTasks = state.filteredTasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        );
        state.currentTask = action.payload;
        thunkAPI.dispatch(addToast({ message: 'Task updated successfully!', type: 'success' }));
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
        state.filteredTasks = state.filteredTasks.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Assign Worker
      .addCase(assignWorker.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignWorker.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        );
        state.filteredTasks = state.filteredTasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        );
        state.currentTask = action.payload;
      })
      .addCase(assignWorker.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentTask, clearError } = tasksSlice.actions;
export default tasksSlice.reducer;

