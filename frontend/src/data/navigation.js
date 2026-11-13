
import {
  LayoutDashboard,
  BrainCircuit,
  MessageSquare,
  FileSearch,
  Code2,
  Target,
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  GraduationCap,
} from 'lucide-react'

export const navigation = [
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
