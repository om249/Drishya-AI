
import {
  BrainCircuit,
  CircleHelp,
} from 'lucide-react'

export function BrandMark() {
  return (
    <div className="brand-mark">
      <BrainCircuit size={24} />
    </div>
  )
}

export function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <div className="error-message" role="alert">
      <CircleHelp size={17} />
      {message}
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="loading-state">
      <div className="nova-mini-orb">
        <BrainCircuit size={28} />
      </div>
      <p>Nova is loading your placement data…</p>
    </div>
  )
}
