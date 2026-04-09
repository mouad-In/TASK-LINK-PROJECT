import { createSlice } from '@reduxjs/toolkit';

const landingSlice = createSlice({
  name: 'landing',
  initialState: {
    mounted: false,
    activeCategory: null,
    chatOpen: false,
  },
  reducers: {
    setMounted(state) {
      state.mounted = true;
    },
    setActiveCategory(state, action) {
      state.activeCategory = action.payload;
    },
    toggleChat(state) {
      state.chatOpen = !state.chatOpen;
    },
  },
});

export const { setMounted, setActiveCategory, toggleChat } = landingSlice.actions;
export default landingSlice.reducer;
