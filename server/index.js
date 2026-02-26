import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './db.js'
import tasksRouter from './routes/tasks.js'
import calendarRouter from './routes/calendar.js'
import canvasRouter from './routes/canvas.js'

const app = express()
const PORT = process.env.PORT || 3001

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/tasks', tasksRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/canvas', canvasRouter)

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: process.env.MONGODB_URI ? 'configured' : 'not configured',
        googleCalendar: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not configured',
        canvas: process.env.CANVAS_API_URL ? 'configured' : 'not configured'
    })
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
    console.log(`📋 Tasks API: http://localhost:${PORT}/api/tasks`)
    console.log(`📅 Calendar API: http://localhost:${PORT}/api/calendar`)
    console.log(`🎓 Canvas API: http://localhost:${PORT}/api/canvas`)
})
