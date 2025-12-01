import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type AuthUser = {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    company_id?: string
    role?: 'admin' | 'manager' | 'operator' | 'viewer'
  }
}

interface RuntimeConfig {
  supabaseUrl: string
  supabaseAnonKey: string
}

// Validate that an API key looks like a valid JWT or new Supabase key format
function isValidApiKey(key: string): boolean {
  if (!key || typeof key !== 'string' || key.length < 20) {
    return false
  }

  // New Supabase key format: sb_publishable_... or sb_secret_...
  if (key.startsWith('sb_')) {
    return true
  }

  // Legacy JWT format: must start with 'eyJ' (base64 for '{"')
  // This catches truncated keys that are missing the leading 'e'
  if (!key.startsWith('eyJ')) {
    console.error('[Supabase] Invalid API key format: JWT tokens must start with "eyJ". Your key starts with:', key.substring(0, 10))
    return false
  }

  // Basic JWT structure check: should have 3 parts separated by dots
  const parts = key.split('.')
  if (parts.length !== 3) {
    console.error('[Supabase] Invalid API key format: JWT tokens must have 3 parts separated by dots')
    return false
  }

  return true
}

// Cached config and client
let cachedConfig: RuntimeConfig | null = null
let supabaseClient: SupabaseClient | null = null
let initPromise: Promise<SupabaseClient> | null = null

// Fetch runtime configuration from the backend
async function fetchRuntimeConfig(): Promise<RuntimeConfig> {
  // First try build-time env variables (for local development)
  const buildTimeUrl = import.meta.env.VITE_SUPABASE_URL
  const buildTimeKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  // If valid build-time config exists, use it (with API key format validation)
  if (buildTimeUrl && buildTimeKey && !buildTimeUrl.includes('localhost:54321') && buildTimeKey !== 'placeholder-key') {
    // Validate the API key format before using it
    if (isValidApiKey(buildTimeKey)) {
      console.log('[Supabase] Using build-time configuration')
      return {
        supabaseUrl: buildTimeUrl,
        supabaseAnonKey: buildTimeKey,
      }
    } else {
      console.warn('[Supabase] Build-time API key is invalid, will try runtime configuration')
    }
  }

  // Otherwise, fetch from runtime config endpoint
  try {
    // Use relative URL to work with both dev proxy and production
    const response = await fetch('/api/v1/config')

    if (!response.ok) {
      throw new Error(`Config endpoint returned ${response.status}`)
    }

    const config = await response.json()

    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Invalid config response: missing supabaseUrl or supabaseAnonKey')
    }

    // Validate the API key from runtime config
    if (!isValidApiKey(config.supabaseAnonKey)) {
      throw new Error('Invalid API key format received from server. Please check SUPABASE_ANON_KEY in server environment variables.')
    }

    console.log('[Supabase] Using runtime configuration from server')
    return {
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
    }
  } catch (error) {
    console.error('[Supabase] Failed to fetch runtime config:', error)

    // Last resort: try build-time config even if it looks like placeholder
    if (buildTimeUrl && buildTimeKey && isValidApiKey(buildTimeKey)) {
      console.warn('[Supabase] Falling back to build-time configuration (may be placeholders)')
      return {
        supabaseUrl: buildTimeUrl,
        supabaseAnonKey: buildTimeKey,
      }
    }

    throw new Error(
      'Supabase configuration not available. ' +
      'Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set on the server, ' +
      'or VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set for local development.'
    )
  }
}

// Initialize Supabase client with runtime config
async function initializeSupabase(): Promise<SupabaseClient> {
  if (supabaseClient) {
    return supabaseClient
  }

  cachedConfig = await fetchRuntimeConfig()

  supabaseClient = createClient(cachedConfig.supabaseUrl, cachedConfig.supabaseAnonKey)

  return supabaseClient
}

// Get the Supabase client (must be called after initialization)
export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initSupabase() first or use getSupabaseAsync().')
  }
  return supabaseClient
}

// Get the Supabase client asynchronously (handles initialization)
export async function getSupabaseAsync(): Promise<SupabaseClient> {
  if (supabaseClient) {
    return supabaseClient
  }

  // Ensure we only initialize once
  if (!initPromise) {
    initPromise = initializeSupabase()
  }

  return initPromise
}

// Initialize and return the promise (call this early in app startup)
export function initSupabase(): Promise<SupabaseClient> {
  if (!initPromise) {
    initPromise = initializeSupabase()
  }
  return initPromise
}

// Check if client is initialized
export function isSupabaseInitialized(): boolean {
  return supabaseClient !== null
}

// Legacy export for backward compatibility - starts initialization
// This creates a "lazy" client that will throw if used before init completes
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!supabaseClient) {
      // Auto-start initialization if not started
      if (!initPromise) {
        initPromise = initializeSupabase()
      }

      // For 'auth' property, return a proxy that handles async methods
      if (prop === 'auth') {
        return new Proxy({} as SupabaseClient['auth'], {
          get(_authTarget, authProp) {
            if (!supabaseClient) {
              // Return an async function wrapper for auth methods
              return async (...args: unknown[]) => {
                await initPromise
                if (!supabaseClient) {
                  throw new Error('Supabase initialization failed')
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const authMethod = (supabaseClient.auth as any)[authProp as string]
                if (typeof authMethod === 'function') {
                  return authMethod.apply(supabaseClient.auth, args)
                }
                return authMethod
              }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (supabaseClient.auth as any)[authProp as string]
          }
        })
      }

      throw new Error(`Supabase client not initialized. Attempted to access '${String(prop)}'. Call initSupabase() first.`)
    }
    return supabaseClient[prop as keyof SupabaseClient]
  }
})
