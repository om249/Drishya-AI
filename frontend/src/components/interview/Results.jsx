import {
  LayoutDashboard,
  RotateCcw,
  Trophy,
} from 'lucide-react'

export default function Results({ result, onDashboard, onRetry }) {
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