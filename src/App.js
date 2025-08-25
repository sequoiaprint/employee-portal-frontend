import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeAuth } from './redux/auth/auth';
import { initializeProfileFromStorage } from './redux/profile/profile';
import { useDispatch } from 'react-redux';
import ProtectedRoute from './component/Global/ProtectedRoute';
import AdminProtectedRoute from './component/Global/AdminProtectedRoute'; // Add this import
import Cookies from 'js-cookie';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/Profile/EditProfile';
import Login from './pages/Login/Login';
import News from './pages/News/News';
import Insights from './pages/Insights/Insights';
import HrHub from './pages/HrHub/HrHub';
import Resources from './pages/Resources/Resources';
import ManagePage from './pages/Manage/Manage';
import ClientPage from './pages/client/client';
import ProjectsPage from './pages/Projects/Projects';
import Assignment from './pages/Assignment/Assignment';

const App = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    console.log('App: Starting auth initialization...');
    
    // Initialize auth first
    dispatch(initializeAuth())
      .then(() => {
        // Then initialize profile from storage
        dispatch(initializeProfileFromStorage());
      })
      .catch(error => {
        console.log('Auth initialization error:', error);
      });
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path='/news' element={<News/>}/>
          <Route path='/insights' element={<Insights/>}/>
          <Route path='/hr' element={<HrHub/>}/>
          <Route path='/resources' element={<Resources/>}/>
          <Route path='/clients' element={<ClientPage/>}/>
          <Route path='/projects' element={<ProjectsPage/>}/>
          <Route path='/assignment' element={<Assignment/>}/>
          
          {/* Admin only route */}
         
            <Route path='/manage' element={<ManagePage/>}/>
         
        </Route>
      </Routes>
    </Router>
  );
};

export default App;