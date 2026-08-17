import noteService from './services/noteService.js'
import loginService from './services/login.js'
import Note from './component/Notes.jsx'
import { useState, useEffect } from 'react'
import Notification from './component/Notification.jsx'
import Footer from './component/Footer.jsx'
import LoginForm from './component/Login.jsx'
import Togglable from './component/Togglable.jsx' // Added Togglable import

// It's best practice to define components outside of other components 
// to prevent them from re-mounting on every render.
const NoteForm = ({ onSubmit, handleChange, value }) => {
  return (
    <div>
      <h2>Create a new note</h2>
      <form onSubmit={onSubmit}>
        <input
          value={value}
          onChange={handleChange}
        />
        <button type="submit">save</button>
      </form>
    </div>
  )
}

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNotes, setNewNotes] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('') 
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(false)

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => setNotes(initialNotes))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  const handleLogin = async event => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })

      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user))
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      setLoginVisible(false) 
    } catch {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteappUser')
    setUser(null)
    noteService.setToken(null)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const newObject = {
      content: newNotes,
      important: Math.random() > 0.5,
    }
    noteService
      .create(newObject)
      .then(returnedObject => setNotes(notes.concat(returnedObject)))
    setNewNotes('')
  }

  const handleNoteChange = e => {
    setNewNotes(e.target.value)
  }

  const filteredNotes = showAll 
    ? notes 
    : notes.filter(note => note.important)

  const toggleImportant = id => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote)
      .then(returnedObject => {
        setNotes(notes.map(n => n.id === id ? returnedObject : n))
      })
      .catch(() => {
        setErrorMessage(`Note '${note.content}' was already removed from server`)
        setTimeout(() => setErrorMessage(null), 5000)
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  const loginForm = () => {
    const hideWhenVisible = { display: loginVisible ? 'none' : '' }
    const showWhenVisible = { display: loginVisible ? '' : 'none' }

    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)}>log in</button>
        </div>
        <div style={showWhenVisible}>
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
          <button onClick={() => setLoginVisible(false)}>cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      {!user && loginForm()}
      {user && (
        <div>
          <p>{user.name} logged in <button onClick={handleLogout}>logout</button></p>
          
          {/* Properly nested Togglable and NoteForm components */}
          <Togglable buttonLabel="new note">
            <NoteForm
              onSubmit={handleSubmit}
              value={newNotes}
              handleChange={handleNoteChange}
            />
          </Togglable>
        </div>
      )}

      <button onClick={() => setShowAll(!showAll)}>
        show {showAll ? 'important' : 'all'}
      </button>
      <ul>
        {filteredNotes.map(note => (
          <Note 
            key={note.id} 
            note={note}
            toggleImportant={() => toggleImportant(note.id)} 
          />
        ))}
      </ul>
      <Footer />
    </div>
  )
}

export default App