import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    dueDate: {
        type: String,
        default: ''
    },
    timeSlot: {
        type: String,
        default: ''
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['todo', 'progress', 'done'],
        default: 'todo'
    },
    // Source tracking for integrations
    source: {
        type: String,
        enum: ['manual', 'canvas', 'calendar'],
        default: 'manual'
    },
    // External ID for Canvas assignments or Calendar events
    externalId: {
        type: String,
        default: null
    },
    // Canvas-specific fields
    canvasCourseId: {
        type: String,
        default: null
    },
    canvasCourseName: {
        type: String,
        default: null
    },
    // Google Calendar-specific fields
    calendarEventId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})

// Index for faster queries
taskSchema.index({ status: 1, dueDate: 1 })
taskSchema.index({ source: 1, externalId: 1 })

const Task = mongoose.model('Task', taskSchema)

export default Task
