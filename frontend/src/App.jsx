import { useEffect, useState } from 'react'
import { api } from './services/api'
import Auth from './components/auth/Auth'
import {
  ErrorMessage,
  LoadingState,
} from './components/common/Feedback'
import Dashboard from './components/dashboard/Dashboard'
import Setup from './components/interview/Setup'
import InterviewRoom from './components/interview/InterviewRoom'
import Results from './components/interview/Results'
import ModulePreview from './components/workspace/ModulePreview'
import { workspaceModules } from './data/workspaceModules'
import { navigation } from './data/navigation'
import WorkspaceSidebar from './components/workspace/WorkspaceSidebar'
import WorkspaceHeader from './components/workspace/WorkspaceHeader'

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
  BriefcaseBusiness,
  FileSearch,
  BookOpen,
  ChartNoAxesCombined,
  Settings,
  Users,
  GraduationCap,
  Menu,
  X,
  LockKeyhole,
} from 'lucide-react'

// const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// async function api(path, options = {}) {
//   const token = localStorage.getItem('drishya_token')

//   const response = await fetch(`${API}${path}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token && { Authorization: `Bearer ${token}` }),
//       ...options.headers,
//     },
//   })

//   const body = await response.json().catch(() => ({}))

//   if (!response.ok) {
//     throw new Error(body.detail || 'Request failed')
//   }

//   return body
// }

// const Field = ({ label, ...props }) => (
//   <label className="field-label">
//     {label}
//     <input {...props} className="field-input" />
//   </label>
// )

// function PasswordField() {
//   const [visible, setVisible] = useState(false)

//   return (
//     <label className="field-label">
//       Password
//       <div className="password-wrap">
//         <input
//           name="password"
//           required
//           type={visible ? 'text' : 'password'}
//           minLength="8"
//           className="field-input password-input"
//         />
//         <button
//           type="button"
//           onClick={() => setVisible(!visible)}
//           className="password-toggle"
//           aria-label={visible ? 'Hide password' : 'Show password'}
//         >
//           {visible ? <EyeOff size={19} /> : <Eye size={19} />}
//         </button>
//       </div>
//     </label>
//   )
// }

// function Auth({ done }) {
//   const [register, setRegister] = useState(false)
//   const [email, setEmail] = useState('')
//   const [error, setError] = useState('')
//   const [busy, setBusy] = useState(false)

//   async function submit(e) {
//     e.preventDefault()
//     setBusy(true)
//     setError('')

//     const form = new FormData(e.currentTarget)

//     try {
//       if (register) {
//         const value = form.get('email')

//         await api('/auth/register', {
//           method: 'POST',
//           body: JSON.stringify({
//             name: form.get('name'),
//             email: value,
//             password: form.get('password'),
//           }),
//         })

//         setEmail(value)
//         return
//       }

//       const result = await api('/auth/login', {
//         method: 'POST',
//         body: JSON.stringify({
//           email: form.get('email'),
//           password: form.get('password'),
//         }),
//       })

//       localStorage.setItem('drishya_token', result.access_token)
//       done()
//     } catch (error) {
//       setError(error.message)
//     } finally {
//       setBusy(false)
//     }
//   }

//   async function verify(e) {
//     e.preventDefault()
//     setBusy(true)
//     setError('')

//     const form = new FormData(e.currentTarget)

//     try {
//       await api('/auth/verify-registration', {
//         method: 'POST',
//         body: JSON.stringify({
//           email,
//           code: form.get('code'),
//         }),
//       })

//       const result = await api('/auth/login', {
//         method: 'POST',
//         body: JSON.stringify({
//           email,
//           password: form.get('password'),
//         }),
//       })

//       localStorage.setItem('drishya_token', result.access_token)
//       done()
//     } catch (error) {
//       setError(error.message)
//     } finally {
//       setBusy(false)
//     }
//   }

//   if (email) {
//     return (
//       <main className="auth-page">
//         <div className="auth-glow auth-glow-one" />
//         <div className="auth-glow auth-glow-two" />

//         <form onSubmit={verify} className="auth-card">
//           <BrandMark />

//           <div className="auth-heading">
//             <span className="eyebrow">Almost there</span>
//             <h1>Verify your email</h1>
//             <p>
//               Enter the six-digit code sent to{' '}
//               <strong>{email}</strong>.
//             </p>
//           </div>

//           <Field
//             label="Verification code"
//             name="code"
//             required
//             inputMode="numeric"
//             pattern="[0-9]{6}"
//             placeholder="123456"
//           />

