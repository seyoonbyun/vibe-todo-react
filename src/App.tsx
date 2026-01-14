
import { useState, useEffect } from 'react'
import './App.css'

interface Todo {
  _id: string
  task: string
}


  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // .env 환경변수에서 백엔드 URL을 불러옵니다.
  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/todos`

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) throw new Error('Failed to fetch todos')
      const data = await response.json()
      setTodos(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async () => {
    if (!newTask.trim()) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask.trim() })
      })
      if (!response.ok) throw new Error('Failed to add todo')
      const newTodo = await response.json()
      setTodos([...todos, newTodo])
      setNewTask('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const updateTodo = async (id: string) => {
    if (!editingTask.trim()) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: editingTask.trim() })
      })
      if (!response.ok) throw new Error('Failed to update todo')
      const updatedTodo = await response.json()
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo))
      setEditingId(null)
      setEditingTask('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const deleteTodo = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete todo')
      setTodos(todos.filter(todo => todo._id !== id))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (todo: Todo) => {
    setEditingId(todo._id)
    setEditingTask(todo.task)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingTask('')
  }

  return (
    <div className="App">
      <h1>Todo App</h1>
      {error && <p className="error">{error}</p>}
      <div className="input-container">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
          disabled={loading}
        />
        <button 
          className={`add-button ${newTask.trim() ? 'active' : ''}`} 
          onClick={addTodo} 
          disabled={loading || !newTask.trim()}
        >
          Add
        </button>
      </div>
      {loading && <p>Loading...</p>}
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo._id} className="todo-item">
            {editingId === todo._id ? (
              <>
                <input
                  type="text"
                  value={editingTask}
                  onChange={(e) => setEditingTask(e.target.value)}
                  disabled={loading}
                />
                <button onClick={() => updateTodo(todo._id)} disabled={loading || !editingTask.trim()}>
                  Save
                </button>
                <button onClick={cancelEditing} disabled={loading}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span>{todo.task}</span>
                <button onClick={() => startEditing(todo)} disabled={loading}>
                  Edit
                </button>
                <button onClick={() => deleteTodo(todo._id)} disabled={loading}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
