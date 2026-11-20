
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
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileSearch,
  Brain,
  GraduationCap,
  BriefcaseBusiness,
  Code2,
  Award,
  Lightbulb,
  Plus,
  Pencil,
  Save,
  Building2,
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

  const [analysis, setAnalysis] = useState(null)
  const [analyzingId, setAnalyzingId] = useState(null)
  const [analysisError, setAnalysisError] = useState('')
  const [analysisResume, setAnalysisResume] = useState(null)

  const [jobDescriptions, setJobDescriptions] = useState([])
  const [jobFormOpen, setJobFormOpen] = useState(false)
  const [editingJobId, setEditingJobId] = useState(null)
  const [savingJob, setSavingJob] = useState(false)

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    description: '',
    resume_id: '',
  })


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


  const handleAnalyze = async (resume, forceRefresh = false) => {
    setAnalyzingId(resume.id)
    setAnalysisError('')
    if (!forceRefresh || analysisResume?.id !== resume.id) {
      setAnalysis(null)
    }
    setAnalysisResume(resume)

    try {
      const result = await api(`/resumes/${resume.id}/analyze`, {
        method: 'POST',
        body: JSON.stringify({
          force_refresh: forceRefresh,
        }),
      })

      setAnalysis(result.analysis)
      setSuccess(
        forceRefresh
          ? 'Resume analysis refreshed successfully.'
          : 'Resume analysis completed successfully.'
      )
    } catch (err) {
      setAnalysisError(
        err.message || 'Could not analyze this resume. Please try again.'
      )
    } finally {
      setAnalyzingId(null)
    }
  }

  const renderAnalysisList = (items, emptyText = 'No information found.') => {
    if (!items?.length) {
      return <p className="analysis-empty-text">{emptyText}</p>
    }

    return (
      <ul className="analysis-list">
        {items.map((item, index) => (
          <li key={`${index}-${typeof item === 'string' ? item : item.name || item.degree || ''}`}>
            {typeof item === 'string' ? item : item.name || item.degree || ''}
          </li>
        ))}
      </ul>
    )
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

  const loadJobDescriptions = useCallback(async () => {
    try {
      const data = await api('/job-descriptions')
      setJobDescriptions(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Could not load job descriptions.')
    }
  }, [])

  useEffect(() => {
    loadJobDescriptions()
  }, [loadJobDescriptions])

  const resetJobForm = () => {
    setJobForm({
      title: '',
      company: '',
      description: '',
      resume_id: '',
    })
    setEditingJobId(null)
    setJobFormOpen(false)
  }

  const saveJobDescription = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (jobForm.description.trim().length < 50) {
      setError('Job description must contain at least 50 characters.')
      return
    }

    setSavingJob(true)

    const payload = {
      title: jobForm.title.trim(),
      company: jobForm.company.trim() || null,
      description: jobForm.description.trim(),
      resume_id: jobForm.resume_id
        ? Number(jobForm.resume_id)
        : null,
    }

    try {
      if (editingJobId) {
        await api(`/job-descriptions/${editingJobId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setSuccess('Job description updated successfully.')
      } else {
        await api('/job-descriptions', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setSuccess('Job description saved successfully.')
      }

      resetJobForm()
      await loadJobDescriptions()
    } catch (err) {
      setError(err.message || 'Could not save job description.')
    } finally {
      setSavingJob(false)
    }
  }

  const editJobDescription = (job) => {
    setJobForm({
      title: job.title,
      company: job.company || '',
      description: job.description,
      resume_id: job.resume_id ? String(job.resume_id) : '',
    })
    setEditingJobId(job.id)
    setJobFormOpen(true)
  }

  const deleteJobDescription = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api(`/job-descriptions/${job.id}`, {
        method: 'DELETE',
      })

      setJobDescriptions((current) =>
        current.filter((item) => item.id !== job.id)
      )

      if (editingJobId === job.id) {
        resetJobForm()
      }

      setSuccess('Job description deleted successfully.')
    } catch (err) {
      setError(err.message || 'Could not delete job description.')
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

      <section className="job-manager">
        <div className="resume-section-heading">
          <div>
            <span className="section-kicker">CAREER TARGETING</span>
            <h2>Job Descriptions</h2>
            <p>Save job requirements and connect them with your resumes.</p>
          </div>

          <button
            className="resume-primary-btn"
            onClick={() => {
              if (jobFormOpen) {
                resetJobForm()
              } else {
                setJobFormOpen(true)
              }
            }}
          >
            {jobFormOpen ? <X size={17} /> : <Plus size={17} />}
            {jobFormOpen ? 'Close Form' : 'Add Job'}
          </button>
        </div>

        {jobFormOpen && (
          <form className="job-form" onSubmit={saveJobDescription}>
            <div className="job-form-heading">
              <Building2 size={21} />
              <h3>{editingJobId ? 'Edit Job Description' : 'Add Job Description'}</h3>
            </div>

            <div className="job-form-grid">
              <label>
                Job Title *
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, title: e.target.value })
                  }
                  placeholder="e.g. Java Developer"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Company Name
                <input
                  type="text"
                  value={jobForm.company}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, company: e.target.value })
                  }
                  placeholder="e.g. Google"
                  maxLength={150}
                />
              </label>
            </div>

            <label>
              Job Description *
              <textarea
                value={jobForm.description}
                onChange={(e) =>
                  setJobForm({ ...jobForm, description: e.target.value })
                }
                placeholder="Paste the complete job description, responsibilities, required skills, qualifications..."
                rows={8}
                maxLength={30000}
                required
              />
              <span className="job-character-count">
                {jobForm.description.length.toLocaleString()} / 30,000 characters
                · Minimum 50
              </span>
            </label>

            <label>
              Associate Resume (Optional)
              <select
                value={jobForm.resume_id}
                onChange={(e) =>
                  setJobForm({ ...jobForm, resume_id: e.target.value })
                }
              >
                <option value="">No resume selected</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.filename}
                  </option>
                ))}
              </select>
            </label>

            <div className="job-form-actions">
              <button
                type="button"
                className="job-secondary-btn"
                onClick={resetJobForm}
                disabled={savingJob}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="resume-primary-btn"
                disabled={savingJob}
              >
                {savingJob ? (
                  <RefreshCw size={17} className="resume-spin" />
                ) : (
                  <Save size={17} />
                )}
                {savingJob ? 'Saving...' : editingJobId ? 'Update Job' : 'Save Job'}
              </button>
            </div>
          </form>
        )}

        <div className="job-description-list">
          {jobDescriptions.length === 0 ? (
            <div className="resume-empty-state">
              <Building2 size={32} />
              <h3>No job descriptions saved</h3>
              <p>Add a job description to prepare for job-specific resume matching.</p>
            </div>
          ) : (
            jobDescriptions.map((job) => (
              <article className="job-description-card" key={job.id}>
                <div className="job-description-icon">
                  <Building2 size={22} />
                </div>

                <div className="job-description-info">
                  <h3>{job.title}</h3>
                  <p>{job.company || 'Company not specified'}</p>

                  <div className="resume-card-meta">
                    <span>
                      {formatDate(job.created_at)}
                    </span>
                    <span>
                      {job.resume_id
                        ? `Resume #${job.resume_id}`
                        : 'No resume associated'}
                    </span>
                    <span>
                      {job.description.length.toLocaleString()} characters
                    </span>
                  </div>
                </div>

                <div className="job-description-actions">
                  <button
                    type="button"
                    onClick={() => editJobDescription(job)}
                    title="Edit job description"
                    aria-label={`Edit ${job.title}`}
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    className="delete"
                    onClick={() => deleteJobDescription(job)}
                    title="Delete job description"
                    aria-label={`Delete ${job.title}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
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
                    className="resume-analyze-btn"
                    onClick={() => handleAnalyze(resume)}
                    disabled={analyzingId === resume.id}
                    title="Analyze resume with AI"
                  >
                    {analyzingId === resume.id ? (
                      <RefreshCw size={17} className="resume-spin" />
                    ) : (
                      <Sparkles size={17} />
                    )}
                    <span>
                      {analyzingId === resume.id ? 'Analyzing...' : 'Analyze'}
                    </span>
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


      {analysisError && (
        <div className="resume-alert error">
          <AlertCircle size={18} />
          <span>{analysisError}</span>
          <button
            onClick={() => setAnalysisError('')}
            aria-label="Dismiss analysis error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {analyzingId !== null && !analysis && (
        <div className="resume-analysis-loading">
          <RefreshCw size={22} className="resume-spin" />
          <span>Nova is analyzing your resume. This may take a moment...</span>
        </div>
      )}

      {analysis && (
        <section className="resume-analysis-section">
          <div className="resume-section-heading">
            <div>
              <span className="section-kicker">NOVA AI INSIGHTS</span>
              <h2>Resume Analysis</h2>
              <p>
                AI-powered insights from {analysisResume?.filename}.
              </p>
            </div>

            <button
              className="resume-refresh-btn"
              onClick={() => handleAnalyze(analysisResume, true)}
              disabled={analyzingId !== null}
              title="Generate a fresh analysis"
            >
              <RotateCw
                size={17}
                className={analyzingId ? 'resume-spin' : ''}
              />
              Re-analyze
            </button>
          </div>

          <div className="analysis-profile-card">
            <div className="analysis-profile-icon">
              <Brain size={25} />
            </div>

            <div>
              <h3>
                {analysis.contact?.name || 'Candidate Profile'}
              </h3>
              <p>{analysis.professional_summary || 'No professional summary found in the resume.'}</p>

              <div className="analysis-contact-details">
                {analysis.contact?.email && (
                  <span>{analysis.contact.email}</span>
                )}
                {analysis.contact?.phone && (
                  <span>{analysis.contact.phone}</span>
                )}
                {analysis.contact?.location && (
                  <span>{analysis.contact.location}</span>
                )}
              </div>
            </div>
          </div>

          <div className="analysis-grid">
            <article className="analysis-card">
              <div className="analysis-card-heading">
                <Code2 size={19} />
                <h3>Technical Skills</h3>
              </div>
              <div className="analysis-tags">
                {analysis.technical_skills?.length ? (
                  analysis.technical_skills.map((skill, index) => (
                    <span key={`${skill}-${index}`}>{skill}</span>
                  ))
                ) : (
                  <p className="analysis-empty-text">No technical skills found.</p>
                )}
              </div>
            </article>

            <article className="analysis-card">
              <div className="analysis-card-heading">
                <Brain size={19} />
                <h3>Soft Skills</h3>
              </div>
              <div className="analysis-tags">
                {analysis.soft_skills?.length ? (
                  analysis.soft_skills.map((skill, index) => (
                    <span key={`${skill}-${index}`}>{skill}</span>
                  ))
                ) : (
                  <p className="analysis-empty-text">No soft skills found.</p>
                )}
              </div>
            </article>

            <article className="analysis-card">
              <div className="analysis-card-heading">
                <GraduationCap size={19} />
                <h3>Education</h3>
              </div>
              {analysis.education?.length ? (
                analysis.education.map((item, index) => (
                  <div className="analysis-entry" key={index}>
                    <h4>{item.degree || 'Degree not specified'}</h4>
                    <p>{item.institution || 'Institution not specified'}</p>
                    {item.graduation_year && <span>{item.graduation_year}</span>}
                    {item.details && <p>{item.details}</p>}
                  </div>
                ))
              ) : (
                <p className="analysis-empty-text">No education details found.</p>
              )}
            </article>

            <article className="analysis-card">
              <div className="analysis-card-heading">
                <BriefcaseBusiness size={19} />
                <h3>Experience</h3>
              </div>
              {analysis.experience?.length ? (
                analysis.experience.map((item, index) => (
                  <div className="analysis-entry" key={index}>
                    <h4>{item.role || 'Role not specified'}</h4>
                    <p>{item.company || 'Company not specified'}</p>
                    {item.duration && <span>{item.duration}</span>}
                    {renderAnalysisList(item.responsibilities)}
                  </div>
                ))
              ) : (
                <p className="analysis-empty-text">No experience details found.</p>
              )}
            </article>

            <article className="analysis-card">
              <div className="analysis-card-heading">
                <Code2 size={19} />
                <h3>Projects</h3>
              </div>
              {analysis.projects?.length ? (
                analysis.projects.map((item, index) => (
                  <div className="analysis-entry" key={index}>
                    <h4>{item.name || 'Project'}</h4>
                    {item.description && <p>{item.description}</p>}
                    <div className="analysis-tags">
                      {item.technologies?.map((tech, techIndex) => (
                        <span key={`${tech}-${techIndex}`}>{tech}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="analysis-empty-text">No projects found.</p>
              )}
            </article>

            <article className="analysis-card">
              <div className="analysis-card-heading">
                <Award size={19} />
                <h3>Certifications</h3>
              </div>
              {analysis.certifications?.length ? (
                analysis.certifications.map((item, index) => (
                  <div className="analysis-entry" key={index}>
                    <h4>{item.name || 'Certification'}</h4>
                    {item.issuer && <p>{item.issuer}</p>}
                    {item.year && <span>{item.year}</span>}
                  </div>
                ))
              ) : (
                <p className="analysis-empty-text">No certifications found.</p>
              )}
            </article>

            <article className="analysis-card">
              <div className="analysis-card-heading">
                <CheckCircle2 size={19} />
                <h3>Strengths</h3>
              </div>
              {renderAnalysisList(analysis.strengths)}
            </article>

            <article className="analysis-card">
              <div className="analysis-card-heading">
                <Lightbulb size={19} />
                <h3>Improvement Suggestions</h3>
              </div>
              {renderAnalysisList(analysis.improvement_suggestions)}
            </article>
          </div>
        </section>
      )}


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
