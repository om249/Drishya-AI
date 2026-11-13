
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function Field({ label, ...props }) {
  return (
    <label className="field-label">
      {label}
      <input {...props} className="field-input" />
    </label>
  )
}

export function PasswordField() {
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
          autoComplete="current-password"
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="password-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </label>
  )
}
