import { NavLink } from 'react-router-dom'

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">📚</div>
                <span className="sidebar-logo-text">Academic Hub</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">🏠</span>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/kanban" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📋</span>
                    <span>Kanban Board</span>
                </NavLink>

                <NavLink to="/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">✅</span>
                    <span>All Tasks</span>
                </NavLink>

                <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📅</span>
                    <span>Calendar</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'var(--primary-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem'
                    }}>
                        👤
                    </div>
                    <div>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Student</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic Mode</div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
