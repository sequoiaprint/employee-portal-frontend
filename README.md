<table style="border-collapse: collapse; border: none;">
  <tr>
    <td>
      <a href="https://employees.sequoia-print.com/">
        <img src="https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/sequiaPrintLogo.png" alt="Sequoia Print Logo" width="500"/>
      </a>
    </td>
    <td>

### About Sequoia Employee Hub

This is the Employee Hub for **Sequoia Print**, a next-generation printing and packaging innovation company. The website is developed using **React**, styled with **Tailwind CSS**, and uses **Redux** for state management. It is backed by a **Node.js** server hosted on **AWS**, while the frontend is deployed via **Netlify**.

    
  </tr>
</table>

---

### ⚙️ Development Note

This website is intended to be run in development mode on `localhost:3000`. Accessing it from other origins without the proper CORS headers may result in CORS errors.

### 🧰 Tech Stack Used

<table style="border-collapse: collapse; border: none;">
  <tr>
    <td align="center">
      <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/react-js-icon.png" alt="React" width="50"/><br/>
      <strong>React</strong><br/>
      <a href="https://react.dev/learn" target="_blank">📘 Docs</a> · <a href="https://github.com/facebook/react" target="_blank">🔗 GitHub</a>
    </td>
    <td align="center">
      <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/tailwind-css-icon.svg" alt="Tailwind CSS" width="85"/><br/>
      <strong>Tailwind CSS</strong><br/>
      <a href="https://tailwindcss.com/docs" target="_blank">📘 Docs</a> · <a href="https://github.com/tailwindlabs/tailwindcss" target="_blank">🔗 GitHub</a>
    </td>
    <td align="center">
      <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/redux-icon.svg" alt="Redux" width="50"/><br/>
      <strong>Redux</strong><br/>
      <a href="https://redux.js.org/introduction/getting-started" target="_blank">📘 Docs</a> · <a href="https://github.com/reduxjs/redux" target="_blank">🔗 GitHub</a>
    </td>
  </tr>
</table>





---
## 🚀 Getting Started
````markdown
Before you begin, make sure you have **Node.js** installed on your system.

### 📦 Install Node.js

- **Windows:**
  - Download and install Node.js from the official site: [https://nodejs.org](https://nodejs.org)
  - Confirm installation:
    ```bash
    node -v
    npm -v
    ```
- **Linux (Ubuntu/Debian):**
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  node -v
  npm -v
````
---

### 🛠️ Project Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sequoiaprint/client-operations-frontend.git
   ```

2. **Navigate into the project folder:**

   ```bash
   cd client-operations-frontend
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Start the development server:**

   ```bash
   npm start
   ```

---

> The app will be available at: `http://localhost:3000`

## 🧱 Tech Info

### 🎨 Tailwind CSS

This project uses **Tailwind CSS** for styling. The configuration is set up in `tailwind.config.js` with:

- ➤ Custom font families (`Satoshi` for headings, `Inter` for body)
- ➤ Custom animations (`pulseIndicator`, `fadeIndicator`)
- ➤ Responsive breakpoints for `sm`, `md`, `lg`, `xl`, and `2xl`

> **📌 Important:** Do **not** modify the existing Tailwind configuration in `tailwind.config.js`.

**📚 Tailwind Documentation**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

<details>
<summary>🔧 <strong>tailwind.config.js</strong> (Click to expand)</summary>

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ➤ Include all React component files for Tailwind class scanning
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Satoshi', 'sans-serif'], // ➤ Custom heading font
        body: ['Inter', 'sans-serif'],       // ➤ Custom body font
      },
      keyframes: {
        pulseIndicator: {
          "0%": { opacity: "0%" },
          "20%": { opacity: "20%" },
          "50%": { opacity: "100%" },
          "80%": { opacity: "20%" },
          "100%": { opacity: "0%" },
        },
        fadeIndicator: {
          "0%": { opacity: "80%" },
          "100%": { opacity: "0%" },
        },
      },
      animation: {
        "pulse-indicator": "pulseIndicator 2s infinite", // ➤ Blinking pulse effect
        "fade-indicator": "fadeIndicator 2s infinite",   // ➤ Smooth fade-out animation
      },
    },
    screens: {
      sm: "640px",    // ➤ Small devices (mobiles)
      md: "768px",    // ➤ Medium devices (tablets)
      lg: "1024px",   // ➤ Large devices (small laptops)
      xl: "1280px",   // ➤ Extra large devices (desktops)
      "2xl": "1536px" // ➤ Very large screens
    },
  },
  plugins: [],
};
````

</details>

---

<details>
<summary>💡 <strong>Font Setup (CSS)</strong> (Click to expand)</summary>

```css
@font-face {
  font-family: 'Satoshi';
  src: url('./../public/fonts/Satoshi-Regular.otf') format('truetype'); // ➤ Load custom font from public directory
  font-weight: normal;
  font-style: normal;
}

body {
  font-family: 'Inter', sans-serif; // ➤ Apply default body font
}
```

</details>


---

# Login System Documentation

## Overview