//           <div className="mt-4">
//             <PasswordField />
//           </div>

//           {error && <ErrorMessage message={error} />}

//           <button disabled={busy} className="primary-btn full-btn">
//             {busy ? 'Verifying…' : 'Verify account'}
//             {!busy && <ArrowRight size={18} />}
//           </button>

//           <button
//             type="button"
//             onClick={() =>
//               api('/auth/resend-verification', {
//                 method: 'POST',
//                 body: JSON.stringify({ email }),
//               }).catch((error) => setError(error.message))
//             }
//             className="text-btn"
//           >
//             Resend verification code
//           </button>
//         </form>
//       </main>
//     )
//   }

//   return (
//     <main className="auth-page">
//       <div className="auth-glow auth-glow-one" />
//       <div className="auth-glow auth-glow-two" />

//       <div className="auth-layout">
//         <section className="auth-hero">
//           <div className="hero-badge">
//             <Sparkles size={15} />
//             AI-powered placement preparation
//           </div>

//           <h1>
//             Prepare smarter.
//             <br />
//             <span>Interview better.</span>
//           </h1>

//           <p>
//             Drishya turns every mock interview into a personalized
//             learning experience with Nova, your AI placement coach.
//           </p>

//           <div className="hero-points">
//             <div>
//               <CheckCircle2 size={18} />
//               Personalized interviews
//             </div>
//             <div>
//               <CheckCircle2 size={18} />
//               AI-powered feedback
//             </div>
//             <div>
//               <CheckCircle2 size={18} />
//               Track your progress
//             </div>
//           </div>
//         </section>

//         <form onSubmit={submit} className="auth-card">
//           <BrandMark />

//           <div className="auth-heading">
//             <span className="eyebrow">
//               {register ? 'Join Drishya' : 'Welcome back'}
//             </span>
//             <h1>{register ? 'Create your account' : 'Sign in'}</h1>
//             <p>
//               {register
//                 ? 'Start your journey toward interview readiness.'
//                 : 'Continue your preparation with Nova.'}
//             </p>
//           </div>

//           {register && (
//             <div className="mb-4">
//               <Field
//                 label="Full name"
//                 name="name"
//                 required
//                 minLength="2"
//                 placeholder="Your name"
//               />
//             </div>
//           )}

//           <div className="mb-4">
//             <Field
//               label="Email"
//               name="email"
//               required
//               type="email"
//               placeholder="you@example.com"
//             />
//           </div>

//           <div className="mb-4">
//             <PasswordField />
//           </div>

//           {error && <ErrorMessage message={error} />}

//           <button disabled={busy} className="primary-btn full-btn">
//             {busy
//               ? 'Please wait…'
//               : register
//                 ? 'Create account'
//                 : 'Sign in'}
//             {!busy && <ArrowRight size={18} />}
//           </button>

//           <button
//             type="button"
//             onClick={() => {
//               setRegister(!register)
//               setError('')
//             }}
//             className="text-btn"
//           >
//             {register
//               ? 'Already have an account? Sign in'
//               : 'New here? Create an account'}
//           </button>
//         </form>
//       </div>
//     </main>
//   )
// }

// function BrandMark() {
//   return (
//     <div className="brand-mark">
//       <BrainCircuit size={24} />
//     </div>
//   )
// }

// function ErrorMessage({ message }) {
//   return (
//     <div className="error-message">
//       <CircleHelp size={17} />
//       {message}
//     </div>
//   )
// }


// function Dashboard({ start, navigate }) {
//   const [data, setData] = useState(null)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     let active = true

//     api('/dashboard')
//       .then((result) => {
//         if (active) setData(result)
//       })
//       .catch((err) => {
//         if (active) setError(err.message)
//       })

//     return () => {
//       active = false
//     }
//   }, [])

//   if (error) {
//     return (
//       <div className="page-content">
//         <ErrorMessage message={error} />
//         <button
//           className="secondary-btn"
//           onClick={() => window.location.reload()}
//         >
//           <RotateCcw size={17} />
//           Retry
//         </button>
//       </div>
//     )
//   }

//   if (!data) return <LoadingState />

//   const topics = data.topic_performance || []
//   const recommendations = data.recommendations || []
//   const strengths = data.strengths || []

