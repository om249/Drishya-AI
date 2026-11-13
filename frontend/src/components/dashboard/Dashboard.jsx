import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronRight,
  Code2,
  FileSearch,
  MessageSquare,
  Play,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'

import { api } from '../../services/api'
import {
  ErrorMessage,
  LoadingState,
} from '../common/Feedback'

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

export default function Dashboard({ start, navigate }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api('/dashboard')
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })

    return () => {
      active = false
    }
  }, [])

  if (error) {
    return (
      <div className="page-content">
        <ErrorMessage message={error} />
        <button
          className="secondary-btn"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return <LoadingState />

  const topics = data.topic_performance || []
  const recommendations = data.recommendations || []
  const strengths = data.strengths || []

  const quickActions = [
    {
      title: 'Nova AI Coach',
      description: 'Get personalized interview preparation.',
      icon: BrainCircuit,
      page: 'nova',
      label: 'Explore coach',
    },
    {
      title: 'Resume Analyzer',
      description: 'Improve your resume and identify skill gaps.',
      icon: FileSearch,
      page: 'resume',
      label: 'Explore analyzer',
    },
    {
      title: 'Coding Arena',
      description: 'Strengthen your programming and DSA skills.',
      icon: Code2,
      page: 'coding',
      label: 'Explore coding',
    },
    {
      title: 'Assessment Center',
      description: 'Prepare for aptitude and technical tests.',
      icon: Target,
      page: 'assessments',
      label: 'Explore assessments',
    },
    {
      title: 'Learning Roadmaps',
      description: 'Build a structured learning routine.',
      icon: BookOpen,
      page: 'learning',
      label: 'Explore roadmaps',
    },
    {
      title: 'Career Hub',
      description: 'Organize your career preparation.',
      icon: BriefcaseBusiness,
      page: 'career',
      label: 'Explore career hub',
    },
  ]

  return (
    <div className="page-content dashboard-page">
      <section className="dashboard-heading">
        <div>
          <span className="section-kicker">
            YOUR PERSONAL WORKSPACE
          </span>
          <h1>Preparation overview</h1>
          <p>
            Track your progress, strengthen your skills and
            prepare for your next opportunity with Drishya.
          </p>
        </div>

        <div className="dashboard-live-status">
          <span className="status-dot" />
          Nova is ready
        </div>
      </section>

      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="hero-badge">
            <Sparkles size={15} />
            Your AI placement coach
          </div>

          <h1>
            Turn preparation
            <br />
            <span>into progress.</span>
          </h1>

          <p>
            Practice interviews, understand your weak areas
            and build the confidence to perform in real
            placement interviews.
          </p>

          <div className="dashboard-hero-actions">
            <button onClick={start} className="primary-btn">
              <Play size={17} fill="currentColor" />
              Start mock interview
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => navigate('analytics')}
              className="dashboard-text-action"
            >
              View performance
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="nova-orb">
          <div className="nova-orb-inner ai-glow">
            <BrainCircuit size={58} />
          </div>
          <span>Nova</span>
          <small>AI Placement Coach</small>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <span className="section-kicker">YOUR PROGRESS</span>
            <h2>Preparation at a glance</h2>
          </div>
          <span className="dashboard-section-note">
            Based on your interview history
          </span>
        </div>

        <div className="stats-grid">
          <StatCard
            icon={<Target />}
            value={`${data.overall_readiness ?? 0}%`}
            label="Overall readiness"
          />

          <StatCard
            icon={<MessageSquare />}
            value={data.completed_interviews ?? 0}
            label="Completed interviews"
          />

          <StatCard
            icon={<Trophy />}
            value={strengths.length}
            label="Recorded strengths"
          />

          <StatCard
            icon={<Zap />}
            value={topics.length}
            label="Topics practiced"
          />
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="content-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">PERFORMANCE</span>
              <h2>Topic performance</h2>
            </div>
            <ChartNoAxesCombined size={21} />
          </div>

          {topics.length ? (
            <div className="performance-list">
              {topics.map((topic) => (
                <div
                  key={topic.topic}
                  className="performance-row"
                >
                  <div className="performance-label">
                    <span>{topic.topic}</span>
                    <strong>{topic.score}%</strong>
                  </div>

                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuenow={topic.score}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`${topic.topic} performance`}
                  >
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, topic.score)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Target />}
              title="Your progress starts here"
              text="Complete your first interview to see your topic-wise performance."
            />
          )}
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">PERSONALIZED</span>
              <h2>Nova's recommendations</h2>
            </div>
            <Sparkles size={21} />
          </div>

          {recommendations.length ? (
            <div className="recommendation-list">
              {recommendations.map((recommendation, index) => (
                <div
                  key={`${index}-${recommendation}`}
                  className="recommendation-item"
                >
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
              title="Nova is getting ready"
              text="Complete an interview to receive recommendations based on your performance."
            />
          )}
        </section>
      </div>

      <section className="dashboard-section quick-access-section">
        <div className="dashboard-section-heading">
          <div>
            <span className="section-kicker">EXPLORE DRISHYA</span>
            <h2>Your preparation modules</h2>
            <p>
              Everything you need to work towards your career goals.
            </p>
          </div>
        </div>

        <div className="dashboard-quick-grid">
          {quickActions.map((item) => {
            const Icon = item.icon

            return (
              <button
                type="button"
                key={item.page}
                className="dashboard-action-card"
                onClick={() => navigate(item.page)}
              >
                <div className="dashboard-action-icon">
                  <Icon size={21} />
                </div>

                <div className="dashboard-action-content">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>

                <div className="dashboard-action-footer">
                  <span>{item.label}</span>
                  <ArrowRight size={16} />
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}