import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://storage-leone-celebrities-pierre.trycloudflare.com/api/auth';

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

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 1, 
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
};

// Fallback to localStorage if cookies fail
const useLocalStorage = false; // Set to true if cookies are problematic

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    isLoading: false,
    error: null,
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
    },
    loginFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutSuccess(state) {
      state.token = null;
      state.user = null;
      state.credentials = { name: null, password: null };
      Cookies.remove('authToken', { path: '/' });
      Cookies.remove('adam', { path: '/' });
      Cookies.remove('eve', { path: '/' });
    },
    setCredentials(state, action) {
      state.credentials = action.payload;
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
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { loginStart, loginSuccess, loginFailure, logoutSuccess, setCredentials } = authSlice.actions;


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
  async ({ name, password }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { name, password });
      const { token, user } = response.data.data;
      
      // Store token in both cookies and localStorage
      const encryptedToken = xorEncrypt(token);
      Cookies.set('authToken', encryptedToken, COOKIE_CONFIG);
      localStorage.setItem('authToken', encryptedToken); // Add this line
      
      storeCredentials(name, password);
      dispatch(setCredentials({ name, password }));
      
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);


export const logout = () => async (dispatch, getState) => {
  try {
    const token = getState().auth.token;
    await axios.post(`${API_URL}/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    dispatch(logoutSuccess());
  }
};

// Initialize auth state from cookies
export const initializeAuth = () => async (dispatch) => {
  dispatch(loginStart());
  
  try {
    // Try both cookies and localStorage
    let encryptedToken = Cookies.get('authToken') || localStorage.getItem('authToken');
    
    if (encryptedToken) {
      const token = xorDecrypt(encryptedToken);
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/validate`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          dispatch(loginSuccess({
            token,
            user: response.data.user
          }));
          return;
        } catch (validationError) {
          console.error('Token validation failed:', validationError);
          // Token is invalid, proceed to login failure
        }
      }
    }
    
    // If we get here, no valid token was found
    const credentials = getStoredCredentials();
    if (credentials) {
      dispatch(setCredentials(credentials));
    }
    
    dispatch(loginFailure(null));
    
  } catch (error) {
    console.error('Auth initialization error:', error);
    dispatch(loginFailure(null));
  }
};

export default authSlice.reducer;