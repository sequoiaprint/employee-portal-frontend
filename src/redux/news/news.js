// features/news/newsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// XOR decryption function
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
  if (!encryptedToken) {
    return null;
  }

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

// Async thunk for fetching news
export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No auth token');
      }

      const response = await axios.get('https://internalApi.sequoia-print.com/api/news', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      return response.data.data || [];
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch news');
    }
  }
);

// Async thunk for adding news
export const addNews = createAsyncThunk(
  'news/addNews',
  async (newsData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No auth token');
      }

      const response = await axios.post(
        'https://internalApi.sequoia-print.com/api/news',
        newsData,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        }
      );
      
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add news');
    }
  }
);

// Async thunk for deleting news
export const deleteNews = createAsyncThunk(
  'news/deleteNews',
  async (newsId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No auth token');
      }

      await axios.delete(
        `https://internalApi.sequoia-print.com/api/news/${newsId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        }
      );
      
      return newsId;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete news');
    }
  }
);

// Async thunk for updating news
export const updateNews = createAsyncThunk(
  'news/updateNews',
  async ({ id, newsData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No auth token');
      }

      const response = await axios.put(
        `https://internalApi.sequoia-print.com/api/news/${id}`,
        newsData,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        }
      );

      return response.data.data;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update news');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch News
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add News
      .addCase(addNews.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Delete News
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.items = state.items.filter(news => news.id !== action.payload);
      })
      // Update News
      .addCase(updateNews.fulfilled, (state, action) => {
        const index = state.items.findIndex(news => news.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export default newsSlice.reducer;