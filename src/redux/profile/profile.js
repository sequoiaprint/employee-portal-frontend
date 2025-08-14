// redux/profile/profile.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// XOR decryption function (same as yours)
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

// Storage keys
const PROFILE_STORAGE_KEY = 'userProfile';
const PROFILES_LIST_STORAGE_KEY = 'profilesList';

// Helper functions for localStorage
const saveProfileToStorage = (profile) => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save profile to storage:', error);
  }
};

const getProfileFromStorage = () => {
  try {
    const profile = localStorage.getItem(PROFILE_STORAGE_KEY);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Failed to load profile from storage:', error);
    return null;
  }
};

const saveProfilesListToStorage = (profiles) => {
  try {
    localStorage.setItem(PROFILES_LIST_STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to save profiles list to storage:', error);
  }
};

const getProfilesListFromStorage = () => {
  try {
    const profiles = localStorage.getItem(PROFILES_LIST_STORAGE_KEY);
    return profiles ? JSON.parse(profiles) : [];
  } catch (error) {
    console.error('Failed to load profiles list from storage:', error);
    return [];
  }
};

// Centralized auth error handling
const handleAuthError = (error, rejectWithValue) => {
  console.error('API Error:', error);

  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.statusText;

    if (status === 401 || status === 403) {
      // Clear all auth data
      const cookiesToClear = ['authToken', 'adam', 'eve', 'tokenExpiration', 'userUid'];
      cookiesToClear.forEach(cookie => {
        Cookies.remove(cookie, { path: '/' });
      });
      localStorage.removeItem('authToken');

      // Redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);

      return rejectWithValue('Session expired, please login again');
    } else if (status === 404) {
      return rejectWithValue('Resource not found');
    } else if (status >= 500) {
      return rejectWithValue('Server error, please try again later');
    }

    return rejectWithValue(message || 'Request failed');
  } else if (error.request) {
    // Network error
    return rejectWithValue('Network error - please check your connection');
  } else if (error.code === 'ECONNABORTED') {
    return rejectWithValue('Request timeout - please try again');
  }

  return rejectWithValue(error.message || 'An unexpected error occurred');
};

// Get auth token with validation
const getAuthToken = () => {
  const encryptedToken = Cookies.get('authToken') || localStorage.getItem('authToken');
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

// Create axios config with auth
const createAuthConfig = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No valid auth token found');
  }

  return {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 15000 // 15 second timeout
  };
};

export const fetchAllProfiles = createAsyncThunk(
  'profile/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const config = createAuthConfig();
      const response = await axios.get('http://localhost:9000/api/profiles', config);

      // Save to localStorage
      saveProfilesListToStorage(response.data?.data || response.data || []);

      return response.data?.data || response.data || [];
    } catch (error) {
      if (error.message === 'No valid auth token found') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        return rejectWithValue('No authentication found');
      }
      return handleAuthError(error, rejectWithValue);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'profile/fetchOne',
  async (uid, { rejectWithValue }) => {
    try {
      if (!uid) {
        console.error('Profile fetch: No UID provided');
        return rejectWithValue('User ID is required');
      }

      console.log('Fetching profile for UID:', uid);
      const config = createAuthConfig();
      const response = await axios.get(`http://localhost:9000/api/profiles/${uid}`, config);

      console.log('Profile API response:', response.data);

      // Handle different response structures
      let profileData;
      if (response.data && typeof response.data === 'object') {
        profileData = response.data.data || response.data;
      } else {
        console.error('Unexpected profile response structure:', response.data);
        return rejectWithValue('Invalid profile data structure');
      }

      if (!profileData) {
        console.warn('Profile fetch: Empty profile data received');
        return rejectWithValue('No profile data received');
      }

      // Ensure the profile has a uid
      if (!profileData.uid) {
        profileData.uid = uid;
      }

      console.log('Processed profile data:', profileData);
      saveProfileToStorage(profileData);
      return profileData;
    } catch (error) {
      console.error('Profile fetch error:', error);
      if (error.message === 'No valid auth token found') {
        setTimeout(() => window.location.href = '/login', 100);
        return rejectWithValue('No authentication found');
      }
      return handleAuthError(error, rejectWithValue);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/update',
  async ({ uid, profileData }, { rejectWithValue }) => {
    try {
      if (!uid) {
        return rejectWithValue('User ID is required');
      }

      if (!profileData || typeof profileData !== 'object') {
        return rejectWithValue('Valid profile data is required');
      }
      console.log(profileData)

      const config = createAuthConfig();
      const response = await axios.put(
        `http://localhost:9000/api/profiles/${uid}`,
        profileData,
        config
      );

      const updatedProfile = response.data?.data || response.data;

      // Save to localStorage
      saveProfileToStorage(updatedProfile);

      return updatedProfile;
    } catch (error) {
      if (error.message === 'No valid auth token found') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        return rejectWithValue('No authentication found');
      }
      return handleAuthError(error, rejectWithValue);
    }
  }
);

