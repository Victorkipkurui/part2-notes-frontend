import { useEffect, useState } from 'react';
import './index.css';
import noteService from './services/notes';

const Notification = ({ message }) => {
  if (message === null) {
    return null;
  }

  return (
    <div className='error'>
      {message}
    </div>
  );
};

const Note = ({ note, toggleImportance, handleDelete }) => {
  const label = note.important
    ? 'make not important' : 'make important'

  return (
    <tr className='notes'>
     <td> {note.content} </td>
     <td><button className='toggle' onClick={toggleImportance}>{label}</button></td>
     <td><button className='del' onClick={handleDelete}>Delete</button></td>
    </tr>
  )
}

const Footer = () => {
  const footerStyle = {
    color: 'green',
    fontStyle: 'italic',
    fontSize: 16
  };
  return (
    <div style={footerStyle}>
      <br />
      <em>Note app, Department of Computer Science, University of Helsinki 2024</em>
    </div>
  );
};

const App = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const toggleImportanceOf = (id) => {
    const note = notes.find(n => n.id === id);
    const changedNote = { ...note, important: !note.important };

    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id !== id ? note : returnedNote));
      })
      .catch(error => {
        setErrorMessage(
          `Note '${note.content}' was already removed from server`
        );
        console.error(error);
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
        setNotes(notes.filter(n => n.id !== id));
      });
  };
  const handleDelete = (id) => {
    const noteToDelete = notes.find((n) => n.id === id);

    if (noteToDelete && window.confirm(`Delete ${noteToDelete.content}?`)) {
      noteService
        .deleteNote(id)
        .then(() => {
          const updatedNotes = notes.filter((note) => note.id !== id);
          setNotes(updatedNotes);
          console.log(notes);
        })
        .catch((error) => {
          setErrorMessage(`Failed to delete '${noteToDelete.content}' due to server error.`);
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
          console.log(errorMessage);
        });
    }
  };
  

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes);
      });
  }, []);

  const notesToShow = showAll 
    ? notes 
    : notes.filter(note => note.important === true);

  const handleNoteChange = (event) => {
    setNewNote(event.target.value);
  };

  const addNote = (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNote.trim(),
      important: Math.random() < 0.5,
    };

    if (noteObject.content) {
      noteService
        .create(noteObject)
        .then(returnedNote => {
          setNotes(notes.concat(returnedNote));
          setNewNote('');
        });
    } else {
      setErrorMessage('Note content cannot be empty');
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <table>
        <tbody>
        {notesToShow.map(note =>
          <Note key={note.id} note={note} handleDelete={()=>{handleDelete(note.id)}} toggleImportance={() => toggleImportanceOf(note.id)} />
        )}
        </tbody>
      </table>
      <form onSubmit={addNote}>
        <input value={newNote} placeholder='new note' onChange={handleNoteChange} />
        <button type="submit">save</button>
      </form>
      <Footer />
    </div>
  );
};

export default App;
