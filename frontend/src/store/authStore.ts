import { create } from 'zustand'
import { initSupabase, getSupabaseAsync, type AuthUser } from '@/lib/supabase'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,

  initialize: async () => {
    if (get().isInitialized) {
      return
    }

    set({ isLoading: true, error: null })

    try {
      // Initialize Supabase client with runtime config
      const supabase = await initSupabase()

      // Set up auth state change listener
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          set({
            user: session.user as AuthUser,
            isAuthenticated: true,
            isLoading: false,
          })
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      })

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        set({
          user: session.user as AuthUser,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        })
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        })
      }
    } catch (error) {
      console.error('[Auth] Failed to initialize:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize authentication',
        isLoading: false,
        isInitialized: true,
      })
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const supabase = await getSupabaseAsync()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      set({
        user: data.user as AuthUser,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      set({
        error: errorMessage,
        isLoading: false,
      })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      const supabase = await getSupabaseAsync()
      await supabase.auth.signOut()
    } catch (error) {
      console.error('[Auth] Logout error:', error)
    }
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  checkAuth: async () => {
    // If not initialized, initialize first
    if (!get().isInitialized) {
      await get().initialize()
      return
    }

    set({ isLoading: true })
    try {
      const supabase = await getSupabaseAsync()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        set({
          user: session.user as AuthUser,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error('[Auth] Check auth error:', error)
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))

// Auto-initialize on module load
useAuthStore.getState().initialize()
