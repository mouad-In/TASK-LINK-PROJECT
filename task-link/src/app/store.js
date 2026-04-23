// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import usersReducer from '../features/users/usersSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import applicationsReducer from '../features/applications/applicationsSlice';
import messagesReducer from '../features/messages/messagesSlice';
import reviewsReducer from '../features/reviews/reviewsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import commentsReducer from '../features/comments/commentsSlice';
import landingReducer from '../features/landing/landingSlice';
import profileReducer from '../features/profile/profileSlice';
import clientReducer from '../features/client/clientSlice';
import workerReducer from '../features/worker/workerSlice';
import favoritesReducer from '../features/favorite/favoritesSlice';
import adminReducer from '../features/admin/adminSlice';
import contactReducer from '../features/contact/contactSlice';
import userSettingsReducer from '@/features/settings/settingsSlice';
import adminSettingsReducer from '@/features/admin/settingsSlice';
import savedTasksReducer from '@/features/tasks/savedTasksSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    tasks: tasksReducer,
    applications: applicationsReducer,
    notifications: notificationsReducer,
    comments: commentsReducer,
    messages: messagesReducer,
    reviews: reviewsReducer,
    landing: landingReducer,
    profile: profileReducer,
    client: clientReducer,
    worker: workerReducer,
    taskFavorites: favoritesReducer,
    admin: adminReducer,
    contact: contactReducer,
    userSettings: userSettingsReducer,
    adminSettings: adminSettingsReducer,
    savedTasks: savedTasksReducer,
  },
});