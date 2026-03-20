import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

type Role = 'guest' | 'admin' | 'user' | null;

interface AuthState {
  role: Role;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  firebaseUser: User | null;
  setRole: (role: Role) => void;
  setDisplayName: (name: string) => void;
  setFirebaseUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      displayName: null,
      email: null,
      photoURL: null,
      firebaseUser: null,
      setRole: (role) => set({ role }),
      setDisplayName: (name) => set({ displayName: name }),
      setFirebaseUser: (user) => {
        if (user) {
          set({
            role: 'user',
            firebaseUser: user,
            displayName: user.displayName || 'User',
            email: user.email,
            photoURL: user.photoURL,
          });
        } else {
          set({
            role: null,
            firebaseUser: null,
            displayName: null,
            email: null,
            photoURL: null,
          });
        }
      },
      logout: async () => {
        if (auth?.currentUser) {
          try {
            await signOut(auth);
          } catch (error) {
            console.error('Firebase sign out error', error);
          }
        }
        set({ role: null, displayName: null, email: null, photoURL: null, firebaseUser: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ role: state.role, displayName: state.displayName }), // Only persist these for preview users
    }
  )
);

// Initialize Firebase Auth Listener if running on client
if (typeof window !== 'undefined' && auth) {
  onAuthStateChanged(auth, (user) => {
    // If it's a real Firebase user, update the store.
    // If we're in 'guest' or 'admin' preview mode, we ignore null Firebase users.
    if (user) {
      useAuthStore.getState().setFirebaseUser(user);
    } else {
      const currentRole = useAuthStore.getState().role;
      // Only clear if the user was logged in via Firebase
      if (currentRole === 'user') {
        useAuthStore.getState().setFirebaseUser(null);
      }
    }
  });
}
