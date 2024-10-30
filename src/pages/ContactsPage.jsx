import React, { useContext, useEffect, useState } from 'react';
import texts from '../assets/texts.json'; // Import the JSON file
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
    Select,
    MenuItem
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getError } from '../utils/getError';
import { UserContext } from '../context';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const { dataBase } = useParams();
  const queryClient = useQueryClient();
  const { state } = useContext(UserContext);
  const [t, i18n] = useTranslation('global');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('firstName');
  const [sortOrder, setSortOrder] = useState('asc');

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

  const { data: contacts = [], isLoading, isError, error } = useQuery({
      queryKey: ['contacts', dataBase, centerInfo],
      queryFn: async () => {
          const res = await axios.get(`/contacts/${dataBase}`, {
              params: { centerInfo },
          });
          return res.data;
      },
  });

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
          queryClient.invalidateQueries(['contacts', dataBase, centerInfo]);
          enqueueSnackbar(t('contacts.saveSuccess'), { variant: 'success' });
          handleCloseDialog();
      },
      onError: (err) => {
          enqueueSnackbar(getError(err), { variant: 'error' });
      },
  });

  const deleteContactMutation = useMutation({
      mutationFn: async (contactId) => {
          const res = await axios.delete(`/contacts/${dataBase}/${contactId}`);
          return res.data;
      },
      onSuccess: () => {
          queryClient.invalidateQueries(['contacts', dataBase, centerInfo]);
          enqueueSnackbar(t('contacts.deleteSuccess'), { variant: 'success' });
      },
      onError: (err) => {
          enqueueSnackbar(getError(err), { variant: 'error' });
      },
  });

  const filteredContacts = contacts
      .filter((contact) =>
          contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
          const fieldA = a[sortField].toLowerCase();
          const fieldB = b[sortField].toLowerCase();
          if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
          if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
      });

  return (
      <Box sx={{ padding: 2 }}>
          <TextField
              label={t('contacts.searchContacts')}
              variant="outlined"
              fullWidth
              margin="normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              displayEmpty
          >
              <MenuItem value="firstName">{t('contacts.firstName')}</MenuItem>
              <MenuItem value="lastName">{t('contacts.lastName')}</MenuItem>
              <MenuItem value="email">{t('contacts.email')}</MenuItem>
          </Select>
          <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              displayEmpty
          >
              <MenuItem value="asc">{t('contacts.ascending')}</MenuItem>
              <MenuItem value="desc">{t('contacts.descending')}</MenuItem>
          </Select>

          <Button variant="contained" onClick={() => handleOpenDialog()}>
              {t('contacts.addContact')}
          </Button>

          <TableContainer>
              <Table>
                  <TableHead>
                      <TableRow>
                          <TableCell>{t('contacts.firstName')}</TableCell>
                          <TableCell>{t('contacts.lastName')}</TableCell>
                          <TableCell>{t('contacts.phone1')}</TableCell>
                          <TableCell>{t('contacts.phone2')}</TableCell>
                          <TableCell>{t('contacts.email')}</TableCell>
                          <TableCell>{t('contacts.observations')}</TableCell>
                          <TableCell>{t('contacts.actions')}</TableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                      {filteredContacts.map((contact) => (
                          <TableRow key={contact._id}>
                              <TableCell>{contact.firstName}</TableCell>
                              <TableCell>{contact.lastName}</TableCell>
                              <TableCell>{contact.phone1}</TableCell>
                              <TableCell>{contact.phone2}</TableCell>
                              <TableCell>{contact.email}</TableCell>
                              <TableCell>{contact.observations}</TableCell>
                              <TableCell>
                                  <Button onClick={() => handleOpenDialog(contact)}>
                                      {t('contacts.edit')}
                                  </Button>
                                  <Button onClick={() => handleDelete(contact._id)} color="error">
                                      {t('contacts.delete')}
                                  </Button>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </TableContainer>

          <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>{selectedContact ? t('contacts.edit') : t('contacts.addContact')}</DialogTitle>
              {/* Dialog content and actions */}
          </Dialog>
      </Box>
  );
};

export default ContactPage;