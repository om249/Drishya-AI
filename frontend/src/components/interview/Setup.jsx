import { useState } from 'react'
import { ArrowRight, BrainCircuit, Play, Sparkles } from 'lucide-react'

import { api } from '../../services/api'
import { Field } from '../common/FormFields'
import { ErrorMessage } from '../common/Feedback'

export default function Setup({ onStarted }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const form = new FormData(e.currentTarget)

    try {
      const interview = await api('/interviews', {
        method: 'POST',
        body: JSON.stringify({
          type: form.get('type'),
          role: form.get('role'),
          subject: form.get('subject'),
          difficulty: form.get('difficulty'),
        }),
      })

      const question = await api(`/interviews/${interview.id}/start`, {
        method: 'POST',
      })

      onStarted({
        interview,
        question,
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-content">
      <div className="setup-header">
        <button
          type="button"
          className="back-link"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

        <div className="hero-badge">
          <Sparkles size={15} />
          Nova Interview
        </div>

        <h1>
          Design your
          <br />
          <span>perfect practice round.</span>
        </h1>

        <p>
          Choose your interview settings and Nova will build a
          personalized session around them.
        </p>
      </div>

      <form onSubmit={submit} className="setup-card">
        <div className="setup-grid">
          <div>
            <label className="field-label">
              Interview type
              <select name="type" className="field-input">
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="aptitude">Aptitude</option>
                <option value="coding">Coding</option>
              </select>
            </label>
          </div>

          <Field
            label="Target role"
            name="role"
            defaultValue="Software Developer"
            required
          />

          <Field
            label="Subject"
            name="subject"
            defaultValue="Python"
            required
          />

          <label className="field-label">
            Difficulty
            <select name="difficulty" className="field-input">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>

        <div className="interview-preview">
          <div className="preview-icon">
            <BrainCircuit size={26} />
          </div>

          <div>
            <strong>Nova will evaluate your answers</strong>
            <p>
              Every response is analyzed for accuracy, relevance,
              completeness, clarity, and improvement areas.
            </p>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <button disabled={busy} className="primary-btn full-btn">
          {busy ? (
            <>
              <span className="spinner" />
              Nova is preparing…
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" />
              Begin with Nova
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  )
}