
import { create } from 'zustand';
import { axiosInstance } from './../lib/axios';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE==="developmet"?'http://localhost:8000':"/";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // Check for user authentication status
  checkingAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ authUser: res.data });
      get().ConnectSocket(); // Connect socket after auth check
    } catch (error) {
      console.error('Error checking auth status:', error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Other actions (userSignUp, login, updateProfile, etc.)
  userSignUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', data);
      toast.success('User created successfully');
      set({ authUser: res.data });
      get().ConnectSocket(); // Connect socket after successful sign up
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'An error occurred during signup. Please try again.';
      toast.error(errorMessage);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', data);
      toast.success('User logged in successfully');
      set({ authUser: res.data });
      get().ConnectSocket(); // Connect socket after successful login
    } catch (error) {
      toast.error(error.response.data.msg);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      toast.success('Profile updated successfully');
      set({ authUser: res.data });
    } catch (error) {
      toast.error(error.response.data.msg);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success('User logged out successfully');
      get().disConnectSocket(); // Disconnect socket on logout
    } catch (error) {
      toast.error(error.response.data.msg);
    }
  },

  ConnectSocket: () => {
    const { authUser, socket } = get();
    
    if (!authUser || socket?.connected) return; // If no user or already connected, don't reconnect

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id } // Pass user ID to socket server via query params
    });

    newSocket.on('connect', () => {
      console.log(`Socket connected: ${newSocket.id}`);
      set({ socket: newSocket }); // Store the socket instance in the store
    });

    newSocket.on('getOnlineUsers', (onlineUsers) => {
      set({ onlineUsers });
    });
  },

  disConnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect(); // Disconnect the socket
      console.log('Socket disconnected');
      set({ socket: null }); // Reset the socket instance in the store
    }
  },
}));
