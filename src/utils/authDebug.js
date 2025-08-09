// Debug utility for auth issues
export const debugAuthState = () => {
  console.log('=== AUTH DEBUG INFO ===');
  
  // Check cookies
  console.log('Cookies:', {
    authToken: document.cookie.includes('authToken'),
    adam: document.cookie.includes('adam'),
    eve: document.cookie.includes('eve')
  });
  
  // Check current URL
  console.log('Current URL:', window.location.pathname);
  
  // Check if we can access Redux dev tools
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log('Redux DevTools available');
  }
};

// Add to window for easy debugging
window.debugAuth = debugAuthState;
