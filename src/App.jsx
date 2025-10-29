import React, { useState } from 'react'
import FileUpload from './components/FileUpload'
import AuthModal from './components/AuthModal'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

const AppContent = () => {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  const handleAuthClick = () => {
    setShowAuthModal(true)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="site">
      <div className="beta-banner">🧪 Versión beta en pruebas. Los resultados y tiempos pueden variar.</div>

      <header className="site-header">
        <div className="site-header__left">
          <div className="brand">
            <span className="brand__logo">📊</span>
            <span className="brand__name">Empower <span>Reports</span></span>
          </div>
        </div>
        <nav className="site-nav">
          <a className="nav-link" href="#faqs">FAQs</a>
          <a className="nav-link" href="#about">Quiénes somos</a>
          <a className="nav-link" href="#contact">Contacto</a>
        </nav>
        <div className="site-header__actions">
          <a className="btn btn-secondary" href="#docs">Ver documentación</a>
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-greeting">Hola, {user?.name}</span>
              <button className="btn btn-primary-light" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button className="btn btn-primary-light" onClick={handleAuthClick}>
              → Iniciar sesión
            </button>
          )}
        </div>
      </header>

      <main className="hero">
        <section className="hero__left">
          <h1 className="hero__title">Empower <span>Reports</span></h1>
          <p className="hero__subtitle">Documentá la lógica interna de reportes en Power BI de manera clara y navegable. Empoderá relevamientos, análisis y nuevos desarrollos.</p>

          <ul className="hero__bullets">
            <li className="bullet bad">No más depender del desarrollador original.</li>
            <li className="bullet bad">No más navegar Power Query como una caja negra.</li>
            <li className="bullet bad">No más documentación manual en Excel o Notion.</li>
            <li className="bullet good">Hacer ingeniería inversa es rápido y visual.</li>
            <li className="bullet good">Impulsa nuevos desarrollos con coherencia.</li>
            <li className="bullet good">Promueve la estandarización del DAX y el modelo.</li>
            <li className="bullet good">Mejora el trabajo colaborativo.</li>
          </ul>
        </section>

        <section className="hero__right">
          <div className="card info">
            <h3>Sobre el archivo .pbit</h3>
            <p>El archivo .pbit es la plantilla del reporte, contiene la estructura del modelo pero no los datos. Así, Empower Reports analiza tu lógica sin acceder a información sensible.</p>
          </div>

          <div className="card upload">
            <div className="upload__title">Arrastrá tu archivo .pbit aquí</div>
            <FileUpload compact={true} onAuthRequired={handleAuthClick} />
            <button className="btn btn-secondary full">Ver Documentación</button>
          </div>

          <div className="card help" id="faqs">
            <h3>¿Cómo obtener tu .pbit?</h3>
            <ol>
              <li>Abrí el .pbix en Power BI Desktop.</li>
              <li>Archivo → Exportar → Plantilla de Power BI (.pbit).</li>
              <li>Guardá y arrastrá aquí.</li>
            </ol>
          </div>
        </section>
      </main>

      <section className="about-section">
        <div className="about-container">
          <h2 className="about-title">¿Quiénes somos?</h2>
          <div className="about-content">
            <p>Empower Reports nace de la experiencia directa con los desafíos de mantener y comprender modelos complejos de Power BI.</p>
            <p>Somos un equipo de desarrolladores y analistas que creemos que la documentación debe ser una herramienta de crecimiento, no un obstáculo.</p>
            <p>Creamos esta plataforma para hacer visible la lógica detrás de cada modelo, acelerar la colaboración y facilitar el trabajo técnico de quienes construyen reportes día a día.</p>
          </div>
        </div>
      </section>

      <section className="feedback-section">
        <div className="feedback-container">
          <h2 className="feedback-title">⭐ Queremos escuchar tu experiencia</h2>
          <p className="feedback-description">
            Este proyecto está en fase de pruebas. Contanos qué te pareció, qué podríamos mejorar o cómo debería evolucionar. 
            Cada comentario nos ayuda a construir una herramienta más útil para los usuarios de Power BI.
          </p>
          
          <form className="feedback-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input type="text" id="nombre" name="nombre" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input type="email" id="email" name="email" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="experiencia">Tu experiencia</label>
              <textarea 
                id="experiencia" 
                name="experiencia" 
                rows="4" 
                placeholder="Contanos qué te pareció, sugerencias, ideas...."
              ></textarea>
            </div>
            
            <button type="submit" className="btn btn-feedback">Enviar Feedback</button>
          </form>
          
          <div className="feedback-footer">
            <p>🧡 Gracias por ayudarnos a mejorar 💛</p>
            <p>Empower Reports está en beta: tu aporte tiene un impacto real.</p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer__brand">Empower Reports</div>
        <div className="footer__legal">© 2024 Empower Reports. Todos los derechos reservados.</div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
