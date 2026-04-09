import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import profileService from '../services/api/profileService';
import { addToast } from '../notifications/notificationsSlice';

// ── Async Thunks ──────────────────────────────────────────────────────────────

/** GET /api/profile - Fetch user profile */
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** PUT /api/profile - Update user profile */
export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileService.updateProfile(profileData);
      dispatch(addToast({ 
        message: 'Profile updated successfully!', 
        type: 'success' 
      }));
      return response;
    } catch (error) {
      dispatch(addToast({ 
        message: error.response?.data?.message || 'Failed to update profile', 
        type: 'error' 
      }));
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** POST /api/profile/avatar - Upload avatar */
export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await profileService.uploadAvatar(formData);
      dispatch(addToast({ 
        message: 'Avatar updated successfully!', 
        type: 'success' 
      }));
      return response.avatar;
    } catch (error) {
      dispatch(addToast({ 
        message: error.response?.data?.message || 'Failed to upload avatar', 
        type: 'error' 
      }));
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** DELETE /api/profile/avatar - Remove avatar */
export const removeAvatar = createAsyncThunk(
  'profile/removeAvatar',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await profileService.removeAvatar();
      dispatch(addToast({ 
        message: 'Avatar removed successfully!', 
        type: 'success' 
      }));
      return null;
    } catch (error) {
      dispatch(addToast({ 
        message: error.response?.data?.message || 'Failed to remove avatar', 
        type: 'error' 
      }));
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** POST /api/profile/skills - Add skill */
export const addUserSkill = createAsyncThunk(
  'profile/addUserSkill',
  async (skill, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileService.addSkill(skill);
      dispatch(addToast({ 
        message: `"${skill}" added to your skills!`, 
        type: 'success' 
      }));
      return response.skills;
    } catch (error) {
      dispatch(addToast({ 
        message: error.response?.data?.message || 'Failed to add skill', 
        type: 'error' 
      }));
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** DELETE /api/profile/skills/:skill - Remove skill */
export const removeUserSkill = createAsyncThunk(
  'profile/removeUserSkill',
  async (skill, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileService.removeSkill(skill);
      dispatch(addToast({ 
        message: `"${skill}" removed from your skills`, 
        type: 'success' 
      }));
      return response.skills;
    } catch (error) {
      dispatch(addToast({ 
        message: error.response?.data?.message || 'Failed to remove skill', 
        type: 'error' 
      }));
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** PUT /api/profile/social-links - Update social links */
export const updateUserSocialLinks = createAsyncThunk(
  'profile/updateUserSocialLinks',
  async (socialLinks, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileService.updateSocialLinks(socialLinks);
      dispatch(addToast({ 
        message: 'Social links updated successfully!', 
        type: 'success' 
      }));
      return response.socialLinks;
    } catch (error) {
      dispatch(addToast({ 
        message: error.response?.data?.message || 'Failed to update social links', 
        type: 'error' 
      }));
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** GET /api/profile/stats - Fetch user stats */
export const fetchUserStats = createAsyncThunk(
  'profile/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  userData: {
    id: null,
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: null,
    memberSince: '',
    isVerified: false,
    userType: 'client',
    stats: {
      // Worker stats
      tasksDone: 0,
      earnings: 0,
      rating: 0,
      responseRate: 0,
      // Client stats
      tasksPosted: 0,
      totalSpent: 0,
      workersHired: 0,
      avgRatingGiven: 0,
    },
    performance: {
      completionRate: 0,
      onTimeDelivery: 0,
      clientSatisfaction: 0,
      repeatHireRate: 0,
    },
    skills: [],
    certifications: [
      {
        label: 'Top Rated Worker',
        icon: 'Award',
        color: 'from-amber-500 to-orange-500',
        desc: 'Top 5% on TaskLink'
      },
      {
        label: 'Identity Verified',
        icon: 'Shield',
        color: 'from-green-500 to-emerald-600',
        desc: 'ID confirmed'
      },
      {
        label: 'Fast Responder',
        icon: 'CheckCircle2',
        color: 'from-cyan-500 to-blue-600',
        desc: 'Avg < 1h response'
      },
    ],
    socialLinks: {
      website: '',
      linkedin: '',
      twitter: '',
      github: '',
      instagram: '',
    },
  },
  editing: false,
  isLoading: false,
  error: null,
  uploadProgress: 0,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

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
    updateSocialLinks: (state, action) => {
      state.userData.socialLinks = { ...state.userData.socialLinks, ...action.payload };
    },
    addSkill: (state, action) => {
      if (!state.userData.skills.includes(action.payload)) {
        state.userData.skills.push(action.payload);
      }
    },
    removeSkill: (state, action) => {
      state.userData.skills = state.userData.skills.filter(skill => skill !== action.payload);
    },
    clearProfileError: (state) => {
      state.error = null;
    },
    resetProfile: (state) => {
      return initialState;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch User Profile ──────────────────────────────────────────────
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = {
          ...state.userData,
          ...action.payload,
          stats: action.payload.stats || state.userData.stats,
          performance: action.payload.performance || state.userData.performance,
          skills: action.payload.skills || state.userData.skills,
          socialLinks: action.payload.socialLinks || state.userData.socialLinks,
        };
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ── Update User Profile ─────────────────────────────────────────────
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = { ...state.userData, ...action.payload };
        state.editing = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ── Upload Avatar ───────────────────────────────────────────────────
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.uploadProgress = 0;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData.avatar = action.payload;
        state.uploadProgress = 100;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      })

      // ── Remove Avatar ───────────────────────────────────────────────────
      .addCase(removeAvatar.fulfilled, (state) => {
        state.userData.avatar = null;
      })

      // ── Add Skill ───────────────────────────────────────────────────────
      .addCase(addUserSkill.fulfilled, (state, action) => {
        state.userData.skills = action.payload;
      })

      // ── Remove Skill ────────────────────────────────────────────────────
      .addCase(removeUserSkill.fulfilled, (state, action) => {
        state.userData.skills = action.payload;
      })

      // ── Update Social Links ─────────────────────────────────────────────
      .addCase(updateUserSocialLinks.fulfilled, (state, action) => {
        state.userData.socialLinks = action.payload;
      })

      // ── Fetch User Stats ────────────────────────────────────────────────
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userData.stats = { ...state.userData.stats, ...action.payload };
        if (action.payload.performance) {
          state.userData.performance = { ...state.userData.performance, ...action.payload.performance };
        }
      });
  },
});

export const {
  setEditing,
  updateProfile,
  updateSocialLinks,
  addSkill,
  removeSkill,
  clearProfileError,
  resetProfile,
  setUploadProgress,
} = profileSlice.actions;

export default profileSlice.reducer;