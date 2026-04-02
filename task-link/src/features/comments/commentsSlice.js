import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../services/api';
import { addToast } from '../notifications/notificationsSlice';

const initialState = {
  commentsByTask: {},
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCommentsByTask = createAsyncThunk(
  'comments/fetchCommentsByTask',
  async (taskId, thunkAPI) => {
    try {
      const data = await taskService.getComments(taskId);
      return { taskId, comments: data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ taskId, content }, thunkAPI) => {
    const { auth } = thunkAPI.getState();
    const user = auth.user;
    if (!user) {
      throw new Error('User not authenticated');
    }
    try {
      const data = await taskService.addComment(taskId, {
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        content,
      });
      return { taskId, comment: data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchCommentsByTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCommentsByTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const { taskId, comments } = action.payload;
        state.commentsByTask[taskId] = comments;
      })
      .addCase(fetchCommentsByTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action, thunkAPI) => {
        state.isLoading = false;
        const { taskId, comment } = action.payload;
        if (!state.commentsByTask[taskId]) {
          state.commentsByTask[taskId] = [];
        }
        state.commentsByTask[taskId].push(comment);
        thunkAPI.dispatch(addToast({ message: 'Comment added successfully!', type: 'success' }));
      })
      .addCase(addComment.rejected, (state, action, thunkAPI) => {
        state.isLoading = false;
        state.error = action.payload;
        thunkAPI.dispatch(addToast({ message: action.payload || 'Failed to add comment', type: 'error' }));
      });
  },
});

export const { clearError } = commentsSlice.actions;
export default commentsSlice.reducer;

