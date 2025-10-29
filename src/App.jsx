import React from 'react'
import FileUpload from './components/FileUpload'
import './App.css'

function App() {
  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Empower Reports Alpha</h1>
        <p className="subtitle">Sube tu archivo .pbit para procesar</p>
        <FileUpload />
      </div>
    </div>
  )
}

export default App
