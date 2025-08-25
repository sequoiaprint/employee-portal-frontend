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
  if (!encryptedToken) return null;

  const token = xorDecrypt(encryptedToken);
  if (!token) {
    console.warn('Failed to decrypt auth token');
    return null;
  }
  return token;
};

const handleUnauthorized = () => {
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

// ------------------------
// Async Thunks
// ------------------------

export const fetchTeams = createAsyncThunk('teams/fetchAll', async (_, { rejectWithValue }) => {
  const token = getAuthToken();
  if (!token) {
    handleUnauthorized();
    return rejectWithValue('No auth token');
  }
  try {
    const res = await axios.get('https://internalApi.sequoia-print.com/api/teams', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.data;
  } catch (error) {
    if (error.response?.status === 401) handleUnauthorized();
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createTeam = createAsyncThunk('teams/create', async (teamData, { rejectWithValue }) => {
  const token = getAuthToken();
  if (!token) {
    handleUnauthorized();
    return rejectWithValue('No auth token');
  }
  try {
    const res = await axios.post('https://internalApi.sequoia-print.com/api/teams', teamData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.data;
  } catch (error) {
    if (error.response?.status === 401) handleUnauthorized();
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateTeam = createAsyncThunk('teams/update', async ({ id, updatedData }, { rejectWithValue }) => {
  const token = getAuthToken();
  if (!token) {
    handleUnauthorized();
    return rejectWithValue('No auth token');
  }
  try {
    await axios.put(`https://internalApi.sequoia-print.com/api/teams/${id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { id, ...updatedData };
  } catch (error) {
    if (error.response?.status === 401) handleUnauthorized();
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteTeam = createAsyncThunk('teams/delete', async (id, { rejectWithValue }) => {
  const token = getAuthToken();
  if (!token) {
    handleUnauthorized();
    return rejectWithValue('No auth token');
  }
  try {
    await axios.delete(`https://internalApi.sequoia-print.com/api/teams/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return id;
  } catch (error) {
    if (error.response?.status === 401) handleUnauthorized();
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// ------------------------
// Slice
// ------------------------
const teamSlice = createSlice({
  name: 'teams',
  initialState: {
    teams: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.push(action.payload);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.teams.findIndex(team => team.id === action.payload.id);
        if (index !== -1) state.teams[index] = action.payload;
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.filter(team => team.id !== action.payload);
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default teamSlice.reducer;
