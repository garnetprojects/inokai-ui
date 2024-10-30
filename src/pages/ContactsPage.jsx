import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getError } from '../utils/getError';
import { UserContext } from '../context';

const ContactPage = () => {
    const { dataBase } = useParams();
    const queryClient = useQueryClient();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const { state } = useContext(UserContext);
    const centerId = state.userInfo?.centerInfo;

    const [newContact, setNewContact] = useState({
        firstName: '',
        lastName: '',
        phone1: '',
        phone2: '',
        email: '',
        observations: '',
        centerIds: [],
    });

    const { data: contacts = [], isLoading, isError } = useQuery(
        ['contacts', dataBase, centerId],
        () =>
            axios.get(`/api/contacts/${dataBase}`, {
                params: { centerId },
            })
    );

    const createContactMutation = useMutation(newContact =>
        axios.post(`/api/contacts/${dataBase}`, newContact)
    );

    const updateContactMutation = useMutation(updatedContact =>
        axios.put(`/api/contacts/${dataBase}/${selectedContact._id}`, updatedContact)
    );

    const deleteContactMutation = useMutation(contactId =>
        axios.delete(`/api/contacts/${dataBase}/${contactId}`)
    );

    const handleOpenDialog = (contact = null) => {
        setSelectedContact(contact);
        setNewContact(contact || {
            firstName: '',
            lastName: '',
            phone1: '',
            phone2: '',
            email: '',
            observations: '',
            centerIds: [],
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedContact(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const contactToSubmit = {
            ...newContact,
            centerIds: [centerId],
        };

        if (selectedContact) {
            await updateContactMutation.mutateAsync(contactToSubmit);
        } else {
            await createContactMutation.mutateAsync(contactToSubmit);
        }

        queryClient.invalidateQueries(['contacts', dataBase, centerId]);
        handleCloseDialog();
    };

    const handleDelete = async (contactId) => {
        await deleteContactMutation.mutateAsync(contactId);
        queryClient.invalidateQueries(['contacts', dataBase]);
    };

    if (isLoading) return <Typography>Loading...</Typography>;
    if (isError) return <Typography>{getError(isError)}</Typography>;

    return (
        <Box sx={{ padding: 2 }}>
            <Button variant="contained" onClick={() => handleOpenDialog()}>
                Add Contact
            </Button>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Phone 1</TableCell>
                            <TableCell>Phone 2</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Observations</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contacts.map((contact) => (
                            <TableRow key={contact._id}>
                                <TableCell>{contact.firstName}</TableCell>
                                <TableCell>{contact.lastName}</TableCell>
                                <TableCell>{contact.phone1}</TableCell>
                                <TableCell>{contact.phone2}</TableCell>
                                <TableCell>{contact.email}</TableCell>
                                <TableCell>{contact.observations}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleOpenDialog(contact)}>Edit</Button>
                                    <Button onClick={() => handleDelete(contact._id)} color="error">Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{selectedContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="First Name"
                        fullWidth
                        value={newContact.firstName}
                        onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Last Name"
                        fullWidth
                        value={newContact.lastName}
                        onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Phone 1"
                        fullWidth
                        value={newContact.phone1}
                        onChange={(e) => setNewContact({ ...newContact, phone1: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Phone 2"
                        fullWidth
                        value={newContact.phone2}
                        onChange={(e) => setNewContact({ ...newContact, phone2: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        fullWidth
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Observations"
                        fullWidth
                        value={newContact.observations}
                        onChange={(e) => setNewContact({ ...newContact, observations: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit}>{selectedContact ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ContactPage;
