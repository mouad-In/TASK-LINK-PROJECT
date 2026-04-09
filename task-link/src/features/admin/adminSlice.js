import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService, taskService } from '@/services/api';

// ─── Async Thunks ───────────────────────────────────────────────

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async ({ range }, { rejectWithValue }) => {
    try {
      const [users, tasks] = await Promise.all([
        userService.getAllUsers(),
        taskService.getAllTasks(),
      ]);

      const totalUsers = users.length;
      const totalWorkers = users.filter(u => u.role === 'worker').length;
      const totalClients = users.filter(u => u.role === 'client').length;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalRevenue = tasks
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.budget || 0), 0);

      return [
        {
          label: 'Total Users',
          value: totalUsers.toLocaleString(),
          change: '+12%',
          up: true,
          color: 'from-blue-500 to-indigo-600',
          icon: 'Users',
        },
        {
          label: 'Total Tasks',
          value: totalTasks.toLocaleString(),
          change: '+8%',
          up: true,
          color: 'from-emerald-500 to-cyan-600',
          icon: 'ClipboardList',
        },
        {
          label: 'Revenue',
          value: `$${totalRevenue.toLocaleString()}`,
          change: '+23%',
          up: true,
          color: 'from-fuchsia-500 to-purple-600',
          icon: 'DollarSign',
        },
        {
          label: 'Completed Tasks',
          value: completedTasks.toLocaleString(),
          change: '+5%',
          up: true,
          color: 'from-amber-500 to-orange-600',
          icon: 'Activity',
        },
      ];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchRevenueData = createAsyncThunk(
  'admin/fetchRevenueData',
  async ({ range }, { rejectWithValue }) => {
    try {
      const tasks = await taskService.getAllTasks();

      // نجمّع البيانات حسب الشهر
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const grouped = {};
      tasks.forEach(task => {
        const date = new Date(task.created_at);
        const month = monthNames[date.getMonth()];
        if (!grouped[month]) grouped[month] = { month, revenue: 0, tasks: 0 };
        grouped[month].tasks += 1;
        if (task.status === 'completed') grouped[month].revenue += task.budget || 0;
      });

      return Object.values(grouped).slice(-6);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCategoryData = createAsyncThunk(
  'admin/fetchCategoryData',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await taskService.getAllTasks();

      const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
      const grouped = {};

      tasks.forEach(task => {
        const cat = task.category || 'Other';
        grouped[cat] = (grouped[cat] || 0) + 1;
      });

      const total = tasks.length || 1;
      return Object.entries(grouped).map(([name, count], i) => ({
        name,
        value: Math.round((count / total) * 100),
        color: colors[i % colors.length],
      }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchWeeklyActivity = createAsyncThunk(
  'admin/fetchWeeklyActivity',
  async (_, { rejectWithValue }) => {
    try {
      const users = await userService.getAllUsers();

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const grouped = {};
      days.forEach(d => { grouped[d] = { day: d, clients: 0, workers: 0 }; });

      users.forEach(user => {
        const day = days[new Date(user.created_at).getDay()];
        if (grouped[day]) {
          if (user.role === 'client') grouped[day].clients += 1;
          else if (user.role === 'worker') grouped[day].workers += 1;
        }
      });

      return Object.values(grouped);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page = 1, search = '' }, { rejectWithValue }) => {
    try {
      const users = await userService.getAllUsers();

      const filtered = search
        ? users.filter(u =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
          )
        : users;

      const perPage = 10;
      const total = filtered.length;
      const paginated = filtered.slice((page - 1) * perPage, page * perPage);

      return {
        users: paginated,
        pagination: {
          currentPage: page,
          lastPage: Math.ceil(total / perPage),
          total,
        },
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const data = await userService.updateUser(userId, { status });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await userService.updateUser(userId, { deleted: true });
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchRecentTasks = createAsyncThunk(
  'admin/fetchRecentTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await taskService.getAllTasks();
      return tasks
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(task => ({
          ...task,
          postedAt: task.created_at,
        }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async ({ range }, { rejectWithValue }) => {
    try {
      const [users, tasks] = await Promise.all([
        userService.getAllUsers(),
        taskService.getAllTasks(),
      ]);
      return {
        totalUsers: users.length,
        totalTasks: tasks.length,
        completionRate: tasks.length
          ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
          : 0,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Initial State ───────────────────────────────────────────────

const initialState = {
  stats: null,
  revenueData: null,
  categoryData: null,
  weeklyActivity: null,
  users: [],
  recentTasks: [],
  analytics: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    total: 0,
  },
};

// ─── Slice ───────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // fetchDashboardStats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchRevenueData
      .addCase(fetchRevenueData.fulfilled, (state, action) => {
        state.revenueData = action.payload;
      })

      // fetchCategoryData
      .addCase(fetchCategoryData.fulfilled, (state, action) => {
        state.categoryData = action.payload;
      })

      // fetchWeeklyActivity
      .addCase(fetchWeeklyActivity.fulfilled, (state, action) => {
        state.weeklyActivity = action.payload;
      })

      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // updateUserStatus
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.users.findIndex(u => u.id === updated.id);
        if (index !== -1) state.users[index] = { ...state.users[index], ...updated };
      })

      // deleteUser
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      })

      // fetchRecentTasks
      .addCase(fetchRecentTasks.fulfilled, (state, action) => {
        state.recentTasks = action.payload;
      })

      // fetchAnalytics
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;