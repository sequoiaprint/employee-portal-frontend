// TechProject.js - Fixed version with delete
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Enhanced authentication handling
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

const API_BASE_URL = 'https://internalApi.sequoia-print.com/api/techprojects';

// Helper function to parse project data
const parseProjectData = (project) => {
  if (!project) return null;
  
  return {
    ...project,
    github_links: Array.isArray(project.github_links) ? project.github_links : 
                 (project.github_links ? safeJsonParse(project.github_links, []) : []),
    techstacks: Array.isArray(project.techstacks) ? project.techstacks : 
               (project.techstacks ? safeJsonParse(project.techstacks, []) : []),
    media: Array.isArray(project.media) ? project.media : 
          (project.media ? safeJsonParse(project.media, []) : [])
  };
};

// Safe JSON parse function
const safeJsonParse = (str, defaultValue = []) => {
  try {
    if (typeof str === 'string') {
      return JSON.parse(str);
    }
    return defaultValue;
  } catch (error) {
    console.warn('JSON parse error:', error);
    return defaultValue;
  }
};

// Enhanced API calls with better error handling
export const fetchProjects = createAsyncThunk(
  'techProjects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.get(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      });
      
      console.log('API Response:', response); // Debug log
      
      // Handle different response formats
      let projectsData = [];
      
      if (Array.isArray(response.data)) {
        // If response.data is already an array
        projectsData = response.data.map(parseProjectData).filter(Boolean);
      } else if (response.data && Array.isArray(response.data.projects)) {
        // If response.data has a projects array
        projectsData = response.data.projects.map(parseProjectData).filter(Boolean);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // If response.data has a data array
        projectsData = response.data.data.map(parseProjectData).filter(Boolean);
      } else if (response.data && typeof response.data === 'object') {
        // If response.data is a single project object
        const parsedProject = parseProjectData(response.data);
        if (parsedProject) {
          projectsData = [parsedProject];
        }
      } else {
        console.warn('Unexpected API response format:', response.data);
        return rejectWithValue('Unexpected API response format');
      }
      
      return projectsData;
    } catch (error) {
      console.error('Fetch projects error:', error);
      
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication failed');
      }
      
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Request timeout');
      }
      
      // Handle cases where error response might have different structure
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch projects';
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const createProject = createAsyncThunk(
  'techProjects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.post(API_BASE_URL, projectData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      const parsedProject = parseProjectData(response.data);
      if (!parsedProject) {
        return rejectWithValue('Invalid project data received');
      }
      
      return parsedProject;
    } catch (error) {
      console.error('Create project error:', error);
      
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication failed');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create project';
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProject = createAsyncThunk(
  'techProjects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.put(`${API_BASE_URL}/${id}`, projectData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      const parsedProject = parseProjectData(response.data);
      if (!parsedProject) {
        return rejectWithValue('Invalid project data received');
      }
      
      return parsedProject;
    } catch (error) {
      console.error('Update project error:', error);
      
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication failed');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to update project';
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'techProjects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      return id;
    } catch (error) {
      console.error('Delete project error:', error);
      
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication failed');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to delete project';
      
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  projects: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  operationStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  operationError: null,
}

const techProjectSlice = createSlice({
  name: 'techProjects',
  initialState,
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = 'idle';
      state.operationError = null;
    },
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    // Manual state updates for optimistic updates
    addProjectToState: (state, action) => {
      if (action.payload) {
        state.projects.push(action.payload);
      }
    },
    updateProjectInState: (state, action) => {
      if (action.payload && action.payload.id) {
        const index = state.projects.findIndex(project => project.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      }
    },
    removeProjectFromState: (state, action) => {
      state.projects = state.projects.filter(project => project.id !== action.payload);
    },
    // Reset entire state
    resetTechProjects: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.projects = [];
      })
      
      // Create project
      .addCase(createProject.pending, (state) => {
        state.operationStatus = 'loading';
        state.operationError = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        if (action.payload) {
          state.projects.push(action.payload);
        }
        state.operationError = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      })
      
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.operationStatus = 'loading';
        state.operationError = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        if (action.payload && action.payload.id) {
          const index = state.projects.findIndex(project => project.id === action.payload.id);
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
        }
        state.operationError = null;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      })
      
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.operationStatus = 'loading';
        state.operationError = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        state.projects = state.projects.filter(project => project.id !== action.payload);
        state.operationError = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.operationError = action.payload;
      });
  }
});

export const { 
  resetOperationStatus, 
  clearError,
  addProjectToState,
  updateProjectInState,
  removeProjectFromState,
  resetTechProjects
} = techProjectSlice.actions;

export const selectAllTechProjects = (state) => state.techProjects.projects;
export const selectTechProjectsStatus = (state) => state.techProjects.status;
export const selectTechProjectsError = (state) => state.techProjects.error;
export const selectTechProjectsOperationStatus = (state) => state.techProjects.operationStatus;
export const selectTechProjectsOperationError = (state) => state.techProjects.operationError;

export default techProjectSlice.reducer;