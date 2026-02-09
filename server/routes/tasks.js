import express from 'express'
import Task from '../models/Task.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// In-memory fallback storage (used when MongoDB is not available)
let inMemoryTasks = [
    {
        id: uuidv4(),
        title: 'Complete CS 101 Assignment',
        description: 'Finish the programming assignment on data structures',
        dueDate: new Date().toISOString().split('T')[0],
        timeSlot: '14:00',
        priority: 'high',
        status: 'progress',
        source: 'manual'
    },
    {
        id: uuidv4(),
        title: 'Study for Math Exam',
        description: 'Review chapters 5-8 on calculus',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeSlot: '09:00',
        priority: 'high',
        status: 'todo',
        source: 'manual'
    },
    {
        id: uuidv4(),
        title: 'Read Biology Chapter',
        description: 'Chapter 12: Cell Division',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeSlot: '16:00',
        priority: 'medium',
        status: 'todo',
        source: 'manual'
    }
]

// Check if MongoDB is connected
const isMongoConnected = () => {
    try {
        return Task.db?.readyState === 1
    } catch {
        return false
    }
}

// GET all tasks
router.get('/', async (req, res) => {
    try {
        if (isMongoConnected()) {
            const tasks = await Task.find().sort({ createdAt: -1 })
            // Convert _id to id for frontend compatibility
            const formattedTasks = tasks.map(t => ({
                id: t._id.toString(),
                ...t.toObject(),
                _id: undefined
            }))
            res.json(formattedTasks)
        } else {
            res.json(inMemoryTasks)
        }
    } catch (error) {
        console.error('Error fetching tasks:', error)
        res.status(500).json({ error: 'Failed to fetch tasks' })
    }
})

// GET single task
router.get('/:id', async (req, res) => {
    try {
        if (isMongoConnected()) {
            const task = await Task.findById(req.params.id)
            if (!task) {
                return res.status(404).json({ error: 'Task not found' })
            }
            res.json({ id: task._id.toString(), ...task.toObject() })
        } else {
            const task = inMemoryTasks.find(t => t.id === req.params.id)
            if (!task) {
                return res.status(404).json({ error: 'Task not found' })
            }
            res.json(task)
        }
    } catch (error) {
        console.error('Error fetching task:', error)
        res.status(500).json({ error: 'Failed to fetch task' })
    }
})

// POST create task
router.post('/', async (req, res) => {
    try {
        const { title, description, dueDate, timeSlot, priority, status, source } = req.body

        if (!title) {
            return res.status(400).json({ error: 'Title is required' })
        }

        if (isMongoConnected()) {
            const newTask = new Task({
                title,
                description: description || '',
                dueDate: dueDate || '',
                timeSlot: timeSlot || '',
                priority: priority || 'medium',
                status: status || 'todo',
                source: source || 'manual'
            })
            await newTask.save()
            res.status(201).json({ id: newTask._id.toString(), ...newTask.toObject() })
        } else {
            const newTask = {
                id: uuidv4(),
                title,
                description: description || '',
                dueDate: dueDate || '',
                timeSlot: timeSlot || '',
                priority: priority || 'medium',
                status: status || 'todo',
                source: source || 'manual',
                createdAt: new Date().toISOString()
            }
            inMemoryTasks.push(newTask)
            res.status(201).json(newTask)
        }
    } catch (error) {
        console.error('Error creating task:', error)
        res.status(500).json({ error: 'Failed to create task' })
    }
})

// PUT update task
router.put('/:id', async (req, res) => {
    try {
        if (isMongoConnected()) {
            const task = await Task.findByIdAndUpdate(
                req.params.id,
                { ...req.body, updatedAt: new Date() },
                { new: true }
            )
            if (!task) {
                return res.status(404).json({ error: 'Task not found' })
            }
            res.json({ id: task._id.toString(), ...task.toObject() })
        } else {
            const taskIndex = inMemoryTasks.findIndex(t => t.id === req.params.id)
            if (taskIndex === -1) {
                return res.status(404).json({ error: 'Task not found' })
            }
            const updatedTask = {
                ...inMemoryTasks[taskIndex],
                ...req.body,
                id: inMemoryTasks[taskIndex].id,
                updatedAt: new Date().toISOString()
            }
            inMemoryTasks[taskIndex] = updatedTask
            res.json(updatedTask)
        }
    } catch (error) {
        console.error('Error updating task:', error)
        res.status(500).json({ error: 'Failed to update task' })
    }
})

// DELETE task
router.delete('/:id', async (req, res) => {
    try {
        if (isMongoConnected()) {
            const task = await Task.findByIdAndDelete(req.params.id)
            if (!task) {
                return res.status(404).json({ error: 'Task not found' })
            }
        } else {
            const taskIndex = inMemoryTasks.findIndex(t => t.id === req.params.id)
            if (taskIndex === -1) {
                return res.status(404).json({ error: 'Task not found' })
            }
            inMemoryTasks.splice(taskIndex, 1)
        }
        res.status(204).send()
    } catch (error) {
        console.error('Error deleting task:', error)
        res.status(500).json({ error: 'Failed to delete task' })
    }
})

export default router
