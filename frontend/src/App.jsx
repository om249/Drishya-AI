import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Zap,
  Moon,
  Sun,
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function api(path, options = {}) {
  const token = localStorage.getItem('drishya_token')

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.detail || 'Request failed')
  }

  return body
}

const Field = ({ label, ...props }) => (
  <label className="field-label">
    {label}
    <input {...props} className="field-input" />
  </label>
)

function PasswordField() {
  const [visible, setVisible] = useState(false)

  return (
    <label className="field-label">
      Password
      <div className="password-wrap">
        <input
          name="password"
          required
          type={visible ? 'text' : 'password'}
          minLength="8"
          className="field-input password-input"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="password-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </label>
  )
}

function Auth({ done }) {
  const [register, setRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const form = new FormData(e.currentTarget)

    try {
      if (register) {
        const value = form.get('email')

        await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: form.get('name'),
            email: value,
            password: form.get('password'),
          }),
        })

        setEmail(value)
        return
      }

      const result = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      })

      localStorage.setItem('drishya_token', result.access_token)
      done()
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function verify(e) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const form = new FormData(e.currentTarget)

    try {
      await api('/auth/verify-registration', {
        method: 'POST',
        body: JSON.stringify({
          email,
          code: form.get('code'),
        }),
      })

      const result = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: form.get('password'),
        }),
      })

      localStorage.setItem('drishya_token', result.access_token)
      done()
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  if (email) {
    return (
      <main className="auth-page">
        <div className="auth-glow auth-glow-one" />
        <div className="auth-glow auth-glow-two" />

        <form onSubmit={verify} className="auth-card">
          <BrandMark />

          <div className="auth-heading">
            <span className="eyebrow">Almost there</span>
            <h1>Verify your email</h1>
            <p>
              Enter the six-digit code sent to{' '}
              <strong>{email}</strong>.
            </p>
          </div>

          <Field
            label="Verification code"
            name="code"
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            placeholder="123456"
          />

          <div className="mt-4">
            <PasswordField />
          </div>

          {error && <ErrorMessage message={error} />}

          <button disabled={busy} className="primary-btn full-btn">
            {busy ? 'Verifying…' : 'Verify account'}
            {!busy && <ArrowRight size={18} />}
          </button>

          <button
            type="button"
            onClick={() =>
              api('/auth/resend-verification', {
                method: 'POST',
                body: JSON.stringify({ email }),
              }).catch((error) => setError(error.message))
            }
            className="text-btn"
          >
            Resend verification code
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="auth-layout">
        <section className="auth-hero">
          <div className="hero-badge">
            <Sparkles size={15} />
            AI-powered placement preparation
          </div>

          <h1>
            Prepare smarter.
            <br />
            <span>Interview better.</span>
          </h1>

          <p>
            Drishya turns every mock interview into a personalized
            learning experience with Nova, your AI placement coach.
          </p>

          <div className="hero-points">
            <div>
              <CheckCircle2 size={18} />
              Personalized interviews
            </div>
            <div>
              <CheckCircle2 size={18} />
              AI-powered feedback
            </div>
            <div>
              <CheckCircle2 size={18} />
              Track your progress
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="auth-card">
          <BrandMark />

          <div className="auth-heading">
            <span className="eyebrow">
              {register ? 'Join Drishya' : 'Welcome back'}
            </span>
            <h1>{register ? 'Create your account' : 'Sign in'}</h1>
            <p>
              {register
                ? 'Start your journey toward interview readiness.'
                : 'Continue your preparation with Nova.'}
            </p>
          </div>

          {register && (
            <div className="mb-4">
              <Field
                label="Full name"
                name="name"
                required
                minLength="2"
                placeholder="Your name"
              />
            </div>
          )}

          <div className="mb-4">
            <Field
              label="Email"
              name="email"
              required
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-4">
            <PasswordField />
          </div>

          {error && <ErrorMessage message={error} />}

          <button disabled={busy} className="primary-btn full-btn">
            {busy
              ? 'Please wait…'
              : register
                ? 'Create account'
                : 'Sign in'}
            {!busy && <ArrowRight size={18} />}
          </button>

          <button
            type="button"
            onClick={() => {
              setRegister(!register)
              setError('')
            }}
            className="text-btn"
          >
            {register
              ? 'Already have an account? Sign in'
              : 'New here? Create an account'}
          </button>
        </form>
      </div>
    </main>
  )
}

