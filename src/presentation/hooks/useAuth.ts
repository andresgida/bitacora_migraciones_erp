import { supabase } from '@/infrastructure/supabase/client'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

export function useAuth() {
  const { user, profile, isLoading, isAdmin, isAuthenticated } = useAuthStore()

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  return {
    user,
    profile,
    isLoading,
    isAdmin: isAdmin(),
    isAuthenticated: isAuthenticated(),
    signIn,
    signOut,
  }
}
