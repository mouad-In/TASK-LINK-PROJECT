// src/store/tasks/tasksSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '@/services/api';
import { addToast } from '../notifications/notificationsSlice';

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  tasks:        [],
  currentTask:  null,
  filteredTasks:[],
  isLoading:    false,
  error:        null,
  // Pagination meta from Laravel paginator
  pagination: {
    currentPage: 1,
    lastPage:    1,
    total:       0,
    perPage:     20,
  },
  filters: {
    category:  '',
    minBudget: '',
    maxBudget: '',
    urgency:   '',
    status:    '',
    search:    '',
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalize Laravel snake_case → camelCase for the frontend.
 * Laravel sends: budget_type, full_description, posted_at, applications_count
 */
const normalize = (task) => ({
  ...task,
  budgetType:        task.budget_type        ?? task.budgetType        ?? 'Fixed Price',
  fullDescription:   task.full_description   ?? task.fullDescription   ?? '',
  postedAt:          task.posted_at          ?? task.postedAt          ?? '',
  applicationsCount: task.applications_count ?? task.applicationsCount
                      ?? task.applications?.length ?? 0,
});

const applyFilters = (tasks, filters) => {
  const { category, minBudget, maxBudget, urgency, status, search } = filters;
  return tasks.filter((t) =>
    (!category  || t.category === category) &&
    (!minBudget || t.budget   >= parseInt(minBudget, 10)) &&
    (!maxBudget || t.budget   <= parseInt(maxBudget, 10)) &&
    (!urgency   || t.urgency  === urgency) &&
    (!status    || t.status   === status) &&
    (!search    ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()))
  );
};

// ── Async Thunks ──────────────────────────────────────────────────────────────

/** GET /api/tasks  — pass filters as params to let Laravel filter server-side */
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await taskService.getAllTasks(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** GET /api/tasks/:id */
export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId, { rejectWithValue }) => {
    try {
      return await taskService.getTaskById(taskId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** POST /api/tasks  🔒 JWT */
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { dispatch, rejectWithValue }) => {
    try {
      const data = await taskService.createTask(taskData);
      dispatch(addToast({ message: 'Task created successfully!', type: 'success' }));
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** PUT /api/tasks/:id  🔒 JWT */
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { dispatch, rejectWithValue }) => {
    try {
      const data = await taskService.updateTask(taskId, taskData);
      dispatch(addToast({ message: 'Task updated successfully!', type: 'success' }));
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** DELETE /api/tasks/:id  🔒 JWT */
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { dispatch, rejectWithValue }) => {
    try {
      await taskService.deleteTask(taskId);
      dispatch(addToast({ message: 'Task deleted successfully!', type: 'success' }));
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** POST /api/tasks/:id/assign  🔒 JWT */
export const assignWorker = createAsyncThunk(
  'tasks/assignWorker',
  async ({ taskId, workerId }, { dispatch, rejectWithValue }) => {
    try {
      const data = await taskService.assignWorker(taskId, workerId);
      dispatch(addToast({ message: 'Worker assigned successfully!', type: 'success' }));
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters       = { ...state.filters, ...action.payload };
      state.filteredTasks = applyFilters(state.tasks, state.filters);
    },
    clearFilters: (state) => {
      state.filters       = initialState.filters;
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
      // ── Fetch All Tasks ──────────────────────────────────────────────────
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;

        // Handle both paginated { data[], ... } and plain array responses
        const raw = action.payload?.data ?? action.payload ?? [];

        state.tasks         = raw.map(normalize);
        state.filteredTasks = applyFilters(state.tasks, state.filters);

        // Store pagination meta if present
        if (action.payload?.current_page) {
          state.pagination = {
            currentPage: action.payload.current_page,
            lastPage:    action.payload.last_page,
            total:       action.payload.total,
            perPage:     action.payload.per_page,
          };
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      })

      // ── Fetch Task By ID ─────────────────────────────────────────────────
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.isLoading   = false;
        state.currentTask = normalize(action.payload);
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      })

      // ── Create Task ──────────────────────────────────────────────────────
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const task = normalize(action.payload);
        state.tasks.unshift(task);  // newest first
        state.filteredTasks = applyFilters(state.tasks, state.filters);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      })

      // ── Update Task ──────────────────────────────────────────────────────
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = normalize(action.payload);
        state.tasks         = state.tasks.map((t) => (t.id === updated.id ? updated : t));
        state.filteredTasks = applyFilters(state.tasks, state.filters);
        state.currentTask   = updated;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      })

      // ── Delete Task ──────────────────────────────────────────────────────
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading     = false;
        state.tasks         = state.tasks.filter((t) => t.id !== action.payload);
        state.filteredTasks = applyFilters(state.tasks, state.filters);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      })

      // ── Assign Worker ────────────────────────────────────────────────────
      .addCase(assignWorker.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(assignWorker.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = normalize(action.payload);
        state.tasks         = state.tasks.map((t) => (t.id === updated.id ? updated : t));
        state.filteredTasks = applyFilters(state.tasks, state.filters);
        state.currentTask   = updated;
      })
      .addCase(assignWorker.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentTask, clearError } = tasksSlice.actions;
export default tasksSlice.reducer;