The login system for Sequoia Employee Hub uses a combination of React, Redux Toolkit, and encrypted cookies to provide secure authentication with cross-platform capabilities.

## Authentication Flow

### 1. Login Process
- User enters credentials in the Login component
- Credentials are sent to the API via Redux Thunk
- Upon successful authentication, tokens and credentials are encrypted and stored
- User is redirected to the main application

### 2. Credential Storage & Encryption
Credentials are encrypted using XOR encryption before being stored in cookies:

```javascript
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
```

### 3. Cookie Configuration
Cookies are configured with secure settings:

```javascript
const COOKIE_CONFIG = {
  expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 1 day from now
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
};
```

## Cross-Platform Login Implementation

The sidebar component enables cross-platform login by retrieving encrypted credentials and constructing login URLs for different portals:

### How It Works

1. **Credential Retrieval**: The sidebar uses `getStoredCredentials()` to decrypt stored credentials from cookies
2. **URL Construction**: Login URLs are built with the decrypted credentials as query parameters
3. **Auto-Login**: When users click portal links, they're automatically logged in to external platforms

### Code Implementation

<details>
<summary>Sidebar Cross-Platform Login Code</summary>

```javascript
// Get stored credentials from encrypted cookies
const cookieCredentials = getStoredCredentials();

// Construct login URLs for different platforms
const loginUrl = cookieCredentials?.name && cookieCredentials?.password 
  ? `https://form.sequoia-print.com/Login?name=${encodeURIComponent(cookieCredentials.name)}&password=${encodeURIComponent(cookieCredentials.password)}`
  : null;

const localLoginUrl = cookieCredentials?.name && cookieCredentials?.password 
  ? `https://clientops.sequoia-print.com/login?name=${encodeURIComponent(cookieCredentials.name)}&password=${encodeURIComponent(cookieCredentials.password)}`
  : null;

// Auto-login handlers
const handleAutoLogin = () => {
  if (loginUrl) {
    window.open(loginUrl, '_blank');
  }
};

const handleLocalLogin = () => {
  if (localLoginUrl) {
    window.open(localLoginUrl, '_blank');
  }
};
```
</details>

### Portal Links in Sidebar
The sidebar displays conditional portal links based on available credentials:
- Forms Portal (auto-login enabled)
- Client Portal (auto-login enabled)
- Official Landing Page (standard link)

## Protected Routes

The application uses a ProtectedRoute component to guard authenticated routes:

```javascript
const ProtectedRoute = () => {
  const { token, isLoading, isAuthenticated } = useSelector((state) => state.auth);
  
  // Check both cookie and Redux state
  const encryptedToken = Cookies.get('authToken');
  const hasToken = !!token || !!encryptedToken;

  // Show loading spinner during authentication check
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">...</div>;
  }

  // Redirect to login if not authenticated
  if (!isLoading && !hasToken && !isAuthenticated) {
    // Clear all auth data
    localStorage.removeItem('authToken');
    // ... more cleanup
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header />
      <Sidebar />
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
};
```

## Security Features

1. **Encrypted Storage**: All sensitive data is encrypted before storage
2. **Secure Cookies**: Cookies are configured with HttpOnly, Secure, and SameSite attributes
3. **Automatic Cleanup**: Auth data is properly cleared on logout
4. **Token Validation**: Token validation checks are implemented (commented in provided code)

## Data Flow

1. **Login**: User credentials → API → Encrypted tokens/cookies → Redux state
2. **Navigation**: Protected routes check auth status → Grant/deny access
3. **Cross-Platform**: Encrypted credentials → URL parameters → Auto-login
4. **Logout**: Clear all client-side storage → API logout call

This system provides a secure authentication mechanism with the convenience of cross-platform access while maintaining security best practices.


# Client Data Flow Documentation

## Overview

The client management system provides a complete CRUD interface for managing client information with role-based access control, image uploads, and search functionality.

## Data Flow Architecture

### 1. Authentication & Authorization
- Uses encrypted tokens from cookies for API authentication
- Implements role-based access control (Admin Ops only)
- Automatically handles unauthorized responses

### 2. Client Data Management
- **Create**: Add new clients with comprehensive information
- **Read**: Fetch and display clients in a searchable table
- **Update**: Edit existing client information
- **Delete**: Remove clients (admin only)

### 3. Image Management
- Supports multiple image uploads via PhotoUploader component
- Images are stored as comma-separated URLs
- Thumbnail previews in the client table

## Authentication Flow

<details>
<summary>Token Management Implementation</summary>

```javascript
// XOR decryption function
const xorDecrypt = (encrypted, secretKey = '28032001') => {
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
  const encryptedToken = Cookies.get('authTokenCOf');
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
  // Clear all auth data and redirect to login
  const cookiesToClear = ['authTokenCOf', 'adam', 'eve', 'tokenExpiration', 'userUidCOf','roleCof'];
  cookiesToClear.forEach(cookie => {
    Cookies.remove(cookie, { path: '/' });
  });
  localStorage.removeItem('authTokenCOf');
  localStorage.removeItem('userUidCOf');
  localStorage.removeItem('profilesListCOf');
  localStorage.removeItem('userCof');
  window.location.href = '/login';
};
```
</details>

## API Integration

<details>
<summary>Redux Async Thunks for CRUD Operations</summary>

```javascript
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.post(API_URL, clientData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Refresh the clients list after creation
      await dispatch(fetchClients());
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
```
</details>

## Search & Filter System

<details>
<summary>Advanced Search Implementation</summary>

```javascript
// Search state management
const [isSearchExpanded, setIsSearchExpanded] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [searchField, setSearchField] = useState('client_name');
const [suggestions, setSuggestions] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);