//   const quickActions = [
//     {
//       title: 'Nova AI Coach',
//       description: 'Get personalized interview preparation.',
//       icon: BrainCircuit,
//       page: 'nova',
//       label: 'Explore coach',
//     },
//     {
//       title: 'Resume Analyzer',
//       description: 'Improve your resume and identify skill gaps.',
//       icon: FileSearch,
//       page: 'resume',
//       label: 'Explore analyzer',
//     },
//     {
//       title: 'Coding Arena',
//       description: 'Strengthen your programming and DSA skills.',
//       icon: Code2,
//       page: 'coding',
//       label: 'Explore coding',
//     },
//     {
//       title: 'Assessment Center',
//       description: 'Prepare for aptitude and technical tests.',
//       icon: Target,
//       page: 'assessments',
//       label: 'Explore assessments',
//     },
//     {
//       title: 'Learning Roadmaps',
//       description: 'Build a structured learning routine.',
//       icon: BookOpen,
//       page: 'learning',
//       label: 'Explore roadmaps',
//     },
//     {
//       title: 'Career Hub',
//       description: 'Organize your career preparation.',
//       icon: BriefcaseBusiness,
//       page: 'career',
//       label: 'Explore career hub',
//     },
//   ]

//   return (
//     <div className="page-content dashboard-page">

//       <section className="dashboard-heading">
//         <div>
//           <span className="section-kicker">
//             YOUR PERSONAL WORKSPACE
//           </span>
//           <h1>Preparation overview</h1>
//           <p>
//             Track your progress, strengthen your skills and
//             prepare for your next opportunity with Drishya.
//           </p>
//         </div>

//         <div className="dashboard-live-status">
//           <span className="status-dot" />
//           Nova is ready
//         </div>
//       </section>

//       <section className="dashboard-hero">
//         <div className="dashboard-hero-content">
//           <div className="hero-badge">
//             <Sparkles size={15} />
//             Your AI placement coach
//           </div>

//           <h1>
//             Turn preparation
//             <br />
//             <span>into progress.</span>
//           </h1>

//           <p>
//             Practice interviews, understand your weak areas
//             and build the confidence to perform in real
//             placement interviews.
//           </p>

//           <div className="dashboard-hero-actions">
//             <button onClick={start} className="primary-btn">
//               <Play size={17} fill="currentColor" />
//               Start mock interview
//               <ArrowRight size={17} />
//             </button>

//             <button
//               onClick={() => navigate('analytics')}
//               className="dashboard-text-action"
//             >
//               View performance
//               <ArrowRight size={16} />
//             </button>
//           </div>
//         </div>

//         <div className="nova-orb">
//           <div className="nova-orb-inner ai-glow">
//             <BrainCircuit size={58} />
//           </div>
//           <span>Nova</span>
//           <small>AI Placement Coach</small>
//         </div>
//       </section>

//       <section className="dashboard-section">
//         <div className="dashboard-section-heading">
//           <div>
//             <span className="section-kicker">YOUR PROGRESS</span>
//             <h2>Preparation at a glance</h2>
//           </div>
//           <span className="dashboard-section-note">
//             Based on your interview history
//           </span>
//         </div>

//         <div className="stats-grid">
//           <StatCard
//             icon={<Target />}
//             value={`${data.overall_readiness ?? 0}%`}
//             label="Overall readiness"
//           />

//           <StatCard
//             icon={<MessageSquare />}
//             value={data.completed_interviews ?? 0}
//             label="Completed interviews"
//           />

//           <StatCard
//             icon={<Trophy />}
//             value={strengths.length}
//             label="Recorded strengths"
//           />

//           <StatCard
//             icon={<Zap />}
//             value={topics.length}
//             label="Topics practiced"
//           />
//         </div>
//       </section>

//       <div className="dashboard-grid">

//         <section className="content-card">
//           <div className="section-heading">
//             <div>
//               <span className="section-kicker">PERFORMANCE</span>
//               <h2>Topic performance</h2>
//             </div>
//             <ChartNoAxesCombined size={21} />
//           </div>

//           {topics.length ? (
//             <div className="performance-list">
//               {topics.map((topic) => (
//                 <div
//                   key={topic.topic}
//                   className="performance-row"
//                 >
//                   <div className="performance-label">
//                     <span>{topic.topic}</span>
//                     <strong>{topic.score}%</strong>
//                   </div>

//                   <div
//                     className="progress-track"
//                     role="progressbar"
//                     aria-valuenow={topic.score}
//                     aria-valuemin="0"
//                     aria-valuemax="100"
//                     aria-label={`${topic.topic} performance`}
//                   >
//                     <div
//                       className="progress-fill"
//                       style={{
//                         width: `${Math.max(
//                           0,
//                           Math.min(100, topic.score)
//                         )}%`,
//                       }}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <EmptyState
//               icon={<Target />}
//               title="Your progress starts here"
//               text="Complete your first interview to see your topic-wise performance."
//             />
//           )}
//         </section>

