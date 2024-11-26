import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/loginPage';
import SettingPage from './pages/settingPage';
import ProfilePage from './pages/profilePage';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/useThemeStore';
import { on } from './../node_modules/socket.io-client/build/esm-debug/on';

const App = () => {
  const { authUser, checkingAuth, isCheckingAuth,onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  console.log(onlineUsers);
  useEffect(() => {
    checkingAuth();
  }, [checkingAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-14 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={authUser ? <SettingPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
