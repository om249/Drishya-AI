
import {
  BrainCircuit,
  LogOut,
  UserRound,
} from 'lucide-react'

function WorkspaceSidebar({
  navigation,
  page,
  sidebarOpen,
  navigate,
  logout,
  setSidebarOpen,
}) {
  return (
    <>
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
    </>
  )
}

export default WorkspaceSidebar
