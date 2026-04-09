import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '@/services/api';

// ─── Async Thunks ───────────────────────────────────────────────

export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      const data = await userService.getUserById(userId);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'profile/fetchUserStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      const data = await userService.getUserById(userId);
      return {
        rating: data.rating || 0,
        completedTasks: data.completed_tasks || 0,
        totalEarnings: data.total_earnings || 0,
        responseRate: data.response_rate || 0,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      const data = await userService.updateUser(userId, profileData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (file, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;

      const formData = new FormData();
      formData.append('avatar', file);

      const data = await userService.updateUser(userId, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.avatar;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeAvatar = createAsyncThunk(
  'profile/removeAvatar',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      await userService.updateUser(userId, { avatar: null });
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addUserSkill = createAsyncThunk(
  'profile/addUserSkill',
  async (skill, { getState, rejectWithValue }) => {
    try {
      const { auth, profile } = getState();
      const userId = auth.user?.id;
      const updatedSkills = [...profile.userData.skills, skill];
      await userService.updateUser(userId, { skills: updatedSkills });
      return skill;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeUserSkill = createAsyncThunk(
  'profile/removeUserSkill',
  async (skill, { getState, rejectWithValue }) => {
    try {
      const { auth, profile } = getState();
      const userId = auth.user?.id;
      const updatedSkills = profile.userData.skills.filter(s => s !== skill);
      await userService.updateUser(userId, { skills: updatedSkills });
      return skill;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateUserSocialLinks = createAsyncThunk(
  'profile/updateUserSocialLinks',
  async (links, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      await userService.updateUser(userId, { social_links: links });
      return links;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Initial State ───────────────────────────────────────────────

const initialState = {
  userData: {
    id: null,
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
    isVerified: false,
    memberSince: '',
    skills: [],
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: '',
      instagram: '',
      website: '',
    },
    stats: {
      rating: 0,
      completedTasks: 0,
      totalEarnings: 0,
      responseRate: 0,
    },
  },
  editing: false,
  isLoading: false,
  uploadProgress: 0,
  error: null,
};

// ─── Slice ───────────────────────────────────────────────────────

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setEditing: (state, action) => {
      state.editing = action.payload;
    },
    updateProfile: (state, action) => {
      state.userData = { ...state.userData, ...action.payload };
    },
    addSkill: (state, action) => {
      if (!state.userData.skills.includes(action.payload)) {
        state.userData.skills.push(action.payload);
      }
    },
    removeSkill: (state, action) => {
      state.userData.skills = state.userData.skills.filter(s => s !== action.payload);
    },
    updateSocialLinks: (state, action) => {
      state.userData.socialLinks = { ...state.userData.socialLinks, ...action.payload };
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        const d = action.payload;
        state.userData = {
          id: d.id,
          name: d.name,
          email: d.email,
          phone: d.phone || '',
          location: d.location || '',
          bio: d.bio || '',
          avatar: d.avatar || '',
          isVerified: d.is_verified || false,
          memberSince: d.created_at?.split('T')[0] || '',
          skills: d.skills || [],
          socialLinks: d.social_links || initialState.userData.socialLinks,
          stats: {
            rating: d.rating || 0,
            completedTasks: d.completed_tasks || 0,
            totalEarnings: d.total_earnings || 0,
            responseRate: d.response_rate || 0,
          },
        };
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchUserStats
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userData.stats = action.payload;
      })

      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.editing = false;
        const d = action.payload;
        state.userData = {
          ...state.userData,
          name: d.name || state.userData.name,
          phone: d.phone || state.userData.phone,
          location: d.location || state.userData.location,
          bio: d.bio || state.userData.bio,
        };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // uploadAvatar
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadProgress = 10;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.userData.avatar = action.payload;
        state.uploadProgress = 100;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.error = action.payload;
        state.uploadProgress = 0;
      })

      // removeAvatar
      .addCase(removeAvatar.fulfilled, (state) => {
        state.userData.avatar = '';
      })

      // addUserSkill
      .addCase(addUserSkill.fulfilled, (state, action) => {
        if (!state.userData.skills.includes(action.payload)) {
          state.userData.skills.push(action.payload);
        }
      })
      .addCase(addUserSkill.rejected, (state, action) => {
        state.error = action.payload;
      })

      // removeUserSkill
      .addCase(removeUserSkill.fulfilled, (state, action) => {
        state.userData.skills = state.userData.skills.filter(s => s !== action.payload);
      })
      .addCase(removeUserSkill.rejected, (state, action) => {
        state.error = action.payload;
      })

      // updateUserSocialLinks
      .addCase(updateUserSocialLinks.fulfilled, (state, action) => {
        state.userData.socialLinks = { ...state.userData.socialLinks, ...action.payload };
      })
      .addCase(updateUserSocialLinks.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setEditing,
  updateProfile,
  addSkill,
  removeSkill,
  updateSocialLinks,
  setUploadProgress,
  clearError,
} = profileSlice.actions;

export default profileSlice.reducer;