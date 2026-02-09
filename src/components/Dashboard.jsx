function Dashboard({ tasks, onAddTask, onEditTask, onDeleteTask, onUpdateTask }) {
    const today = new Date().toISOString().split('T')[0]

    const stats = {
        total: tasks.length,
        dueToday: tasks.filter(t => t.dueDate === today).length,
        inProgress: tasks.filter(t => t.status === 'progress').length,
        completed: tasks.filter(t => t.status === 'done').length
    }

    const upcomingTasks = tasks
        .filter(t => t.status !== 'done' && t.dueDate >= today)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5)

    const recentTasks = tasks
        .filter(t => t.status !== 'done')
        .slice(0, 3)

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back! Here's your academic overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Tasks</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value">{stats.dueToday}</div>
                    <div className="stat-label">Due Today</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value">{stats.inProgress}</div>
                    <div className="stat-label">In Progress</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value">{stats.completed}</div>
                    <div className="stat-label">Completed</div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }}>
                {/* Upcoming Tasks */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">📅 Upcoming Tasks</h2>
                        <button className="btn btn-primary" onClick={onAddTask}>
                            + Add Task
                        </button>
                    </div>

                    {upcomingTasks.length > 0 ? (
                        <div className="task-list">
                            {upcomingTasks.map(task => (
                                <div key={task.id} className="task-list-item">
                                    <div
                                        className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                                        onClick={() => onUpdateTask(task.id, {
                                            status: task.status === 'done' ? 'todo' : 'done'
                                        })}
                                    >
                                        {task.status === 'done' && '✓'}
                                    </div>
                                    <div className="task-list-content">
                                        <div className={`task-list-title ${task.status === 'done' ? 'completed' : ''}`}>
                                            {task.title}
                                        </div>
                                        <div className="task-list-details">
                                            <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                                            <span>📅 {task.dueDate}</span>
                                            {task.timeSlot && <span>🕐 {task.timeSlot}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-secondary btn-icon" onClick={() => onEditTask(task)}>✏️</button>
                                        <button className="btn btn-danger btn-icon" onClick={() => onDeleteTask(task.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📝</div>
                            <p>No upcoming tasks. Add one to get started!</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions / Mini Kanban */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">📋 Quick View</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {/* To Do Preview */}
                        <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--kanban-todo)' }}>
                            <div style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--kanban-todo)' }}>●</span> To Do
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {tasks.filter(t => t.status === 'todo').length} tasks
                            </div>
                        </div>

                        {/* In Progress Preview */}
                        <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--kanban-progress)' }}>
                            <div style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--kanban-progress)' }}>●</span> In Progress
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {tasks.filter(t => t.status === 'progress').length} tasks
                            </div>
                        </div>

                        {/* Done Preview */}
                        <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--kanban-done)' }}>
                            <div style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--kanban-done)' }}>●</span> Done
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {tasks.filter(t => t.status === 'done').length} tasks
                            </div>
                        </div>
                    </div>

                    {/* Google Calendar Placeholder */}
                    <div style={{
                        marginTop: 'var(--spacing-lg)',
                        padding: 'var(--spacing-lg)',
                        background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(52, 168, 83, 0.1))',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed rgba(255,255,255,0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📆</div>
                        <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Google Calendar</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Integration placeholder - Connect your Google account
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
