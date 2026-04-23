import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageService } from '@/services/api';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (userId, { rejectWithValue }) => {
    try {
      return await messageService.getConversations(userId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      return await messageService.getMessages(conversationId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      return await messageService.sendMessage({ conversationId, content });
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getOrCreateConversation = createAsyncThunk(
  'messages/getOrCreateConversation',
  async ({ participant1Id, participant2Id }, { rejectWithValue }) => {
    try {
      return await messageService.getOrCreateConversation(participant1Id, participant2Id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  conversations:      [],
  activeConversation: null,
  messages:           [],
  isLoading:          false,
  isSending:          false,
  error:              null,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      state.messages = [];
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setConversations:    (state, action) => { state.conversations = action.payload; },
    addMessage:          (state, action) => { state.messages.push(action.payload.message ?? action.payload); },
    markConversationRead:(state, action) => {
      const c = state.conversations.find(c => c.id === action.payload);
      if (c) c.unreadCount = 0;
    },
    setTypingStatus:     () => {},
    updateMessageStatus: () => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchConversations.fulfilled, (state, action) => { state.isLoading = false; state.conversations = action.payload; })
      .addCase(fetchConversations.rejected,  (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(fetchMessages.pending,   (state) => { state.isLoading = true; })
      .addCase(fetchMessages.fulfilled, (state, action) => { state.isLoading = false; state.messages = action.payload; })
      .addCase(fetchMessages.rejected,  (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(sendMessage.pending,   (state) => { state.isSending = true; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push(action.payload);
        const convId = action.payload.conversationId ?? action.payload.conversation_id;
        const conv = state.conversations.find(c => c.id === convId);
        if (conv) { conv.last_message = action.payload.content; conv.last_message_time = action.payload.createdAt ?? action.payload.created_at; }
      })
      .addCase(sendMessage.rejected, (state) => { state.isSending = false; })

      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        const exists = state.conversations.find(c => c.id === action.payload.id);
        if (!exists) state.conversations.unshift(action.payload);
        state.activeConversation = action.payload;
      });
  },
});

export const {
  setActiveConversation, clearMessages,
  setConversations, addMessage,
  markConversationRead, setTypingStatus, updateMessageStatus,
} = messagesSlice.actions;

export default messagesSlice.reducer;