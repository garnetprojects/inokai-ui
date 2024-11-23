import React, { useState, useContext } from 'react';
import {
    Box,
    Button,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserContext } from '../context';
import { enqueueSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';

const NotesSidebar = () => {
    const { state } = useContext(UserContext);
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [noteInput, setNoteInput] = useState('');
    const [editNoteId, setEditNoteId] = useState(null);
    const { dataBase } = useParams();
    const centerInfo = state.userInfo.centerId;

    // Fetch notes with the centerInfo from the backend
    const { data: notes = [], isLoading, isError } = useQuery({
        queryKey: ['notes', centerInfo],
        queryFn: async () => {
            const res = await axios.get(`/notes/${dataBase}/`, { params: { centerInfo } });
            return res.data;
        }
    });

    // Mutation for adding/updating notes
    const saveNoteMutation = useMutation({
        mutationFn: async (noteData) => {
            const url = editNoteId ? `/notes/${dataBase}/${editNoteId}` : `/notes/${dataBase}`;
            const method = editNoteId ? 'put' : 'post';
            const res = await axios[method](url, noteData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notes', centerInfo]);
            enqueueSnackbar(editNoteId ? 'Nota actualizada' : 'Nota guardada', { variant: 'success' });
            setNoteInput('');
            setEditNoteId(null);
        },
        onError: () => {
            enqueueSnackbar('Error al guardar la nota', { variant: 'error' });
        }
    });

    // Mutation for deleting notes
    const deleteNoteMutation = useMutation({
        mutationFn: async (noteId) => {
            await axios.delete(`/notes/${dataBase}/${noteId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notes', centerInfo]);
            enqueueSnackbar('Nota eliminada', { variant: 'success' });
        },
        onError: () => {
            enqueueSnackbar('Error al eliminar la nota', { variant: 'error' });
        }
    });

    // Handlers
    const handleInputChange = (e) => setNoteInput(e.target.value);

    const handleSaveNote = () => {
        if (!noteInput.trim()) return;

        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${currentDate.getFullYear()}`;

        saveNoteMutation.mutate({
            text: noteInput,
            date: formattedDate,
            centerInfo
        });
    };

    const handleDeleteNote = (noteId) => deleteNoteMutation.mutate(noteId);

    const handleEditNote = (note) => {
        setNoteInput(note.text);
        setEditNoteId(note._id);
    };

    return (
        <>
            {/* Expandable panel */}
            <Box
                position="fixed"
                right={isOpen ? 0 : '-35%'}
                top={0}
                bottom={0}
                width={{ xs: '90%', sm: '50%', md: '30%' }} // Responsive widths
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
                {/* Sidebar button */}
                <Box
                    position="absolute"
                    left="-50px" // Attach tab to panel
                    top="165px"
                    height="100px"
                    width="50px"
                    bgcolor={notes.length > 0 ? 'red' : 'black'}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{
                        writingMode: 'vertical-rl',
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: '20px 0 0 20px',
                        zIndex: 10001,
                        transition: 'right 0.3s ease',
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {`NOTAS${notes.length > 0 ? ` (${notes.length})` : ''}`}
                </Box>

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
                    {editNoteId ? 'Actualizar' : 'Guardar'}
                </Button>

                <Box mt={2} width="100%" overflow="auto">
                    <Typography variant="h6">Lista de Notas</Typography>
                    {isLoading && <Typography>Cargando notas...</Typography>}
                    {isError && <Typography>Error al cargar notas</Typography>}
                    {notes.map((note) => (
                        <Box
                            key={note._id}
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
                            {/* Note date */}
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
                                    onClick={() => handleEditNote(note)}
                                    color="primary"
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleDeleteNote(note._id)}
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
