import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeAuth } from './redux/auth/auth';
import { useDispatch } from 'react-redux';
import ProtectedRoute from './component/Global/ProtectedRoute';
import Routing from './pages/Routing/Routing';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/Profile/EditProfile';
import Login from './pages/Login/Login';
import './utils/authDebug';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('App: Starting auth initialization...');
    dispatch(initializeAuth());
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
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
