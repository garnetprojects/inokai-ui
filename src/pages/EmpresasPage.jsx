import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import ModalComponent from '../components/ModalComponent';
import TableComponent from '../components/TableComponent';

import {
  Box,
  Button,
  Container,
  IconButton,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Grid from '@mui/material/Unstable_Grid2';
import axios from 'axios';
import { CellActionComponents } from '../components/CellActionComponents';
import { useInvalidate } from '../utils/Invalidate';
import { useTranslation } from 'react-i18next';
import { urlBD } from '../utils/urlBD';
import { enqueueSnackbar } from 'notistack';
import { getError } from '../utils/getError';

const EmpresasPage = () => {
  const [t] = useTranslation('global');

  return (
    <Container>
      <Typography variant={'h2'} sx={{ textTransform: 'capitalize' }} mb={2}>
        {t('menu.companies')}
      </Typography>

      <Header />

      <TableBody />
    </Container>
  );
};

const Header = () => {
  const [t] = useTranslation('global');
  const [companyName, setCompanyName] = useState('');
  const [open, setOpen] = useState(false);
  const [centers, setCenters] = useState([]);
  const [services, setServices] = useState([]);

  const { invalidate } = useInvalidate();

  const mutation = useMutation({
    mutationFn: async (data) =>
      await axios
        .post(`/users/crear-empresa`, data)
        .then((response) => response.data),

    onSuccess: (data) => {
      console.log(data);

      invalidate(['empresas']);
      enqueueSnackbar('Creado exitosamente', { variant: 'success' });
      setOpen(false);
    },
    onError: (err) => {
      console.log(err);
      enqueueSnackbar(getError(err), { variant: 'error' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      email: e.target.email.value,
      password: e.target.password.value,
      name: e.target.name.value,
      DNI: e.target.name.value,
      companyName: e.target.companyName.value.replace(/ /g, '-'),
      centers,
      services
    };

    mutation.mutate(data);
  };

  const handleDelete = (id, setState = setCenters) => {
    setState((prev) => prev.filter((item, idx) => +idx !== +id));
  };

  const handleChange = (e, setState = setCenters) => {
    const [name, id] = e.target.name.split('-');
    console.log(name, id);

    setState((prev) =>
      prev.map((item, idx) =>
        idx === +id ? { ...item, [name]: e.target.value } : item
      )
    );
  };

  console.log({centers, services});
  return (
    <Box component={'header'} mb={5}>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        startIcon={<AddIcon />}
      >
        {t('buttons.create')}
      </Button>
      <ModalComponent
        onClose={() => setCenters([])}
        open={open}
        setOpen={setOpen}
      >
        <form action="" onSubmit={handleSubmit}>
          <Typography mt={3} variant="h4" textTransform={'capitalize'}>
            {t('title.company')}
          </Typography>

          <Grid container spacing={5}>
            <Grid xs={12}>
              <TextField
                label={t('inputLabel.companyName')}
                variant="standard"
                sx={{ width: '100%' }}
                name="companyName"
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={mutation.isPending}
              />
            </Grid>
            {/* <Grid xs={12} md={6}>
              <TextField
                label="Dirección"
                variant="standard"
                sx={{ width: '100%' }}
                disabled={mutation.isPending}
              />
            </Grid> */}

            <Grid py={0}>
              <Typography>{urlBD(companyName)}</Typography>
              <Typography color={'red'} sx={{ fontSize: 13 }}>
                {t('messages.nameBd')}
              </Typography>
            </Grid>
          </Grid>

          <Typography mt={3} variant="h4" textTransform={'capitalize'}>
            {t('title.manager')}
          </Typography>

          <Grid container spacing={5}>
            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.name')}
                name="name"
                required
                variant="standard"
                sx={{ width: '100%' }}
                disabled={mutation.isPending}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label={t('inputLabel.email')}
                type="email"
                name="email"
                required
                variant="standard"
                sx={{ width: '100%' }}
                disabled={mutation.isPending}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                label={t('inputLabel.dni')}
                type="text"
                name="DNI"
                required
                variant="standard"
                sx={{ width: '100%' }}
                disabled={mutation.isPending}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                label={t('inputLabel.password')}
                type="password"
                name="password"
                required
                variant="standard"
                sx={{ width: '100%' }}
                disabled={mutation.isPending}
              />
            </Grid>
          </Grid>

          <Typography mt={3} variant="h4" textTransform={'capitalize'}>
            {t('title.center')}s
            <IconButton
              sx={{ ml: 1 }}
              variant="contained"
              onClick={() => setCenters((prev) => [...prev, {}])}
              disabled={mutation.isPending}
            >
              <AddIcon />
            </IconButton>
          </Typography>

          {/* <Grid container spacing={5}> */}
          {centers.map((item, idx) => (
            <Grid
              position={'relative'}
              container
              spacing={5}
              key={idx}
              mb={0.1}
            >
              <Grid xs={12} md={6}>
                <TextField
                  label={t('inputLabel.name')}
                  name={`centerName-${idx}`}
                  value={centers[idx].centerName || ''}
                  required
                  variant="standard"
                  sx={{ width: '100%' }}
                  disabled={mutation.isPending}
                  onChange={(e) => handleChange(e)}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label={t('inputLabel.address')}
                  name={`address-${idx}`}
                  value={centers[idx].address || ''}
                  type="text"
                  required
                  variant="standard"
                  sx={{ width: '100%' }}
                  disabled={mutation.isPending}
                  onChange={(e) => handleChange(e)}
                />
              </Grid>

              <IconButton
                sx={{ position: 'absolute', right: 5 }}
                color="error"
                disabled={mutation.isPending}
                onClick={() => handleDelete(idx)}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          ))}
          {/* </Grid> */}

          <Typography mt={3} variant="h4" textTransform={'capitalize'}>
            {t('title.service')}s
            <IconButton
              sx={{ ml: 1 }}
              variant="contained"
              onClick={() => setServices((prev) => [...prev, {}])}
              disabled={mutation.isPending}
            >
              <AddIcon />
            </IconButton>
          </Typography>

          {services.map((item, idx) => (
            <Grid
              position={'relative'}
              container
              spacing={5}
              key={idx}
              mb={0.1}
            >
              <Grid xs={12} md={4}>
                <TextField
                  label={t('inputLabel.name')}
                  name={`serviceName-${idx}`}
                  value={services[idx].serviceName || ''}
                  required
                  variant="standard"
                  sx={{ width: '100%' }}
                  disabled={mutation.isPending}
                  onChange={(e) => handleChange(e, setServices)}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  label={t('inputLabel.duration')}
                  name={`duration-${idx}`}
                  value={services[idx].duration || ''}
                  type="text"
                  required
                  variant="standard"
                  sx={{ width: '100%' }}
                  disabled={mutation.isPending}
                  onChange={(e) => handleChange(e, setServices)}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  label={'Color'}
                  name={`color-${idx}`}
                  value={services[idx].color || ''}
                  type="color"
                  required
                  variant="standard"
                  sx={{ width: '100%' }}
                  disabled={mutation.isPending}
                  onChange={(e) => handleChange(e, setServices)}
                />
              </Grid>

              <IconButton
                sx={{ position: 'absolute', right: 5 }}
                color="error"
                disabled={mutation.isPending}
                onClick={() => handleDelete(idx, setServices)}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          ))}

          <Button
            type="submit"
            variant="contained"
            sx={{ width: '100%', mt: 5 }}
            disabled={mutation.isPending}
          >
            {t('buttons.create')}
          </Button>
        </form>
      </ModalComponent>
    </Box>
  );
};

const TableBody = () => {
  const [t] = useTranslation('global');

  const columns = [
    {
      header: t('inputLabel.companyName'),
      accessorKey: 'dbName',
    },
    {
      header: t('inputLabel.name'),
      accessorKey: 'users.name',
    },
    {
      header: t('inputLabel.email'),
      accessorKey: 'users.email',
    },
    {
      header: `${t('inputLabel.action')}s`,
      cell: (info) => <CellActionComponents info={info.row.original} />,
    },
  ];

  const { isLoading, isError, data } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => axios('/users/databases').then((response) => response.data),
  });

  if (isLoading)
    return (
      <Skeleton
        variant="rectangular"
        // animation="wave"
        height={300}
        sx={{ bgcolor: 'rgb(203 213 225)' }}
      />
    );

  if (isError) return <p>Ocurrio algo</p>;

  console.log(data);

  return <TableComponent columns={columns} data={data} />;
};

export default EmpresasPage;