function BrandMark() {
  return (
    <div className="brand-mark">
      <BrainCircuit size={24} />
    </div>
  )
}

function ErrorMessage({ message }) {
  return (
    <div className="error-message">
      <CircleHelp size={17} />
      {message}
    </div>
  )
}

function Dashboard({ start }) {
  const [data, setData] = useState()
  const [error, setError] = useState('')

  useEffect(() => {
    api('/dashboard')
      .then(setData)
      .catch((error) => setError(error.message))
  }, [])

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!data) {
    return <LoadingState />
  }

  return (
    <div className="page-content">
      <section className="dashboard-hero">
        <div>
          <div className="hero-badge">
            <Sparkles size={15} />
            Nova is ready
          </div>

          <h1>
            Build confidence.
            <br />
            <span>One interview at a time.</span>
          </h1>

          <p>
            Practice what matters, identify your weak areas, and
            keep improving until you're ready for the real interview.
          </p>

          <button onClick={start} className="primary-btn">
            <Play size={18} fill="currentColor" />
            Start mock interview
          </button>
        </div>

        <div className="nova-orb">
          <div className="nova-orb-inner">
            <BrainCircuit size={58} />
          </div>
          <span>Nova</span>
          <small>AI Placement Coach</small>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard
          icon={<Target />}
          value={`${data.overall_readiness}%`}
          label="Overall readiness"
        />

        <StatCard
          icon={<MessageSquare />}
          value={data.completed_interviews}
          label="Completed interviews"
        />

        <StatCard
          icon={<Trophy />}
          value={data.strengths.length || '—'}
          label="Recorded strengths"
        />

        <StatCard
          icon={<Zap />}
          value={data.topic_performance.length || '—'}
          label="Topics practiced"
        />
      </div>

      <div className="dashboard-grid">
        <section className="content-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Performance</span>
              <h2>Topic performance</h2>
            </div>
            <Target size={20} />
          </div>

          {data.topic_performance.length ? (
            <div className="performance-list">
              {data.topic_performance.map((topic) => (
                <div key={topic.topic} className="performance-row">
                  <div className="performance-label">
                    <span>{topic.topic}</span>
                    <strong>{topic.score}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${topic.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Target />}
              title="No performance data yet"
              text="Complete your first interview and Nova will start tracking your progress."
            />
          )}
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Personalized</span>
              <h2>Nova's focus</h2>
            </div>
            <Sparkles size={20} />
          </div>

          {data.recommendations.length ? (
            <div className="recommendation-list">
              {data.recommendations.map((recommendation) => (
                <div key={recommendation} className="recommendation-item">
                  <div className="recommendation-icon">
                    <ChevronRight size={16} />
                  </div>
                  <span>{recommendation}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles />}
              title="Nova is waiting"
              text="Finish your first interview to receive personalized recommendations."
            />
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function Setup({ onStarted }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const form = new FormData(e.currentTarget)

    try {
      // 1. Create the interview
      const interview = await api('/interviews', {
        method: 'POST',
        body: JSON.stringify({
          type: form.get('type'),
          role: form.get('role'),
          subject: form.get('subject'),
          difficulty: form.get('difficulty'),
        }),
      })

      // 2. Actually start the interview and ask Nova
      const question = await api(`/interviews/${interview.id}/start`, {
        method: 'POST',
      })

      // 3. Move to interview room
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

function InterviewRoom({ session, onComplete }) {
  const [question, setQuestion] = useState(session.question)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const questionNumber = question.sequence_number

  async function submitAnswer(e) {
    e.preventDefault()

    if (!answer.trim()) return

    setBusy(true)
    setError('')

    try {
      const result = await api(`/interviews/${session.interview.id}/answer`, {
        method: 'POST',
        body: JSON.stringify({
          question_id: question.id,
          answer_text: answer.trim(),
        }),
      })

      setEvaluation(result)
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function nextQuestion() {
    setBusy(true)
    setError('')

    try {
      const next = await api(
        `/interviews/${session.interview.id}/next-question`,
        { method: 'POST' }
      )

      setQuestion(next)
      setAnswer('')
      setEvaluation(null)
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function completeInterview() {
    setBusy(true)
    setError('')

    try {
      const result = await api(
        `/interviews/${session.interview.id}/complete`,
        { method: 'POST' }
      )

      onComplete(result)
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-content interview-page">
      <div className="interview-topbar">
        <div>
          <span className="section-kicker">Live interview</span>
          <h1>Nova is interviewing you</h1>
        </div>

        <div className="interview-meta">
          <span>
            <MessageSquare size={16} />
            Question {questionNumber}
          </span>
          <span>
            <Clock3 size={16} />
            {session.interview.difficulty}
          </span>
        </div>
      </div>

      <div className="interview-layout">
        <aside className="interview-sidebar">
          <div className="nova-profile">
            <div className="nova-mini-orb">
              <BrainCircuit size={28} />
            </div>

            <div>
              <strong>Nova</strong>
              <span>AI Interviewer</span>
            </div>
          </div>

          <div className="interview-info">
            <div>
              <span>Role</span>
              <strong>{session.interview.role}</strong>
            </div>

            <div>
              <span>Subject</span>
              <strong>{session.interview.subject}</strong>
            </div>

            <div>
              <span>Mode</span>
              <strong>{session.interview.type}</strong>
            </div>
          </div>

          <div className="interview-tip">
            <Sparkles size={18} />
            <p>
              Take your time. Nova evaluates your reasoning, not just
              the final answer.
            </p>
          </div>
        </aside>

        <main className="question-area">
          <div className="question-card">
            <div className="question-label">
              <span>QUESTION {String(questionNumber).padStart(2, '0')}</span>
              <span>{question.difficulty}</span>
            </div>

            <h2>{question.question_text}</h2>

            {!evaluation ? (
              <form onSubmit={submitAnswer}>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="answer-box"
                  rows={10}
                  disabled={busy}
                />

                <div className="answer-footer">
                  <span>
                    {answer.length} characters
                  </span>

                  <button
                    disabled={busy || !answer.trim()}
                    className="primary-btn"
                  >
                    {busy ? (
                      <>
                        <span className="spinner" />
                        Nova is evaluating…
                      </>
                    ) : (
                      <>
                        Submit answer
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <Evaluation
                evaluation={evaluation}
                busy={busy}
                onNext={nextQuestion}
                onComplete={completeInterview}
              />
            )}
          </div>

          {error && <ErrorMessage message={error} />}
        </main>
      </div>
    </div>
  )
}

function Evaluation({ evaluation, busy, onNext, onComplete }) {
  const score = evaluation.score

  return (
    <div className="evaluation">
      <div className="evaluation-header">
        <div>
          <span className="section-kicker">Nova's evaluation</span>
          <h3>Here's how you did</h3>
        </div>

        <div className="score-ring">
          <strong>{score}</strong>
          <span>/10</span>
        </div>
      </div>

      <div className="evaluation-grid">
        <ScoreItem
          label="Technical accuracy"
          value={evaluation.technical_accuracy}
        />
        <ScoreItem
          label="Relevance"
          value={evaluation.relevance}
        />
        <ScoreItem
          label="Completeness"
          value={evaluation.completeness}
        />
        <ScoreItem
          label="Clarity"
          value={evaluation.clarity}
        />
      </div>

      <div className="feedback-block">
        <h4>Nova's feedback</h4>
        <p>{evaluation.feedback}</p>
      </div>

      <div className="feedback-columns">
        <FeedbackList
          title="Strengths"
          items={evaluation.strengths}
          positive
        />

        <FeedbackList
          title="Improve next"
          items={[
            ...(evaluation.weaknesses || []),
            ...(evaluation.missing_concepts || []),
          ]}
        />
      </div>

      {evaluation.improvement_suggestions?.length > 0 && (
        <div className="improvement-box">
          <Sparkles size={18} />
          <div>
            <strong>Recommended improvement</strong>
            {evaluation.improvement_suggestions.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      )}

      <div className="evaluation-actions">
        <button
          disabled={busy}
          onClick={onComplete}
          className="secondary-btn"
        >
          <CheckCircle2 size={18} />
          Finish interview
        </button>

        <button
          disabled={busy}
          onClick={onNext}
          className="primary-btn"
        >
          Next question
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

function ScoreItem({ label, value }) {
  return (
    <div className="score-item">
      <div>
        <span>{label}</span>
        <strong>{value}/10</strong>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  )
}

function FeedbackList({ title, items, positive = false }) {
  return (
    <div className="feedback-list">
      <h4>{title}</h4>

      {items?.length ? (
        items.map((item) => (
          <div key={item}>
            <CheckCircle2
              size={16}
              className={positive ? 'icon-positive' : 'icon-neutral'}
            />
            <span>{item}</span>
          </div>
        ))
      ) : (
        <p className="muted">Nothing specific here.</p>
      )}
    </div>
  )
}

function Results({ result, onDashboard, onRetry }) {
  return (
    <div className="page-content results-page">
      <div className="results-hero">
        <div className="hero-badge">
          <Trophy size={15} />
          Interview completed
        </div>

        <h1>
          Nice work.
          <br />
          <span>Here's your result.</span>
        </h1>

        <p>
          Nova has analyzed your interview. Use this result to
          decide what to practice next.
        </p>
      </div>

      <div className="result-score-card">
        <div className="result-score">
          <span>Overall score</span>
          <strong>{result.overall_score}</strong>
          <small>/100</small>
        </div>

        <div className="result-info">
          <div>
            <span>Role</span>
            <strong>{result.role}</strong>
          </div>

          <div>
            <span>Subject</span>
            <strong>{result.subject}</strong>
          </div>

          <div>
            <span>Difficulty</span>
            <strong>{result.difficulty}</strong>
          </div>
        </div>
      </div>

      <div className="results-actions">
        <button onClick={onRetry} className="primary-btn">
          <RotateCcw size={18} />
          Practice again
        </button>

        <button onClick={onDashboard} className="secondary-btn">
          <LayoutDashboard size={18} />
          Back to dashboard
        </button>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="loading-state">
      <div className="nova-mini-orb">
        <BrainCircuit size={28} />
      </div>
      <p>Nova is loading your placement data…</p>
    </div>
  )
}

export default function App() {
  const [signed, setSigned] = useState(
    !!localStorage.getItem('drishya_token')
  )

  const [page, setPage] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)
  const [theme, setTheme] = useState(
    () => localStorage.getItem('drishya_theme') || 'light'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('drishya_theme', theme)
  }, [theme])

  function logout() {
    localStorage.removeItem('drishya_token')
    setSigned(false)
    setPage('dashboard')
    setSession(null)
    setResult(null)
  }

  if (!signed) {
    return <Auth done={() => setSigned(true)} />
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button
            className="brand"
            onClick={() => {
              setPage('dashboard')
              setSession(null)
              setResult(null)
            }}
          >
            <span className="brand-icon">
              <BrainCircuit size={20} />
            </span>
            <span>Drishya</span>
          </button>

          <nav className="main-nav">
            <button
              type="button"
              className="theme-toggle"
              onClick={() =>
                setTheme((current) =>
                  current === 'dark' ? 'light' : 'dark'
                )
              }
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <button
              className={page === 'dashboard' ? 'nav active' : 'nav'}
              onClick={() => setPage('dashboard')}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>

            <button
              className={page === 'setup' ? 'nav active' : 'nav'}
              onClick={() => {
                setPage('setup')
                setSession(null)
              }}
            >
              <MessageSquare size={16} />
              Interview
            </button>

            <button onClick={logout} className="nav logout-nav">
              <LogOut size={16} />
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {page === 'dashboard' && (
          <Dashboard start={() => setPage('setup')} />
        )}

        {page === 'setup' && (
          <Setup
            onStarted={(newSession) => {
              setSession(newSession)
              setPage('interview')
            }}
          />
        )}

        {page === 'interview' && session && (
          <InterviewRoom
            session={session}
            onComplete={(completed) => {
              setResult(completed)
              setSession(null)
              setPage('results')
            }}
          />
        )}

        {page === 'results' && result && (
          <Results
            result={result}
            onDashboard={() => setPage('dashboard')}
            onRetry={() => {
              setResult(null)
              setPage('setup')
            }}
          />
        )}
      </main>
    </div>
  )
}