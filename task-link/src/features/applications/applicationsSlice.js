import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applicationService } from '../../services/api';
import { addToast } from '../notifications/notificationsSlice';

const initialState = {
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchApplications = createAsyncThunk(
  'applications/fetchApplications',
  async (_, thunkAPI) => {
    try {
      const data = await applicationService.getAllApplications();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchApplicationsByTask = createAsyncThunk(
  'applications/fetchApplicationsByTask',
  async (taskId, thunkAPI) => {
    try {
      const data = await applicationService.getApplicationsByTask(taskId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchApplicationsByWorker = createAsyncThunk(
  'applications/fetchApplicationsByWorker',
  async (workerId, thunkAPI) => {
    try {
      const data = await applicationService.getApplicationsByWorker(workerId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const createApplication = createAsyncThunk(
  'applications/createApplication',
  async (applicationData, thunkAPI) => {
    try {
      const data = await applicationService.createApplication(applicationData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateApplicationStatus',
  async ({ applicationId, status }, thunkAPI) => {
    try {
      const data = await applicationService.updateApplicationStatus(applicationId, status);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Applications
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Applications By Task
      .addCase(fetchApplicationsByTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplicationsByTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplicationsByTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Applications By Worker
      .addCase(fetchApplicationsByWorker.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplicationsByWorker.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplicationsByWorker.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Application
      .addCase(createApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createApplication.fulfilled, (state, action, thunkAPI) => {
        state.isLoading = false;
        state.applications.push(action.payload);
        thunkAPI.dispatch(addToast({ message: 'Application submitted successfully!', type: 'success' }));
      })
      .addCase(createApplication.rejected, (state, action, thunkAPI) => {
        state.isLoading = false;
        state.error = action.payload;
        thunkAPI.dispatch(addToast({ message: action.payload || 'Failed to submit application', type: 'error' }));
      })
      // Update Application Status
      .addCase(updateApplicationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action, thunkAPI) => {
        state.isLoading = false;
        state.applications = state.applications.map((app) =>
          app.id === action.payload.id ? action.payload : app
        );
        const status = action.payload.status;
        let message = '';
        if (status === 'accepted') {
          message = 'Application accepted! Task assigned.';
        } else if (status === 'rejected') {
          message = 'Application rejected.';
        }
        if (message) {
          thunkAPI.dispatch(addToast({ message, type: 'success' }));
        }
      })
      .addCase(updateApplicationStatus.rejected, (state, action, thunkAPI) => {
        state.isLoading = false;
        state.error = action.payload;
        thunkAPI.dispatch(addToast({ message: action.payload || 'Failed to update application', type: 'error' }));
      });
  },
});

export const { clearCurrentApplication, clearError } = applicationsSlice.actions;
export default applicationsSlice.reducer;

