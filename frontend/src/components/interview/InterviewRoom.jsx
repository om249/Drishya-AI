import { useState } from 'react'
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Sparkles,
} from 'lucide-react'

import { api } from '../../services/api'
import { ErrorMessage } from '../common/Feedback'

export default function InterviewRoom({ session, onComplete }) {
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
      const result = await api(
        `/interviews/${session.interview.id}/answer`,
        {
          method: 'POST',
          body: JSON.stringify({
            question_id: question.id,
            answer_text: answer.trim(),
          }),
        }
      )

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
              <span>
                QUESTION {String(questionNumber).padStart(2, '0')}
              </span>
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
                  <span>{answer.length} characters</span>

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