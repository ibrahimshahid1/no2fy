import express from 'express'
import cors from 'cors'
import tasksRouter from './routes/tasks.js'

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/tasks', tasksRouter)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
    console.log(`📋 Tasks API: http://localhost:${PORT}/api/tasks`)
})
