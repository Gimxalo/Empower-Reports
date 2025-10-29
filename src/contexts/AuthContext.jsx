import React, { createContext, useContext, useState, useEffect } from 'react'
import { validateUser, addUser } from '../services/userService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem('empower_reports_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error al cargar usuario desde localStorage:', error)
        localStorage.removeItem('empower_reports_user')
      }
    }
    setLoading(false)
  }, [])

  // Guardar usuario en localStorage cuando cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem('empower_reports_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('empower_reports_user')
    }
  }, [user])

  const login = async (email, password) => {
    setLoading(true)
    try {
      // Validar credenciales contra el CSV
      const result = await validateUser(email, password)
      
      if (result.success) {
        const userData = {
          id: Date.now().toString(),
          email: result.user.email,
          name: result.user.name,
          loginTime: new Date().toISOString()
        }
        setUser(userData)
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: 'Error al iniciar sesión' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, confirmPassword) => {
    setLoading(true)
    try {
      // Validaciones básicas
      if (!email || !password || !confirmPassword) {
        return { success: false, error: 'Todos los campos son obligatorios' }
      }
      
      if (password !== confirmPassword) {
        return { success: false, error: 'Las contraseñas no coinciden' }
      }
      
      if (password.length < 6) {
        return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
      }
      
      if (!email.includes('@')) {
        return { success: false, error: 'Email inválido' }
      }

      // Agregar usuario al CSV
      const result = await addUser(email, password)
      
      if (result.success) {
        const userData = {
          id: Date.now().toString(),
          email: result.user.email,
          name: result.user.name,
          loginTime: new Date().toISOString()
        }
        setUser(userData)
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error en registro:', error)
      return { success: false, error: 'Error al crear cuenta' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
