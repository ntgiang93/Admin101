import { JwtHelper } from '@/libs/JwtHelper'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/store/auth-store'
import { useNavivationStore } from '@/store/navigation-store'
import { type ApiResponse, defaultApiResponse } from '@/types/base/ApiResponse'
import {
  defaultUserClaim,
  mapJwtClaimToUserClaim,
} from '@/types/base/UserClaim'
import type { LoginDto, TokenDto } from '@/types/sys/Auth'
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect, useRef,
  useState,
} from 'react'
import { useStore } from 'zustand'
import {
  clearSessionFlag,
  getDeviceId,
  hasActiveSession,
  markSessionActive,
} from './AuthHelper'
import { useRouter } from '@tanstack/react-router'
import { SysModule } from '@/types/constant/SysModule.ts'
import { EPermission } from '@/types/base/Permission.ts'
import { SysRoles } from '@/types/constant/SysRoles.ts'
import type { RolePermissionDto } from '@/types/sys/Role.ts'
interface AuthContextType {
  isAuthenticated: boolean
  isAppLoading: boolean
  login: (body: LoginDto) => Promise<ApiResponse<TokenDto>>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  navigate: (url: string, target?: '_self' | '_blank') => void
  hasPermission: (
    sysModule: string | SysModule,
    required: EPermission,
  ) => boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAppLoading: true,
  login: async () => ({ ...defaultApiResponse }),
  logout: async () => {},
  refreshToken: async () => {},
  navigate: () => {},
  hasPermission: () => false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokenExpireTime, setExpiredAt] = useState<number | undefined>(
    undefined,
  )
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { token, setToken, setUser, user, permissions } = useStore(
    useAuthStore,
    (state) => state,
  )
  const router = useRouter()
  const { setNavigating } = useNavivationStore()

  const resetAuthContext = () => {
    clearSessionFlag()
    setToken(undefined)
    setExpiredAt(undefined)
    setIsAuthenticated(false)
    setUser(defaultUserClaim)
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current)
    }
  }

  const endpoint = 'auth/'

  const login = async (body: LoginDto): Promise<ApiResponse<TokenDto>> => {
    try {
      setIsAppLoading(true)
      const response = await apiService.post<ApiResponse<TokenDto>>(
        endpoint + 'login',
        {
          ...body,
          deviceId: await getDeviceId(),
        },
      )

      if (response.success && response.data) {
        const accessToken = response.data.accessToken
        if (accessToken) {
          router.navigate({ to: '/' })
          const jwtClaim = JwtHelper.decodeToken(accessToken)
          if (jwtClaim) {
            setExpiredAt(jwtClaim?.exp)
            setToken(accessToken)
            setUser(mapJwtClaimToUserClaim(jwtClaim))
            setIsAuthenticated(true)
            markSessionActive(jwtClaim)
          }
          setIsAppLoading(false)
          return response
        }
      }
      setIsAppLoading(false)
      return response
    } catch (error: any) {}
    setIsAppLoading(false)
    return { ...defaultApiResponse }
  }

  // Logout function
  const logout = async () => {
    try {
      apiService.post<ApiResponse<TokenDto>>(
        endpoint + 'logout',
        undefined,
        undefined,
        true,
      )
    } catch (error: any) {}
    resetAuthContext()
    router.navigate({ to: '/login' })
  }

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await apiService.post<ApiResponse<TokenDto>>(
        endpoint + 'refresh',
        undefined,
        undefined,
        true,
      )

      if (response.success && response.data) {
        const accessToken = response.data.accessToken
        if (accessToken) {
          const jwtClaim = JwtHelper.decodeToken(accessToken)
          if (jwtClaim) {
            setToken(accessToken)
            setExpiredAt(jwtClaim?.exp)
            setUser(mapJwtClaimToUserClaim(jwtClaim))
            setIsAuthenticated(true)
            markSessionActive(jwtClaim)
            return
          }
        }
      } else {
        router.navigate({ to: '/login' })
      }
    } catch (error: any) {
      router.navigate({ to: '/login' })
    }
    resetAuthContext()
  }

  const hasPermission = (
    sysModule: string | SysModule,
    required: EPermission,
  ): boolean => {
    if (user) {
      const userRoleCodes = user.roleCode.split(';')
      return userRoleCodes.includes(SysRoles.SuperAdmin) // SuperAdmin has all permissions
    } else
      // Check if user has the required permission for the specific module
      return (
        permissions?.some(
          (permission: RolePermissionDto) =>
            permission.sysModule === sysModule.toString() &&
            (permission.permission && required) === required,
        ) || false
      )
  }

  const navigate = (url: string, target: '_self' | '_blank' = '_self') => {
    if (target === '_blank') {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }
    setNavigating(true)
    router.navigate({ to: url })
  }

  // Kiểm tra session khi component mount
  useLayoutEffect(() => {
    const checkSession = async () => {
      if (hasActiveSession()) {
        setIsAppLoading(true)
        await refreshToken()
      } else {
        console.log('miss jti')
        await router.navigate({ to: '/login' })
      }
      setIsAppLoading(false)
    }

    checkSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useEffect handle refresh token
  useEffect(() => {
    // Check if token and tokenExpireTime are available
    if (token && tokenExpireTime) {
      // computes expireTime in millisecond
      const expireTime = tokenExpireTime * 1000
      const currentTime = Date.now()

      // compute remaining time (ms)
      const timeRemaining = expireTime - currentTime
      const refreshBuffer = 60 * 1000 // refresh before 1 min

      // computed time until next refresh
      const timeUntilRefresh = Math.max(0, timeRemaining - refreshBuffer)

      // Clear old timer if exist
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current)
      }

      // Create new timer
      refreshTimer.current = setTimeout(async () => {
        // Check if token is still valid before refreshing
        if (token && Date.now() < expireTime) {
          await refreshToken()
        }
      }, timeUntilRefresh)
      // Cleanup function
      return () => {
        if ( refreshTimer.current) clearTimeout( refreshTimer.current)
      }
    } else {
      setIsAuthenticated(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tokenExpireTime])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAppLoading,
        login,
        logout,
        refreshToken,
        navigate,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
