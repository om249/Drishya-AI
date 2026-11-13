
import {
  ChevronRight,
  Menu,
  Moon,
  Sun,
} from 'lucide-react'

function WorkspaceHeader({
  activeLabel,
  theme,
  setTheme,
  setSidebarOpen,
}) {
  return (
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
  )
}

export default WorkspaceHeader