// Generate suggestions based on search term and field
useEffect(() => {
  if (searchTerm.length > 0) {
    const filtered = clients.filter(client => {
      const fieldValue = String(client[searchField] || '').toLowerCase();
      return fieldValue.includes(searchTerm.toLowerCase());
    });

    const uniqueSuggestions = [...new Set(
      filtered.map(client => client[searchField])
    )].filter(Boolean);

    setSuggestions(uniqueSuggestions.slice(0, 5));
  } else {
    setSuggestions([]);
  }
}, [searchTerm, searchField, clients]);

// Filter clients based on search criteria
const filteredClients = clients.filter(client => {
  if (!searchTerm) return true;
  const fieldValue = String(client[searchField] || '').toLowerCase();
  return fieldValue.includes(searchTerm.toLowerCase());
});
```
</details>

## Role-Based Access Control

<details>
<summary>Admin-Only Operations</summary>

```javascript
const role = Cookies.get('roleCof');
const isAdmin = role === "Admin Ops";

// Admin-only buttons with disabled states
<button
  onClick={() => isAdmin && setIsModalOpen(true)}
  disabled={!isAdmin}
  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
    ${isAdmin
      ? "bg-[#EA7125] text-white hover:bg-[#d45f1a]"
      : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
  title={isAdmin ? "Add New Client" : "Only admins can add clients"}
>
  <Plus size={18} />
  <span>Add New Client</span>
</button>
```
</details>

## Form Data Handling

<details>
<summary>Client Form Management</summary>

```javascript
// Form state management
const [formData, setFormData] = useState({
  client_name: '',
  name: '',
  phone: '',
  email: '',
  companyType: '',
  description: '',
  urls: '',
  createdBy: uid
});

const [imageUrls, setImageUrls] = useState([]);

// Prepare data for API submission
const prepareFormData = () => {
  return {
    ...formData,
    urls: imageUrls.join(','), // Join URLs with comma
    createdBy: uid
  };
};

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  const clientData = prepareFormData();

  if (editingId) {
    await dispatch(updateClient({ id: editingId, clientData }));
  } else {
    await dispatch(createClient(clientData));
  }
};
```
</details>

## Image Upload System

<details>
<summary>Image Management Functions</summary>

```javascript
// Handle image uploads from PhotoUploader component
const handleImageUpload = (url) => {
  setImageUrls(prev => [...prev, url]);
};

// Remove uploaded images
const removeImage = (index) => {
  setImageUrls(prev => prev.filter((_, i) => i !== index));
};

