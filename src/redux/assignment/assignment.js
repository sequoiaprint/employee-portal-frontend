// /redux/assignment.js - Optimized Version (No Timeout)
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

// Create axios instance with default config (no timeout)
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth token
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

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

      const response = await axiosInstance.get('/');
      return response.data;
    } catch (error) {
      console.error('Fetch assignments error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch assignments');
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

      const response = await axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Fetch assignment by ID error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch assignment');
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

      // No timeout set - let it complete naturally
      const response = await axiosInstance.post('/', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Create assignment error:', error);
      
      // Handle different error types
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Request was cancelled. Please try again.');
      }
      
      if (error.code === 'NETWORK_ERROR') {
        return rejectWithValue('Network error. Please check your connection.');
      }

      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create assignment'
      );
    }
  }
);

export const updateAssignment = createAsyncThunk(
  'assignment/updateAssignment',
  async ({ id, assignmentData }, { rejectWithValue }) => {
    try {
      console.log('Updating assignment with ID:', id);
      console.log('Update data:', assignmentData);
      
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('Unauthorized');
      }

      const response = await fetch(`http://localhost:9000/api/assignment/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assignmentData)
      });

      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to update assignment';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        return rejectWithValue(errorMessage);
      }

      // Handle response parsing
      let data;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : { 
          success: true, 
          id: id, 
          updatedData: assignmentData 
        };
      } catch (parseError) {
        console.warn('Response not JSON, creating success response manually');
        data = { 
          success: true, 
          id: id, 
          updatedData: assignmentData 
        };
      }

      console.log('Update successful, returning:', data);
      return data;

    } catch (error) {
      console.error('Network error in updateAssignment:', error);
      return rejectWithValue(error.message || 'Network error occurred while updating assignment');
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  'assignments/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('Unauthorized');
      }

      // Optimistically update the UI
      dispatch(assignmentSlice.actions.optimisticDelete(id));

      await axiosInstance.delete(`/${id}`);
      return id;
    } catch (error) {
      console.error('Delete assignment error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete assignment');
    }
  }
);

// Assignment slice with optimized state management
const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: {
    assignments: [],
    currentAssignment: null,
    loading: false,
    error: null,
    success: false,
    refreshCounter: 0,
    // Add operation-specific loading states for better UX
    operations: {
      creating: false,
      updating: false,
      deleting: false,
      fetching: false
    }
  },
  reducers: {
    resetAssignmentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.operations = {
        creating: false,
        updating: false,
        deleting: false,
        fetching: false
      };
    },
    triggerRefetch: (state) => {
      state.refreshCounter += 1;
      state.operations.fetching = true;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    optimisticDelete: (state, action) => {
      state.assignments = state.assignments.filter(a => a.id !== action.payload);
      if (state.currentAssignment?.id === action.payload) {
        state.currentAssignment = null;
      }
    },
    updateAssignmentInStore: (state, action) => {
      const { id, updatedData } = action.payload;
      const index = state.assignments.findIndex(a => a.id === id);
      if (index !== -1) {
        state.assignments[index] = { ...state.assignments[index], ...updatedData };
      }
      if (state.currentAssignment?.id === id) {
        state.currentAssignment = { ...state.currentAssignment, ...updatedData };
      }
    },
    // Add optimistic create for better UX
    optimisticCreate: (state, action) => {
      const tempId = `temp-${Date.now()}`;
      const tempAssignment = {
        ...action.payload,
        id: tempId,
        isTemp: true
      };
      state.assignments.unshift(tempAssignment);
    },
    // Remove temp assignment on error
    removeTempAssignment: (state, action) => {
      state.assignments = state.assignments.filter(a => !a.isTemp);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.operations.fetching = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.operations.fetching = false;
        state.assignments = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.operations.fetching = false;
        state.error = action.payload;
      })

      // Fetch assignment by ID
      .addCase(fetchAssignmentById.pending, (state) => {
        state.loading = true;
        state.operations.fetching = true;
        state.error = null;
      })
      .addCase(fetchAssignmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.operations.fetching = false;
        state.currentAssignment = action.payload;
        state.error = null;
      })
      .addCase(fetchAssignmentById.rejected, (state, action) => {
        state.loading = false;
        state.operations.fetching = false;
        state.error = action.payload;
      })

      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.operations.creating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.operations.creating = false;
        
        // Remove any temp assignments
        state.assignments = state.assignments.filter(a => !a.isTemp);
        
        // Add the real assignment
        if (action.payload) {
          state.assignments.unshift(action.payload);
        }
        
        state.success = true;
        state.error = null;
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.operations.creating = false;
        state.error = action.payload;
        state.success = false;
        
        // Remove temp assignments on error
        state.assignments = state.assignments.filter(a => !a.isTemp);
      })

      // Update assignment
      .addCase(updateAssignment.pending, (state) => {
        state.loading = true;
        state.operations.updating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.operations.updating = false;
        state.success = true;
        state.error = null;

        if (action.payload) {
          const { id, updatedData } = action.payload;
          console.log('Redux Update - ID:', id, 'Data:', updatedData);
          
          const index = state.assignments.findIndex(a => a.id === id);
          console.log('Found assignment at index:', index);

          if (index !== -1) {
            const currentAssignment = state.assignments[index];
            
            // Create updated assignment with proper field mapping
            const updatedAssignment = {
              ...currentAssignment,
              ...updatedData,
              
              // Map fields consistently
              title: updatedData.task || currentAssignment.title,
              task: updatedData.task || currentAssignment.task,
              assignee: updatedData.assignedPerson || currentAssignment.assignee,
              assignedPerson: updatedData.assignedPerson || currentAssignment.assignedPerson,
              dueDate: updatedData.endDate ? new Date(updatedData.endDate) : currentAssignment.dueDate,
              
              // Calculate status
              status: updatedData.isCompleted ? 'completed' :
                (updatedData.endDate && new Date(updatedData.endDate) < new Date()) ? 'overdue' : 
                'in-progress'
            };
            
            state.assignments[index] = updatedAssignment;
            console.log('Updated assignment in state:', updatedAssignment);
            
            // Update currentAssignment if it matches
            if (state.currentAssignment?.id === id) {
              state.currentAssignment = updatedAssignment;
            }
          }
        }
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.loading = false;
        state.operations.updating = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete assignment
      .addCase(deleteAssignment.pending, (state) => {
        state.loading = true;
        state.operations.deleting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.operations.deleting = false;
        state.assignments = state.assignments.filter(a => a.id !== action.payload);
        if (state.currentAssignment?.id === action.payload) {
          state.currentAssignment = null;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.operations.deleting = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

// Export actions and reducer
export const { 
  resetAssignmentState, 
  clearCurrentAssignment, 
  updateAssignmentInStore, 
  triggerRefetch,
  clearError,
  clearSuccess,
  optimisticCreate,
  removeTempAssignment
} = assignmentSlice.actions;

export default assignmentSlice.reducer;