import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

type User = { id: string; name: string; role: 'admin' | 'client' }

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

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [token])

  const login = async (username:string, password:string) => {
    try {
      const data = await authAPI.login(username, password)
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.user.role === 'admin') navigate('/dashboard')
      else navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Erro no login')
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
