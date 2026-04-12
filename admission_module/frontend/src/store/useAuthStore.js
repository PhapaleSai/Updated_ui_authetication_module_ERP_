import { create } from 'zustand';
import useFormStore from './useFormStore';

// Helper to decode JWT token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const useAuthStore = create(
  (set, get) => ({
    currentUser: null, 
    
    // Check if token exists and load user info
    checkAuth: () => {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = parseJwt(token);
        if (payload) {
          // If token has expired
          if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            set({ currentUser: null });
            return;
          }
          
          // Fetch user info from token
          const user = {
            id: payload.user_id || (Math.abs(payload.sub.charCodeAt(0)) % 1000) + 1, // Fallback if no user_id
            name: payload.username || payload.sub,
            email: payload.sub,
            role: payload.role
          };
          
          set({ currentUser: user });
          
          // Keep form store updated with this userId
          const state = get();
          if (state.currentUser) {
            useFormStore.getState().setGlobalState({ userId: user.id });
          }
          return user;
        }
      }
      set({ currentUser: null });
      return null;
    },
    
    // Login is now handled by redirecting to Auth app
    login: () => {
      window.location.href = 'http://localhost:5173/login';
    },
    
    // Logout clears token and redirects to Auth app
    logout: () => {
      localStorage.removeItem('token');
      useFormStore.getState().clearForm();
      set({ currentUser: null });
      window.location.href = 'http://localhost:5173/login';
    },
  })
);

export default useAuthStore;