export const createProfile = createAsyncThunk(
  'profile/create',
  async (profileData, { rejectWithValue }) => {
    console.log(profileData)
    try {
      if (!profileData || typeof profileData !== 'object') {
        return rejectWithValue('Valid profile data is required');
      }

      const config = createAuthConfig();
      const response = await axios.post(
        'http://localhost:9000/api/auth/signup',
        profileData,
        config
      );

      const newProfile = response.data?.data || response.data;

      // Save to localStorage
      //saveProfileToStorage(newProfile);

      return newProfile;
    } catch (error) {
      if (error.message === 'No valid auth token found') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        return rejectWithValue('No authentication found');
      }
      return handleAuthError(error, rejectWithValue);
    }
  }
);

export const createWorkSchedule = createAsyncThunk(
  'profile/createWorkSchedule',
  async ({ employeeId, scheduleData }, { rejectWithValue }) => {
    try {
      const config = createAuthConfig();
      const response = await axios.post(
        `http://localhost:9000/api/profiles/work-schedule/${employeeId}`,
        scheduleData,
        config
      );
      return { employeeId, schedule: response.data.data || response.data };
    } catch (error) {
      return handleAuthError(error, rejectWithValue);
    }
  }
);

export const updateWorkSchedule = createAsyncThunk(
  'profile/updateWorkSchedule',
  async ({ employeeId, scheduleId, scheduleData }, { rejectWithValue }) => {
    try {
      const config = createAuthConfig();
      const response = await axios.put(
        `http://localhost:9000/api/profiles/${employeeId}/work-schedule/${scheduleId}`,
        scheduleData,
        config
      );
      return { employeeId, scheduleId, schedule: response.data.data || response.data };
    } catch (error) {
      return handleAuthError(error, rejectWithValue);
    }
  }
);

export const deleteWorkSchedule = createAsyncThunk(
  'profile/deleteWorkSchedule',
  async ({ employeeId, scheduleId }, { rejectWithValue }) => {
    try {
      const config = createAuthConfig();
      const response = await axios.delete(
        `http://localhost:9000/api/profiles/${employeeId}/work-schedule/${scheduleId}`,
        config
      );
      return { employeeId, scheduleId, data: response.data };
    } catch (error) {
      return handleAuthError(error, rejectWithValue);
    }
  }
);

export const deleteProfile = createAsyncThunk(
  'profile/delete',
  async (uid, { rejectWithValue, dispatch }) => {
    try {
      if (!uid) {
        return rejectWithValue('User ID is required');
      }

      const config = createAuthConfig();
      const response = await axios.delete(
        `http://localhost:9000/api/auth/${uid}`,
        config
      );

      // After successful delete, refresh profile list
      await dispatch(fetchAllProfiles());

      return { uid, data: response.data };
    } catch (error) {
      if (error.message === 'No valid auth token found') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        return rejectWithValue('No authentication found');
      }
      return handleAuthError(error, rejectWithValue);
    }
  }
);

