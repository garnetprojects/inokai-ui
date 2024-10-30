/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const ContactsPage = () => {
  const [t] = useTranslation('global');
  const { dataBase } = useParams();
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', surname: '', phone1: '', phone2: '', email: '', observations: '' });

  const { data, isLoading, isError } = useQuery(['contacts'], () =>
    axios(`/users/get-all-contacts/${dataBase}`).then((response) => response.data)
  );

  useEffect(() => {
    if (data) {
      setContacts(data);
    }
  }, [data]);

  const handleEditChange = (index, field, value) => {
    const updatedContacts = [...contacts];
    updatedContacts[index][field] = value;
    setContacts(updatedContacts);
  };

  const handleDelete = (index) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
    enqueueSnackbar('Contact deleted successfully!', { variant: 'success' });
  };

  const handleAddContact = () => {
    if (Object.values(newContact).some((field) => field.trim() === '')) {
      enqueueSnackbar('Please fill all fields before adding a contact.', { variant: 'error' });
      return;
    }
    
    setContacts((prevContacts) => [...prevContacts, newContact]);
    setNewContact({ name: '', surname: '', phone1: '', phone2: '', email: '', observations: '' });
    enqueueSnackbar('Contact added successfully!', { variant: 'success' });
  };

  const handleSave = () => {
    // Here you can send the updated contacts to the backend when ready
    // await axios.post('/your-endpoint', contacts);
    enqueueSnackbar('Changes saved successfully!', { variant: 'success' });
  };

  if (isLoading)
    return <Skeleton variant="rectangular" height={300} sx={{ bgcolor: 'rgb(203 213 225)' }} />;
  if (isError) return <Typography color="error">Error loading data</Typography>;

  return (
    <Container>
      <Typography variant={'h2'} sx={{ textTransform: 'capitalize' }} mb={2}>
        {t('menu.contacts')}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('inputLabel.name')}</TableCell>
              <TableCell>{t('inputLabel.surname')}</TableCell>
              <TableCell>{t('inputLabel.phone1')}</TableCell>
              <TableCell>{t('inputLabel.phone2')}</TableCell>
              <TableCell>{t('inputLabel.email')}</TableCell>
              <TableCell>{t('inputLabel.observations')}</TableCell>
              <TableCell>{t('inputLabel.action')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    value={contact.name}
                    onChange={(e) => handleEditChange(index, 'name', e.target.value)}
                    variant="standard"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={contact.surname}
                    onChange={(e) => handleEditChange(index, 'surname', e.target.value)}
                    variant="standard"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={contact.phone1}
                    onChange={(e) => handleEditChange(index, 'phone1', e.target.value)}
                    variant="standard"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={contact.phone2}
                    onChange={(e) => handleEditChange(index, 'phone2', e.target.value)}
                    variant="standard"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={contact.email}
                    onChange={(e) => handleEditChange(index, 'email', e.target.value)}
                    variant="standard"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={contact.observations}
                    onChange={(e) => handleEditChange(index, 'observations', e.target.value)}
                    variant="standard"
                  />
                </TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleDelete(index)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <TextField
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  variant="standard"
                  placeholder={t('inputLabel.name')}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newContact.surname}
                  onChange={(e) => setNewContact({ ...newContact, surname: e.target.value })}
                  variant="standard"
                  placeholder={t('inputLabel.surname')}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newContact.phone1}
                  onChange={(e) => setNewContact({ ...newContact, phone1: e.target.value })}
                  variant="standard"
                  placeholder={t('inputLabel.phone1')}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newContact.phone2}
                  onChange={(e) => setNewContact({ ...newContact, phone2: e.target.value })}
                  variant="standard"
                  placeholder={t('inputLabel.phone2')}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  variant="standard"
                  placeholder={t('inputLabel.email')}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newContact.observations}
                  onChange={(e) => setNewContact({ ...newContact, observations: e.target.value })}
                  variant="standard"
                  placeholder={t('inputLabel.observations')}
                />
              </TableCell>
              <TableCell>
                <Button variant="contained" onClick={handleAddContact}>Add</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>
        Save Changes
      </Button>
    </Container>
  );
};

export default ContactsPage;
