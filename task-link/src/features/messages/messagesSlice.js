import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageService } from '../../services/api';

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (userId, thunkAPI) => {
    try {
      const data = await messageService.getConversations(userId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId, thunkAPI) => {
    try {
      const data = await messageService.getMessages(conversationId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, thunkAPI) => {
    try {
      const data = await messageService.sendMessage(messageData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (conversationId, thunkAPI) => {
    try {
      await messageService.markAsRead(conversationId);
      return conversationId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    setActiveConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addNewMessage: (state, action) => {
      // Add message to the messages array if it belongs to current conversation
      if (state.currentConversation && 
          action.payload.conversationId === state.currentConversation.id) {
        state.messages.push(action.payload);
      }
      // Update conversation's last message
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (conversation) {
        conversation.lastMessage = action.payload;
        conversation.updatedAt = action.payload.createdAt;
      }
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
        // Calculate unread count
        state.unreadCount = action.payload.reduce(
          (count, conv) => count + (conv.unreadCount || 0),
          0
        );
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push(action.payload);
        // Update conversation's last message
        const conversation = state.conversations.find(
          (c) => c.id === action.payload.conversationId
        );
        if (conversation) {
          conversation.lastMessage = action.payload;
          conversation.updatedAt = action.payload.createdAt;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark As Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const conversation = state.conversations.find(
          (c) => c.id === action.payload
        );
        if (conversation) {
          const unreadDiff = conversation.unreadCount || 0;
          conversation.unreadCount = 0;
          state.unreadCount = Math.max(0, state.unreadCount - unreadDiff);
        }
      });
  },
});

export const { 
  setCurrentConversation, 
  setActiveConversation,
  addNewMessage, 
  clearCurrentConversation, 
  clearError 
} = messagesSlice.actions;
export default messagesSlice.reducer;

