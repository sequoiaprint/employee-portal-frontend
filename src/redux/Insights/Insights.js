import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Token decryption
const xorDecrypt = (encrypted, secretKey = '28032002') => {
  try {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

const getAuthToken = () => {
  const encryptedToken = Cookies.get('authToken');
  if (!encryptedToken) return null;
  const token = xorDecrypt(encryptedToken);
  if (!token) {
    console.warn('Failed to decrypt auth token');
    return null;
  }
  return token;
};

const handleUnauthorized = () => {
  // Clear all auth data
  const cookiesToClear = ['authToken', 'adam', 'eve', 'tokenExpiration', 'userUid','role'];
  cookiesToClear.forEach(cookie => {
    Cookies.remove(cookie, { path: '/' });
  });
  localStorage.removeItem('authToken');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('profilesList');
  localStorage.removeItem('lastSelectedProjectId');
  localStorage.removeItem('selectedDate');
  window.location.href = '/login';
};

// Base API URL
const API_URL = 'https://internalApi.sequoia-print.com/api/insight';

// Thunks
export const createInsight = createAsyncThunk(
  'insight/createInsight',
  async ({ userId, urls, tags, body, title }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No auth token');
      }
      const { data } = await axios.post(
        `${API_URL}/${userId}`,
        { urls, tags, body, title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleUnauthorized();
      }
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getAllInsights = createAsyncThunk(
  'insight/getAllInsights',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No auth token');
      }
      const { data } = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleUnauthorized();
      }
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getInsightById = createAsyncThunk(
  'insight/getInsightById',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No auth token');
      }
      const { data } = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleUnauthorized();
      }
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getInsightsByUser = createAsyncThunk(
  'insight/getInsightsByUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No auth token');
      }
      const { data } = await axios.get(`${API_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleUnauthorized();
      }
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateInsight = createAsyncThunk(
  'insight/updateInsight',
  async ({ id, urls, tags, body, title, createdBy }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No auth token');
      }
      const { data } = await axios.put(
        `${API_URL}/${id}`,
        { urls, tags, body, title, createdBy },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleUnauthorized();
      }
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteInsight = createAsyncThunk(
  'insight/deleteInsight',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No auth token');
      }
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleUnauthorized();
      }
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Slice
const insightSlice = createSlice({
  name: 'insight',
  initialState: {
    insights: [],
    selectedInsight: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedInsight: (state) => {
      state.selectedInsight = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInsight.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(createInsight.fulfilled, (state, action) => {
        state.loading = false;
        state.insights.push(action.payload);
      })
      .addCase(createInsight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllInsights.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(getAllInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
      })
      .addCase(getAllInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getInsightById.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(getInsightById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInsight = action.payload;
      })
      .addCase(getInsightById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getInsightsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInsightsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
      })
      .addCase(getInsightsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateInsight.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInsight.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.insights.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.insights[index] = action.payload;
        }
      })
      .addCase(updateInsight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteInsight.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInsight.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = state.insights.filter(i => i.id !== action.payload);
      })
      .addCase(deleteInsight.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedInsight } = insightSlice.actions;
export default insightSlice.reducer;