//         <section className="content-card">
//           <div className="section-heading">
//             <div>
//               <span className="section-kicker">PERSONALIZED</span>
//               <h2>Nova's recommendations</h2>
//             </div>
//             <Sparkles size={21} />
//           </div>

//           {recommendations.length ? (
//             <div className="recommendation-list">
//               {recommendations.map((recommendation, index) => (
//                 <div
//                   key={`${index}-${recommendation}`}
//                   className="recommendation-item"
//                 >
//                   <div className="recommendation-icon">
//                     <ChevronRight size={16} />
//                   </div>
//                   <span>{recommendation}</span>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <EmptyState
//               icon={<Sparkles />}
//               title="Nova is getting ready"
//               text="Complete an interview to receive recommendations based on your performance."
//             />
//           )}
//         </section>

//       </div>

//       <section className="dashboard-section quick-access-section">
//         <div className="dashboard-section-heading">
//           <div>
//             <span className="section-kicker">EXPLORE DRISHYA</span>
//             <h2>Your preparation modules</h2>
//             <p>
//               Everything you need to work towards your career goals.
//             </p>
//           </div>
//         </div>

//         <div className="dashboard-quick-grid">
//           {quickActions.map((item) => {
//             const Icon = item.icon

//             return (
//               <button
//                 type="button"
//                 key={item.page}
//                 className="dashboard-action-card"
//                 onClick={() => navigate(item.page)}
//               >
//                 <div className="dashboard-action-icon">
//                   <Icon size={21} />
//                 </div>

//                 <div className="dashboard-action-content">
//                   <strong>{item.title}</strong>
//                   <span>{item.description}</span>
//                 </div>

//                 <div className="dashboard-action-footer">
//                   <span>{item.label}</span>
//                   <ArrowRight size={16} />
//                 </div>
//               </button>
//             )
//           })}
//         </div>
//       </section>

//     </div>
//   )
// }


// function StatCard({ icon, value, label }) {
//   return (
//     <div className="stat-card">
//       <div className="stat-icon">{icon}</div>
//       <div>
//         <strong>{value}</strong>
//         <span>{label}</span>
//       </div>
//     </div>
//   )
// }

// function EmptyState({ icon, title, text }) {
//   return (
//     <div className="empty-state">
//       <div className="empty-icon">{icon}</div>
//       <h3>{title}</h3>
//       <p>{text}</p>
//     </div>
//   )
// }

// function Setup({ onStarted }) {
//   const [error, setError] = useState('')
//   const [busy, setBusy] = useState(false)

//   async function submit(e) {
//     e.preventDefault()
//     setBusy(true)
//     setError('')

//     const form = new FormData(e.currentTarget)

//     try {
//       // 1. Create the interview
//       const interview = await api('/interviews', {
//         method: 'POST',
//         body: JSON.stringify({
//           type: form.get('type'),
//           role: form.get('role'),
//           subject: form.get('subject'),
//           difficulty: form.get('difficulty'),
//         }),
//       })

//       // 2. Actually start the interview and ask Nova
//       const question = await api(`/interviews/${interview.id}/start`, {
//         method: 'POST',
//       })

//       // 3. Move to interview room
//       onStarted({
//         interview,
//         question,
//       })
//     } catch (error) {
//       setError(error.message)
//     } finally {
//       setBusy(false)
//     }
//   }

//   return (
//     <div className="page-content">
//       <div className="setup-header">
//         <button
//           className="back-link"
//           onClick={() => window.history.back()}
//         >
//           ← Back
//         </button>

//         <div className="hero-badge">
//           <Sparkles size={15} />
//           Nova Interview
//         </div>

//         <h1>
//           Design your
//           <br />
//           <span>perfect practice round.</span>
//         </h1>

//         <p>
//           Choose your interview settings and Nova will build a
//           personalized session around them.
//         </p>
//       </div>

//       <form onSubmit={submit} className="setup-card">
//         <div className="setup-grid">
//           <div>
//             <label className="field-label">
//               Interview type
//               <select name="type" className="field-input">
//                 <option value="technical">Technical</option>
//                 <option value="hr">HR</option>
//                 <option value="aptitude">Aptitude</option>
//                 <option value="coding">Coding</option>
//               </select>
//             </label>
//           </div>

//           <Field
//             label="Target role"
//             name="role"
//             defaultValue="Software Developer"
//             required
//           />