// Display image previews in form
{imageUrls.length > 0 && (
  <div className="mt-4">
    <div className="flex flex-wrap gap-2">
      {imageUrls.map((url, index) => (
        <div key={index} className="relative group">
          <img
            src={url}
            alt={`Preview ${index}`}
            className="h-20 w-20 object-cover rounded-md"
          />
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  </div>
)}
```
</details>

## Data Flow Summary

1. **Authentication**: Tokens are retrieved from encrypted cookies
2. **Authorization**: Role-based checks determine edit/delete permissions
3. **Data Fetching**: Clients are loaded via Redux async thunks
4. **Search/Filter**: Real-time filtering with autocomplete suggestions
5. **CRUD Operations**: Create, read, update, delete with immediate UI updates
6. **Image Management**: Upload, preview, and manage client images
7. **Form Handling**: Comprehensive form validation and data preparation
8. **Error Handling**: Proper error handling and unauthorized response management

## Security Features

- Encrypted token storage and retrieval
- Automatic logout on unauthorized responses
- Role-based access control
- Input validation and sanitization
- Secure API communication with proper headers

---

# Project Data Flow Documentation

## Overview

The project management system provides comprehensive CRUD operations for managing print projects with advanced features like milestone tracking, AI-generated milestones, team management, and visual progress tracking.

## Data Flow Architecture

### 1. Authentication & Authorization
- Uses encrypted tokens from cookies for API authentication
- Implements role-based access control (Admin Ops only for edits/deletes)
- Automatically handles unauthorized responses with redirect to login

### 2. Project Data Management
- **Create**: Add new projects with comprehensive details and milestones
- **Read**: Fetch and display projects with search and filtering
- **Update**: Edit existing project information with milestone management
- **Delete**: Remove projects (admin only)

### 3. Advanced Features
- AI-generated milestone suggestions
- Visual milestone progress tracking
- Team assignment and management
- Image upload and management
- Real-time search with suggestions

## Authentication & Token Management

<details>
<summary>Token Decryption and Management</summary>

```javascript
// XOR decryption function for tokens
const xorDecrypt = (encrypted, secretKey = '28032001') => {
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
  const encryptedToken = Cookies.get('authTokenCOf');
  if (!encryptedToken) return null;
  const token = xorDecrypt(encryptedToken);
  if (!token) {
    console.warn('Failed to decrypt auth token');
    return null;
  }
  return token;
};

const handleUnauthorized = () => {
  const cookiesToClear = ['authTokenCOf', 'adam', 'eve', 'tokenExpiration', 'userUidCOf','roleCof'];
  cookiesToClear.forEach(cookie => {
    Cookies.remove(cookie, { path: '/' });
  });
  localStorage.removeItem('authTokenCOf');
  localStorage.removeItem('userUidCOf');
  localStorage.removeItem('profilesListCOf');
  localStorage.removeItem('userCof');
  window.location.href = '/login';
};
```
</details>

## API Integration with Redux

<details>
<summary>Redux Async Thunks for Project Operations</summary>

```javascript
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.get(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.post(API_BASE_URL, projectData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Refresh the projects list after creation
      dispatch(fetchProjects());
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
```
</details>

## Milestone Management System

<details>
<summary>AI-Powered Milestone Generation</summary>

```javascript
const generateMilestones = async () => {
  if (!formData.goals && !formData.description) {
    setMilestoneError('Please enter project goals or description to generate milestones');
    return;
  }

  setIsGeneratingMilestones(true);
  setMilestoneError(null);

  try {
    const response = await fetch('https://internalApi.sequoia-print.com/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectDescription: `${formData.goals}\n${formData.description}`
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate milestones');
    }

    const data = await response.json();
    setGeneratedMilestones(data.milestones || []);
    setShowGeneratedMilestones(true);
  } catch (error) {
    console.error('Error generating milestones:', error);
    setMilestoneError('Failed to generate milestones. Please try again.');
  } finally {
    setIsGeneratingMilestones(false);
  }
};

const confirmGeneratedMilestone = (milestone) => {
  setFormData(prev => ({
    ...prev,
    milestones: [...prev.milestones, milestone],
    milestones_status: [...prev.milestones_status, 0] // AI milestones start as incomplete
  }));
  setGeneratedMilestones(prev => prev.filter(m => m !== milestone));
};
```
</details>

<details>
<summary>Milestone Progress Calculation</summary>

```javascript
// Helper function to parse milestone statuses
const parseMilestoneStatuses = (statusesString) => {
  if (!statusesString) return [];
  return statusesString.split(',').map(status => parseInt(status.trim())).filter(status => !isNaN(status));
};

// Helper function to calculate progress percentage
const calculateProgress = (statuses) => {
  if (!statuses || statuses.length === 0) return 0;
  const completed = statuses.filter(status => status === 1).length;
  return Math.round((completed / statuses.length) * 100);
};

// Visual milestone chain component
const MilestoneChain = ({ milestones, statuses }) => {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700">
          Milestones ({completedCount}/{milestones.length})
        </span>
        <span className="text-xs text-gray-600">
          {progress}% Complete
        </span>
      </div>
      
      {/* Visual milestone chain implementation */}
      <div className="flex items-center space-x-1 mb-2">
        {milestones.map((milestone, index) => {
          const isCompleted = statuses[index] === 1;
          // ... visual representation logic
        })}
      </div>
    </div>
  );
};
```
</details>

## Search and Filter System

<details>
<summary>Advanced Search Implementation</summary>

```javascript
// Search state management
const [isSearchExpanded, setIsSearchExpanded] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [searchField, setSearchField] = useState('name');
const [suggestions, setSuggestions] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);

// Generate suggestions based on search term and field
useEffect(() => {
  if (searchTerm.length > 0 && projects) {
    const filtered = projects.filter(project => {
      let fieldValue = '';
      if (searchField === 'name') {
        fieldValue = project.name.toLowerCase();
      } else if (searchField === 'job_no') {
        fieldValue = project.job_no ? project.job_no.toLowerCase() : '';
      }
      return fieldValue.includes(searchTerm.toLowerCase());
    });

    const uniqueSuggestions = [...new Set(
      filtered.map(project => {
        if (searchField === 'name') return project.name;
        else if (searchField === 'job_no') return project.job_no;
        return '';
      })
    )].filter(Boolean);

    setSuggestions(uniqueSuggestions.slice(0, 5));
  } else {
    setSuggestions([]);
  }
}, [searchTerm, searchField, projects]);

// Filter projects based on search criteria
const filteredProjects = projects ? projects.filter(project => {
  if (!searchTerm) return true;
  let fieldValue = '';
  if (searchField === 'name') {
    fieldValue = project.name.toLowerCase();
  } else if (searchField === 'job_no') {
    fieldValue = project.job_no ? project.job_no.toLowerCase() : '';
  }
  return fieldValue.includes(searchTerm.toLowerCase());
}) : [];
```
</details>

## Role-Based Access Control

<details>
<summary>Admin-Only Operations</summary>

```javascript
const role = Cookies.get('roleCof');
const isAdmin = role === "Admin Ops";

// Admin-only edit button
<button
  onClick={() => isAdmin && navigate('/project-edit', { state: { project } })}
  disabled={!isAdmin}
  className={`w-full md:w-auto flex items-center justify-center gap-1 sm:gap-2 
    px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 rounded-lg shadow 
    active:scale-[0.98] transition-all duration-150 text-xs sm:text-sm md:text-base
    ${isAdmin
      ? "bg-[#EA7125] hover:bg-[#D96520] text-white hover:shadow-md"
      : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
  title={isAdmin ? "Edit Project" : "Only admins can edit projects"}
>
  <FaEdit className="text-xs sm:text-sm md:text-base" />
  <span>Edit Project</span>
</button>
```
</details>

## Data Normalization Utilities

<details>
<summary>Data Formatting Functions</summary>

```javascript
// Normalize URLs from string to array
const normalizeUrls = (urls) => {
  if (!urls) return [];
  if (Array.isArray(urls)) return urls;
  if (typeof urls === 'string') {
    return urls.split(',').map(url => url.trim()).filter(url => url);
  }
  return [];
};

// Normalize milestones from string to array
const normalizeMilestones = (milestones) => {
  if (!milestones) return [];
  if (Array.isArray(milestones)) return milestones;
  if (typeof milestones === 'string') {
    return milestones.split(',').map(milestone => milestone.trim()).filter(milestone => milestone);
  }
  return [];
};

// Date formatting utilities
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const formatDateForBackend = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
};
```
</details>

## Project Filtering Selector

<details>
<summary>Redux Selector for Print Projects</summary>

```javascript
// Selector to filter only print projects
export const selectPrintProjects = createSelector(
  [selectAllProjects],
  (projects) => projects.filter(project => project.isPrintProject === 1)
);
```
</details>

## Data Flow Summary

1. **Authentication**: Tokens are retrieved from encrypted cookies
2. **Authorization**: Role-based checks determine edit/delete permissions
3. **Data Fetching**: Projects are loaded via Redux async thunks
4. **Search/Filter**: Real-time filtering with autocomplete suggestions
5. **CRUD Operations**: Create, read, update, delete with immediate UI updates
6. **Milestone Management**: AI-generated suggestions and visual tracking
7. **Team Management**: Assignment and display of team members
8. **Image Management**: Upload, preview, and management of project images
9. **Error Handling**: Comprehensive error handling and unauthorized response management

## Security Features

- Encrypted token storage and retrieval
- Automatic logout on unauthorized responses
- Role-based access control for sensitive operations
- Input validation and sanitization
- Secure API communication with proper headers
- Protected routes and components based on user roles

---

## Assignment Management

This document outlines the data flow and component architecture for the assignment management feature of this application.

Assignment Data Flow
The application uses a centralized data flow model powered by Redux for managing assignment data. This ensures a single source of truth and predictable state management across all components.

Data Flow Diagram
Here is a diagram illustrating how assignment data flows through the application.

graph TD
    subgraph "User Interaction"
        A[CreateTask Component] --> B{Redux Action: createAssignment};
        C[Task Component] --> D{Redux Action: deleteAssignment};
        E[ViewEditTaskPopup Component] --> F{Redux Action: updateAssignment};
        G[Assignment Component] --> H{Redux Action: fetchAssignments};
    end

    subgraph "Redux State Management"
        B --> I[assignment.js Redux Slice];
        D --> I;
        F --> I;
        H --> I;
        I -- Updates --> J[Redux Store];
    end

    subgraph "Component Display"
        J -- Provides State --> K[Assignment Component];
        K -- Passes Props --> L[Task Component];
        K -- Passes Props --> M[Calendar Component];
        K -- Passes Props --> N[PendingAssignments Component];
        K -- Passes Props --> O[ViewTaskByStatus Component];
        L -- Passes Props --> E;
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#f9f,stroke:#333,stroke-width:2px

    style B fill:#ccf,stroke:#333,stroke-width:2px
    style D fill:#ccf,stroke:#333,stroke-width:2px
    style F fill:#ccf,stroke:#333,stroke-width:2px
    style H fill:#ccf,stroke:#333,stroke-width:2px

    style I fill:#fca,stroke:#333,stroke-width:2px
    style J fill:#fca,stroke:#333,stroke-width:2px

    style K fill:#cfc,stroke:#333,stroke-width:2px
    style L fill:#cfc,stroke:#333,stroke-width:2px
    style M fill:#cfc,stroke:#333,stroke-width:2px
    style N fill:#cfc,stroke:#333,stroke-width:2px
    style O fill:#cfc,stroke:#333,stroke-width:2px

Explanation of the Flow:
User Interaction & Action Dispatching:

When a user creates a new task in the CreateTask component, it dispatches the createAssignment action.

Deleting a task from the Task component dispatches the deleteAssignment action.

Editing a task in the ViewEditTaskPopup dispatches the updateAssignment action.

The main Assignment component dispatches fetchAssignments to retrieve all assignment data.

Redux State Management:

All these actions are handled by the assignment.js Redux slice.

The slice contains reducers that process these actions and update the central Redux store.

The store holds the global state for all assignments.

Component Display & Data Subscriptions:

The Assignment component subscribes to the Redux store.

When the store is updated, the Assignment component re-renders with the new data.

It then passes the relevant assignment data as props to its child components (Task, Calendar, PendingAssignments, ViewTaskByStatus), ensuring the entire UI is synchronized with the application's state.

Component Breakdown
Below are expandable tables detailing the purpose, props, state, and a code snippet for each key component involved in the assignment data flow.

<details>
<summary><strong>assignment.js (Redux Slice)</strong></summary>

Property

Type

Description

Purpose

Redux Slice

Manages the central state for all assignment-related data. Handles API calls for fetching, creating, updating, and deleting assignments.

State

Object

assignments: An array of all assignment objects. <br> loading: A boolean indicating if an API call is in progress. <br> error: Stores any error messages from API calls.

Actions

Async Thunks

fetchAssignments: Fetches all assignments from the server. <br> createAssignment: Creates a new assignment. <br> updateAssignment: Updates an existing assignment. <br> deleteAssignment: Deletes an assignment.

// /redux/assignment.js

// ... (imports and helper functions)

export const createAssignment = createAsyncThunk(
  'assignments/create',
  async (assignmentData, { rejectWithValue }) => {
    // ... (logic to get auth token)
    try {
      const response = await axiosInstance.post('/', assignmentData);
      return response.data;
    } catch (error) {
      // ... (error handling)
      return rejectWithValue(/*...*/);
    }
  }
);

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: {
    assignments: [],
    currentAssignment: null,
    loading: false,
    error: null,
    // ... other state properties
  },
  reducers: {
    // ... reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        // ...
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.assignments.unshift(action.payload);
        }
        // ...
      })
      // ... other cases
  }
});

