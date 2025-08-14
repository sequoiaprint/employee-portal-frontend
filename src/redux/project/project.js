// project/project.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Token decryption utility
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
  const cookiesToClear = ['authToken', 'adam', 'eve', 'tokenExpiration', 'userUid'];
  cookiesToClear.forEach(cookie => {
    Cookies.remove(cookie, { path: '/' });
  });
  localStorage.removeItem('authToken');
  window.location.href = '/login';
};

// API base URL
const API_BASE_URL = 'http://localhost:9000/api/projets';

// Async Thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.get(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.post(API_BASE_URL, projectData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Refresh the projects list after creation
      dispatch(fetchProjects());
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.put(`${API_BASE_URL}/${id}`, projectData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Refresh the projects list after update
      dispatch(fetchProjects());
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Refresh the projects list after deletion
      dispatch(fetchProjects());
      return id;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  projects: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  operationStatus: 'idle', // For create/update/delete operations
  operationError: null,
};

// Slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = 'idle';
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.operationStatus = 'loading';
        state.operationError = null;
      })
      .addCase(createProject.fulfilled, (state) => {
        state.operationStatus = 'succeeded';
      })
      .addCase(createProject.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      })
      
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.operationStatus = 'loading';
        state.operationError = null;
      })
      .addCase(updateProject.fulfilled, (state) => {
        state.operationStatus = 'succeeded';
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      })
      
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.operationStatus = 'loading';
        state.operationError = null;
      })
      .addCase(deleteProject.fulfilled, (state) => {
        state.operationStatus = 'succeeded';
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      });
  },
});

// Export actions
export const { resetOperationStatus } = projectSlice.actions;

// Export selectors
export const selectAllProjects = (state) => state.projects.projects;
export const selectProjectsStatus = (state) => state.projects.status;
export const selectProjectsError = (state) => state.projects.error;
export const selectOperationStatus = (state) => state.projects.operationStatus;
export const selectOperationError = (state) => state.projects.operationError;

export default projectSlice.reducer;