//           <Field
//             label="Subject"
//             name="subject"
//             defaultValue="Python"
//             required
//           />

//           <label className="field-label">
//             Difficulty
//             <select name="difficulty" className="field-input">
//               <option value="beginner">Beginner</option>
//               <option value="intermediate">Intermediate</option>
//               <option value="advanced">Advanced</option>
//             </select>
//           </label>
//         </div>

//         <div className="interview-preview">
//           <div className="preview-icon">
//             <BrainCircuit size={26} />
//           </div>

//           <div>
//             <strong>Nova will evaluate your answers</strong>
//             <p>
//               Every response is analyzed for accuracy, relevance,
//               completeness, clarity, and improvement areas.
//             </p>
//           </div>
//         </div>

//         {error && <ErrorMessage message={error} />}

//         <button disabled={busy} className="primary-btn full-btn">
//           {busy ? (
//             <>
//               <span className="spinner" />
//               Nova is preparing…
//             </>
//           ) : (
//             <>
//               <Play size={18} fill="currentColor" />
//               Begin with Nova
//               <ArrowRight size={18} />
//             </>
//           )}
//         </button>
//       </form>
//     </div>
//   )
// }

// function InterviewRoom({ session, onComplete }) {
//   const [question, setQuestion] = useState(session.question)
//   const [answer, setAnswer] = useState('')
//   const [evaluation, setEvaluation] = useState(null)
//   const [busy, setBusy] = useState(false)
//   const [error, setError] = useState('')

//   const questionNumber = question.sequence_number

//   async function submitAnswer(e) {
//     e.preventDefault()

//     if (!answer.trim()) return

//     setBusy(true)
//     setError('')

//     try {
//       const result = await api(`/interviews/${session.interview.id}/answer`, {
//         method: 'POST',
//         body: JSON.stringify({
//           question_id: question.id,
//           answer_text: answer.trim(),
//         }),
//       })

//       setEvaluation(result)
//     } catch (error) {
//       setError(error.message)
//     } finally {
//       setBusy(false)
//     }
//   }

//   async function nextQuestion() {
//     setBusy(true)
//     setError('')

//     try {
//       const next = await api(
//         `/interviews/${session.interview.id}/next-question`,
//         { method: 'POST' }
//       )

//       setQuestion(next)
//       setAnswer('')
//       setEvaluation(null)
//     } catch (error) {
//       setError(error.message)
//     } finally {
//       setBusy(false)
//     }
//   }

//   async function completeInterview() {
//     setBusy(true)
//     setError('')

//     try {
//       const result = await api(
//         `/interviews/${session.interview.id}/complete`,
//         { method: 'POST' }
//       )

//       onComplete(result)
//     } catch (error) {
//       setError(error.message)
//     } finally {
//       setBusy(false)
//     }
//   }

//   return (
//     <div className="page-content interview-page">
//       <div className="interview-topbar">
//         <div>
//           <span className="section-kicker">Live interview</span>
//           <h1>Nova is interviewing you</h1>
//         </div>

//         <div className="interview-meta">
//           <span>
//             <MessageSquare size={16} />
//             Question {questionNumber}
//           </span>
//           <span>
//             <Clock3 size={16} />
//             {session.interview.difficulty}
//           </span>
//         </div>
//       </div>

//       <div className="interview-layout">
//         <aside className="interview-sidebar">
//           <div className="nova-profile">
//             <div className="nova-mini-orb">
//               <BrainCircuit size={28} />
//             </div>

//             <div>
//               <strong>Nova</strong>
//               <span>AI Interviewer</span>
//             </div>
//           </div>

//           <div className="interview-info">
//             <div>
//               <span>Role</span>
//               <strong>{session.interview.role}</strong>
//             </div>

//             <div>
//               <span>Subject</span>
//               <strong>{session.interview.subject}</strong>
//             </div>

//             <div>
//               <span>Mode</span>
//               <strong>{session.interview.type}</strong>
//             </div>
//           </div>

//           <div className="interview-tip">
//             <Sparkles size={18} />
//             <p>
//               Take your time. Nova evaluates your reasoning, not just
//               the final answer.
//             </p>
//           </div>
//         </aside>

//         <main className="question-area">
//           <div className="question-card">
//             <div className="question-label">
//               <span>QUESTION {String(questionNumber).padStart(2, '0')}</span>
//               <span>{question.difficulty}</span>
//             </div>

//             <h2>{question.question_text}</h2>

