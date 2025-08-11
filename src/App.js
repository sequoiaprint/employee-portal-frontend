import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeAuth } from './redux/auth/auth';
import { initializeProfileFromStorage } from './redux/profile/profile';
import { useDispatch } from 'react-redux';
import ProtectedRoute from './component/Global/ProtectedRoute';
import Routing from './pages/Routing/Routing';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/Profile/EditProfile';
import Login from './pages/Login/Login';
import News from './pages/News/News';
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
          <Route path="/routing" element={<Routing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path='/news' element={<News/>}/>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;