import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/domain/entities/Profile'

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  isAdmin: () => boolean
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  isAdmin: () => get().profile?.role === 'admin',
  isAuthenticated: () => !!get().user,
}))
