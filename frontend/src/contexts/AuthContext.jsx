import { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  userType: null, // 'admin' or 'team'
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        userType: action.payload.userType,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        userType: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        userType: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing token on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const userData = await authService.getCurrentUser()
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userData.user || userData.team,
              token,
              userType: userData.user ? 'admin' : 'team',
            },
          })
        } else {
          dispatch({ type: 'LOGIN_FAILURE' })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('token')
        dispatch({ type: 'LOGIN_FAILURE' })
      }
    }

    initAuth()
  }, [])

  const login = async (credentials, userType) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      const response = await authService.login(credentials, userType)
      
      localStorage.setItem('token', response.token)
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user || response.team,
          token: response.token,
          userType: userType,
        },
      })
      
      toast.success(`Welcome back, ${response.user?.username || response.team?.teamName}!`)
      return response
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' })
      toast.error(error.response?.data?.error || 'Login failed')
      throw error
    }
  }

  const register = async (teamData) => {
    try {
      const response = await authService.register(teamData)
      toast.success('Team registered successfully! Please login.')
      return response
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    }
  }

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
