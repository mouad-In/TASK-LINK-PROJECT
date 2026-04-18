// services/api/apiService.js
import api from './axiosInstance.js';

// Auth Service - Real API calls
export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// User Service - Real API calls
export const userService = {
  async getAllUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async getUserById(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  async updateUser(userId, userData) {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  async getWorkers() {
    const response = await api.get('/users/workers');
    return response.data;
  },
};

// Task Service - Real API calls
export const taskService = {
  async getAllTasks() {
    const response = await api.get('/tasks');
    return response.data;
  },

  async getTaskById(taskId) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(taskId, taskData) {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  async deleteTask(taskId) {
    await api.delete(`/tasks/${taskId}`);
    return true;
  },

  async assignWorker(taskId, workerId) {
    const response = await api.post(`/tasks/${taskId}/assign`, { workerId });
    return response.data;
  },

  async getTasksByClient(clientId) {
    const response = await api.get(`/tasks/client/${clientId}`);
    return response.data;
  },

  async getTasksByWorker(workerId) {
    const response = await api.get(`/tasks/worker/${workerId}`);
    return response.data;
  },

  async getPublishedTasks() {
    const response = await api.get('/tasks/published');
    return response.data;
  },

  async getComments(taskId) {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  async addComment(taskId, commentData) {
    const response = await api.post(`/tasks/${taskId}/comments`, commentData);
    return response.data;
  },
};

// Application Service - Real API calls
export const applicationService = {
  async getAllApplications() {
    const response = await api.get('/applications');
    return response.data;
  },

  async getApplicationsByTask(taskId) {
    const response = await api.get(`/tasks/${taskId}/applications`);
    return response.data;
  },

  async getApplicationsByWorker(workerId) {
    const response = await api.get(`/applications/worker/${workerId}`);
    return response.data;
  },

  async createApplication(applicationData) {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  async updateApplicationStatus(applicationId, status) {
    const response = await api.patch(`/applications/${applicationId}/status`, { status });
    return response.data;
  },
};

// Message Service - Real API calls
export const messageService = {
  async getConversations(userId) {
    const response = await api.get(`/messages/conversations/${userId}`);
    return response.data;
  },

  async getMessages(conversationId) {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  },

  async sendMessage(messageData) {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  async markAsRead(conversationId) {
    await api.patch(`/messages/${conversationId}/read`);
    return true;
  },

  async getOrCreateConversation(participant1Id, participant2Id) {
    const response = await api.post('/messages/conversations', {
      participant1Id,
      participant2Id
    });
    return response.data;
  },
};

// Review Service - Real API calls
export const reviewService = {
  async getAllReviews() {
    const response = await api.get('/reviews');
    return response.data;
  },

  async getReviewsByUser(userId) {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },

  async getReviewsByTask(taskId) {
    const response = await api.get(`/tasks/${taskId}/reviews`);
    return response.data;
  },

  async createReview(reviewData) {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
};

// Favorites Service
export const favoritesService = {
  async getFavorites(clientId) {
    const response = await api.get(`/favorites/${clientId}`);
    return response.data;
  },

  async addFavorite(clientId, workerId) {
    const response = await api.post('/favorites', { client_id: clientId, worker_id: workerId });
    return response.data;
  },

  async removeFavorite(clientId, workerId) {
    await api.delete(`/favorites/${clientId}/${workerId}`);
    return true;
  },
};

// Admin Service - NEW
export const adminService = {
  // Settings endpoints
  async getSettings() {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async updateSettings(settings) {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },

  // Dashboard stats
  async getStats({ range }) {
    const response = await api.get('/admin/stats', { params: { range } });
    return response.data;
  },

  async getRevenueData({ range }) {
    const response = await api.get('/admin/revenue', { params: { range } });
    return response.data;
  },

  async getCategoryData() {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  async getWeeklyActivity() {
    const response = await api.get('/admin/activity');
    return response.data;
  },

  // User management
  async getUsers({ page, search }) {
    const response = await api.get('/admin/users', { params: { page, search } });
    return response.data;
  },

  async updateUserStatus(userId, status) {
    const response = await api.put(`/admin/users/${userId}`, { status });
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Task management
  async getRecentTasks() {
    const response = await api.get('/admin/tasks/recent');
    return response.data;
  },

  async getAnalytics({ range }) {
    const response = await api.get('/admin/analytics', { params: { range } });
    return response.data;
  },

  async updateTaskStatus(taskId, status) {
    const response = await api.put(`/admin/tasks/${taskId}`, { status });
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await api.delete(`/admin/tasks/${taskId}`);
    return response.data;
  },
};

// Saved Tasks Service
export const savedTasksService = {
  async getSavedTasks() {
    const response = await api.get('/saved-tasks');
    return response.data;
  },

  async saveTask(taskId) {
    const response = await api.post('/saved-tasks', { task_id: taskId }); // ← fixed
    return response.data;
  },

  async unsaveTask(taskId) {
    await api.delete(`/saved-tasks/${taskId}`);
    return true;
  },
};