export default assignmentSlice.reducer;

</details>

<details>
<summary><strong>Assignment.js</strong></summary>

Property

Type

Description

Purpose

Main Component

The primary container for the assignment management page. It fetches and displays all assignment-related data and components.

Props

-

None

State

selectedDate

The currently selected date on the calendar.



selectedProjectId

The ID of the currently selected project.



isCreateTaskOpen

A boolean to control the visibility of the CreateTask modal.



isPendingTasksOpen

A boolean to control the visibility of the PendingAssignments modal.



isViewTasksOpen

A boolean to control the visibility of the ViewTaskByStatus modal.



selectedStatus

The status type selected for viewing tasks.

// Assignment.js

const Assignment = () => {
  const dispatch = useDispatch();
  const { assignments, loading, error } = useSelector(state => state.assignments);
  // ... (state management)

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  const tasks = useMemo(() => {
    // ... (filtering logic based on selectedProjectId)
  }, [assignments, selectedProjectId]);

  // ... (event handlers)

  return (
    <div className="min-h-screen py-4 bg-gray-50">
      <CreateTask isOpen={isCreateTaskOpen} /* ... */ />
      <PendingAssignments isOpen={isPendingTasksOpen} /* ... */ />
      <ViewTaskByStatus isOpen={isViewTasksOpen} /* ... */ />
      
      {/* ... (Header and Stats Cards) */}

      <div className="flex gap-6 h-[calc(100vh-400px)]">
        <div className="flex-shrink-0">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            tasks={tasks}
          />
        </div>
        <div className="flex-1 min-w-0">
          <Task
            tasks={tasks}
            selectedDate={selectedDate}
            /* ... */
          />
        </div>
      </div>
    </div>
  );
};

