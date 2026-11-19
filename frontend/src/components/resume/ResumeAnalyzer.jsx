
import { useCallback, useEffect, useRef, useState } from 'react'
import { renderAsync } from 'docx-preview'
import { api, API_BASE_URL } from '../../services/api'
import {
  UploadCloud,
  FileText,
  File,
  Trash2,
  Eye,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileSearch,
} from 'lucide-react'

import './ResumeAnalyzer.css'



const MAX_FILE_SIZE = 5 * 1024 * 1024

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function formatDate(value) {
  if (!value) return 'Recently uploaded'

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatSize(characters) {
  return `${Number(characters || 0).toLocaleString()} characters`
}

function ResumeAnalyzer() {
  const fileInputRef = useRef(null)

  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const docxContainerRef = useRef(null)

  const loadResumes = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await api('/resumes')
      setResumes(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Could not load your resumes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadResumes()
  }, [loadResumes])

  const validateFile = (file) => {
    if (!file) return 'Please select a file.'

    const extension = file.name.split('.').pop()?.toLowerCase()

    if (!['pdf', 'docx'].includes(extension)) {
      return 'Only PDF and DOCX files are supported.'
    }

    if (file.type && !ACCEPTED_TYPES.includes(file.type)) {
      return 'The selected file type is not supported.'
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File size must not exceed 5 MB.'
    }

    if (file.size === 0) {
      return 'The selected file is empty.'
    }

    return ''
  }

  const handleUpload = async (file) => {
    setError('')
    setSuccess('')

    const validationError = validateFile(file)

    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await api('/resumes/upload', {
        method: 'POST',
        body: formData,
      })

      setSuccess(
        result?.message || 'Resume uploaded successfully.'
      )

      await loadResumes()

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err.message || 'Resume upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)

    const file = event.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

 const openResume = async (resume) => {
  setError('')
  setSuccess('')
  setPreviewLoading(true)

  try {
    const token = localStorage.getItem('drishya_token')

    const response = await fetch(
      `${API_BASE_URL}/resumes/${resume.id}/file`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Could not load the original resume.')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return url
    })

    setSelectedResume(resume)
  } catch (err) {
    setError(err.message || 'Could not open this resume.')
  } finally {
    setPreviewLoading(false)
  }
}

useEffect(() => {
  if (
    !selectedResume ||
    selectedResume.file_type !== 'docx' ||
    !previewUrl ||
    !docxContainerRef.current
  ) {
    return
  }

  let cancelled = false

  const renderDocument = async () => {
    try {
      const response = await fetch(previewUrl)
      const blob = await response.blob()

      if (!cancelled && docxContainerRef.current) {
        await renderAsync(blob, docxContainerRef.current, null, {
          className: 'docx-preview-document',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
        })
      }
    } catch {
      if (!cancelled) {
        setError('Could not render this Word document.')
      }
    }
  }

  renderDocument()

  return () => {
    cancelled = true
  }
}, [selectedResume, previewUrl])


useEffect(() => {
  return () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }
}, [previewUrl])

  const deleteResume = async (resume) => {
    const confirmed = window.confirm(
      `Delete "${resume.filename}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await api(`/resumes/${resume.id}`, {
        method: 'DELETE',
      })

      setResumes((current) =>
        current.filter((item) => item.id !== resume.id)
      )

      if (selectedResume?.id === resume.id) {
        setSelectedResume(null)
      }

      setSuccess('Resume deleted successfully.')
    } catch (err) {
      setError(err.message || 'Could not delete this resume.')
    }
  }

  return (
    <div className="resume-page page-content">
      <div className="resume-heading">
        <div>
          <span className="section-kicker">
            RESUME INTELLIGENCE
          </span>

          <h1>Resume Analyzer</h1>

          <p>
            Upload your resume, explore its extracted content and
            prepare it for AI-powered career analysis.
          </p>
        </div>

        <div className="resume-heading-icon">
          <Sparkles size={25} />
        </div>
      </div>

      {error && (
        <div className="resume-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="resume-alert success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      <section
        className={`resume-upload-zone ${dragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragging(false)
          }
        }}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          hidden
          disabled={uploading}
        />

        <div className="resume-upload-icon">
          {uploading ? (
            <RefreshCw className="resume-spin" size={30} />
          ) : (
            <UploadCloud size={32} />
          )}
        </div>

        <h2>
          {uploading ? 'Uploading your resume...' : 'Upload your resume'}
        </h2>

        <p>
          Drag and drop your file here, or select it from your device.
        </p>

        <button
          className="resume-primary-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <UploadCloud size={17} />
          {uploading ? 'Please wait...' : 'Choose Resume'}
        </button>

        <span className="resume-upload-hint">
          PDF or DOCX · Maximum file size 5 MB
        </span>
      </section>

      <section className="resume-library">
        <div className="resume-section-heading">
          <div>
            <span className="section-kicker">YOUR DOCUMENTS</span>
            <h2>My Resumes</h2>
            <p>Manage your uploaded resumes.</p>
          </div>

          <button
            className="resume-refresh-btn"
            onClick={loadResumes}
            disabled={loading}
            title="Refresh resumes"
          >
            <RefreshCw
              size={17}
              className={loading ? 'resume-spin' : ''}
            />
          </button>
        </div>

        {loading ? (
          <div className="resume-empty-state">
            <RefreshCw className="resume-spin" size={25} />
            <p>Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="resume-empty-state">
            <FileSearch size={34} />
            <h3>No resumes uploaded yet</h3>
            <p>
              Upload your first resume to get started with Drishya.
            </p>
          </div>
        ) : (
          <div className="resume-list">
            {resumes.map((resume) => (
              <article className="resume-card" key={resume.id}>
                <div className="resume-file-icon">
                  <FileText size={23} />
                </div>

                <div className="resume-card-info">
                  <h3 title={resume.filename}>
                    {resume.filename}
                  </h3>

                  <div className="resume-card-meta">
                    <span>{resume.file_type?.toUpperCase()}</span>
                    <span>{formatSize(resume.character_count)}</span>
                    <span>{formatDate(resume.created_at)}</span>
                  </div>
                </div>

                <div className="resume-card-actions">
                  <button
                    onClick={() => openResume(resume)}
                    title="View extracted text"
                    aria-label={`View ${resume.filename}`}
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    className="delete"
                    onClick={() => deleteResume(resume)}
                    title="Delete resume"
                    aria-label={`Delete ${resume.filename}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedResume && (
  <div
    className="resume-modal-backdrop"
    onClick={() => {
      setSelectedResume(null)
      setPreviewUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return ''
      })
    }}
  >
    <section
      className="resume-modal resume-document-modal"
      role="dialog"
      aria-modal="true"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="resume-modal-header">
        <div>
          <span className="section-kicker">
            RESUME PREVIEW
          </span>
          <h2>{selectedResume.filename}</h2>
        </div>

        <button
          onClick={() => {
            setSelectedResume(null)
            setPreviewUrl((previous) => {
              if (previous) URL.revokeObjectURL(previous)
              return ''
            })
          }}
          aria-label="Close preview"
        >
          <X size={20} />
        </button>
      </div>

      <div className="resume-document-container">
        {previewLoading ? (
          <div className="resume-empty-state">
            <RefreshCw className="resume-spin" size={25} />
            <p>Loading original document...</p>
          </div>
        ) : selectedResume.file_type === 'pdf' ? (
          <iframe
            src={previewUrl}
            title={selectedResume.filename}
            className="resume-pdf-frame"
          />
        ) : (
          <div
            ref={docxContainerRef}
            className="resume-docx-frame"
          />
        )}
      </div>

      <div className="resume-modal-footer">
        <span>
          Original document · {selectedResume.file_type.toUpperCase()}
        </span>

        <button
          className="resume-primary-btn"
          onClick={() => {
            setSelectedResume(null)
            setPreviewUrl((previous) => {
              if (previous) URL.revokeObjectURL(previous)
              return ''
            })
          }}
        >
          Close Preview
        </button>
      </div>
    </section>
  </div>
)}
    </div>
  )
}

export default ResumeAnalyzer
