import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './AuthModal.css'

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { login, register, loading } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar errores al escribir
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      let result
      if (isLogin) {
        result = await login(formData.email, formData.password)
      } else {
        result = await register(formData.email, formData.password, formData.confirmPassword)
      }

      if (result.success) {
        setSuccess(isLogin ? '¡Inicio de sesión exitoso!' : '¡Cuenta creada exitosamente!')
        setTimeout(() => {
          onClose()
          setFormData({ email: '', password: '', confirmPassword: '' })
          setSuccess('')
        }, 1500)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Error inesperado. Intenta nuevamente.')
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
    setFormData({ email: '', password: '', confirmPassword: '' })
  }

  if (!isOpen) return null

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="auth-modal-header">
          <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
          <p className="auth-modal-subtitle">
            {isLogin 
              ? 'Ingresa tus credenciales para acceder' 
              : 'Crea una cuenta para comenzar a usar Empower Reports'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Mínimo 6 caracteres"
              minLength="6"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Repite tu contraseña"
                minLength="6"
              />
            </div>
          )}

          {error && (
            <div className="auth-error">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              ✅ {success}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </button>
        </form>

        <div className="auth-modal-footer">
          <p>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button 
              type="button" 
              className="auth-toggle-btn"
              onClick={toggleMode}
            >
              {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
