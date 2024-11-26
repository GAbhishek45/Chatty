

import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('chat-theme') || 'dark', // Default to 'blue' if no theme is saved in localStorage
  setTheme: (theme) => {
    localStorage.setItem('chat-theme', theme); // Save to localStorage whenever theme is updated
    set({ theme }); // Update Zustand store
  },
}));
