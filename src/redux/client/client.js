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
  const cookiesToClear = ['authToken', 'adam', 'eve', 'tokenExpiration', 'userUid','role','role'];
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

const API_URL = 'https://internalApi.sequoia-print.com/api/client';

// Async Thunks for CRUD operations
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.post(API_URL, clientData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Refresh the clients list after creation
      await dispatch(fetchClients());
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, clientData }, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.put(`${API_URL}/${id}`, clientData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Refresh the clients list after update
      await dispatch(fetchClients());
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return id;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  clients: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  operationStatus: 'idle', // For create/update/delete operations
  operationError: null
};

// Create slice
const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = 'idle';
      state.operationError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Clients
      .addCase(fetchClients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create Client
      .addCase(createClient.pending, (state) => {
        state.operationStatus = 'loading';
      })
      .addCase(createClient.fulfilled, (state) => {
        state.operationStatus = 'succeeded';
      })
      .addCase(createClient.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      })
      
      // Update Client
      .addCase(updateClient.pending, (state) => {
        state.operationStatus = 'loading';
      })
      .addCase(updateClient.fulfilled, (state) => {
        state.operationStatus = 'succeeded';
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      })
      
      // Delete Client
      .addCase(deleteClient.pending, (state) => {
        state.operationStatus = 'loading';
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        state.clients = state.clients.filter(client => client.id !== action.payload);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      });
  }
});

export const { resetOperationStatus } = clientSlice.actions;

// Selectors
export const selectAllClients = (state) => state.clients.clients;
export const selectClientsStatus = (state) => state.clients.status;
export const selectClientsError = (state) => state.clients.error;
export const selectOperationStatus = (state) => state.clients.operationStatus;
export const selectOperationError = (state) => state.clients.operationError;

export default clientSlice.reducer;