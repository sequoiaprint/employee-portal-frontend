// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/auth';

export const store = configureStore({
  reducer: {
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.config', 'payload.request', 'error', 'meta.arg']
      }
    })
});

export default store;