//             {!evaluation ? (
//               <form onSubmit={submitAnswer}>
//                 <textarea
//                   value={answer}
//                   onChange={(e) => setAnswer(e.target.value)}
//                   placeholder="Type your answer here..."
//                   className="answer-box"
//                   rows={10}
//                   disabled={busy}
//                 />

//                 <div className="answer-footer">
//                   <span>
//                     {answer.length} characters
//                   </span>

//                   <button
//                     disabled={busy || !answer.trim()}
//                     className="primary-btn"
//                   >
//                     {busy ? (
//                       <>
//                         <span className="spinner" />
//                         Nova is evaluating…
//                       </>
//                     ) : (
//                       <>
//                         Submit answer
//                         <ArrowRight size={18} />
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </form>
//             ) : (
//               <Evaluation
//                 evaluation={evaluation}
//                 busy={busy}
//                 onNext={nextQuestion}
//                 onComplete={completeInterview}
//               />
//             )}
//           </div>

//           {error && <ErrorMessage message={error} />}
//         </main>
//       </div>
//     </div>
//   )
// }

// function Evaluation({ evaluation, busy, onNext, onComplete }) {
//   const score = evaluation.score

//   return (
//     <div className="evaluation">
//       <div className="evaluation-header">
//         <div>
//           <span className="section-kicker">Nova's evaluation</span>
//           <h3>Here's how you did</h3>
//         </div>

//         <div className="score-ring">
//           <strong>{score}</strong>
//           <span>/10</span>
//         </div>
//       </div>

//       <div className="evaluation-grid">
//         <ScoreItem
//           label="Technical accuracy"
//           value={evaluation.technical_accuracy}
//         />
//         <ScoreItem
//           label="Relevance"
//           value={evaluation.relevance}
//         />
//         <ScoreItem
//           label="Completeness"
//           value={evaluation.completeness}
//         />
//         <ScoreItem
//           label="Clarity"
//           value={evaluation.clarity}
//         />
//       </div>

//       <div className="feedback-block">
//         <h4>Nova's feedback</h4>
//         <p>{evaluation.feedback}</p>
//       </div>

//       <div className="feedback-columns">
//         <FeedbackList
//           title="Strengths"
//           items={evaluation.strengths}
//           positive
//         />

//         <FeedbackList
//           title="Improve next"
//           items={[
//             ...(evaluation.weaknesses || []),
//             ...(evaluation.missing_concepts || []),
//           ]}
//         />
//       </div>

//       {evaluation.improvement_suggestions?.length > 0 && (
//         <div className="improvement-box">
//           <Sparkles size={18} />
//           <div>
//             <strong>Recommended improvement</strong>
//             {evaluation.improvement_suggestions.map((item) => (
//               <p key={item}>{item}</p>
//             ))}
//           </div>
//         </div>
//       )}

//       <div className="evaluation-actions">
//         <button
//           disabled={busy}
//           onClick={onComplete}
//           className="secondary-btn"
//         >
//           <CheckCircle2 size={18} />
//           Finish interview
//         </button>

//         <button
//           disabled={busy}
//           onClick={onNext}
//           className="primary-btn"
//         >
//           Next question
//           <ArrowRight size={18} />
//         </button>
//       </div>
//     </div>
//   )
// }

// function ScoreItem({ label, value }) {
//   return (
//     <div className="score-item">
//       <div>
//         <span>{label}</span>
//         <strong>{value}/10</strong>
//       </div>

//       <div className="progress-track">
//         <div
//           className="progress-fill"
//           style={{ width: `${value * 10}%` }}
//         />
//       </div>
//     </div>
//   )
// }

// function FeedbackList({ title, items, positive = false }) {
//   return (
//     <div className="feedback-list">
//       <h4>{title}</h4>

//       {items?.length ? (
//         items.map((item) => (
//           <div key={item}>
//             <CheckCircle2
//               size={16}
//               className={positive ? 'icon-positive' : 'icon-neutral'}
//             />
//             <span>{item}</span>
//           </div>
//         ))
//       ) : (
//         <p className="muted">Nothing specific here.</p>
//       )}
//     </div>
//   )
// }

// function Results({ result, onDashboard, onRetry }) {
//   return (
//     <div className="page-content results-page">
//       <div className="results-hero">
//         <div className="hero-badge">
//           <Trophy size={15} />
//           Interview completed
//         </div>

//         <h1>
//           Nice work.
//           <br />
//           <span>Here's your result.</span>
//         </h1>

//         <p>
//           Nova has analyzed your interview. Use this result to
//           decide what to practice next.
//         </p>
//       </div>

