
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/auth';
import profileReducer from './profile/profile';
import newsSlice from './news/news';
import insightReducer from './Insights/Insights';
import teamReducer from './team/team';
import clientReducer from './client/client';
import projectReducer from './project/project';
import assigmentReducer from './assignment/assignment'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    news: newsSlice,
    insight: insightReducer,
    teams: teamReducer,
    clients: clientReducer,
    projects: projectReducer,
    assignments: assigmentReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.config', 'payload.request', 'error', 'meta.arg']
      }
    })
});

export default store;