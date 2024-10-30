import { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Unstable_Grid2';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { getError } from '../utils/getError';

export const ContactsContext = createContext();

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState(null);

  // Fetch contacts from the server
  const { data, isLoading, isError } = useQuery({
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
      // Refetch contacts after update
      refetch();
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

  if (isLoading) return <Skeleton variant="rectangular" height={300} />;
  if (isError) return <p>Something went wrong...</p>;

  return (
    <Container>
      <Typography variant={'h2'} mb={2}>Contacts</Typography>

      <Button
        variant="outlined"
        onClick={() => setEditedContact({})} // Reset state for new contact
        startIcon={<AddIcon />}
      >
        Add Contact
      </Button>

      <Box mt={3}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Número 1</th>
              <th>Número 2</th>
              <th>Correo</th>
              <th>Observaciones</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(contact => (
              <tr key={contact.id}>
                <td>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="firstName"
                      defaultValue={contact.firstName}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.firstName
                  )}
                </td>
                <td>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="lastName"
                      defaultValue={contact.lastName}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.lastName
                  )}
                </td>
                <td>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="phone1"
                      defaultValue={contact.phone1}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.phone1
                  )}
                </td>
                <td>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="phone2"
                      defaultValue={contact.phone2}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.phone2
                  )}
                </td>
                <td>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="email"
                      defaultValue={contact.email}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.email
                  )}
                </td>
                <td>
                  {isEditing && editedContact.id === contact.id ? (
                    <TextField
                      name="observations"
                      defaultValue={contact.observations}
                      onChange={handleChange}
                    />
                  ) : (
                    contact.observations
                  )}
                </td>
                <td>
                  {isEditing && editedContact.id === contact.id ? (
                    <Button onClick={handleSave} variant="contained">
                      Save
                    </Button>
                  ) : (
                    <Button onClick={() => handleEdit(contact)} variant="outlined">
                      Edit
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Container>
  );
};

export default ContactsPage;
