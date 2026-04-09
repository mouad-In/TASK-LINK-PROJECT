import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Contact Form
  contactForm: {
    formData: { name: '', email: '', subject: '', message: '' },
    submitted: false,
    loading: false,
    error: null,
    history: [],
  },
  // Support Options
  supportOptions: {
    activeOption: null,
    options: [
      {
        id: 'live-chat',
        title: 'Live Chat',
        description: 'Chat with our support team in real time.',
        detail: 'Average response: 2 min',
        icon: 'MessageCircle',
        gradient: 'from-emerald-500 to-cyan-500',
        action: 'Start Chat',
        available: true,
      },
      {
        id: 'email-support',
        title: 'Email Support',
        description: 'Send us an email and we\'ll respond within 24 hours.',
        detail: 'support@tasklink.com',
        icon: 'Mail',
        gradient: 'from-fuchsia-500 to-purple-500',
        action: 'Send Email',
        available: true,
      },
      {
        id: 'phone-support',
        title: 'Phone Support',
        description: 'Talk directly with our support team.',
        detail: '+1 (555) 123-4567',
        icon: 'Phone',
        gradient: 'from-amber-500 to-orange-500',
        action: 'Call Now',
        available: false,
      },
    ],
  },
  // FAQ
  faq: {
    searchQuery: '',
    selectedCategory: 'all',
    faqs: [
      {
        id: 1,
        question: 'How do I create a task?',
        answer: 'Go to your dashboard and click "Create Task". Fill in the details and publish.',
        category: 'tasks',
        helpful: 12,
        notHelpful: 2,
      },
      {
        id: 2,
        question: 'How do I get paid?',
        answer: 'Payments are processed automatically after task completion and client approval.',
        category: 'payments',
        helpful: 20,
        notHelpful: 1,
      },
      {
        id: 3,
        question: 'How do I contact a worker?',
        answer: 'Once a worker applies to your task, you can message them directly from the task page.',
        category: 'general',
        helpful: 8,
        notHelpful: 0,
      },
      {
        id: 4,
        question: 'Can I cancel a task?',
        answer: 'Yes, you can cancel a task before a worker is assigned. After assignment, contact support.',
        category: 'tasks',
        helpful: 15,
        notHelpful: 3,
      },
      {
        id: 5,
        question: 'How do I become a verified worker?',
        answer: 'Complete your profile, add your skills, and submit your ID for verification.',
        category: 'general',
        helpful: 18,
        notHelpful: 1,
      },
    ],
  },
  // Contact Info
  contactInfo: {
    contactInfo: [
      { label: 'Email', value: 'support@tasklink.com', icon: 'Mail', gradient: 'from-fuchsia-500 to-purple-500' },
      { label: 'Phone', value: '+1 (555) 123-4567', icon: 'Phone', gradient: 'from-amber-500 to-orange-500' },
      { label: 'Address', value: '123 TaskLink Ave, San Francisco, CA', icon: 'MapPin', gradient: 'from-emerald-500 to-cyan-500' },
      { label: 'Working Hours', value: 'Mon - Fri, 9AM - 6PM PST', icon: 'Clock', gradient: 'from-blue-500 to-indigo-500' },
    ],
    socialMedia: {
      Twitter: 'https://twitter.com/tasklink',
      Facebook: 'https://facebook.com/tasklink',
      Linkedin: 'https://linkedin.com/company/tasklink',
      Instagram: 'https://instagram.com/tasklink',
    },
  },
};

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    // Form actions
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.contactForm.formData[field] = value;
    },
    resetForm: (state) => {
      state.contactForm.formData = { name: '', email: '', subject: '', message: '' };
    },
    setSubmitted: (state, action) => {
      state.contactForm.submitted = action.payload;
    },
    setLoading: (state, action) => {
      state.contactForm.loading = action.payload;
    },
    setError: (state, action) => {
      state.contactForm.error = action.payload;
    },
    addToHistory: (state, action) => {
      state.contactForm.history.push({ ...action.payload, sentAt: new Date().toISOString() });
    },

    // Support options actions
    setActiveOption: (state, action) => {
      state.supportOptions.activeOption = action.payload;
    },

    // FAQ actions
    setSearchQuery: (state, action) => {
      state.faq.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.faq.selectedCategory = action.payload;
    },
    updateFaqHelpfulness: (state, action) => {
      const { id, helpful } = action.payload;
      const faq = state.faq.faqs.find(f => f.id === id);
      if (faq) {
        if (helpful) faq.helpful += 1;
        else faq.notHelpful += 1;
      }
    },
  },
});

export const {
  updateFormField,
  resetForm,
  setSubmitted,
  setLoading,
  setError,
  addToHistory,
  setActiveOption,
  setSearchQuery,
  setSelectedCategory,
  updateFaqHelpfulness,
} = contactSlice.actions;

export default contactSlice.reducer;