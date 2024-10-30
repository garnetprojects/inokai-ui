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
    CircularProgress,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getError } from '../utils/getError';
import { UserContext } from '../context';
import { enqueueSnackbar } from 'notistack';

const ContactPage = () => {
    const { dataBase } = useParams();
    const queryClient = useQueryClient();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const { state } = useContext(UserContext);

    const centerInfo = state.userInfo.centerId;

    const [newContact, setNewContact] = useState({
        firstName: '',
        lastName: '',
        phone1: '',
        phone2: '',
        email: '',
        observations: '',
        centerInfo: [centerInfo],
    });

    if(centerInfo !== null || "null" || undefined){}
    // Fetch contacts for the selected database
    const { data: contacts = [], isLoading, isError, error } = useQuery({
        queryKey: ['contacts', dataBase, centerInfo],
        queryFn: async () => {
            const res = await axios.get(`/contacts/${dataBase}`, {
                params: { centerInfo },
            });
            return res.data;
        },
    });
  }else{
        // Fetch contacts for the selected database
        const { data: contacts = [], isLoading, isError, error } = useQuery({
          queryKey: ['contacts', dataBase],
          queryFn: async () => {
              const res = await axios.get(`/contacts/${dataBase}/all`);
              return res.data;
          },
      });
  }

    // Mutation for creating or updating a contact
    const mutation = useMutation({
        mutationFn: async (contactData) => {
            const url = selectedContact
                ? `/contacts/${dataBase}/${selectedContact._id}`
                : `/contacts/${dataBase}`;
            const method = selectedContact ? 'put' : 'post';
            const res = await axios[method](url, contactData);
            return res.data;
        },
        onSuccess: () => {
            console.log(state.userInfo);
            queryClient.invalidateQueries(['contacts', dataBase, centerInfo]);
            enqueueSnackbar('Contact saved successfully', { variant: 'success' });
            handleCloseDialog();
        },
        onError: (err) => {
            enqueueSnackbar(getError(err), { variant: 'error' });
        },
    });

    // Mutation for deleting a contact
    const deleteContactMutation = useMutation({
        mutationFn: async (contactId) => {
            const res = await axios.delete(`/contacts/${dataBase}/${contactId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts', dataBase, centerInfo]);
            enqueueSnackbar('Contact deleted successfully', { variant: 'success' });
        },
        onError: (err) => {
            enqueueSnackbar(getError(err), { variant: 'error' });
        },
    });

    useEffect(() => {
        // Reset dialog fields if closed or after successful mutation
        if (!openDialog) {
            setSelectedContact(null);
            setNewContact({
                firstName: '',
                lastName: '',
                phone1: '',
                phone2: '',
                email: '',
                observations: '',
                centerInfo: [],
            });
        }
    }, [openDialog]);

    const handleOpenDialog = (contact = null) => {
        setSelectedContact(contact);
        setNewContact(contact || {
            firstName: '',
            lastName: '',
            phone1: '',
            phone2: '',
            email: '',
            observations: '',
            centerInfo: [],
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => setOpenDialog(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({
            ...newContact,
            centerInfo: [centerInfo],
        });
    };

    const handleDelete = (contactId) => deleteContactMutation.mutate(contactId);

    if (isLoading) return <CircularProgress />;
    if (isError) return <Typography>{getError(error)}</Typography>;

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
                {contact.editable && (
                    <>
                        <Button onClick={() => handleOpenDialog(contact)}>Edit</Button>
                        <Button onClick={() => handleDelete(contact._id)} color="error">Delete</Button>
                    </>
                )}
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
