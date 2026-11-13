
import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

import { api } from '../../services/api'
import {
  BrandMark,
  ErrorMessage,
} from '../common/Feedback'
import {
  Field,
  PasswordField,
} from '../common/FormFields'

export default function Auth({ done }) {
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

  async function resendVerification() {
    setError('')

    try {
      await api('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    } catch (error) {
      setError(error.message)
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
            autoComplete="one-time-code"
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
            onClick={resendVerification}
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
                autoComplete="name"
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
              autoComplete="email"
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
              setRegister((current) => !current)
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
