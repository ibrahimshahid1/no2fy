import { useState } from 'react'

function KanbanBoard({ tasks, onAddTask, onEditTask, onDeleteTask, onUpdateTask }) {
    const [draggedTask, setDraggedTask] = useState(null)

    const columns = [
        { id: 'todo', title: 'To Do', dotClass: 'todo' },
        { id: 'progress', title: 'In Progress', dotClass: 'progress' },
        { id: 'done', title: 'Done', dotClass: 'done' }
    ]

    const handleDragStart = (e, task) => {
        setDraggedTask(task)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e, status) => {
        e.preventDefault()
        if (draggedTask && draggedTask.status !== status) {
            onUpdateTask(draggedTask.id, { status })
        }
        setDraggedTask(null)
    }

    const handleDragEnd = () => {
        setDraggedTask(null)
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Kanban Board</h1>
                    <p className="page-subtitle">Drag and drop tasks to organize your workflow.</p>
                </div>
                <button className="btn btn-primary" onClick={onAddTask}>
                    + Add Task
                </button>
            </div>

            <div className="kanban-board">
                {columns.map(column => {
                    const columnTasks = tasks.filter(t => t.status === column.id)

                    return (
                        <div
                            key={column.id}
                            className="kanban-column"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            <div className="kanban-header">
                                <div className="kanban-title">
                                    <span className={`kanban-dot ${column.dotClass}`}></span>
                                    {column.title}
                                </div>
                                <span className="kanban-count">{columnTasks.length}</span>
                            </div>

                            <div className="kanban-tasks">
                                {columnTasks.length > 0 ? (
                                    columnTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={`task-card ${draggedTask?.id === task.id ? 'dragging' : ''}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task)}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <div className="task-title">{task.title}</div>
                                            {task.description && (
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                    {task.description.substring(0, 60)}{task.description.length > 60 ? '...' : ''}
                                                </div>
                                            )}
                                            <div className="task-meta">
                                                <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                                                {task.dueDate && (
                                                    <span className="task-time">📅 {task.dueDate}</span>
                                                )}
                                            </div>
                                            {task.timeSlot && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                    🕐 {task.timeSlot}
                                                </div>
                                            )}
                                            <div className="task-actions">
                                                <button className="btn btn-secondary btn-icon" onClick={() => onEditTask(task)}>✏️</button>
                                                <button className="btn btn-danger btn-icon" onClick={() => onDeleteTask(task.id)}>🗑️</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p style={{ fontSize: '0.875rem' }}>No tasks</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default KanbanBoard
