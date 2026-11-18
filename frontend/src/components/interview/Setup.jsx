
import { useState } from 'react'
import {
  ArrowRight,
  BrainCircuit,
  Play,
  Sparkles,
  Building2,
  Target,
  BriefcaseBusiness,
  ListChecks,
} from 'lucide-react'

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
          experience_level: form.get('experience_level'),
          target_company: form.get('target_company'),
          focus_areas: form.get('focus_areas'),
          question_count: Number(form.get('question_count')),
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
          Customize your experience and let Nova create an interview
          around your career goals.
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

          <label className="field-label">
            <span className="setup-field-heading">
              <BriefcaseBusiness size={16} />
              Experience level
            </span>

            <select
              name="experience_level"
              className="field-input"
              defaultValue="fresher"
            >
              <option value="fresher">Fresher / Student</option>
              <option value="0-1 years">0–1 year</option>
              <option value="1-3 years">1–3 years</option>
              <option value="3+ years">3+ years</option>
            </select>
          </label>

          <label className="field-label">
            <span className="setup-field-heading">
              <Building2 size={16} />
              Target company
              <span className="optional-label">Optional</span>
            </span>

            <input
              type="text"
              name="target_company"
              className="field-input"
              placeholder="e.g. Google, TCS, Infosys"
              maxLength={120}
            />
          </label>

          <label className="field-label setup-full-width">
            <span className="setup-field-heading">
              <Target size={16} />
              Focus areas
              <span className="optional-label">Optional</span>
            </span>

            <textarea
              name="focus_areas"
              className="field-input setup-textarea"
              placeholder="e.g. Python OOP, SQL joins, REST APIs, data structures"
              rows={3}
              maxLength={500}
            />

            <span className="field-hint">
              Separate topics with commas. Nova will prioritize these areas.
            </span>
          </label>

          <label className="field-label">
            <span className="setup-field-heading">
              <ListChecks size={16} />
              Number of questions
            </span>

            <select
              name="question_count"
              className="field-input"
              defaultValue="5"
            >
              <option value="3">3 Questions — Quick practice</option>
              <option value="5">5 Questions — Standard</option>
              <option value="7">7 Questions — Detailed</option>
              <option value="10">10 Questions — Extended</option>
              <option value="15">15 Questions — Full practice</option>
            </select>
          </label>
        </div>

        <div className="interview-preview">
          <div className="preview-icon">
            <BrainCircuit size={26} />
          </div>

          <div>
            <strong>Nova will personalize your interview</strong>
            <p>
              Questions adapt to your experience, target role, focus
              areas, and performance. Every answer receives structured
              evaluation and improvement feedback.
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