</details>

<details>
<summary><strong>CreateTask.js</strong></summary>

Property

Type

Description

Purpose

Modal Component

A form for creating a new task. It dispatches the createAssignment action upon submission.

Props

isOpen (boolean)

Controls the visibility of the modal.



onClose (function)

A callback function to close the modal.



selectedProjectId (string)

The ID of the project the new task will be associated with.

State

formData

An object containing the data for the new task (e.g., title, assignee, due date).

// CreateTask.js

const CreateTask = ({ isOpen, onClose, selectedProjectId }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ /* ... initial state */ });
  // ... (other state and refs)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = {
      ...formData,
      task: taskContent, // from rich text editor
      urls: uploadedFiles.join(','),
      projectId: selectedProjectId
    };

    try {
      // Fire and forget approach
      dispatch(createAssignment(submissionData));

      resetForm();
      onClose();

      // Refresh data after a short delay
      setTimeout(() => {
        dispatch(fetchAssignments());
      }, 1000);

    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (JSX for the form)
};

</details>

<details>
<summary><strong>Task.js</strong></summary>

Property

Type

Description

Purpose

Display Component

Displays a list of tasks for the selected date. Allows for viewing task details and deleting tasks.

Props

tasks (array)

An array of task objects to display.



selectedDate (Date)

The date for which to display tasks.



onTaskDeleted (function)

