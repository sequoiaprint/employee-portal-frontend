// /redux/assignment.js - Complete Fixed Version
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
      return response.data;
    } catch (error) {
      console.error('Fetch assignments error:', error);
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data?.message || error.message);
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
      return rejectWithValue(error.response?.data?.message || error.message);
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
        },
        timeout: 60000
      });

      return response.data;
    } catch (error) {
      console.error('Create assignment error:', error);
      if (error.response?.status === 401) {
        handleUnauthorized();
      }

      if (error.code === 'ECONNABORTED') {
        console.warn('Request timed out, but task may have been created');
        return rejectWithValue('Request completed but response was slow');
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

// In your assignment slice file
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

      // Try to parse response, but handle empty responses
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
      return rejectWithValue(error.message || 'Network error');
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
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fixed Slice
const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: {
    assignments: [],
    currentAssignment: null,
    loading: false,
    error: null,
    success: false,
    refreshCounter: 0 // Add this to force re-renders
  },
  reducers: {
    resetAssignmentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    triggerRefetch: (state) => {
      state.refreshCounter += 1;
      state.loading = true;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
    optimisticDelete: (state, action) => {
      state.assignments = state.assignments.filter(a => a.id !== action.payload);
      if (state.currentAssignment?.id === action.payload) {
        state.currentAssignment = null;
      }
    },
    // Simplified manual update action
    updateAssignmentInStore: (state, action) => {
      const { id, updatedData } = action.payload;
      const index = state.assignments.findIndex(a => a.id === id);
      if (index !== -1) {
        state.assignments[index] = { ...state.assignments[index], ...updatedData };
      }
      if (state.currentAssignment?.id === id) {
        state.currentAssignment = { ...state.currentAssignment, ...updatedData };
      }
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
        state.error = null;
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
        state.error = null;
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
        state.error = null;
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update assignment - SIMPLIFIED AND FIXED
      .addCase(updateAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

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
        state.error = null;
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.loading = false;
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
  triggerRefetch 
} = assignmentSlice.actions;

export default assignmentSlice.reducer;