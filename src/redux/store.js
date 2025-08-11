// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/auth';
import profileReducer from './profile/profile';
// import newsReducer from './news/news';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
   // news: newsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.config', 'payload.request', 'error', 'meta.arg']
      }
    })
});

export default store;