A callback function triggered when a task is deleted.



onTaskUpdated (function)

A callback function triggered when a task is updated.

State

selectedTask

The task object currently being viewed in the ViewEditTaskPopup.

// Task.js

const Task = ({ tasks, selectedDate, onTaskDeleted, onTaskUpdated }) => {
  const dispatch = useDispatch();
  // ... (state and helper functions)

  const tasksForSelectedDate = getTasksForDate(selectedDate, tasks);

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(taskId);
      try {
        await dispatch(deleteAssignment(taskId)).unwrap();
        if (onTaskDeleted) onTaskDeleted();
      } catch (error) {
        // ... (error handling)
      }
    }
  };

  return (
    <div className="bg-white ...">
      {/* ... (Header) */}
      {tasksForSelectedDate.length === 0 ? (
        // ... (No tasks message)
      ) : (
        <div className="grid ...">
          {tasksForSelectedDate.map(task => (
            <div key={task.id} className="border ...">
              {/* ... (Task details) */}
              <button onClick={() => handleDeleteTask(task.id)}>
                <Trash2 size={14} />
              </button>
              <button onClick={() => setSelectedTask(task)}>
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
      {selectedTask && <ViewEditTaskPopup task={selectedTask} /* ... */ />}
    </div>
  );
};

</details>

<details>
<summary><strong>ViewEditTaskPopup.js</strong></summary>

Property

Type

Description

Purpose

Modal Component

Displays the details of a selected task and allows for editing. Dispatches the updateAssignment action upon saving changes.

Props

task (object)

The task object to display and edit.



onClose (function)

A callback function to close the modal.



onTaskUpdated (function)

A callback function triggered when the task is successfully updated.

State

isEditing

A boolean to toggle between view and edit modes.



editedTask

An object containing the edited task data before saving.

// ViewEditTaskPopup.js

const ViewEditTaskPopup = ({ task, onClose, onTaskUpdated }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  // ... (other state)

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const updateData = { /* ... format data for backend */ };

      await dispatch(updateAssignment({
        id: task.id,
        assignmentData: updateData
      })).unwrap();

      if (onTaskUpdated) onTaskUpdated(true);
      onClose();

    } catch (error) {
      // ... (error handling)
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 ...">
      {/* ... (Modal JSX) */}
      {isEditing ? (
        <button onClick={handleSave}>Save Changes</button>
      ) : (
        canEdit && <button onClick={() => setIsEditing(true)}>Edit Task</button>
      )}
    </div>
  );
};

</details>

<details>
<summary><strong>Calendar.js</strong></summary>

Property

Type

Description

Purpose

UI Component

A calendar view that displays which dates have tasks and allows the user to select a date.

Props

selectedDate (Date)

The currently selected date.



onDateSelect (function)

A callback function triggered when a date is selected.



tasks (array)

An array of all task objects to determine which dates have tasks.

State

currentMonth

The month currently being displayed in the calendar.

// Calendar.js

const Calendar = ({ selectedDate, onDateSelect, tasks }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // ... (state and helper functions)

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-white ...">
      {/* ... (Calendar header with navigation) */}
      <div className="grid grid-cols-7 ...">
        {['Su', 'Mo', 'Tu', /*...*/ 'Sa'].map(day => (
          <div key={day}>{day}</div>
        ))}
        {days.map((day, index) => {
          const count = taskCountOnDate(day.fullDate);
          return (
            <button
              key={index}
              onClick={() => onDateSelect(day.fullDate)}
              className={`... ${getTaskDayClass(count)}`}
            >
              {day.date}
            </button>
          );
        })}
      </div>
    </div>
  );
};

</details>

<details>
<summary><strong>PendingAssignments.js</strong></summary>

Property

Type

Description

Purpose

Modal Component

Displays a list of all pending assignments and allows users to mark them as complete.

Props

isOpen (boolean)

Controls the visibility of the modal.



onClose (function)

A callback function to close the modal.



pendingTasks (array)

An array of task objects with a "pending" status.



onTaskCompleted (function)

A callback function triggered when a task is marked as complete.

State

-

None

// PendingAssignments.js

const PendingAssignments = ({ isOpen, onClose, pendingTasks, onTaskCompleted }) => {
  // ... (state and helper functions)

  const handleMarkAsCompleted = async (taskId) => {
    // ... (confirmation logic)
    try {
      // ... (API call to update task status to 'completed')
      if (onTaskCompleted) {
        onTaskCompleted();
      }
    } catch (error) {
      // ... (error handling)
    }
  };

  return (
    <div className="fixed inset-0 ...">
      {/* ... (Modal JSX) */}
      {pendingTasks.map(task => (
        <div key={task.id} className="border ...">
          {/* ... (Task details) */}
          <button onClick={() => handleStartCompletion(task.id)}>
            Mark as Completed
          </button>
        </div>
      ))}
    </div>
  );
};

</details>

<details>
<summary><strong>ViewTaskByStatus.js</strong></summary>

Property

Type

Description

Purpose

Modal Component

Displays a filtered list of tasks based on their status (e.g., "Completed", "In Progress").

Props

isOpen (boolean)

Controls the visibility of the modal.



onClose (function)

A callback function to close the modal.



tasks (array)

The array of tasks to be filtered and displayed.



statusType (string)

The status to filter the tasks by.



statusLabel (string)

The display label for the selected status.

State

searchTerm

The current value of the search input for filtering tasks.



dueDateFilter

The date selected for filtering tasks.



assigneeFilter

The assignee selected for filtering tasks.

// ViewTaskByStatus.js

const ViewTaskByStatus = ({ isOpen, onClose, tasks, statusType, statusLabel }) => {
  // ... (state for filters)

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // ... (logic to filter by searchTerm, dueDateFilter, assigneeFilter)
      return matchesSearch && matchesDueDate && matchesAssignee;
    });
  }, [tasks, searchTerm, dueDateFilter, assigneeFilter, assigneeProfiles]);

  return (
    <div className="fixed inset-0 ...">
      {/* ... (Modal JSX with filter inputs) */}
      <div className="overflow-y-auto ...">
        {filteredTasks.length === 0 ? (
          // ... (No results message)
        ) : (
          <div className="grid ...">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-gray-50 ...">
                {/* ... (Task details) */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

</details>

# React App Routing and Component Structure

## Project Structure Overview

```
src/
├── component/
│   ├── Assignment/
│   ├── Global/
│   │   ├── ProtectedRoute.js
│   │   └── AdminProtectedRoute.js
│   ├── HrHub/
│   ├── Insights/
│   ├── Manage/
│   ├── News/
│   ├── Profile/
│   └── Projects/
├── pages/
│   ├── Assignment/
│   │   └── Assignment.js
│   ├── client/
│   │   └── client.js
│   ├── Home/
│   │   └── Home.js
│   ├── HrHub/
│   │   └── HrHub.js
│   ├── Insights/
│   │   └── Insights.js
│   ├── Login/
│   │   └── Login.js
│   ├── Manage/
│   │   └── Manage.js
│   ├── News/
│   │   └── News.js
│   ├── Profile/
│   │   ├── Profile.js
│   │   └── EditProfile.js
│   ├── Projects/
│   │   └── Projects.js
│   └── Resources/
│       └── Resources.js
├── redux/
│   ├── auth/
│   │   └── auth.js
│   └── profile/
│       └── profile.js
└── App.js
```

## Routing Table

| Route Path | Component | Authentication Required | Admin Required |
|------------|-----------|-------------------------|----------------|
| `/login` | `Login` | No | No |
| `/` | `Home` | Yes | No |
| `/profile` | `Profile` | Yes | No |
| `/profile/edit` | `EditProfile` | Yes | No |
| `/news` | `News` | Yes | No |
| `/insights` | `Insights` | Yes | No |
| `/hr` | `HrHub` | Yes | No |
| `/resources` | `Resources` | Yes | No |
| `/clients` | `ClientPage` | Yes | No |
| `/projects` | `ProjectsPage` | Yes | No |
| `/assignment` | `Assignment` | Yes | No |
| `/manage` | `ManagePage` | Yes | Yes |

## Component Hierarchy Tree

```
App
├── Router (React Router)
│   ├── Routes
│   │   ├── Route (/login) -> Login (Public)
│   │   └── ProtectedRoute (Wrapper)
│   │       ├── Route (/) -> Home
│   │       ├── Route (/profile) -> Profile
│   │       ├── Route (/profile/edit) -> EditProfile
│   │       ├── Route (/news) -> News
│   │       ├── Route (/insights) -> Insights
│   │       ├── Route (/hr) -> HrHub
│   │       ├── Route (/resources) -> Resources
│   │       ├── Route (/clients) -> ClientPage
│   │       ├── Route (/projects) -> ProjectsPage
│   │       ├── Route (/assignment) -> Assignment
│   │       └── AdminProtectedRoute (Wrapper)
│   │           └── Route (/manage) -> ManagePage
│   └── Navigation (if present)
├── Redux Store
│   ├── Auth State
│   └── Profile State
└── Authentication System
    └── Cookies (js-cookie)
```

## Key Features

1. **Authentication Flow**:
   - App initializes auth state on mount
   - Then initializes profile from storage
   - Uses protected routes for authenticated content
   - Has special admin-only routes

2. **State Management**:
   - Uses Redux for global state
   - Auth and profile states are managed separately
   - Persistent storage integration

3. **Route Protection**:
   - `ProtectedRoute` guards authenticated routes
   - `AdminProtectedRoute` adds admin authorization check

## Setup Instructions

1. Install dependencies:
```bash
npm install react-router-dom redux react-redux js-cookie
```

2. Ensure Redux store is properly configured

3. The authentication system expects:
   - Auth tokens to be stored in cookies
   - Profile data to be stored in localStorage or similar

## Navigation Flow

```
User visits app
↓
App initializes auth state
↓
If authenticated → Initialize profile → Redirect to home
↓
If not authenticated → Redirect to login
↓
After login → Initialize profile → Redirect to home
```

