import { useState, useEffect } from 'react'

function TaskModal({ task, onSave, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        timeSlot: '',
        priority: 'medium',
        status: 'todo'
    })

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                dueDate: task.dueDate || '',
                timeSlot: task.timeSlot || '',
                priority: task.priority || 'medium',
                status: task.status || 'todo'
            })
        }
    }, [task])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.title.trim()) return
        onSave(formData)
    }

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{task ? 'Edit Task' : 'Add New Task'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Task Title *</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            placeholder="e.g., Complete CS homework"
                            value={formData.title}
                            onChange={handleChange}
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            placeholder="Add details about this task..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                className="form-input"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Time Slot</label>
                            <input
                                type="time"
                                name="timeSlot"
                                className="form-input"
                                value={formData.timeSlot}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                name="priority"
                                className="form-select"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="low">🟢 Low</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="high">🔴 High</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="todo">📋 To Do</option>
                                <option value="progress">🔄 In Progress</option>
                                <option value="done">✅ Done</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {task ? 'Save Changes' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TaskModal
