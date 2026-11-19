
import Dashboard from '../dashboard/Dashboard'
import Setup from '../interview/Setup'
import InterviewRoom from '../interview/InterviewRoom'
import Results from '../interview/Results'
import ModulePreview from './ModulePreview'
import { workspaceModules } from '../../data/workspaceModules'
import ResumeAnalyzer from '../resume/ResumeAnalyzer'

function WorkspaceContent({
  page,
  navigate,
  session,
  setSession,
  result,
  setResult,
  setPage,
}) {
  return (
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

      {workspaceModules[page] && page !== 'resume' && (
        <ModulePreview
          module={workspaceModules[page]}
          onAction={() =>
            navigate(workspaceModules[page].destination)
          }
        />
      )}

      {page === 'resume' && <ResumeAnalyzer />}

    </main>
  )
}

export default WorkspaceContent
