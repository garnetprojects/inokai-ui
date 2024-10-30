import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';

// Your existing components would be imported here as needed.

const ContactsPage = () => {
  const { state } = useContext(UserContext);
  const centerId = state.userInfo?.centerInfo; // Assuming this is the correct structure

  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    phone1: '',
    phone2: '',
    email: '',
    observations: '',
  });

  // Fetch contacts based on centerId
  const { isLoading, isError, data: fetchedContacts } = useQuery(
    ['contacts', centerId],
    () => axios.get(`/contacts?centerId=${centerId}`).then(res => res.data),
    {
      enabled: !!centerId, // Only run the query if centerId is available
      onSuccess: (data) => {
        setContacts(data);
      },
    }
  );

  const mutation = useMutation({
    mutationFn: (newContact) => {
      return axios.post('/contacts', newContact);
    },
    onSuccess: (data) => {
      enqueueSnackbar('Contact created successfully', { variant: 'success' });
      setContacts((prev) => [...prev, data.data]);
      setNewContact({
        firstName: '',
        lastName: '',
        phone1: '',
        phone2: '',
        email: '',
        observations: '',
      });
    },
    onError: (err) => {
      enqueueSnackbar('Error creating contact', { variant: 'error' });
      console.error(err);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContact((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    // Include the centerId from the user context
    const contactToAdd = {
      ...newContact,
      centerIds: [centerId], // Assuming you want to store it as an array
    };
    mutation.mutate(contactToAdd);
  };

  if (isLoading) return <Typography>Loading contacts...</Typography>;
  if (isError) return <Typography>Error loading contacts</Typography>;

  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Contacts
      </Typography>
      <form onSubmit={handleAddContact}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={newContact.firstName}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={newContact.lastName}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <input
              type="text"
              name="phone1"
              placeholder="Phone 1"
              value={newContact.phone1}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <input
              type="text"
              name="phone2"
              placeholder="Phone 2 (optional)"
              value={newContact.phone2}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newContact.email}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <textarea
              name="observations"
              placeholder="Observations"
              value={newContact.observations}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Add Contact
            </Button>
          </Grid>
        </Grid>
      </form>

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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ContactsPage;
