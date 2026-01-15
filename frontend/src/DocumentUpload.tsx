import { useState } from 'react'
import axios from 'axios'

export function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file')
      return
    }

    setUploading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setMessage(`SUCCESS: ${response.data.message} (${response.data.chunks_created} chunks)`)
      } else {
        setMessage(`WARNING: ${response.data.message}: ${response.data.error}`)
      }
      
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
    } catch (error: any) {
      setMessage(`ERROR: ${error.response?.data?.detail || error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-container">
      <h3>Upload Document</h3>
      
      <input
        id="file-input"
        type="file"
        accept=".txt,.pdf,.docx,.xlsx,.xls"
        onChange={handleFileChange}
        disabled={uploading}
        className="file-input"
      />
      
      {file && <p className="file-name">Selected: {file.name}</p>}
      
      <button 
        onClick={handleUpload} 
        disabled={!file || uploading}
        className="upload-btn"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      
      {message && (
        <p className={`upload-message ${message.startsWith('SUCCESS') ? 'success' : message.startsWith('WARNING') ? 'warning' : 'error'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
