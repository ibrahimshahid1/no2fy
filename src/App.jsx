import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import KanbanBoard from './components/KanbanBoard'
import TaskList from './components/TaskList'
import CalendarView from './components/CalendarView'
import TaskModal from './components/TaskModal'

function App() {
  const [tasks, setTasks] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Fetch tasks from API
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const addTask = async (task) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })
      const newTask = await response.json()
      setTasks([...tasks, newTask])
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const updateTask = async (id, updates) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const updatedTask = await response.json()
      setTasks(tasks.map(t => t.id === id ? updatedTask : t))
      setIsModalOpen(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (id) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      setTasks(tasks.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const openAddModal = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const openEditModal = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData)
    } else {
      addTask(taskData)
    }
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <Dashboard
                tasks={tasks}
                onAddTask={openAddModal}
                onEditTask={openEditModal}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
              />
            } />
            <Route path="/kanban" element={
              <KanbanBoard
                tasks={tasks}
                onAddTask={openAddModal}
                onEditTask={openEditModal}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
              />
            } />
            <Route path="/tasks" element={
              <TaskList
                tasks={tasks}
                onAddTask={openAddModal}
                onEditTask={openEditModal}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
              />
            } />
            <Route path="/calendar" element={
              <CalendarView
                tasks={tasks}
                onAddTask={openAddModal}
                onEditTask={openEditModal}
              />
            } />
          </Routes>
        </main>

        {isModalOpen && (
          <TaskModal
            task={editingTask}
            onSave={handleSaveTask}
            onClose={() => {
              setIsModalOpen(false)
              setEditingTask(null)
            }}
          />
        )}
      </div>
    </BrowserRouter>
  )
}

export default App
