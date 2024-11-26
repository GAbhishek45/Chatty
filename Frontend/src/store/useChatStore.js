import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

  // Fetch users for chat
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/msg/user');
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages for a specific user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/msg/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Set the selected user for the current chat
  setSelectedUser: (user) => {
    // Unsubscribe from the previous user's messages (if any)
    const { selectedUser } = get();
    if (selectedUser) {
      get().unsubscribeFromMessages();
    }

    // Set the new selected user
    set({ selectedUser: user });

    // Fetch the messages for the newly selected user
    get().getMessages(user._id);

    // Subscribe to the new user's messages
    get().subscribeToMessages();
  },

  // Send a message to the selected user
  sendMessage: async (messageData) => {
    set({ isSendingMessage: true });
    const { selectedUser, messages } = get();

    if (!selectedUser) {
      toast.error("No user selected.");
      set({ isSendingMessage: false });
      return; // Avoid sending message if no user is selected
    }

    try {
      const res = await axiosInstance.post(`/msg/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] }); // Add the new message to the state
      toast.success("Message sent successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      set({ isSendingMessage: false });
    }
  },

  // Subscribe to new incoming messages via socket
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
