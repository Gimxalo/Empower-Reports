import React, { useState, useCallback } from 'react'
import { BlobServiceClient } from '@azure/storage-blob'
import { useAuth } from '../contexts/AuthContext'
import './FileUpload.css'

const FileUpload = ({ compact = true, onAuthRequired }) => {
  const [files, setFiles] = useState([]) // File[]
  const [uploading, setUploading] = useState(false)
  const [progressByFile, setProgressByFile] = useState({}) // { filename: percent }
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { isAuthenticated, user } = useAuth()

  // Configuración desde variables de entorno
  const accountName = import.meta.env.VITE_AZURE_ACCOUNT_NAME
  const sasToken = import.meta.env.VITE_AZURE_SAS_TOKEN // Debe empezar con "sv="
  const containerName = import.meta.env.VITE_CONTAINER_NAME
  const maxFileSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 31457280 // 30MB por defecto

  // Debug: verificar variables de entorno
  console.log('Account Name:', accountName ? 'Presente' : 'FALTANTE')
  console.log('SAS Token:', sasToken ? 'Presente' : 'FALTANTE')
  console.log('Container Name:', containerName)
  console.log('Max File Size:', maxFileSize)

  const validateFile = (file) => {
    if (!file) {
      setError('Por favor selecciona un archivo')
      return false
    }

    if (!file.name.toLowerCase().endsWith('.pbit')) {
      setError('El archivo debe ser de tipo .pbit')
      return false
    }

    if (file.size > maxFileSize) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${Math.round(maxFileSize / 1024 / 1024)}MB`)
      return false
    }

    return true
  }

  const uploadToAzure = async (file) => {
    try {
      // Validar que tenemos el SAS Token (navegador)
      if (!accountName || !sasToken) {
        throw new Error('Config faltante. Define VITE_AZURE_ACCOUNT_NAME y VITE_AZURE_SAS_TOKEN en .env')
      }

      console.log('Iniciando upload usando SAS Token...')

      // Crear el cliente de blob service usando SAS
      const serviceUrl = `https://${accountName}.blob.core.windows.net?${sasToken}`
      const blobServiceClient = new BlobServiceClient(serviceUrl)
      
      const containerClient = blobServiceClient.getContainerClient(containerName)
      
      // Crear el nombre del blob con timestamp para evitar duplicados
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const blobName = `${timestamp}-${file.name}`
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobName)
      
      // Configurar opciones de upload con callback de progreso
      const uploadOptions = {
        onProgress: (ev) => {
          const progressPercent = Math.round((ev.loadedBytes / file.size) * 100)
          setProgressByFile(prev => ({ ...prev, [file.name]: progressPercent }))
        }
      }

      // Subir el archivo
      await blockBlobClient.upload(file, file.size, uploadOptions)
      
      return { success: true, blobName }
    } catch (err) {
      console.error('Error uploading to Azure:', err)
      throw new Error(`Error al subir el archivo: ${err.message}`)
    }
  }

  const handleFileSelect = useCallback((fileList) => {
    setError('')
    setMessage('')
    setProgressByFile({})

    const selected = Array.from(fileList || [])
    const valid = selected.filter(validateFile)
    setFiles(valid)
  }, [maxFileSize])

  const handleFileChange = (event) => {
    handleFileSelect(event.target.files)
  }

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    handleFileSelect(event.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleUpload = async () => {
    // Verificar autenticación primero
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para subir archivos')
      if (onAuthRequired) {
        onAuthRequired()
      }
      return
    }

    if (!files || files.length === 0) {
      setError('Por favor selecciona uno o más archivos primero')
      return
    }

    setUploading(true)
    setError('')
    setMessage('')
    setProgressByFile({})

    const results = []
    for (const f of files) {
      try {
        const result = await uploadToAzure(f)
        results.push({ file: f.name, success: true, blobName: result.blobName })
      } catch (err) {
        results.push({ file: f.name, success: false, error: err.message })
      }
    }

    const failed = results.filter(r => !r.success)
    if (failed.length === 0) {
      setMessage(`✅ ${results.length} archivo(s) subido(s) exitosamente`)
    } else {
      setError(`Algunos archivos fallaron: ${failed.map(f => f.file).join(', ')}`)
    }

    // Reset selección
    setFiles([])
    const fileInput = document.getElementById('file-input')
    if (fileInput) fileInput.value = ''
    setUploading(false)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`file-upload-container ${compact ? 'compact' : ''}`}>
      <div 
        className={`file-drop-zone ${files.length ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="upload-icon">📁</div>
        <p className="upload-text">
          {!isAuthenticated 
            ? 'Inicia sesión para subir archivos' 
            : files.length 
              ? `${files.length} archivo(s) seleccionado(s)` 
              : 'Arrastra tus archivos .pbit aquí'
          }
        </p>
        <p className="upload-subtext">
          {!isAuthenticated 
            ? 'Necesitas estar loggeado para usar esta función' 
            : files.length 
              ? 'o selecciona más' 
              : 'o haz clic para seleccionar'
          }
        </p>
        <input
          id="file-input"
          type="file"
          accept=".pbit"
          multiple
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      {files.length > 0 && (
        <div className="file-info">
          <p><strong>Archivos seleccionados:</strong></p>
          <ul className="file-list">
            {files.map(f => (
              <li key={f.name} className="file-row">
                <span className="file-name">{f.name}</span>
                <span className="file-size">{formatFileSize(f.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploading && files.length > 0 && (
        <div className="progress-container">
          {files.map(f => {
            const p = progressByFile[f.name] || 0
            return (
              <div key={f.name} className="progress-item">
                <div className="progress-label">{f.name}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p}%` }}></div>
                </div>
                <p className="progress-text">{p}%</p>
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      <button 
        className="upload-button upload-button--primary"
        onClick={handleUpload}
        disabled={!isAuthenticated || files.length === 0 || uploading}
      >
        {!isAuthenticated 
          ? 'Inicia sesión para subir' 
          : uploading 
            ? 'Subiendo...' 
            : 'Cargar Archivo'
        }
      </button>
      {!compact && (
        <div className="help-text">
          <p><strong>¿Cómo obtener tu archivo .pbit?</strong></p>
          <ol>
            <li>Abre el .pbix en Power BI Desktop</li>
            <li>Archivo → Exportar → Plantilla de Power BI (.pbit)</li>
            <li>Guarda y arrastra aquí</li>
          </ol>
        </div>
      )}
    </div>
  )
}

export default FileUpload
