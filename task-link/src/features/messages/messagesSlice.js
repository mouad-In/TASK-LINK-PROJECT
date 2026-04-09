import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  activeConversation: null,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },

    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },

    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;

      // أضف الرسالة للمحادثة في القائمة
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.messages.push(message);
        conversation.lastMessage = message.text;
        conversation.time = message.time;
      }

      // أضف الرسالة للمحادثة الفعّالة
      if (state.activeConversation?.id === conversationId) {
        state.activeConversation.messages.push(message);
        state.activeConversation.lastMessage = message.text;
        state.activeConversation.time = message.time;
      }
    },

    updateMessageStatus: (state, action) => {
      const { conversationId, messageId, status } = action.payload;

      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        const message = conversation.messages.find(m => m.id === messageId);
        if (message) message.status = status;
      }

      if (state.activeConversation?.id === conversationId) {
        const message = state.activeConversation.messages.find(m => m.id === messageId);
        if (message) message.status = status;
      }
    },

    markConversationRead: (state, action) => {
      const conversationId = action.payload;

      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) conversation.unread = 0;

      if (state.activeConversation?.id === conversationId) {
        state.activeConversation.unread = 0;
      }
    },

    setTypingStatus: (state, action) => {
      const { conversationId, isTyping } = action.payload;

      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) conversation.typing = isTyping;

      if (state.activeConversation?.id === conversationId) {
        state.activeConversation.typing = isTyping;
      }
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  addMessage,
  updateMessageStatus,
  markConversationRead,
  setTypingStatus,
} = messagesSlice.actions;

export default messagesSlice.reducer;