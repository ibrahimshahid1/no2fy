import { useState, useEffect } from 'react'

function IntegrationsPanel() {
    const [calendarStatus, setCalendarStatus] = useState({ configured: false, connected: false })
    const [canvasStatus, setCanvasStatus] = useState({ configured: false })
    const [courses, setCourses] = useState([])
    const [importing, setImporting] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        checkStatuses()

        // Check for OAuth callback params
        const params = new URLSearchParams(window.location.search)
        if (params.get('calendar_connected')) {
            setMessage('✅ Google Calendar connected successfully!')
            window.history.replaceState({}, '', window.location.pathname)
        } else if (params.get('calendar_error')) {
            setMessage('❌ Failed to connect Google Calendar: ' + params.get('calendar_error'))
            window.history.replaceState({}, '', window.location.pathname)
        }
    }, [])

    const checkStatuses = async () => {
        try {
            const [calRes, canvasRes] = await Promise.all([
                fetch('/api/calendar/status'),
                fetch('/api/canvas/status')
            ])
            setCalendarStatus(await calRes.json())
            setCanvasStatus(await canvasRes.json())
        } catch (error) {
            console.error('Error checking statuses:', error)
        }
    }

    const connectGoogleCalendar = () => {
        window.location.href = '/api/calendar/auth'
    }

    const disconnectGoogleCalendar = async () => {
        try {
            await fetch('/api/calendar/disconnect', { method: 'POST' })
            setCalendarStatus({ ...calendarStatus, connected: false })
            setMessage('Disconnected from Google Calendar')
        } catch (error) {
            console.error('Error disconnecting:', error)
        }
    }

    const loadCourses = async () => {
        try {
            const response = await fetch('/api/canvas/courses')
            const data = await response.json()
            if (response.ok) {
                setCourses(data)
            } else {
                setMessage('❌ ' + (data.error || 'Failed to load courses'))
            }
        } catch (error) {
            console.error('Error loading courses:', error)
        }
    }

    const importFromCanvas = async (courseId = null) => {
        setImporting(true)
        setMessage('')
        try {
            const response = await fetch('/api/canvas/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })
            })
            const data = await response.json()
            if (response.ok) {
                setMessage(`✅ ${data.message}`)
                // Trigger a refresh of tasks
                window.dispatchEvent(new Event('tasks-updated'))
            } else {
                setMessage('❌ ' + (data.error || 'Failed to import'))
            }
        } catch (error) {
            setMessage('❌ Failed to import from Canvas')
        }
        setImporting(false)
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Integrations</h1>
                <p className="page-subtitle">Connect external services to sync your academic content.</p>
            </div>

            {message && (
                <div style={{
                    padding: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)',
                    background: message.includes('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid ' + (message.includes('✅') ? 'var(--success)' : 'var(--danger)')
                }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                {/* Google Calendar Card */}
                <div className="card">
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-md)',
                                background: 'linear-gradient(135deg, #4285F4, #34A853)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                📅
                            </div>
                            <div>
                                <h2 className="card-title">Google Calendar</h2>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                                    Sync tasks with your Google Calendar
                                </p>
                            </div>
                        </div>
                        <div style={{
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: calendarStatus.connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            color: calendarStatus.connected ? 'var(--success)' : 'var(--text-muted)',
                            fontSize: '0.75rem',
                            fontWeight: 500
                        }}>
                            {calendarStatus.connected ? '● Connected' : '○ Not Connected'}
                        </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
                        {calendarStatus.configured
                            ? calendarStatus.connected
                                ? 'Your Google Calendar is connected. Tasks can be synced to your calendar.'
                                : 'Click Connect to authorize access to your Google Calendar.'
                            : 'To enable Google Calendar, add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.'}
                    </p>

                    {calendarStatus.configured ? (
                        calendarStatus.connected ? (
                            <button className="btn btn-secondary" onClick={disconnectGoogleCalendar}>
                                Disconnect
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={connectGoogleCalendar}>
                                🔗 Connect Google Calendar
                            </button>
                        )
                    ) : (
                        <button className="btn btn-secondary" disabled style={{ opacity: 0.6 }}>
                            Not Configured
                        </button>
                    )}
                </div>

                {/* Canvas LMS Card */}
                <div className="card">
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-md)',
                                background: 'linear-gradient(135deg, #E63946, #F4A261)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                🎓
                            </div>
                            <div>
                                <h2 className="card-title">Canvas LMS</h2>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                                    Import assignments from Canvas
                                </p>
                            </div>
                        </div>
                        <div style={{
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: canvasStatus.configured ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            color: canvasStatus.configured ? 'var(--success)' : 'var(--text-muted)',
                            fontSize: '0.75rem',
                            fontWeight: 500
                        }}>
                            {canvasStatus.configured ? '● Configured' : '○ Not Configured'}
                        </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
                        {canvasStatus.configured
                            ? `Connected to: ${canvasStatus.apiUrl}`
                            : 'To enable Canvas, add CANVAS_API_URL and CANVAS_ACCESS_TOKEN to your .env file.'}
                    </p>

                    {canvasStatus.configured ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={loadCourses}
                                >
                                    📚 Load Courses
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => importFromCanvas()}
                                    disabled={importing}
                                >
                                    {importing ? '⏳ Importing...' : '📥 Import All Assignments'}
                                </button>
                            </div>

                            {courses.length > 0 && (
                                <div style={{ marginTop: 'var(--spacing-md)' }}>
                                    <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem' }}>Your Courses:</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                        {courses.map(course => (
                                            <div
                                                key={course.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: 'var(--spacing-md)',
                                                    background: 'var(--bg-glass)',
                                                    borderRadius: 'var(--radius-md)'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{course.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{course.code}</div>
                                                </div>
                                                <button
                                                    className="btn btn-secondary btn-icon"
                                                    onClick={() => importFromCanvas(course.id)}
                                                    disabled={importing}
                                                    title="Import from this course"
                                                >
                                                    📥
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="btn btn-secondary" disabled style={{ opacity: 0.6 }}>
                            Not Configured
                        </button>
                    )}
                </div>

                {/* Setup Instructions */}
                <div className="card" style={{ borderColor: 'rgba(102, 126, 234, 0.3)' }}>
                    <h2 className="card-title" style={{ marginBottom: 'var(--spacing-lg)' }}>📋 Setup Instructions</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        <div>
                            <h4 style={{ color: 'var(--primary-color)', marginBottom: 'var(--spacing-sm)' }}>Google Calendar</h4>
                            <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.8 }}>
                                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener" style={{ color: 'var(--primary-color)' }}>Google Cloud Console</a></li>
                                <li>Create a new project (or select existing)</li>
                                <li>Enable the "Google Calendar API"</li>
                                <li>Create OAuth 2.0 credentials (Web application)</li>
                                <li>Add redirect URI: <code style={{ background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: '4px' }}>http://localhost:3001/api/calendar/callback</code></li>
                                <li>Copy Client ID & Secret to your .env file</li>
                            </ol>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--primary-color)', marginBottom: 'var(--spacing-sm)' }}>Canvas LMS</h4>
                            <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.8 }}>
                                <li>Log into your institution's Canvas</li>
                                <li>Go to Account → Settings</li>
                                <li>Scroll to "Approved Integrations"</li>
                                <li>Click "+ New Access Token"</li>
                                <li>Copy the token and your Canvas URL to .env</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IntegrationsPanel
