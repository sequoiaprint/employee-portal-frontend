// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/auth';
import profileReducer from './profile/profile';
import newsSlice from './news/news';
import insightReducer from './Insights/Insights';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    news: newsSlice,
    insight: insightReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.config', 'payload.request', 'error', 'meta.arg']
      }
    })
});

export default store;