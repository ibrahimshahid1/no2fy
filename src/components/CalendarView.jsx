import { useState } from 'react'

function CalendarView({ tasks, onAddTask, onEditTask }) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const today = new Date()
    const isToday = (day) => {
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
    }

    const getTasksForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return tasks.filter(t => t.dueDate === dateStr)
    }

    // Generate calendar days
    const calendarDays = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        calendarDays.push({
            day: prevMonthLastDay - i,
            isCurrentMonth: false
        })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push({
            day,
            isCurrentMonth: true,
            isToday: isToday(day),
            tasks: getTasksForDay(day)
        })
    }

    // Next month days
    const remainingDays = 42 - calendarDays.length
    for (let day = 1; day <= remainingDays; day++) {
        calendarDays.push({
            day,
            isCurrentMonth: false
        })
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Calendar</h1>
                    <p className="page-subtitle">View your tasks on a monthly calendar.</p>
                </div>
                <button className="btn btn-primary" onClick={onAddTask}>
                    + Add Task
                </button>
            </div>

            <div className="card">
                {/* Calendar Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                            {monthNames[month]} {year}
                        </h2>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button className="btn btn-secondary" onClick={prevMonth}>←</button>
                        <button className="btn btn-secondary" onClick={goToToday}>Today</button>
                        <button className="btn btn-secondary" onClick={nextMonth}>→</button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid">
                    {/* Day Headers */}
                    {dayNames.map(day => (
                        <div key={day} className="calendar-header">
                            {day}
                        </div>
                    ))}

                    {/* Calendar Days */}
                    {calendarDays.map((dayInfo, index) => (
                        <div
                            key={index}
                            className={`calendar-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${dayInfo.isToday ? 'today' : ''}`}
                        >
                            <div className={`day-number ${dayInfo.isToday ? 'today' : ''}`}>
                                {dayInfo.day}
                            </div>
                            {dayInfo.tasks && dayInfo.tasks.slice(0, 3).map(task => (
                                <div
                                    key={task.id}
                                    className="calendar-task"
                                    onClick={() => onEditTask(task)}
                                    style={{
                                        background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.3)' :
                                            task.priority === 'medium' ? 'rgba(245, 158, 11, 0.3)' :
                                                'rgba(102, 126, 234, 0.3)'
                                    }}
                                >
                                    {task.title}
                                </div>
                            ))}
                            {dayInfo.tasks && dayInfo.tasks.length > 3 && (
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', paddingLeft: '4px' }}>
                                    +{dayInfo.tasks.length - 3} more
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Google Calendar Placeholder */}
                <div style={{
                    marginTop: 'var(--spacing-xl)',
                    padding: 'var(--spacing-lg)',
                    background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(52, 168, 83, 0.1))',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-lg)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📆</div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Connect Google Calendar</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Sync your academic schedule with Google Calendar
                        </div>
                        <button className="btn btn-secondary" disabled style={{ opacity: 0.6 }}>
                            🔗 Connect (Coming Soon)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CalendarView
