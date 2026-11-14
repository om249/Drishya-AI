import { useEffect, useState } from 'react'
import { api } from './services/api'
import Auth from './components/auth/Auth'
import {
  ErrorMessage,
  LoadingState,
} from './components/common/Feedback'
import { navigation } from './data/navigation'
import WorkspaceSidebar from './components/workspace/WorkspaceSidebar'
import WorkspaceHeader from './components/workspace/WorkspaceHeader'
import WorkspaceContent from './components/workspace/WorkspaceContent'
import useWorkspace from './hooks/useWorkspace'
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
export default function App() {
  const [signed, setSigned] = useState(
    !!localStorage.getItem('drishya_token')
  )
  const {
    page,
    setPage,
    session,
    setSession,
    result,
    setResult,
    sidebarOpen,
    setSidebarOpen,
    theme,
    setTheme,
    navigate,
    logout,
  } = useWorkspace(setSigned)
  if (!signed) {
    return <Auth done={() => setSigned(true)} />
  }
  const activeLabel =
    navigation
      .flatMap((group) => group.items)
      .find((item) => item.id === page)?.label || 'Drishya'
  return (
    <div className="app-shell workspace-shell">
      <WorkspaceSidebar
        navigation={navigation}
        page={page}
        sidebarOpen={sidebarOpen}
        navigate={navigate}
        logout={logout}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="workspace-main">
        <WorkspaceHeader
          activeLabel={activeLabel}
          theme={theme}
          setTheme={setTheme}
          setSidebarOpen={setSidebarOpen}
        />
        <WorkspaceContent
          page={page}
          navigate={navigate}
          session={session}
          setSession={setSession}
          result={result}
          setResult={setResult}
          setPage={setPage}
        />
      </div>
    </div>
  )
}
