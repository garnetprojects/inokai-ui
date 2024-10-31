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

    if (editIndex !== null) {
      const updatedNotes = notes.map((note, index) =>
        index === editIndex ? noteInput : note
      );
      setNotes(updatedNotes);
      setEditIndex(null);
    } else {
      setNotes([...notes, noteInput]);
    }

    setNoteInput('');
  };

  // Función para eliminar una nota
  const handleDeleteNote = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  // Función para iniciar la edición de una nota
  const handleEditNote = (index) => {
    setNoteInput(notes[index]);
    setEditIndex(index);
  };

  return (
    <Box
      position="fixed"
      right={0}
      top={0}
      bottom={0}
      width={isOpen ? '30%' : '50px'}
      bgcolor="black"
      color="white"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="start"
      p={2}
      style={{ transition: 'width 0.3s', zIndex: 1000 }}
    >
      {/* Pestaña en vertical en el borde derecho */}
      <Box
        display={isOpen ? 'none' : 'flex'}
        alignItems="center"
        justifyContent="center"
        height="100px"
        width="50px"
        bgcolor="gray"
        color="white"
        style={{
          writingMode: 'vertical-rl', // hace que el texto esté en vertical
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '4px 0 0 4px',
          position: 'absolute',
          left: '-50px',
          top: '20px',
        }}
        onClick={() => setIsOpen(true)}
      >
        Notas
      </Box>

      {/* Panel desplegable completo */}
      {isOpen && (
        <Box width="100%" mt={2}>
          <Button
            onClick={() => setIsOpen(false)}
            variant="contained"
            style={{ backgroundColor: 'gray', width: '100%' }}
          >
            Cerrar
          </Button>

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

          <Box mt={2}>
            <Typography variant="h6">Lista de Notas</Typography>
            {notes.map((note, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                my={1}
                bgcolor="gray"
                px={1}
                borderRadius="4px"
              >
                <Typography>{note}</Typography>
                <Box>
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
      )}
    </Box>
  );
};

export default NotesSidebar;