//       <div className="result-score-card">
//         <div className="result-score">
//           <span>Overall score</span>
//           <strong>{result.overall_score}</strong>
//           <small>/100</small>
//         </div>

//         <div className="result-info">
//           <div>
//             <span>Role</span>
//             <strong>{result.role}</strong>
//           </div>

//           <div>
//             <span>Subject</span>
//             <strong>{result.subject}</strong>
//           </div>

//           <div>
//             <span>Difficulty</span>
//             <strong>{result.difficulty}</strong>
//           </div>
//         </div>
//       </div>

//       <div className="results-actions">
//         <button onClick={onRetry} className="primary-btn">
//           <RotateCcw size={18} />
//           Practice again
//         </button>

//         <button onClick={onDashboard} className="secondary-btn">
//           <LayoutDashboard size={18} />
//           Back to dashboard
//         </button>
//       </div>
//     </div>
//   )
// }

// function LoadingState() {
//   return (
//     <div className="loading-state">
//       <div className="nova-mini-orb">
//         <BrainCircuit size={28} />
//       </div>
//       <p>Nova is loading your placement data…</p>
//     </div>
//   )
// }


// const workspaceModules = {
//   nova: {
//     eyebrow: 'YOUR AI CAREER COACH',
//     title: 'Meet Nova',
//     description:
//       'Your personal AI placement coach. Practice interviews, receive feedback and build a preparation strategy based on your performance.',
//     features: [
//       'Personalized interview preparation',
//       'AI-powered answer evaluation',
//       'Adaptive difficulty and recommendations',
//     ],
//     action: 'Start an AI interview',
//     destination: 'setup',
//   },
//   resume: {
//     eyebrow: 'RESUME INTELLIGENCE',
//     title: 'Build a stronger resume',
//     description:
//       'Analyze your resume, identify missing skills and improve its alignment with your target job descriptions.',
//     features: [
//       'Resume parsing and skill extraction',
//       'ATS compatibility analysis',
//       'Job description matching',
//     ],
//   },
//   coding: {
//     eyebrow: 'CODING PRACTICE',
//     title: 'Sharpen your coding skills',
//     description:
//       'Build problem-solving confidence through structured programming and DSA practice.',
//     features: [
//       'Topic-wise coding challenges',
//       'Difficulty-based practice',
//       'Coding performance tracking',
//     ],
//   },
//   assessments: {
//     eyebrow: 'ASSESSMENT CENTER',
//     title: 'Test your placement readiness',
//     description:
//       'Prepare for aptitude rounds, technical assessments and company placement examinations.',
//     features: [
//       'Quantitative aptitude',
//       'Logical reasoning and verbal ability',
//       'Technical MCQ assessments',
//     ],
//   },
//   learning: {
//     eyebrow: 'LEARNING PATHWAYS',
//     title: 'Learn with a clear direction',
//     description:
//       'Follow structured learning roadmaps and focus on the skills that matter for your career goals.',
//     features: [
//       'Personalized learning roadmaps',
//       'Skill progress tracking',
//       'Revision and practice plans',
//     ],
//   },
//   career: {
//     eyebrow: 'CAREER HUB',
//     title: 'Take control of your career',
//     description:
//       'Organize your job search, track applications and prepare for the companies you want to join.',
//     features: [
//       'Job application tracking',
//       'Company preparation guides',
//       'Placement preparation checklist',
//     ],
//   },
//   analytics: {
//     eyebrow: 'PERFORMANCE INTELLIGENCE',
//     title: 'Understand your progress',
//     description:
//       'Review your preparation history, strengths, weak areas and career readiness.',
//     features: [
//       'Interview performance trends',
//       'Topic-wise strengths and weaknesses',
//       'Personalized improvement insights',
//     ],
//   },
//   institutions: {
//     eyebrow: 'INSTITUTION WORKSPACE',
//     title: 'Placement preparation for colleges',
//     description:
//       'A dedicated workspace for placement departments to organize student preparation and monitor progress.',
//     features: [
//       'Student and batch management',
//       'Assigned assessments and interviews',
//       'Placement readiness analytics',
//     ],
//   },
// }

// function ModulePreview({ module, onAction }) {
//   return (
//     <div className="module-preview page-content">
//       <div className="module-preview-top">
//         <span className="section-kicker">{module.eyebrow}</span>
//         <span className="module-status">
//           <Sparkles size={13} />
//           In development
//         </span>
//       </div>

//       <div className="module-preview-content">
//         <div className="module-preview-icon">
//           <Sparkles size={30} />
//         </div>

//         <h1>{module.title}</h1>
//         <p>{module.description}</p>

