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
      width={isOpen ? '30%' : '5%'}
      bgcolor="black"
      color="white"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="start"
      p={2}
      style={{ transition: 'width 0.3s' }}
    >
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="contained"
        style={{ backgroundColor: 'gray', width: '100%' }}
      >
        Notas
      </Button>

      {isOpen && (
        <Box width="100%" mt={2}>
          <TextField
            label="Nueva Nota"
            value={noteInput}
            onChange={handleInputChange}
            variant="outlined"
            fullWidth
            inputProps={{ maxLength: 100 }}
            style={{ backgroundColor: 'white', color: 'black' }}
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
