import { useEffect, useState } from 'react';
import Note from './components/Note';
import './index.css';
import noteService from './services/notes'

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className='error'>
      {message}
    </div>
  )
}

const Footer = () => {
  const footerStyle = {
    color: 'green',
    fontStyle: 'italic',
    fontSize: 16
  }
  return (
    <div style={footerStyle}>
      <br />
      <em>Note app, Department of Computer Science, University of Helsinki 2024</em>
    </div>
  )
}

const App = () => {
  
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleImportanceOf = id => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }
  
    noteService
    .update(id, changedNote)
    .then(returnedNote => {
      setNotes(notes.map(note => note.id !== id ? note : returnedNote))
    })
    .catch(error => {
      setErrorMessage(
        `Note '${note.content}' was already removed from server`
      )
      console.log(errorMessage)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      setNotes(notes.filter(n => n.id !== id))
    })
  }

  useEffect(()=>{
    noteService
    .getAll()
    .then(initialNotes => {
      setNotes(initialNotes)
    })
  },[])


  
  const notesToShow = showAll 
    ? notes 
    : notes.filter(note => note.important === true);

  const handleNoteChange = (event) => {
    console.log(event.target.value);
    setNewNote(event.target.value);
  };

  const addNote = (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5, 
    };
    noteService
    .create(noteObject)
    .then(returnedNote => {
      setNotes(notes.concat(returnedNote))
      setNewNote('')
    })
  };
  console.log(notes);

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage}></Notification>
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map(note => 
          <Note key={note.id} note={note} toggleImportance={()=>{toggleImportanceOf(note.id)}}/>
        )}
      </ul>
      <form onSubmit={addNote}>
        <input value={newNote} placeholder='new note' onChange={handleNoteChange} />
        <button type="submit">save</button>
      </form>
      <Footer></Footer>
    </div>
  );
};

export default App;
