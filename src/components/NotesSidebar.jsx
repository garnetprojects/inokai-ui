// src/components/NotesSidebar.js
import React, { useState } from 'react';
import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const NotesSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Función para manejar el cambio en el cuadro de texto de notas
  const handleInputChange = (e) => setNoteInput(e.target.value);

  // Función para agregar o actualizar una nota
  const handleSaveNote = () => {
    if (!noteInput.trim()) return;

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${currentDate.getFullYear()}`;

    if (editIndex !== null) {
      const updatedNotes = notes.map((note, index) =>
        index === editIndex ? { ...note, text: noteInput } : note
      );
      setNotes(updatedNotes);
      setEditIndex(null);
    } else {
      setNotes([...notes, { text: noteInput, date: formattedDate }]);
    }

    setNoteInput('');
  };

  // Función para eliminar una nota
  const handleDeleteNote = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  // Función para iniciar la edición de una nota
  const handleEditNote = (index) => {
    setNoteInput(notes[index].text);
    setEditIndex(index);
  };

  return (
    <>
      {/* Pestaña en vertical en el borde derecho */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100px"
        width="50px"
        bgcolor={notes.length > 0 ? 'red' : 'black'}
        color="white"
        style={{
          writingMode: 'vertical-rl',
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '20px 0 0 20px',
          position: 'fixed',
          right: isOpen ? '32.4%' : 0,
          top: '165px',
          zIndex: 10000,
          transition: 'right 0.3s ease',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {`NOTAS${notes.length > 0 ? ` (${notes.length})` : ''}`}
      </Box>

      {/* Panel desplegable completo */}
      <Box
        position="fixed"
        right={isOpen ? 0 : '-32.5%'}
        top={0}
        bottom={0}
        width="30%"
        bgcolor="white"
        color="black"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="start"
        p={2}
        style={{
          transition: 'right 0.3s ease',
          zIndex: 9999,
          borderLeft: '3px solid black',
        }}
      >
        <TextField
          label="Nueva Nota"
          value={noteInput}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          inputProps={{ maxLength: 100 }}
          style={{ backgroundColor: 'white', color: 'black', marginTop: '8px' }}
        />
        <Button
          onClick={handleSaveNote}
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '8px' }}
        >
          {editIndex !== null ? 'Actualizar' : 'Guardar'}
        </Button>

        <Box mt={2} width="100%" overflow="auto">
          <Typography variant="h6">Lista de Notas</Typography>
          {notes.map((note, index) => (
            <Box
              key={index}
              display="flex"
              flexDirection="column"
              my={1}
              bgcolor="white"
              boxShadow={2}
              px={1}
              py={1}
              borderRadius="4px"
              style={{
                overflowWrap: 'break-word',
                width: '95.5%',
                border: '1px solid gray',
              }}
            >
              {/* Fecha de la nota */}
              <Box
                display="flex"
                justifyContent="center"
                bgcolor="black"
                color="white"
                width="fit-content"
                px={1}
                py={0.5}
                borderRadius="4px"
                style={{
                  fontSize: '12px',
                  marginBottom: '4px',
                }}
              >
                {note.date}
              </Box>
              <Typography style={{ wordBreak: 'break-word', maxWidth: '100%' }}>
                {note.text}
              </Typography>
              <Box display="flex" justifyContent="flex-end">
                <IconButton
                  onClick={() => handleEditNote(index)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteNote(index)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default NotesSidebar;
