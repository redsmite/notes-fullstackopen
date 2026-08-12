import noteService from './services/noteService.js'
import loginService from './services/login'
import Note from './component/Notes.jsx'
import {useState, useEffect} from 'react'
import Notification from './component/Notification.jsx'
import Footer from './component/Footer.jsx'

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNotes, setNewNotes] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('') 
  const [user, setUser] = useState(null)

  useEffect(()=>{
    noteService
      .getAll()
      .then(initialNotes=>
        setNotes(initialNotes)
    )
  },[])

  const handleLogin = async event => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    const newObject = {
      content: newNotes,
      important: Math.random() > 0.5,
    }
    noteService
      .create(newObject)
      .then(returnedObject=>
        setNotes(notes.concat(returnedObject))
      )
    setNewNotes('')
  }

  const handleNoteChange = e =>{
    const input = e.target.value
    setNewNotes(input)
  }

  const filteredNotes = showAll ?
    notes :
    notes.filter(filter=>filter.important)

  const toggleImportant = id => {
    const note = notes.find(n=>n.id===id)
    const changedNote = {...note, important: !note.important}

    noteService
      .update(id,changedNote)
      .then(returnedObject=>
        setNotes(notes.map(n=>n.id===id?returnedObject:n))
      )
      .catch(error => {
        setErrorMessage(
          `Note '${note.content}' was already removed from server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        <label>
          username
          <input
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  )

  const noteForm = () => (
    <form onSubmit={handleSubmit}>
      <input value={newNotes} onChange={handleNoteChange} />
      <button type="submit">save</button>
    </form>
  )

  return(
    <div>
      <h1>Notes</h1>
      <Notification/>

      {!user && loginForm()}
      {user && (
        <div>
          <p>{user.name} logged in</p>
          {noteForm()}
        </div>
      )}

      <button onClick={()=>setShowAll(!showAll)}>show {showAll? 'important' : 'all'}</button>
      <ul>
        {filteredNotes.map(note=>
          <Note 
            key={note.id} 
            note={note}
            toggleImportant={()=>toggleImportant(note.id)}/> 
        )}
      </ul>
      <Footer />
    </div>
  )
}

export default App;