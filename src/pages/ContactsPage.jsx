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
    IconButton
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getError } from '../utils/getError';
import { UserContext } from '../context';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
    const { t } = useTranslation('global');
    const { dataBase } = useParams();
    const queryClient = useQueryClient();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [sortField, setSortField] = useState('firstName');
    const [sortOrder, setSortOrder] = useState('asc'); // Agregar estado para el orden ascendente/descendente
    const [filterText, setFilterText] = useState('');
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

    // Fetch contacts with centerInfo if available
    const { data: contacts = [], isLoading, isError, error } = useQuery({
        queryKey: ['contacts', dataBase, centerInfo],
        queryFn: async () => {
            const url = centerInfo
                ? `/contacts/${dataBase}`
                : `/contacts/${dataBase}/all`;
            const res = await axios.get(url, {
                params: centerInfo ? { centerInfo } : {},
            });
            return res.data;
        },
    });

    // Función para cambiar el campo de orden y el orden ascendente/descendente
    const handleSortChange = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const filteredContacts = contacts
        .filter(contact =>
            contact.firstName.toLowerCase().includes(filterText.toLowerCase()) ||
            contact.lastName.toLowerCase().includes(filterText.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOrder === 'asc') {
                return a[sortField] > b[sortField] ? 1 : -1;
            } else {
                return a[sortField] < b[sortField] ? 1 : -1;
            }
        });

    if (isLoading) return <CircularProgress />;
    if (isError) return <Typography>{t('contacts.errorLoading')}</Typography>;

    return (
        <Box sx={{ padding: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button variant="contained" onClick={() => handleOpenDialog()}>
                    {t('contacts.addContact')}
                </Button>
                <TextField
                    label={t('contacts.search')}
                    variant="outlined"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    sx={{ mr: 2 }}
                />
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {['firstName', 'lastName', 'phone1', 'phone2', 'email', 'observations'].map((field) => (
                                <TableCell key={field}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {t(`contacts.${field}`)}
                                        <IconButton onClick={() => handleSortChange(field)} size="small">
                                            {sortField === field ? (
                                                sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                                            ) : null}
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            ))}
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
                                    {contact.editable && (
                                        <>
                                            <Button onClick={() => handleOpenDialog(contact)}>
                                                {t('contacts.edit')}
                                            </Button>
                                            <Button onClick={() => handleDelete(contact._id)} color="error">
                                                {t('contacts.delete')}
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{selectedContact ? t('contacts.edit') : t('contacts.addContact')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('contacts.firstName')}
                        fullWidth
                        value={newContact.firstName}
                        onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label={t('contacts.lastName')}
                        fullWidth
                        value={newContact.lastName}
                        onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label={t('contacts.phone1')}
                        fullWidth
                        value={newContact.phone1}
                        onChange={(e) => setNewContact({ ...newContact, phone1: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label={t('contacts.phone2')}
                        fullWidth
                        value={newContact.phone2}
                        onChange={(e) => setNewContact({ ...newContact, phone2: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label={t('contacts.email')}
                        fullWidth
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label={t('contacts.observations')}
                        fullWidth
                        value={newContact.observations}
                        onChange={(e) => setNewContact({ ...newContact, observations: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>{t('contacts.cancel')}</Button>
                    <Button onClick={handleSubmit}>
                        {selectedContact ? t('contacts.update') : t('contacts.create')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ContactPage;
