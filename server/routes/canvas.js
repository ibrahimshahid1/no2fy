import express from 'express'
import axios from 'axios'
import Task from '../models/Task.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Create axios instance for Canvas API
const getCanvasApi = () => {
    const baseURL = process.env.CANVAS_API_URL
    const token = process.env.CANVAS_ACCESS_TOKEN

    if (!baseURL || !token) {
        return null
    }

    return axios.create({
        baseURL: `${baseURL}/api/v1`,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

// Check Canvas configuration status
router.get('/status', (req, res) => {
    const isConfigured = !!(process.env.CANVAS_API_URL && process.env.CANVAS_ACCESS_TOKEN)

    res.json({
        configured: isConfigured,
        apiUrl: process.env.CANVAS_API_URL || null,
        message: isConfigured
            ? 'Canvas is configured and ready'
            : 'Canvas not configured. Add CANVAS_API_URL and CANVAS_ACCESS_TOKEN to .env'
    })
})

// Get enrolled courses
router.get('/courses', async (req, res) => {
    const api = getCanvasApi()

    if (!api) {
        return res.status(400).json({
            error: 'Canvas not configured',
            setup: 'Add CANVAS_API_URL and CANVAS_ACCESS_TOKEN to your .env file'
        })
    }

    try {
        const response = await api.get('/courses', {
            params: {
                enrollment_state: 'active',
                per_page: 50
            }
        })

        const courses = response.data
            .filter(course => course.name) // Filter out unnamed courses
            .map(course => ({
                id: course.id,
                name: course.name,
                code: course.course_code,
                enrollmentTerm: course.enrollment_term_id
            }))

        res.json(courses)
    } catch (error) {
        console.error('Error fetching courses:', error.response?.data || error.message)
        res.status(500).json({ error: 'Failed to fetch courses from Canvas' })
    }
})

// Get assignments for a course (or all courses)
router.get('/assignments', async (req, res) => {
    const api = getCanvasApi()

    if (!api) {
        return res.status(400).json({ error: 'Canvas not configured' })
    }

    const { courseId } = req.query

    try {
        let assignments = []

        if (courseId) {
            // Get assignments for specific course
            const response = await api.get(`/courses/${courseId}/assignments`, {
                params: {
                    per_page: 50,
                    order_by: 'due_at'
                }
            })
            assignments = response.data.map(a => ({ ...a, course_id: courseId }))
        } else {
            // Get all upcoming assignments
            const response = await api.get('/users/self/upcoming_events', {
                params: { per_page: 50 }
            })
            assignments = response.data.filter(e => e.type === 'assignment')
        }

        const formattedAssignments = assignments
            .filter(a => a.name && a.due_at) // Only assignments with name and due date
            .map(assignment => ({
                id: assignment.id,
                title: assignment.name,
                description: assignment.description || '',
                dueDate: assignment.due_at,
                courseId: assignment.course_id,
                courseName: assignment.context_name || '',
                pointsPossible: assignment.points_possible,
                submissionTypes: assignment.submission_types,
                htmlUrl: assignment.html_url
            }))

        res.json(formattedAssignments)
    } catch (error) {
        console.error('Error fetching assignments:', error.response?.data || error.message)
        res.status(500).json({ error: 'Failed to fetch assignments from Canvas' })
    }
})

// Import Canvas assignments as tasks
router.post('/import', async (req, res) => {
    const api = getCanvasApi()

    if (!api) {
        return res.status(400).json({ error: 'Canvas not configured' })
    }

    const { courseId, assignmentIds } = req.body

    try {
        // Fetch assignments to import
        let assignmentsToImport = []

        if (assignmentIds && assignmentIds.length > 0) {
            // Import specific assignments
            for (const id of assignmentIds) {
                try {
                    const response = await api.get(`/courses/${courseId}/assignments/${id}`)
                    assignmentsToImport.push(response.data)
                } catch (e) {
                    console.error(`Failed to fetch assignment ${id}:`, e.message)
                }
            }
        } else if (courseId) {
            // Import all assignments from a course
            const response = await api.get(`/courses/${courseId}/assignments`, {
                params: { per_page: 50, order_by: 'due_at' }
            })
            assignmentsToImport = response.data.filter(a => a.due_at)
        } else {
            // Import upcoming assignments
            const response = await api.get('/users/self/upcoming_events', {
                params: { per_page: 50 }
            })
            assignmentsToImport = response.data.filter(e => e.type === 'assignment')
        }

        // Get course name if we have courseId
        let courseName = ''
        if (courseId) {
            try {
                const courseResponse = await api.get(`/courses/${courseId}`)
                courseName = courseResponse.data.name || ''
            } catch (e) {
                console.log('Could not fetch course name')
            }
        }

        const imported = []

        for (const assignment of assignmentsToImport) {
            if (!assignment.name) continue

            const dueDate = assignment.due_at
                ? new Date(assignment.due_at).toISOString().split('T')[0]
                : ''
            const timeSlot = assignment.due_at
                ? new Date(assignment.due_at).toTimeString().slice(0, 5)
                : ''

            // Check if already imported (by external ID)
            const existingTask = await Task.findOne({
                source: 'canvas',
                externalId: assignment.id.toString()
            }).catch(() => null)

            if (existingTask) {
                console.log(`Skipping already imported assignment: ${assignment.name}`)
                continue
            }

            const taskData = {
                title: assignment.name,
                description: assignment.description
                    ? assignment.description.replace(/<[^>]*>/g, '').substring(0, 500) // Strip HTML
                    : '',
                dueDate,
                timeSlot,
                priority: 'medium',
                status: 'todo',
                source: 'canvas',
                externalId: assignment.id.toString(),
                canvasCourseId: (assignment.course_id || courseId || '').toString(),
                canvasCourseName: assignment.context_name || courseName
            }

            try {
                // Try to save to MongoDB
                const newTask = new Task(taskData)
                await newTask.save()
                imported.push({ id: newTask._id.toString(), ...newTask.toObject() })
            } catch (dbError) {
                // Fallback: return task with generated ID
                imported.push({ id: uuidv4(), ...taskData })
            }
        }

        res.json({
            success: true,
            imported: imported.length,
            tasks: imported,
            message: `Imported ${imported.length} assignment(s) from Canvas`
        })
    } catch (error) {
        console.error('Error importing assignments:', error.response?.data || error.message)
        res.status(500).json({ error: 'Failed to import assignments from Canvas' })
    }
})

export default router
