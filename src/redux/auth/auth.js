import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://internalApi.sequoia-print.com/api/auth';

// XOR Encryption/Decryption functions
const xorEncrypt = (text, secretKey = '28032002') => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result); // Base64 encode the result
};

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

// Updated Cookie configuration
const COOKIE_CONFIG = {
  expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 1 day from now
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
};

// Centralized logout function
const clearAuthData = () => {
  const cookiesToClear = ['authToken', 'adam', 'eve', 'tokenExpiration', 'userUid','role'];
  cookiesToClear.forEach(cookie => {
    Cookies.remove(cookie, { path: '/' });
  });
  localStorage.removeItem('authToken');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('profilesList');
  localStorage.removeItem('lastSelectedProjectId');
  localStorage.removeItem('selectedDate');
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    credentials: {
      name: null,
      password: null
    }
  },
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logoutSuccess(state) {
      state.token = null;
      state.user = null;
      state.credentials = { name: null, password: null };
      state.isAuthenticated = false;
      state.error = null;
      
      clearAuthData();
    },
    setCredentials(state, action) {
      state.credentials = action.payload;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // .addCase(validateToken.pending, (state) => {
      //   state.isLoading = true;
      // })
      // .addCase(validateToken.fulfilled, (state, action) => {
      //   state.isLoading = false;
      //   state.token = action.payload.token;
      //   state.user = action.payload.user;
      //   state.isAuthenticated = true;
      //   state.error = null;
      // })
      // .addCase(validateToken.rejected, (state) => {
      //   state.isLoading = false;
      //   state.isAuthenticated = false;
      //   state.token = null;
      //   state.user = null;
      // });
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logoutSuccess, 
  setCredentials, 
  clearError 
} = authSlice.actions;

const storeCredentials = (name, password) => {
  const encryptedName = xorEncrypt(name);
  const encryptedPassword = xorEncrypt(password);
  Cookies.set('adam', encryptedName, COOKIE_CONFIG);
  Cookies.set('eve', encryptedPassword, COOKIE_CONFIG);
};

export const getStoredCredentials = () => {
  const encryptedName = Cookies.get('adam');
  const encryptedPassword = Cookies.get('eve');
  
  if (encryptedName && encryptedPassword) {
    return {
      name: xorDecrypt(encryptedName),
      password: xorDecrypt(encryptedPassword)
    };
  }
  return null;
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ name, password, platform = 'employee' }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { 
        name, 
        password,
        platform 
      });
      
      const { token, user, platform: responsePlatform } = response.data.data;
      const uid = user.uid;
      const role = user.role;
      
      // Store token in both cookies and localStorage
      const encryptedToken = xorEncrypt(token);
      Cookies.set('authToken', encryptedToken, COOKIE_CONFIG);
      Cookies.set('userUid', uid, COOKIE_CONFIG);
      Cookies.set('role', role, COOKIE_CONFIG);
      Cookies.set('platform', responsePlatform, COOKIE_CONFIG); // Store platform
      localStorage.setItem('authToken', encryptedToken);
      localStorage.setItem('platform', responsePlatform);
      
      storeCredentials(name, password);
      dispatch(setCredentials({ name, password, platform: responsePlatform }));
      
      return { token, user, platform: responsePlatform };
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// export const validateToken = createAsyncThunk(
//   'auth/validateToken',
//   async (_, { rejectWithValue }) => {
//     try {
//       const encryptedToken = Cookies.get('authToken') 
//       if (!encryptedToken) {
//         return rejectWithValue('No token found');
//       }

//       const token = xorDecrypt(encryptedToken);
//       if (!token) {
//         return rejectWithValue('Invalid token format');
//       }

//       const response = await axios.get(`${API_URL}/validate`, {
//         headers: { Authorization: `Bearer ${token}` },
//         timeout: 10000 // 10 second timeout
//       });
      
//       return {
//         token,
//         user: response.data.user || response.data.data?.user
//       };
//     } catch (error) {
//       console.error('Token validation failed:', error);
      
//       // Only clear auth data if the error is specifically an auth error
//       if (error.response?.status === 401) {
//         clearAuthData();
//       }
      
//       if (error.code === 'ECONNABORTED') {
//         return rejectWithValue('Connection timeout');
//       }
      
//       return rejectWithValue(
//         error.response?.data?.message || 'Token validation failed'
//       );
//     }
//   }
// );

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, dispatch }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      const platform = state.auth.platform || 'employee'; // Get platform from state or default
      
      if (token) {
        await axios.post(`${API_URL}/logout`, 
          { platform }, // Send platform in request body
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }
        );
      }
    } catch (error) {
      console.warn('Server logout failed:', error.message);
    } finally {
      // Always clear local auth data
      dispatch(logoutSuccess());
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // First, check if we have a token
      const encryptedToken = Cookies.get('authToken') || localStorage.getItem('authToken');
      
      if (encryptedToken) {
        const token = xorDecrypt(encryptedToken);
        
        if (token) {
          // Validate the token
         // const result = await dispatch(validateToken()).unwrap();
          //return result;
        }
      }
      
      // If no valid token, check for stored credentials
      const credentials = getStoredCredentials();
      if (credentials) {
        dispatch(setCredentials(credentials));
        return rejectWithValue('Stored credentials found but no valid session');
      }
      
      return rejectWithValue('No valid authentication found');
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Don't clear auth data here - let validateToken handle that
      return rejectWithValue(error.message || 'Auth initialization failed');
    }
  }
);

export default authSlice.reducer;