// /redux/assignment.js
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
  const cookiesToClear = ['authToken', 'adam', 'eve', 'tokenExpiration', 'userUid'];
  cookiesToClear.forEach(cookie => {
    Cookies.remove(cookie, { path: '/' });
  });
  localStorage.removeItem('authToken');
  window.location.href = '/login';
};

// API base URL
const API_BASE_URL = 'http://localhost:9000/api/assignment';

// Async thunks
export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('Unauthorized');
      }

      const response = await axios.get(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data)
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAssignmentById = createAsyncThunk(
  'assignments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('Unauthorized');
      }

      const response = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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

export const createAssignment = createAsyncThunk(
  'assignments/create',
  async (assignmentData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('Unauthorized');
      }

      const response = await axios.post(API_BASE_URL, assignmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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

export const updateAssignment = createAsyncThunk(
  'assignments/update',
  async ({ id, assignmentData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('Unauthorized');
      }

      const response = await axios.put(`${API_BASE_URL}/${id}`, assignmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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

export const deleteAssignment = createAsyncThunk(
  'assignments/delete',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('Unauthorized');
      }

      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return id;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: {
    assignments: [],
    currentAssignment: null,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetAssignmentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch assignment by ID
      .addCase(fetchAssignmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload;
      })
      .addCase(fetchAssignmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.push(action.payload);
        state.success = true;
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update assignment
      .addCase(updateAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.assignments.findIndex(a => a.id === action.meta.arg.id);
        if (index !== -1) {
          state.assignments[index] = { ...state.assignments[index], ...action.meta.arg.assignmentData };
        }
        if (state.currentAssignment?.id === action.meta.arg.id) {
          state.currentAssignment = { ...state.currentAssignment, ...action.meta.arg.assignmentData };
        }
        state.success = true;
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete assignment
      .addCase(deleteAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = state.assignments.filter(a => a.id !== action.payload);
        if (state.currentAssignment?.id === action.payload) {
          state.currentAssignment = null;
        }
        state.success = true;
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

// Export actions and reducer
export const { resetAssignmentState, clearCurrentAssignment } = assignmentSlice.actions;
export default assignmentSlice.reducer;