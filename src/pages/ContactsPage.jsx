import { Box, Button, CircularProgress, TextField, Typography, Chip } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getError } from '../utils/getError';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const ContactPage = () => {
    const { dataBase } = useParams();
    const [t] = useTranslation('global');
    const [newContact, setNewContact] = useState({
        firstName: '',
        lastName: '',
        phone1: '',
        phone2: '',
        email: '',
        observations: '',
    });

    const queryClient = useQueryClient();

    // Fetch contacts using React Query
    const contactsQuery = useQuery({
        queryKey: ['contacts', dataBase],
        queryFn: () => axios.get(`/contacts/${dataBase}`).then(res => res.data),
    });

    // Create new contact
    const createContactMutation = useMutation({
        mutationFn: (contact) => axios.post(`/contacts/${dataBase}`, contact),
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts', dataBase]);
            setNewContact({ firstName: '', lastName: '', phone1: '', phone2: '', email: '', observations: '' }); // Reset form
        },
    });

    // Delete contact
    const deleteContactMutation = useMutation({
        mutationFn: (contactId) => axios.delete(`/contacts/${dataBase}/${contactId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts', dataBase]);
        },
    });

    // Handle form submission for new contact
    const handleSubmitContact = async (e) => {
        e.preventDefault();
        await createContactMutation.mutateAsync(newContact);
    };

    // Handle deleting a contact
    const handleDeleteContact = (contactId) => {
        deleteContactMutation.mutate(contactId);
    };

    // Handle input change for new contact
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewContact((prev) => ({ ...prev, [name]: value }));
    };

    // Loading and error states
    if (contactsQuery.isLoading) return <CircularProgress />;
    if (contactsQuery.isError) return <Typography>{getError(contactsQuery.error)}</Typography>;

    const contacts = contactsQuery.data || [];

    return (
        <Box padding={2}>
            <Typography variant="h4">{t('contacts.title')}</Typography>
            <form onSubmit={handleSubmitContact}>
                <TextField
                    label={t('contacts.firstName')}
                    name="firstName"
                    value={newContact.firstName}
                    onChange={handleChange}
                    required
                    margin="normal"
                    fullWidth
                />
                <TextField
                    label={t('contacts.lastName')}
                    name="lastName"
                    value={newContact.lastName}
                    onChange={handleChange}
                    required
                    margin="normal"
                    fullWidth
                />
                <TextField
                    label={t('contacts.phone1')}
                    name="phone1"
                    value={newContact.phone1}
                    onChange={handleChange}
                    required
                    margin="normal"
                    fullWidth
                />
                <TextField
                    label={t('contacts.phone2')}
                    name="phone2"
                    value={newContact.phone2}
                    onChange={handleChange}
                    margin="normal"
                    fullWidth
                />
                <TextField
                    label={t('contacts.email')}
                    name="email"
                    type="email"
                    value={newContact.email}
                    onChange={handleChange}
                    required
                    margin="normal"
                    fullWidth
                />
                <TextField
                    label={t('contacts.observations')}
                    name="observations"
                    value={newContact.observations}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    margin="normal"
                    fullWidth
                />
                <Button type="submit" variant="contained" color="primary">
                    {t('contacts.add')}
                </Button>
            </form>

            <Typography variant="h6" marginTop={3}>{t('contacts.listTitle')}</Typography>
            <Box marginTop={2}>
                {contacts.map((contact) => (
                    <Chip
                        key={contact._id}
                        label={`${contact.firstName} ${contact.lastName}`}
                        onDelete={() => handleDeleteContact(contact._id)}
                        style={{ margin: '5px' }}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default ContactPage;