//         <div className="module-feature-list">
//           {module.features.map((feature) => (
//             <div key={feature} className="module-feature">
//               <CheckCircle2 size={18} />
//               <span>{feature}</span>
//             </div>
//           ))}
//         </div>

//         {module.action && (
//           <button className="primary-btn" onClick={onAction}>
//             {module.action}
//             <ArrowRight size={18} />
//           </button>
//         )}
//       </div>

//       <div className="module-preview-footer">
//         <Sparkles size={16} />
//         <span>
//           We're building this experience as part of the Drishya
//           platform roadmap.
//         </span>
//       </div>
//     </div>
//   )
// }



export default function App() {
  const [signed, setSigned] = useState(
    !!localStorage.getItem('drishya_token')
  )

  const [page, setPage] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Preserve your existing theme implementation.
  const [theme, setTheme] = useState(
    () => localStorage.getItem('drishya_theme') || 'light'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('drishya_theme', theme)
  }, [theme])

  function navigate(destination) {
    setPage(destination)
    setSidebarOpen(false)

    if (destination !== 'interview') {
      setSession(null)
    }

    if (destination !== 'results') {
      setResult(null)
    }
  }

  function logout() {
    localStorage.removeItem('drishya_token')
    setSigned(false)
    setPage('dashboard')
    setSession(null)
    setResult(null)
    setSidebarOpen(false)
  }

  if (!signed) {
    return <Auth done={() => setSigned(true)} />
  }

  const navigation = [
    {
      label: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'nova', label: 'Nova AI Coach', icon: BrainCircuit },
        { id: 'setup', label: 'Mock Interviews', icon: MessageSquare },
      ],
    },
    {
      label: 'PREPARATION',
      items: [
        { id: 'resume', label: 'Resume Analyzer', icon: FileSearch },
        { id: 'coding', label: 'Coding Arena', icon: Code2 },
        { id: 'assessments', label: 'Assessments', icon: Target },
        { id: 'learning', label: 'Learning Roadmaps', icon: BookOpen },
      ],
    },
    {
      label: 'CAREER',
      items: [
        { id: 'career', label: 'Career Hub', icon: BriefcaseBusiness },
        {
          id: 'analytics',
          label: 'My Performance',
          icon: ChartNoAxesCombined,
        },
      ],
    },
    {
      label: 'INSTITUTIONS',
      items: [
        {
          id: 'institutions',
          label: 'College Workspace',
          icon: GraduationCap,
        },
      ],
    },
  ]

  const activeLabel =
    navigation
      .flatMap((group) => group.items)
      .find((item) => item.id === page)?.label || 'Drishya'

  return (
    <div className="app-shell workspace-shell">
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`workspace-sidebar ${sidebarOpen ? 'is-open' : ''}`}
      >
        <button
          className="workspace-brand"
          onClick={() => navigate('dashboard')}
        >
          <span className="brand-icon">
            <BrainCircuit size={21} />
          </span>

          <span className="workspace-brand-text">
            <strong>Drishya</strong>
            <small>AI CAREER PLATFORM</small>
          </span>
        </button>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <UserRound size={20} />
          </div>
          <div>
            <strong>My Workspace</strong>
            <span>Student account</span>
          </div>
        </div>

        <nav className="sidebar-navigation">
          {navigation.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <span className="sidebar-group-label">
                {group.label}
              </span>

              {group.items.map((item) => {
                const Icon = item.icon
                const active = page === item.id

                return (
                  <button
                    key={item.id}
                    className={`sidebar-link ${active ? 'active' : ''}`}
                    onClick={() => navigate(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {active && (
                      <span className="sidebar-active-indicator" />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={logout}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-header">
          <div className="workspace-header-left">
            <button
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="workspace-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{activeLabel}</strong>
            </div>
          </div>

          <div className="workspace-header-actions">
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
              {theme === 'dark' ? (
                <Sun size={17} />
              ) : (
                <Moon size={17} />
              )}
              <span>
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </span>
            </button>
          </div>
        </header>

        <main className="workspace-content">
          {page === 'dashboard' && (
            <Dashboard
                start={() => navigate('setup')}
                navigate={navigate}
            />
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
              onDashboard={() => navigate('dashboard')}
              onRetry={() => navigate('setup')}
            />
          )}

          {workspaceModules[page] && (
            <ModulePreview
              module={workspaceModules[page]}
              onAction={() => navigate(
                workspaceModules[page].destination
              )}
            />
          )}
        </main>
      </div>
    </div>
  )
}
