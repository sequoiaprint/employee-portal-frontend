import Cookies from 'js-cookie';

// XOR Encryption/Decryption functions
const xorEncrypt = (text, secretKey = '28032002') => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
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

class TokenService {
  constructor() {
    this.cookieConfig = {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    };
  }

  // Store token with fallback to localStorage
  storeToken(token) {
    try {
      const encryptedToken = xorEncrypt(token);
      
      // Try cookies first
      Cookies.set('authToken', encryptedToken, this.cookieConfig);
      
      // Fallback to localStorage
      localStorage.setItem('authToken', encryptedToken);
      
      return true;
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  }

  // Get token with fallback
  getToken() {
    try {
      // Try cookies first
      let encryptedToken = Cookies.get('authToken');
      
      // Fallback to localStorage
      if (!encryptedToken) {
        encryptedToken = localStorage.getItem('authToken');
      }
      
      if (encryptedToken) {
        return xorDecrypt(encryptedToken);
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  // Remove token from both storage locations
  removeToken() {
    try {
      Cookies.remove('authToken', { path: '/' });
      localStorage.removeItem('authToken');
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  }

  // Store credentials
  storeCredentials(name, password) {
    try {
      const encryptedName = xorEncrypt(name);
      const encryptedPassword = xorEncrypt(password);
      
      Cookies.set('adam', encryptedName, this.cookieConfig);
      Cookies.set('eve', encryptedPassword, this.cookieConfig);
      
      // Also store in localStorage as fallback
      localStorage.setItem('adam', encryptedName);
      localStorage.setItem('eve', encryptedPassword);
      
      return true;
    } catch (error) {
      console.error('Error storing credentials:', error);
      return false;
    }
  }

  // Get credentials
  getCredentials() {
    try {
      let encryptedName = Cookies.get('adam');
      let encryptedPassword = Cookies.get('eve');
      
      // Fallback to localStorage
      if (!encryptedName || !encryptedPassword) {
        encryptedName = localStorage.getItem('adam');
        encryptedPassword = localStorage.getItem('eve');
      }
      
      if (encryptedName && encryptedPassword) {
        return {
          name: xorDecrypt(encryptedName),
          password: xorDecrypt(encryptedPassword)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  // Remove credentials
  removeCredentials() {
    try {
      Cookies.remove('adam', { path: '/' });
      Cookies.remove('eve', { path: '/' });
      localStorage.removeItem('adam');
      localStorage.removeItem('eve');
      return true;
    } catch (error) {
      console.error('Error removing credentials:', error);
      return false;
    }
  }
}

export default new TokenService();
