function TaskList({ tasks, onAddTask, onEditTask, onDeleteTask, onUpdateTask }) {
    const sortedTasks = [...tasks].sort((a, b) => {
        // Sort by status (todo first, then progress, then done)
        const statusOrder = { todo: 0, progress: 1, done: 2 }
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status]
        }
        // Then by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        // Then by due date
        return new Date(a.dueDate) - new Date(b.dueDate)
    })

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">All Tasks</h1>
                    <p className="page-subtitle">Manage all your academic tasks in one place.</p>
                </div>
                <button className="btn btn-primary" onClick={onAddTask}>
                    + Add Task
                </button>
            </div>

            <div className="card">
                {sortedTasks.length > 0 ? (
                    <div className="task-list">
                        {sortedTasks.map(task => (
                            <div key={task.id} className="task-list-item">
                                <div
                                    className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                                    onClick={() => onUpdateTask(task.id, {
                                        status: task.status === 'done' ? 'todo' : 'done'
                                    })}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {task.status === 'done' && '✓'}
                                </div>
                                <div className="task-list-content" style={{ flex: 1 }}>
                                    <div className={`task-list-title ${task.status === 'done' ? 'completed' : ''}`}>
                                        {task.title}
                                    </div>
                                    {task.description && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                            {task.description.substring(0, 80)}{task.description.length > 80 ? '...' : ''}
                                        </div>
                                    )}
                                    <div className="task-list-details">
                                        <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                                        <span>📅 {task.dueDate || 'No date'}</span>
                                        {task.timeSlot && <span>🕐 {task.timeSlot}</span>}
                                        <span style={{
                                            textTransform: 'capitalize',
                                            color: task.status === 'done' ? 'var(--success)' :
                                                task.status === 'progress' ? 'var(--warning)' : 'var(--info)'
                                        }}>
                                            {task.status === 'progress' ? 'In Progress' : task.status}
                                        </span>
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
                        <p>No tasks yet. Add your first task to get started!</p>
                        <button className="btn btn-primary" onClick={onAddTask} style={{ marginTop: '1rem' }}>
                            + Add Task
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TaskList
