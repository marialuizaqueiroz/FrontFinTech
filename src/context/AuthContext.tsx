import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

export type UserRole = 'admin' | 'client'
type User = { id: string; name: string; role: UserRole }

type AuthContextType = {
  token: string | null
  user: User | null
  login: (username:string, password:string)=>Promise<void>
  logout: ()=>void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{children:React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem('user')
    return s ? JSON.parse(s) : null
  })
  const navigate = useNavigate()

  const goToDefaultArea = (role: UserRole) => {
    navigate(role === 'admin' ? '/dashboard' : '/acesso-negado', { replace: true })
  }

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [token])

  useEffect(() => {
    const syncProfile = async () => {
      if (!token || user) return
      try {
        const me = await authAPI.me()
        setUser(me)
        localStorage.setItem('user', JSON.stringify(me))
        goToDefaultArea(me.role)
      } catch (error: any) {
        if (error?.response?.status === 401) {
          logout()
          return
        }
        console.warn('Não foi possível sincronizar o perfil. Mantendo dados do cache.', error)
      }
    }
    syncProfile()
  }, [token, user])

  const login = async (username:string, password:string) => {
    try {
      // Tenta autenticar com o backend
      const data = await authAPI.login(username, password)
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      goToDefaultArea(data.user.role)
    } catch (error) {
      console.error('Login error:', error)
      // Fallback mockado para desenvolvimento local
      if (username === 'admin' && password === 'admin123') {
        const mockToken = 'mock-admin-token'
        const mockUser: User = { id: '1', name: 'Admin', role: 'admin' }
        setToken(mockToken)
        setUser(mockUser)
        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify(mockUser))
        goToDefaultArea(mockUser.role)
        return
      }

      if (username === 'client' && password === 'client123') {
        const mockToken = 'mock-client-token'
        const mockUser: User = { id: '2', name: 'Cliente', role: 'client' }
        setToken(mockToken)
        setUser(mockUser)
        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify(mockUser))
        goToDefaultArea(mockUser.role)
        return
      }

      throw new Error('Credenciais inválidas. Use admin/admin123')
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
