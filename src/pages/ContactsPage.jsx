import { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { getError } from '../utils/getError';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState(null);
  const [newContact, setNewContact] = useState({}); // State for new contact

  // Fetch contacts from the server
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => axios.get('/contacts').then(res => res.data),
    onSuccess: (data) => setContacts(data),
  });

  const mutation = useMutation({
    mutationFn: (contact) => {
      return axios.put(`/contacts/${contact.id}`, contact);
    },
    onSuccess: () => {
      enqueueSnackbar('Contact updated successfully', { variant: 'success' });
      setIsEditing(false);
      refetch(); // Refetch contacts after update
    },
    onError: (error) => {
      enqueueSnackbar(getError(error), { variant: 'error' });
    },
  });

  const handleEdit = (contact) => {
    setEditedContact(contact);
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setEditedContact({ ...editedContact, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    mutation.mutate(editedContact);
  };

  const handleAddChange = (e) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  const handleAddContact = () => {
    // Logic to add new contact
    if (!newContact.firstName || !newContact.lastName) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }

    // Simulating adding a new contact
    setContacts([...contacts, { id: Date.now(), ...newContact }]);
    enqueueSnackbar('Contact added successfully', { variant: 'success' });

    // Reset new contact state
    setNewContact({});
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Something went wrong...</Typography>;

  return (
    <Container>
      <Typography variant={'h2'} mb={2}>Contacts</Typography>

      <Box mb={2}>
        <TextField
          label="First Name"
          name="firstName"
          value={newContact.firstName || ''}
          onChange={handleAddChange}
          sx={{ marginRight: 1 }}
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={newContact.lastName || ''}
          onChange={handleAddChange}
          sx={{ marginRight: 1 }}
        />
        <TextField
          label="Number 1"
          name="phone1"
          value={newContact.phone1 || ''}
          onChange={handleAddChange}
          sx={{ marginRight: 1 }}
        />
        <TextField
          label="Number 2"
          name="phone2"
          value={newContact.phone2 || ''}
          onChange={handleAddChange}
          sx={{ marginRight: 1 }}
        />
        <TextField
          label="Email"
          name="email"
          value={newContact.email || ''}
          onChange={handleAddChange}
          sx={{ marginRight: 1 }}
        />
        <TextField
          label="Observations"
          name="observations"
          value={newContact.observations || ''}
          onChange={handleAddChange}
          sx={{ marginRight: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleAddContact}
          startIcon={<AddIcon />}
        >
          Add Contact
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellidos</TableCell>
              <TableCell>Número 1</TableCell>
              <TableCell>Número 2</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map(contact => (
              <TableRow key={contact.id}>
                <TableCell>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="firstName"
                      defaultValue={contact.firstName}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.firstName
                  )}
                </TableCell>
                <TableCell>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="lastName"
                      defaultValue={contact.lastName}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.lastName
                  )}
                </TableCell>
                <TableCell>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="phone1"
                      defaultValue={contact.phone1}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.phone1
                  )}
                </TableCell>
                <TableCell>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="phone2"
                      defaultValue={contact.phone2}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.phone2
                  )}
                </TableCell>
                <TableCell>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="email"
                      defaultValue={contact.email}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.email
                  )}
                </TableCell>
                <TableCell>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="observations"
                      defaultValue={contact.observations}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.observations
                  )}
                </TableCell>
                <TableCell>
                  {isEditing && editedContact.id === contact.id ? (
                    <Button onClick={handleSave} variant="contained">
                      Save
                    </Button>
                  ) : (
                    <Button onClick={() => handleEdit(contact)} variant="outlined">
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ContactsPage;