// Helper function to update profile in both current and profiles array
const updateProfileInState = (state, updatedProfile) => {
  // Update current profile if it matches
  if (state.currentProfile?.uid === updatedProfile.uid) {
    state.currentProfile = updatedProfile;
    saveProfileToStorage(updatedProfile);
  }

  // Update in profiles array
  const profileIndex = state.profiles.findIndex(p => p.uid === updatedProfile.uid);
  if (profileIndex !== -1) {
    state.profiles[profileIndex] = updatedProfile;
    saveProfilesListToStorage(state.profiles);
  }
};

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profiles: getProfilesListFromStorage(),
    currentProfile: getProfileFromStorage(),
    loading: false,
    error: null,
    lastFetch: null
  },
  reducers: {
    clearProfileState: (state) => {
      state.profiles = [];
      state.currentProfile = null;
      state.error = null;
      state.lastFetch = null;
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      localStorage.removeItem(PROFILES_LIST_STORAGE_KEY);
    },
    clearProfileError: (state) => {
      state.error = null;
    },
    setCurrentProfile: (state, action) => {
      state.currentProfile = action.payload;
      saveProfileToStorage(action.payload);
    },
    initializeProfileFromStorage: (state) => {
      state.currentProfile = getProfileFromStorage();
      state.profiles = getProfilesListFromStorage();
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all profiles
      .addCase(fetchAllProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = Array.isArray(action.payload) ? action.payload : [];
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchAllProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentProfile = action.payload;
          saveProfileToStorage(action.payload);

          // Update in profiles array if exists
          const index = state.profiles.findIndex(p => p.uid === action.payload.uid);
          if (index !== -1) {
            state.profiles[index] = action.payload;
          } else {
            state.profiles.push(action.payload);
          }
          saveProfilesListToStorage(state.profiles);
        }
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Profile fetch failed:', action.payload);
      })


      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        updateProfileInState(state, action.payload);
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create profile
      .addCase(createProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Only add to profiles array, don't set as currentProfile or save to localStorage
        if (action.payload) {
          state.profiles.push(action.payload);
          saveProfilesListToStorage(state.profiles);
        }
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create work schedule
      .addCase(createWorkSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const { employeeId, schedule } = action.payload;

        // Update current profile if it matches
        if (state.currentProfile?.uid === employeeId) {
          state.currentProfile.work_schedules = state.currentProfile.work_schedules || [];
          state.currentProfile.work_schedules.push(schedule);
          saveProfileToStorage(state.currentProfile);
        }

        // Update in profiles array
        const profileIndex = state.profiles.findIndex(p => p.uid === employeeId);
        if (profileIndex !== -1) {
          state.profiles[profileIndex].work_schedules = state.profiles[profileIndex].work_schedules || [];
          state.profiles[profileIndex].work_schedules.push(schedule);
          saveProfilesListToStorage(state.profiles);
        }

        state.error = null;
      })
      .addCase(createWorkSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update work schedule
      .addCase(updateWorkSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const { employeeId, scheduleId, schedule } = action.payload;

        // Update current profile if it matches
        if (state.currentProfile?.uid === employeeId && state.currentProfile.work_schedules) {
          const scheduleIndex = state.currentProfile.work_schedules.findIndex(s => s.id === scheduleId);
          if (scheduleIndex !== -1) {
            state.currentProfile.work_schedules[scheduleIndex] = schedule;
            saveProfileToStorage(state.currentProfile);
          }
        }

        // Update in profiles array
        const profileIndex = state.profiles.findIndex(p => p.uid === employeeId);
        if (profileIndex !== -1 && state.profiles[profileIndex].work_schedules) {
          const scheduleIndex = state.profiles[profileIndex].work_schedules.findIndex(s => s.id === scheduleId);
          if (scheduleIndex !== -1) {
            state.profiles[profileIndex].work_schedules[scheduleIndex] = schedule;
            saveProfilesListToStorage(state.profiles);
          }
        }

        state.error = null;
      })
      .addCase(updateWorkSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete work schedule
      .addCase(deleteWorkSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWorkSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const { employeeId, scheduleId } = action.payload;

        // Update current profile if it matches
        if (state.currentProfile?.uid === employeeId && state.currentProfile.work_schedules) {
          state.currentProfile.work_schedules = state.currentProfile.work_schedules.filter(
            s => s.id !== scheduleId
          );
          saveProfileToStorage(state.currentProfile);
        }

        // Update in profiles array
        const profileIndex = state.profiles.findIndex(p => p.uid === employeeId);
        if (profileIndex !== -1 && state.profiles[profileIndex].work_schedules) {
          state.profiles[profileIndex].work_schedules = state.profiles[profileIndex].work_schedules.filter(
            s => s.id !== scheduleId
          );
          saveProfilesListToStorage(state.profiles);
        }

        state.error = null;
      })
      .addCase(deleteWorkSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete profile
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        state.loading = false;
        const { uid } = action.payload;
        // Remove from state
        state.profiles = state.profiles.filter(profile => profile.uid !== uid);

        // If the deleted profile was the current one, clear it
        if (state.currentProfile?.uid === uid) {
          state.currentProfile = null;
          localStorage.removeItem(PROFILE_STORAGE_KEY);
        }

        saveProfilesListToStorage(state.profiles);
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearProfileState,
  clearProfileError,
  setCurrentProfile,
  initializeProfileFromStorage
} = profileSlice.actions;

export default profileSlice.reducer;